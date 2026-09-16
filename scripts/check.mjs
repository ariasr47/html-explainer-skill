#!/usr/bin/env node
// html-explainer checker. Zero dependencies. Usage: node check.mjs <file.html> [--json]
// Exit 0 when every hard rule passes, 1 otherwise. Warnings never fail the run.
import { readFileSync, statSync } from 'node:fs';

const file = process.argv[2];
if (!file) { console.error('usage: node check.mjs <file.html> [--json]'); process.exit(2); }
const asJson = process.argv.includes('--json');
const html = readFileSync(file, 'utf8');
const fails = [], warns = [], info = {};
const fail = (m) => fails.push(m), warn = (m) => warns.push(m);

const strip = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
// a number with separators (1,250 or 3.5) counts as one word
const words = (s) => (strip(s).match(/[A-Za-z]+(?:[’'\-][A-Za-z]+)*|\d[\d,.]*\d|\d/g) || []).length;
const count = (re) => (html.match(re) || []).length;
const hasClass = (tag, cls) => new RegExp(`<${tag}(?![\\w-])[^>]*class="[^"]*\\b${cls}\\b[^"]*"`, 'g');

// ---- document basics
const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1]?.trim() ?? '';
info.title = title;
if (!title) fail('missing <title>');
else {
  const tw = title.split(/\s+/).length;
  if (tw < 2 || tw > 8) warn(`title has ${tw} words; aim for 2 to 8`);
  if (/explainer/i.test(title)) warn('title contains "explainer"; name the subject instead');
}
if (!/<meta name="viewport"/i.test(html)) fail('missing <meta name="viewport">');
if (!/<meta name="color-scheme"/i.test(html)) fail('missing <meta name="color-scheme">');
if (/<script[^>]+src=/i.test(html)) fail('external <script src>; everything must be inline');
const links = [...html.matchAll(/<link[^>]+href="([^"]+)"/gi)].map(m => m[1]);
for (const l of links) if (!/^(https:\/\/fonts\.(googleapis|gstatic)\.com|data:)/.test(l)) fail(`external <link> not allowed: ${l}`);
if (/<img[^>]+src="https?:/i.test(html)) fail('remote <img>; inline it as SVG or a data URI');
const kb = statSync(file).size / 1024; info.kb = Math.round(kb);
if (kb > 400) fail(`file is ${info.kb} KB; keep under 400 KB`);

// ---- structure
const answers = count(hasClass('p', 'answer')); info.answers = answers;
if (answers !== 1) fail(`expected exactly one p.answer, found ${answers}`);
const answer = html.match(/<p class="answer">([\s\S]*?)<\/p>/);
if (answer) {
  const aw = words(answer[1]); info.answerWords = aw;
  if (aw > 40) fail(`answer bar is ${aw} words; one sentence, under 40`);
  else if (aw > 30) warn(`answer bar is ${aw} words; shorter reads better`);
}
if (title && title.split(/\s+/).length > 2 && title.split(/\s+/).every(w => /^[A-Z0-9]/.test(w))) warn('title is in Title Case; use sentence case');
const bodyOnly = html.replace(/<(style|script)[\s\S]*?<\/\1>/g, '').replace(/<head>[\s\S]*?<\/head>/, '');
const dashes = (bodyOnly.match(/—|&mdash;/g) || []).length; if (dashes > 0) warn(`${dashes} em dash(es); use a full stop, a colon, or a comma instead`);
const middots = (bodyOnly.match(/ · |&middot;/g) || []).length; if (middots > 0) warn(`${middots} middle dot(s) in text; use words or punctuation`);
const keep = html.match(/<div class="keep">([\s\S]*?)<\/div>/);
if (!keep) fail('missing div.keep'); else {
  const items = (keep[1].match(/<li\b/g) || []).length; info.keepItems = items;
  if (items < 1 || items > 3) fail(`keep box has ${items} items; 1 to 3 allowed`);
  for (const li of keep[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)) if (words(li[1]) > 15) warn(`keep item over 15 words: "${strip(li[1]).slice(0, 60)}"`);
}
if (!count(hasClass('section', 'recap'))) fail('missing section.recap');

// ---- chapters
const chapters = [...html.matchAll(/<section class="chapter"[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g)];
info.chapters = chapters.length;
if (chapters.length < 3 || chapters.length > 7) fail(`found ${chapters.length} chapters; 3 to 7 expected`);
const visual = /class="[^"]*\b(figure|flow|split|timeline|status|decision|tiles|steps|metaphor)\b/;
let totalWords = 0;
chapters.forEach(([, id, body], i) => {
  const readingPath = body.replace(/<details[\s\S]*?<\/details>/g, '');
  const w = words(readingPath.replace(/<svg[\s\S]*?<\/svg>/g, '')); totalWords += w;
  if (!/<h2\b/.test(body)) fail(`chapter #${id} has no h2`);
  if (!hasClass('p', 'remember').test(body)) fail(`chapter #${id} has no p.remember`);
  if (i > 0 && !hasClass('p', 'from').test(body)) warn(`chapter #${id} has no p.from carry-forward`);
  if (!visual.test(body)) fail(`chapter #${id} has no visual component`);
  if (w > 250) warn(`chapter #${id} reading path is ${w} words; aim under 250`);
  for (const p of readingPath.matchAll(/<p(?![\w-])(?![^>]*class="(?:answer|take|remember|from|nothing)")[^>]*>([\s\S]*?)<\/p>/g)) {
    const pw = words(p[1]);
    if (pw > 40) fail(`chapter #${id}: paragraph of ${pw} words (max 40): "${strip(p[1]).slice(0, 60)}…"`);
    for (const s of strip(p[1]).split(/(?<=[.!?])\s+/)) if (words(s) > 30) warn(`chapter #${id}: sentence of ${words(s)} words: "${s.slice(0, 60)}…"`);
  }
});
info.readingPathWords = totalWords;
if (totalWords > 1400) warn(`reading path is ${totalWords} words across chapters; aim under 1400`);

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

// ---- report
const out = { file, ok: fails.length === 0, fails, warns, info };
if (asJson) console.log(JSON.stringify(out, null, 2));
else {
  console.log(`${out.ok ? 'PASS' : 'FAIL'}  ${file}`);
  console.log(`  title: "${info.title}"  chapters: ${info.chapters}  reading-path words: ${info.readingPathWords}  size: ${info.kb} KB`);
  for (const f of fails) console.log(`  FAIL  ${f}`);
  for (const w of warns) console.log(`  warn  ${w}`);
}
process.exit(out.ok ? 0 : 1);
