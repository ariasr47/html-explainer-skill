#!/usr/bin/env node
// html-explainer anchor check. Zero dependencies.
// Usage: node anchors.mjs <index.html> --repo <path> [--rev <hash>]
// Collects every .anchor and .inspect element, then confirms that its data-src exists in the
// repository (working tree, or the committed tree at --rev) and that data-line falls inside the file.
// One line per failure, then "N anchors, M missing files, K out of range". Counts are per anchor.
// A missing or empty data-src counts as a missing file; a missing or non-numeric data-line as out of range.
// Exit 0 when every anchor resolves, 1 otherwise, 2 on bad usage.
import { readFileSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';

const argv = process.argv.slice(2);
const flag = (name) => { const i = argv.indexOf(name); return i < 0 ? undefined : argv[i + 1]; };
const file = argv.find((a, i) => !a.startsWith('--') && !(argv[i - 1] || '').startsWith('--'));
const repo = flag('--repo'), rev = flag('--rev');
if (!file || !repo) { console.error('usage: node anchors.mjs <index.html> --repo <path> [--rev <hash>]'); process.exit(2); }
const root = resolve(repo);
try { if (!statSync(root).isDirectory()) throw 0; } catch { console.error(`not a directory: ${root}`); process.exit(2); }

// git, with path conversion off so Git Bash on Windows leaves "rev:path" alone
const git = (...a) => execFileSync('git', ['-C', root, ...a], { env: { ...process.env, MSYS_NO_PATHCONV: '1' }, stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 29 });
if (rev) try { git('rev-parse', '--verify', '--quiet', `${rev}^{commit}`); } catch { console.error(`cannot resolve revision ${rev} in ${root}`); process.exit(2); }

// ---- collect: blank comments, scripts and styles (keeping newlines) so embedded sources are never scanned
const html = readFileSync(file, 'utf8').replace(/<!--[\s\S]*?-->|<(script|style)\b[\s\S]*?<\/\1\s*>/gi, (m) => m.replace(/[^\n]/g, ' '));
const tag = /<([a-z][\w:-]*)((?:\s+[^\s"'<>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*\/?>/gi;
const attr = /([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#0*39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const found = [];
let row = 1, seen = 0;
for (const m of html.matchAll(tag)) {
  if (!/anchor|inspect/.test(m[2])) continue;
  const at = {};
  for (const x of m[2].matchAll(attr)) at[x[1].toLowerCase()] = decode(x[2] ?? x[3] ?? x[4] ?? '');
  if (!/(^|\s)(anchor|inspect)(\s|$)/.test(at.class || '')) continue;
  for (; seen < m.index; seen++) if (html.charCodeAt(seen) === 10) row++;
  found.push({ row, src: (at['data-src'] || '').trim().replace(/\\/g, '/').replace(/^\.\//, ''), line: at['data-line'] });
}

// ---- resolve: line count of each distinct file, or null when it is not there
const cache = new Map();
const lineCount = (p) => {
  if (!cache.has(p)) {
    let n = null;
    try {
      const text = rev ? git('cat-file', 'blob', `${rev}:${p}`).toString('utf8')
        : statSync(join(root, p)).isFile() ? readFileSync(join(root, p), 'utf8') : null;
      if (text !== null) n = text === '' ? 0 : text.split('\n').length - (text.endsWith('\n') ? 1 : 0);
    } catch { /* absent */ }
    cache.set(p, n);
  }
  return cache.get(p);
};
const outside = (p) => !p || p.startsWith('/') || /^[a-z]:/i.test(p) || p.split('/').includes('..'); // never read beyond the repository

let missing = 0, range = 0;
for (const f of found) {
  const n = outside(f.src) ? null : lineCount(f.src);
  const line = /^\d+$/.test(f.line ?? '') ? Number(f.line) : 0;
  if (n === null) { missing++; console.log(`${file}:${f.row}  missing file  ${f.src || '(no data-src)'}`); }
  else if (line < 1 || line > n) { range++; console.log(`${file}:${f.row}  out of range  ${f.src}:${f.line ?? '(no data-line)'} (file has ${n} lines)`); }
}
console.log(`${found.length} anchors, ${missing} missing files, ${range} out of range`);
process.exit(missing + range ? 1 : 0);
