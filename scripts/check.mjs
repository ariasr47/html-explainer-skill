#!/usr/bin/env node
// html-explainer checker. Zero dependencies. Usage: node check.mjs <file.html> [--json]
// Exit 0 when every hard rule passes, 1 otherwise. Warnings never fail the run.
// <html lang="en|ja" data-type="..."> picks the limits (words or characters) and the extra rules for that page type.
import { readFileSync, statSync } from 'node:fs';

const file = process.argv[2];
if (!file) { console.error('usage: node check.mjs <file.html> [--json]'); process.exit(2); }
const asJson = process.argv.includes('--json');
const html = readFileSync(file, 'utf8').replace(/<!--[\s\S]*?-->/g, ''); // comments never count
const fails = [], warns = [], info = {};
const fail = (m) => fails.push(m), warn = (m) => warns.push(m);

// ---- helpers
const strip = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
// a number with separators (1,250 or 3.5) counts as one word
const words = (s) => (strip(s).match(/[A-Za-z]+(?:[’'\-][A-Za-z]+)*|\d[\d,.]*\d|\d/g) || []).length;
// Japanese has no spaces: every character that is not a space or punctuation counts one
const chars = (s) => [...strip(s)].filter((c) => !/[\s\p{P}]/u.test(c)).length;
const count = (re) => (html.match(re) || []).length;
const hasClass = (tag, cls) => new RegExp(`<${tag}(?![\\w-])[^>]*class="[^"]*\\b${cls}\\b[^"]*"`, 'g');
const attr = (attrs, name) => (attrs.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`, 'i')) || [])[1];
const hasAttr = (attrs, name) => new RegExp(`(?:^|\\s)${name}(?=[\\s=/>]|$)`, 'i').test(attrs.replace(/"[^"]*"/g, '""'));
const VOID = /^(?:input|br|hr|img|meta|link)$/i;
// html between an open tag (ending at `from`) and its matching close tag, counting nested tags of the same name
const inner = (src, from, tag) => {
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi'); re.lastIndex = from;
  let depth = 1, m;
  while ((m = re.exec(src))) {
    if (m[0].endsWith('/>')) continue;
    depth += m[1] ? -1 : 1;
    if (!depth) return src.slice(from, m.index);
  }
  return src.slice(from);
};
const starts = (src) => [...src.matchAll(/<([a-z][a-z0-9]*)\b([^>]*)>/gi)]; // every start tag: [whole, name, attributes]
// elements whose class list has the token `c` (and tag `t` when given): { tag, attrs, inner }
const find = (c, t, src = html) => {
  const has = new RegExp(`\\sclass="(?:[^"]*\\s)?${c}(?:\\s[^"]*)?"`);
  return starts(src).filter((m) => has.test(m[2]) && (!t || m[1].toLowerCase() === t)).map((m) => {
    const empty = VOID.test(m[1]) || m[0].endsWith('/>'); // void and self-closing elements hold nothing
    return { tag: m[1].toLowerCase(), attrs: m[2], inner: empty ? '' : inner(src, m.index + m[0].length, m[1]) };
  });
};
const num = (c, t, src) => find(c, t, src).length;
const withAttr = (name, src = html) => starts(src).filter((m) => hasAttr(m[2], name)); // start tags that carry an attribute

// ---- css: every <style> block, comments removed, flattened into rules ({ sel, body }); at-rule wrappers drop away
const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('\n').replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/@media[^{]*\bprint\b[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, ''); // @media print blocks (one nesting level) never count: they reset --paper and --card to white
const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ sel: m[1].trim().replace(/\s+/g, ' '), body: m[2] }));
const rulesFor = (re) => rules.filter((r) => re.test(r.sel));

// ---- page identity: lang and data-type pick the limits and the extra rules
const TYPES = ['explainer', 'decision', 'status', 'spec', 'release', 'research', 'handover', 'gather', 'atlas'];
const htmlAttrs = (html.match(/<html\b([^>]*)>/i) || [])[1] || '';
const lang = (attr(htmlAttrs, 'lang') || '').trim(), type = (attr(htmlAttrs, 'data-type') || 'explainer').trim();
const ja = /^ja(-|$)/i.test(lang); // any other lang falls back to the English rules
const unit = ja ? 'chars' : 'words', size = ja ? chars : words;
const RATE = ja ? 500 : 200; // reading speed per minute, in `unit`
const LIM = { para: ja ? 90 : 40, sent: ja ? 60 : 30, keep: ja ? 25 : 15, answer: ja ? 70 : 40, chapter: 1.25 * RATE, path: 7 * RATE };
if (!lang) fail('missing lang on <html>; set lang="en" or lang="ja"');
if (!TYPES.includes(type)) fail(`unknown data-type "${type}"; use one of ${TYPES.join(', ')}`);

// ---- document basics
const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1]?.trim() ?? '';
info.title = title; info.lang = lang; info.type = type; info.unit = unit;
if (!title) fail('missing <title>');
else {
  const tw = ja ? chars(title) : title.split(/\s+/).length, [lo, hi] = ja ? [4, 24] : [2, 8];
  if (tw < lo || tw > hi) warn(`title has ${tw} ${unit}; aim for ${lo} to ${hi}`);
  if (/explainer/i.test(title)) warn('title contains "explainer"; name the subject instead');
}
if (!/<meta name="viewport"/i.test(html)) fail('missing <meta name="viewport">');
if (!/<meta name="color-scheme"/i.test(html)) fail('missing <meta name="color-scheme">');
const atlasFile = (u) => type === 'atlas' && /^(?:\.\/)?atlas\.(?:css|js)$/.test(u); // atlas pages load their two add-on files from next to index.html
if ([...html.matchAll(/<script\b[^>]*\ssrc=["']?([^"'\s>]*)/gi)].some((m) => !atlasFile(m[1]))) fail('external <script src>; everything must be inline');
const links = [...html.matchAll(/<link[^>]+href="([^"]+)"/gi)].map(m => m[1]);
for (const l of links) if (!/^(https:\/\/fonts\.(googleapis|gstatic)\.com|data:)/.test(l) && !atlasFile(l)) fail(`external <link> not allowed: ${l}`);
if (/<img[^>]+src="https?:/i.test(html)) fail('remote <img>; inline it as SVG or a data URI');
const kb = statSync(file).size / 1024, maxKb = type === 'atlas' ? 3072 : 400; info.kb = Math.round(kb); // an atlas embeds source: 3 MB budget
if (kb > maxKb) fail(`file is ${info.kb} KB; keep under ${maxKb} KB`);

// ---- structure
const answers = count(hasClass('p', 'answer')); info.answers = answers;
if (answers !== 1) fail(`expected exactly one p.answer, found ${answers}`);
const answer = html.match(/<p class="answer">([\s\S]*?)<\/p>/);
if (answer) {
  const aw = size(answer[1]); info.answerWords = aw;
  if (aw > LIM.answer) fail(`answer bar is ${aw} ${unit}; one sentence, under ${LIM.answer}`);
  else if (aw > LIM.answer * 0.75) warn(`answer bar is ${aw} ${unit}; shorter reads better`);
}
if (!ja && title && title.split(/\s+/).length > 2 && title.split(/\s+/).every(w => /^[A-Z0-9]/.test(w))) warn('title is in Title Case; use sentence case');
const bodyOnly = html.replace(/<(style|script)[\s\S]*?<\/\1>/g, '').replace(/<head>[\s\S]*?<\/head>/, '');
const dashes = (bodyOnly.match(/—|&mdash;/g) || []).length; if (dashes > 0) warn(`${dashes} em dash(es); use a full stop, a colon, or a comma instead`);
const middots = (bodyOnly.match(/ · |&middot;/g) || []).length; if (!ja && middots > 0) warn(`${middots} middle dot(s) in text; use words or punctuation`);
const keep = html.match(/<div class="keep">([\s\S]*?)<\/div>/);
if (!keep) fail('missing div.keep'); else {
  const items = (keep[1].match(/<li\b/g) || []).length; info.keepItems = items;
  if (items < 1 || items > 3) fail(`keep box has ${items} items; 1 to 3 allowed`);
  for (const li of keep[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)) if (size(li[1]) > LIM.keep) warn(`keep item over ${LIM.keep} ${unit}: "${strip(li[1]).slice(0, 60)}"`);
}
if (!count(hasClass('section', 'recap'))) fail('missing section.recap');

// ---- chapters
const chapters = [...html.matchAll(/<section class="chapter"[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g)];
info.chapters = chapters.length;
const maxChapters = type === 'atlas' ? 12 : 7; // the atlas menu offers twelve chapters
if (chapters.length < 3 || chapters.length > maxChapters) fail(`found ${chapters.length} chapters; 3 to ${maxChapters} expected`);
const visual = /class="[^"]*\b(figure|flow|split|timeline|status|decision|tiles|steps|metaphor|sysmap|trace|matrix|stepper|views|minimap)\b/;
const sentences = (s) => strip(s).split(ja ? /(?<=[。！？])/ : /(?<=[.!?])\s+/);
let totalWords = 0;
chapters.forEach(([, id, body], i) => {
  const readingPath = body.replace(/<details[\s\S]*?<\/details>/g, '');
  const w = size(readingPath.replace(/<svg[\s\S]*?<\/svg>/g, '')); totalWords += w;
  if (!/<h2\b/.test(body)) fail(`chapter #${id} has no h2`);
  if (!hasClass('p', 'remember').test(body)) fail(`chapter #${id} has no p.remember`);
  if (i > 0 && !hasClass('p', 'from').test(body)) warn(`chapter #${id} has no p.from carry-forward`);
  if (!visual.test(body)) fail(`chapter #${id} has no visual component`);
  if (w > LIM.chapter) warn(`chapter #${id} reading path is ${w} ${unit}; aim under ${LIM.chapter}`);
  for (const p of readingPath.matchAll(/<p(?![\w-])(?![^>]*class="(?:answer|take|remember|from|nothing)")[^>]*>([\s\S]*?)<\/p>/g)) {
    const pw = size(p[1]);
    if (pw > LIM.para) fail(`chapter #${id}: paragraph of ${pw} ${unit} (max ${LIM.para}): "${strip(p[1]).slice(0, 60)}…"`);
    for (const s of sentences(p[1])) if (size(s) > LIM.sent) warn(`chapter #${id}: sentence of ${size(s)} ${unit}: "${s.slice(0, 60)}…"`);
  }
});
info.readingPathWords = totalWords; info.readingMinutes = Math.ceil(totalWords / RATE);
if (totalWords > LIM.path) warn(`reading path is ${totalWords} ${unit} across chapters; aim under ${LIM.path}`);

// ---- figures and svg
for (const f of html.matchAll(/<figure class="figure">([\s\S]*?)<\/figure>/g)) {
  if (!/<svg\b/.test(f[1]) && !/<img\b/.test(f[1])) fail('figure.figure without an svg');
  if (!hasClass('figcaption', 'take').test(f[1])) fail('figure.figure without figcaption.take');
}
for (const s of html.matchAll(/<svg\b([^>]*)>([\s\S]*?)<\/svg>/g)) {
  if (!/viewBox=/.test(s[1])) fail('svg without viewBox');
  if (/\b(width|height)="\d/.test(s[1])) warn('svg with fixed width/height attribute; use viewBox only');
  if (!/<title\b/.test(s[2])) fail('svg without <title>');
  const hard = s[2].match(/(fill|stroke)="#(?!fff\b|ffffff\b)[0-9a-f]{3,6}"/gi);
  if (hard) warn(`svg uses hard-coded colours (${hard.length}); prefer d-* classes so dark mode works`);
  const nodes = (s[2].match(/<rect\b/g) || []).length; if (nodes > 9) warn(`svg has ${nodes} boxes; split it or fold it`);
}
const rails = count(/<nav class="rail"/); if (rails !== 1) fail('missing nav.rail');

// ---- language: the text must match lang; Japanese also needs its own CSS, no italics and BIZ UDPGothic
const pageText = strip(bodyOnly);
const letters = pageText.match(/\p{L}/gu) || [], cjk = pageText.match(/(?=\p{L})[\p{sc=Han}\p{scx=Hira}\p{scx=Kana}]/gu) || [];
const share = letters.length ? cjk.length / letters.length : 0; info.cjkPercent = Math.round(share * 100);
if (ja && share < 0.2) fail(`lang="${lang}" but only ${info.cjkPercent}% of the letters are Japanese; need 20% or more`);
if (!ja && share > 0.3) fail(`lang="${lang}" but ${info.cjkPercent}% of the letters are Japanese or Chinese; max 30%, or set lang="ja"`);
if (ja) {
  const jaRules = rulesFor(/:lang\(\s*["']?ja\b/);
  if (!jaRules.length) fail('lang="ja" but the CSS has no :lang(ja) block (Japanese font stack and spacing)');
  if (jaRules.some((r) => /font-style\s*:\s*italic/i.test(r.body))) fail('font-style: italic inside a :lang(ja) rule; Japanese is never italic');
  if (/font-style\s*[:=]\s*["']?\s*italic/i.test(html.replace(/<style[\s\S]*?<\/style>/gi, ''))) fail('font-style: italic outside <style>; Japanese is never italic');
  const gf = links.find((l) => /fonts\.googleapis\.com/.test(l));
  if (gf && !/BIZ(?:\+|%20)UDPGothic/.test(gf)) fail('lang="ja" but the Google Fonts link lacks BIZ+UDPGothic');
}

// ---- contrast, computed from the token blocks in each theme (WCAG 2: text needs 4.5)
const tokensOf = (re) => Object.assign({}, ...rulesFor(re).map((r) => Object.fromEntries([...r.body.matchAll(/(--[\w-]+)\s*:\s*([^;]+)/g)].map((m) => [m[1], m[2].trim()]))));
const light = tokensOf(/^:root$/), themes = { light };
for (const [name, sel] of [['dark', /^:root\[data-theme="dark"\]$/], ['dark (prefers-color-scheme)', /^:root:not\(\[data-theme="light"\]\)$/]])
  if (rulesFor(sel).length) themes[name] = { ...light, ...tokensOf(sel) }; // a dark block overrides the light tokens it names
const rgb = (v) => { const h = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v || '')?.[1]; return h && [0, 1, 2].map((i) => parseInt(h.length === 3 ? h[i] + h[i] : h.slice(2 * i, 2 * i + 2), 16)); };
const lin = (v) => (v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const floor2 = (x) => Math.floor(x * 100) / 100; // WCAG ratios are truncated, never rounded up
const PAIRS = [['--ink', '--paper'], ['--ink', '--card'], ['--ink-soft', '--card'], ['--ink-faint', '--paper'], ['--ink-faint', '--card'], ['--here', '--card'],
  ...['here', 'go', 'wait', 'stop', 'decide'].map((x) => [`--on-${x}`, `--${x}`]), ['--on-soft', '--ink-soft']];
const missing = new Set(); info.contrast = {}; // lowest ratio per theme
for (const [name, t] of Object.entries(themes)) for (const [fg, bg] of PAIRS) {
  const a = rgb(t[fg]), b = rgb(t[bg]);
  for (const [k, c] of [[fg, a], [bg, b]]) if (!c) missing.add(k);
  if (!a || !b) continue;
  const [hi, lo] = [lum(a), lum(b)].sort((p, q) => q - p), r = floor2((hi + 0.05) / (lo + 0.05));
  info.contrast[name] = Math.min(info.contrast[name] ?? r, r);
  if (r < 4.5) fail(`contrast (${name}): ${fg} on ${bg} is ${r.toFixed(2)}:1; text needs 4.5:1`);
}
if (missing.size) warn(`contrast not checked, token missing or not a hex colour: ${[...missing].join(', ')}`);

// ---- colour is never the only cue (WCAG 1.4.1): the go state must carry a glyph
for (const sel of ['.status li.go::before', '.timeline li.go::before'])
  if (!rules.some((r) => r.sel.split(',').some((s) => s.trim().endsWith(sel)) && /content\s*:\s*(?!none|normal|""|'')[^;}\s]/.test(r.body)))
    fail(`colour-only: the CSS has no "${sel}" rule with a content: glyph`);

// ---- type rules, keyed by data-type on <html>
const bad = (m) => fail(`data-type="${type}": ${m}`), need = (ok, m) => { if (!ok) bad(m); };
const REQUIRED = { decision: ['decision', 'ask'], status: ['status'], spec: ['split', 'status'], release: ['tiles', 'split'], handover: ['status', 'steps'] };
for (const c of REQUIRED[type] || []) need(num(c), `needs at least one .${c}`);
if (type === 'status') need(find('timeline').some((t) => num('here', 'li', t.inner) === 1), 'needs a .timeline with exactly one li.here');
if (type === 'research') { need(num('status') + num('tiles'), 'needs at least one .status or .tiles'); need(num('fold', 'details'), 'needs at least one details.fold'); }
if (type === 'gather') {
  const fields = find('answer-field'), seen = new Set();
  need(fields.length, 'needs at least one .answer-field');
  fields.forEach((f, i) => {
    const q = attr(f.attrs, 'data-q'), at = q ? `"${q}"` : `#${i + 1}`;
    if (!q) bad(`.answer-field ${at} has no data-q`); else if (seen.has(q)) bad(`duplicate data-q "${q}"`);
    seen.add(q);
    const el = f.tag === 'fieldset' ? 'legend' : 'label', m = f.inner.match(new RegExp(`<${el}\\b[^>]*>([\\s\\S]*?)</${el}>`, 'i'));
    need(m && strip(m[1]), `.answer-field ${at} has no non-empty ${el}`);
  });
  need(num('collect') === 1, `needs exactly one .collect, found ${num('collect')}`);
}
if (type === 'atlas') {
  const states = ['state-current', 'state-dormant', 'state-target'];
  need(find('legend').some((l) => states.every((s) => num(s, null, l.inner))), 'needs a .legend containing .state-current, .state-dormant and .state-target');
  need(num('sysmap'), 'needs at least one .sysmap');
  for (const a of find('anchor')) if (!attr(a.attrs, 'data-src') || !attr(a.attrs, 'data-line')) bad(`.anchor without data-src and data-line: "${strip(a.inner).slice(0, 40)}"`);
  need(withAttr('data-revision').length, 'needs an element with data-revision (commit hash and date)');
}

// ---- reader-feature components, on any page type
find('stepper').forEach((s, i) => {
  if (!num('stepper-nav', null, s.inner)) fail(`.stepper #${i + 1} has no .stepper-nav`);
  const steps = withAttr('data-step-text', s.inner).length;
  if (steps < 2) fail(`.stepper #${i + 1} has ${steps} [data-step-text]; at least 2 needed`);
});
find('views').forEach((v, i) => {
  const [first] = withAttr('data-view-panel', v.inner);
  if (!first) fail(`.views #${i + 1} has no [data-view-panel]`);
  else if (hasAttr(first[2], 'hidden')) fail(`.views #${i + 1}: the first [data-view-panel] is hidden; the first tab must carry the point`);
});
find('minimap').forEach((m, i) => { if (!hasAttr(m.attrs, 'data-lit')) warn(`.minimap #${i + 1} has no data-lit; no node will be lit`); });

// ---- report
const out = { file, ok: fails.length === 0, fails, warns, info };
if (asJson) console.log(JSON.stringify(out, null, 2));
else {
  console.log(`${out.ok ? 'PASS' : 'FAIL'}  ${file}`);
  console.log(`  title: "${info.title}"  chapters: ${info.chapters}  reading-path ${unit}: ${info.readingPathWords}  size: ${info.kb} KB`);
  for (const f of fails) console.log(`  FAIL  ${f}`);
  for (const w of warns) console.log(`  warn  ${w}`);
}
process.exit(out.ok ? 0 : 1);
