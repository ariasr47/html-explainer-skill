#!/usr/bin/env node
// html-explainer translation sidecar. Zero dependencies.
//   node translate.mjs extract page.html > strings.json
//   node translate.mjs apply page.html strings.ja.json --lang ja [--ui ../assets/i18n/ui.ja.json] > page.ja.html
//   node translate.mjs check page.html page.ja.html
// extract lists every string worth translating, in document order. The translator edits only the "text" values.
// apply writes the second page: tags, ids, classes and data-q never change, only text does. A translated item wins.
// An item left unchanged is looked up in the --ui file (exact match on the trimmed text), so interface strings come
// out right even when the strings file never touched them. The --ui file is skipped when --lang equals the page's own
// lang, because its keys are English. check lists the items identical in both pages that are not code, so the author
// sees what was left in English (exit 0 either way, exit 1 only when the pages do not share one layout).
// Redirect with bash or PowerShell 7. Windows PowerShell 5.1 writes `>` output as UTF-16.
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

const USAGE = `usage:
  node translate.mjs extract page.html > strings.json
  node translate.mjs apply page.html strings.json --lang ja [--ui ../assets/i18n/ui.ja.json] > page.ja.html
  node translate.mjs check page.html page.ja.html`;

const VOID = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
const RAW = new Set(['script', 'style']);               // contents are code, never listed
const CODE = new Set(['code', 'pre', 'kbd', 'samp']);   // listed with kind "code" so the translator can leave them
// Attributes that hold text a reader sees. data-rec is drawn by CSS (attr()), data-keep feeds the sticky bar.
const ATTRS = new Set(['title', 'aria-label', 'placeholder', 'alt', 'data-rec', 'data-keep']);
const ATTR = /([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/dg;

const die = (m) => { console.error('translate: ' + m); process.exit(1); };
const text = (f) => { try { return readFileSync(f, 'utf8'); } catch (e) { return die(`cannot read ${f} (${e.code})`); } };
const noBom = (s) => (s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s);
const json = (f) => { try { return JSON.parse(noBom(text(f))); } catch (e) { return die(`${f} is not valid JSON: ${e.message}`); } };
const norm = (s) => s.replace(/\s+/g, ' ');
// Escape what a translator may type. Idempotent: an entity already in the text (&amp; &#39;) is left alone.
const esc = (s) => s.replace(/&(?!#?\w+;)/g, '&amp;').replace(/</g, '&lt;');

// ---------- tokenizer: lossless, so joining the tokens returns the page byte for byte ----------
function tagEnd(s, i) {                                  // index just after the '>' that closes the tag at i, quotes respected
  for (let q = '', j = i + 1; j < s.length; j++) {
    const c = s[j];
    if (q) { if (c === q) q = ''; } else if (c === '"' || c === "'") q = c; else if (c === '>') return j + 1;
  }
  return s.length;
}

function tokenize(html) {                                // tokens: tag, text, raw (script/style body), misc (comment, doctype)
  const toks = [], nextTag = /<(?=[A-Za-z\/!?])/g;
  for (let i = 0, end; i < html.length; i = end) {
    if (html[i] === '<' && /[A-Za-z\/!?]/.test(html[i + 1] || '')) {
      if (html.startsWith('<!--', i)) {
        end = html.indexOf('-->', i + 4); end = end < 0 ? html.length : end + 3;
        toks.push({ k: 'misc', s: html.slice(i, end) }); continue;
      }
      end = tagEnd(html, i);
      const s = html.slice(i, end), m = /^<(\/?)([A-Za-z][^\s\/>]*)/.exec(s);
      if (!m) { toks.push({ k: 'misc', s }); continue; }
      const t = { k: 'tag', s, close: !!m[1], name: m[2].toLowerCase(), self: s.endsWith('/>'), nameEnd: m[0].length };
      toks.push(t);
      if (!t.close && !t.self && RAW.has(t.name)) {      // everything up to the closing tag is opaque
        const re = new RegExp(`</${t.name}[\\s>]`, 'gi'); re.lastIndex = end;
        const stop = re.exec(html)?.index ?? html.length;
        if (stop > end) toks.push({ k: 'raw', s: html.slice(end, stop) });
        end = stop;
      }
    } else {                                             // text runs to the next real tag; a lone "<" (a < b) stays text
      nextTag.lastIndex = i + 1; end = nextTag.exec(html)?.index ?? html.length;
      toks.push({ k: 'text', s: html.slice(i, end) });
    }
  }
  return toks;
}

function attrsOf(t) {                                    // [{ name, raw, value, a, b }], a..b spans the whole attribute in t.s
  return [...t.s.slice(t.nameEnd).matchAll(ATTR)].map((m) => ({
    name: m[1].toLowerCase(), raw: m[1], value: m[2] ?? m[3] ?? m[4],
    a: t.nameEnd + m.indices[0][0], b: t.nameEnd + m.indices[0][1],
  }));
}

// "body > div.page > main#main > section#core.chapter > p:nth-of-type(2)": ids, classes, data-q, nth-of-type when needed
const label = (n) => {
  const attr = (n.q ? `[data-q=${n.q}]` : '') + (n.meta ? `[name=${n.meta}]` : '');
  return n.tag + (n.id ? '#' + n.id : '') + (n.cls ? '.' + n.cls : '') + attr +
    (!n.id && !attr && n.parent.n[n.tag] > 1 ? `:nth-of-type(${n.nth})` : '');
};
const pathOf = (n) => { const p = []; for (; n.tag && n.tag !== 'html'; n = n.parent) p.unshift(label(n)); return p.join(' > '); };

// Walk the tokens once and list the items in document order. Each item remembers its token and the span to edit.
function scan(html) {
  const toks = tokenize(html), items = [], root = { n: {} }, stack = [root];
  for (const t of toks) {
    const top = stack[stack.length - 1];
    if (t.k === 'tag' && t.close) {
      for (let j = stack.length - 1; j > 0; j--) if (stack[j].tag === t.name) { stack.length = j; break; }
    } else if (t.k === 'tag') {
      const at = attrsOf(t), get = (n) => at.find((a) => a.name === n)?.value;
      const node = {
        tag: t.name, parent: top, n: {}, nth: (top.n[t.name] = (top.n[t.name] || 0) + 1), id: get('id'), q: get('data-q'),
        cls: (get('class') || '').trim().split(/\s+/).filter(Boolean).join('.'), meta: t.name === 'meta' ? get('name') : undefined,
      };
      const description = /^description$/i.test(node.meta || '');
      for (const a of at) {
        if (!a.value?.trim() || !(ATTRS.has(a.name) || (description && a.name === 'content'))) continue;
        items.push({ kind: 'attr', attr: a.name, raw: a.raw, node, tok: t, a: a.a, b: a.b, text: norm(a.value.trim()) });
      }
      if (!t.self && !VOID.has(t.name)) stack.push(node);
    } else if (t.k === 'text') {
      const core = t.s.trim(); if (!core) continue;
      const a = t.s.length - t.s.trimStart().length, code = stack.some((n) => CODE.has(n.tag));
      items.push({ kind: code ? 'code' : 'text', attr: null, node: top, tok: t, a, b: a + core.length, text: code ? core : norm(core) });
    }
  }
  for (const it of items) it.path = pathOf(it.node);
  return { toks, items };
}

const edit = (t, a, b, s) => (t.edits ||= []).push({ a, b, s });
const render = (toks) => toks.map((t) => {
  let s = t.s;
  for (const e of (t.edits || []).sort((x, y) => y.a - x.a)) s = s.slice(0, e.a) + e.s + s.slice(e.b);
  return s;
}).join('');
const htmlTag = (toks) => toks.find((t) => t.k === 'tag' && !t.close && t.name === 'html');
const langAttr = (toks) => { const h = htmlTag(toks); return h && attrsOf(h).find((a) => a.name === 'lang'); };

// ---------- interface strings: exact match on the trimmed text of an item ----------
// A key may hold {name} (one word) and (s) (optional s): "Chapter {n} of {m}, about {t} minute(s)".
function swapper(map) {
  if (!map || typeof map !== 'object' || Array.isArray(map)) die('the --ui file must be one JSON object of English string to translated string');
  const exact = new Map(), pats = [];
  for (const [k, v] of Object.entries(map)) {
    if (typeof v !== 'string') continue;
    if (!/\{\w+\}|\(s\)/.test(k)) { exact.set(k, v); continue; }
    const names = [];
    const src = k.split(/(\{\w+\}|\(s\))/).map((p, i) => i % 2 === 0 ? p.replace(/[.*+?^$()|[\]\\{}]/g, '\\$&')
      : p === '(s)' ? 's?' : (names.push(p.slice(1, -1)), '(\\S+?)')).join('');
    pats.push({ re: new RegExp(`^${src}$`), names, v });
  }
  return (s) => {
    if (exact.has(s)) return exact.get(s);
    for (const p of pats) {
      const m = p.re.exec(s);
      if (m) return p.v.replace(/\{(\w+)\}/g, (all, n) => (p.names.includes(n) ? m[p.names.indexOf(n) + 1] : all));
    }
  };
}

// ---------- commands ----------
function extract([file]) {
  const { toks, items } = scan(text(file));
  const rows = items.map((it, i) => '  ' + JSON.stringify({ i, kind: it.kind, path: it.path, attr: it.attr, text: it.text }));
  process.stdout.write(`{"source":${JSON.stringify(basename(file))},"lang":${JSON.stringify(langAttr(toks)?.value ?? 'en')},"items":[\n${rows.join(',\n')}\n]}\n`);
}

function apply([file, stringsFile], flags) {
  const lang = flags.lang;
  if (!/^[a-z]{2,3}(-[A-Za-z0-9]+)*$/.test(lang || '')) die('apply needs --lang with a language code, for example --lang ja');
  const { toks, items } = scan(text(file)), rows = json(stringsFile)?.items;
  if (!Array.isArray(rows)) die(`${stringsFile} has no "items" array`);
  if (rows.length !== items.length) {
    die(`item counts differ: ${stringsFile} has ${rows.length}, ${file} has ${items.length}. ` +
      'The page changed since extract, or items were added or dropped. Run extract again and translate that file.');
  }
  const byIndex = new Map(rows.map((r, n) => [r?.i ?? n, r]));
  const h = htmlTag(toks), cur = langAttr(toks);
  // Interface strings are English keys, so they only apply when the page really changes language.
  const swap = flags.ui && (cur?.value ?? 'en') !== lang ? swapper(json(flags.ui)) : null;
  let changed = 0, swapped = 0, drift = 0;
  items.forEach((it, n) => {
    const r = byIndex.get(n);
    if (!r) die(`${stringsFile} has no entry with "i": ${n}`);
    if ((r.kind ?? it.kind) !== it.kind || (r.attr ?? it.attr) !== it.attr) {
      const say = (k, a) => k + (a ? ' ' + a : '');
      die(`item ${n} does not line up: the strings file says ${say(r.kind ?? it.kind, r.attr ?? it.attr)}, the page has ${say(it.kind, it.attr)} at ${it.path}. Run extract again.`);
    }
    if (r.path && r.path !== it.path) drift++;
    let t = typeof r.text === 'string' ? r.text.trim() : '';
    if (!t) die(`item ${n} (${it.path}) has no text`);
    if (t === it.text && swap && it.kind !== 'code') {   // left untranslated: the interface file may still know it
      const s = swap(it.text);
      if (s !== undefined && s !== it.text) { t = s; swapped++; }
    }
    if (t === it.text) return;                           // unchanged: the source bytes stay as they were
    edit(it.tok, it.a, it.b, it.kind === 'attr' ? `${it.raw}="${esc(t).replace(/"/g, '&quot;')}"` : esc(t));
    changed++;
  });
  if (!h) console.error('translate: warning: no <html> tag, lang not set');
  else if (cur?.value !== lang) cur ? edit(h, cur.a, cur.b, `lang="${lang}"`) : edit(h, h.nameEnd, h.nameEnd, ` lang="${lang}"`);
  process.stdout.write(render(toks));
  if (flags.ui && !swap) console.error(`translate: the page is already lang="${lang}", so --ui was not applied`);
  if (!flags.ui && (cur?.value ?? 'en') !== lang) console.error('translate: no --ui given, interface strings keep their source language');
  console.error(`translate: ${items.length} items, ${changed} changed${swap ? `, ${swapped} from the interface file` : ''}, lang="${lang}"` +
    (drift ? `, warning: ${drift} paths differ from the strings file` : ''));
}

function check([fileA, fileB]) {
  const A = scan(text(fileA)), B = scan(text(fileB));
  if (A.items.length !== B.items.length) {
    die(`item counts differ: ${fileA} has ${A.items.length}, ${fileB} has ${B.items.length}. Both pages must share one layout; make the second with apply.`);
  }
  const left = []; let code = 0, bare = 0;
  A.items.forEach((a, n) => {
    if (a.text !== B.items[n].text) return;
    if (a.kind === 'code') code++;
    else if (!/[A-Za-z]/.test(a.text)) bare++;           // numbers, symbols and emoji belong to no language
    else left.push(`  #${n}  ${a.path.split(' > ').slice(-2).join(' > ')}${a.attr ? ' [' + a.attr + ']' : ''}  "${a.text.length > 72 ? a.text.slice(0, 72) + '...' : a.text}"`);
  });
  const la = langAttr(A.toks)?.value, lb = langAttr(B.toks)?.value;
  console.log(`${left.length} of ${A.items.length} items unchanged and not code (not counted: ${code} code, ${bare} without letters)`);
  if (la === lb) console.log(`  note: both pages declare lang="${la}"`);
  for (const l of left) console.log(l);
}

const [cmd, ...rest] = process.argv.slice(2), flags = {}, args = [];
for (let i = 0; i < rest.length; i++) rest[i].startsWith('--') ? (flags[rest[i].slice(2)] = rest[++i]) : args.push(rest[i]);
const commands = { extract: [1, extract], apply: [2, apply], check: [2, check] };
if (!commands[cmd] || args.length !== commands[cmd][0]) { console.error(USAGE); process.exit(2); }
commands[cmd][1](args, flags);
