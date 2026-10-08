/* html-explainer atlas add-on, v1.0. Zero dependencies, atlas pages only.
   Load after the template script:  <script src="atlas.js" defer></script>

   Markup (names are final)
   Map     <figure class="figure sysmap"><svg role="group" ..> nodes <g data-node="api">shape and label</g>,
           edges <g data-edge="web>api">line, arrowhead, <text class="d-text-s">label</text></g> </svg>
           <div class="node-detail" data-node="api">..</div> ..  <figcaption class="take">..</figcaption></figure>
           Select a node (click, Enter): it gets is-selected, its edges and neighbours is-lit, the rest dims, its
           .node-detail shows. Escape or a second click clears. Other states: d-dormant, d-target on the shape.
   Source  <a class="inspect" href="#src-up" data-src="app/up.py" data-line="12">Inspect implementation</a>
           <script type="text/plain" id="src-up" data-src="app/up.py">the whole file, from line 1</script>
           (write </script in a snippet as <\/script)
   Trace   <ol class="trace" id="upload" data-lanes="browser,api,db"><li data-lane="api">One-line label</li>..</ol>
   Matrix  <table class="matrix"><caption>..</caption>.. <td class="go|wait|stop">..</td></table>
   Search  <input type="search" class="atlas-search" aria-label="Search"> inside the rail's .tools
   Link    #<chapter-id>/<node-or-trace-id>, written on select and restored on load. */
(() => {
  'use strict';
  const d = document, body = d.body;
  const [CLOSE, NONE, HITS] = /^ja/i.test(d.documentElement.lang)
    ? ['閉じる', '一致なし', n => n + ' 件']
    : ['Close', 'No match', n => n + (n === 1 ? ' match' : ' matches')];
  const all = (sel, from = d) => [...from.querySelectorAll(sel)];
  const chap = el => el.closest('section[id]');
  const nodes = [], traces = [];
  let current = null, dlg, pre, opener;

  /* ---------- permalinks and jumping ---------- */
  function write(el, id) {
    const c = chap(el);
    if (c) try { history.replaceState(null, '', '#' + encodeURIComponent(c.id) + (id ? '/' + encodeURIComponent(id) : '')); } catch (e) {}
  }
  function reveal(el, block, focus) {
    for (let f = el.closest('details'); f; f = f.parentElement.closest('details')) f.open = true;
    const c = chap(el);
    const link = c && body.dataset.focus === 'on' && d.querySelector(`.rail a[href="#${c.id}"]`);
    if (link) link.click();  // one-chapter mode: let the template switch
    el.scrollIntoView({ block });
    if (focus) { if (!el.hasAttribute('tabindex')) el.tabIndex = -1; el.focus({ preventScroll: true }); }
  }
  function restore() {
    let m = /^#([^/]+)\/(.+)$/.exec(location.hash);
    if (!m) return;
    try { m = m.slice(1).map(decodeURIComponent); } catch (e) { return; }
    const hit = [...nodes, ...traces].find(o => o.id === m[1] && chap(o.el)?.id === m[0]);
    if (!hit) return;
    select(hit);
    requestAnimationFrame(() => reveal(hit.el, hit.node ? 'center' : 'start'));
  }

  /* ---------- selection: one node or one trace at a time ---------- */
  function clear() {
    all('.is-selected, .is-lit').forEach(el => el.classList.remove('is-selected', 'is-lit'));
    nodes.forEach(n => n.el.setAttribute('aria-pressed', 'false'));
    all('.node-detail').forEach(x => { x.hidden = true; });
    current = null;
  }
  function select(o) {
    clear(); current = o;
    o.el.classList.add('is-selected');
    if (o.node) {  // light edges and neighbours, show detail
      const svg = o.el.closest('svg'), fig = svg.closest('.sysmap'), lit = new Set();
      o.el.setAttribute('aria-pressed', 'true');
      all('[data-edge]', svg).forEach(e => {
        const [a, b = ''] = e.dataset.edge.split('>').map(s => s.trim());
        if (a === o.id || b === o.id) { e.classList.add('is-lit'); lit.add(a === o.id ? b : a); }
      });
      all('[data-node]', svg).forEach(n => { if (n !== o.el && lit.has(n.dataset.node)) n.classList.add('is-lit'); });
      all('.node-detail', fig.querySelector('.node-detail') ? fig : chap(fig) || d).forEach(x => { x.hidden = x.dataset.node !== o.id; });
    }
    if (o.id) write(o.el, o.id);
  }
  function toggle(o) {
    if (current !== o) return select(o);
    clear(); write(o.el, '');
  }

  /* ---------- system maps ---------- */
  all('.sysmap svg').forEach(svg => {
    if (svg.getAttribute('role') === 'img') svg.setAttribute('role', 'group');  // role=img hides the nodes from screen readers
    all('[data-node]', svg).forEach(el => {
      const n = { el, id: el.dataset.node, node: true };
      el.setAttribute('role', 'button');
      if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
      if (!el.hasAttribute('aria-label') && !el.textContent.trim()) el.setAttribute('aria-label', n.id);
      el.addEventListener('click', () => toggle(n));
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(n); } });
      nodes.push(n);
    });
  });

  /* ---------- request traces: one grid column per lane ---------- */
  all('ol.trace').forEach(ol => {
    const lanes = (ol.dataset.lanes || '').split(',').map(s => s.trim()).filter(Boolean);
    const t = { el: ol, id: ol.id }, head = d.createDocumentFragment();
    [...ol.children].forEach((li, i) => {
      li.style.setProperty('--lane', lanes.indexOf(li.dataset.lane) + 1 || 1);
      li.style.setProperty('--step', i + 2);  // row 1 holds the lane heads
      li.tabIndex = 0;
    });
    lanes.forEach((name, k) => {
      const li = d.createElement('li');
      li.className = 'trace-lane'; li.setAttribute('aria-hidden', 'true'); li.textContent = name; li.style.setProperty('--lane', k + 1);
      head.append(li);
    });
    ol.style.setProperty('--lanes', lanes.length || 1);
    ol.prepend(head);
    ol.addEventListener('click', e => { if (!e.target.closest('a, button')) toggle(t); });
    ol.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.parentNode === ol) { e.preventDefault(); toggle(t); }
    });
    traces.push(t);
  });

  /* ---------- matrix: a scroll box keeps the first column in view ---------- */
  all('table.matrix').forEach(tb => {
    const w = d.createElement('div');
    w.className = 'matrix-wrap'; w.tabIndex = 0;
    tb.replaceWith(w); w.append(tb);
  });

  /* ---------- source inspector ---------- */
  function inspect(link) {
    const src = d.getElementById(link.getAttribute('href').slice(1));
    if (!src) return false;
    if (!dlg) {
      dlg = body.appendChild(d.createElement('dialog'));
      dlg.className = 'inspector'; dlg.setAttribute('aria-labelledby', 'inspector-title');
      dlg.innerHTML = `<header><div><b id="inspector-title"></b><small></small></div><form method="dialog"><button>${CLOSE}</button></form></header><pre tabindex="0"></pre>`;
      pre = dlg.querySelector('pre');
      dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
      dlg.addEventListener('keydown', e => e.stopPropagation());  // keep the page's J K F S D R keys quiet
      dlg.addEventListener('close', () => opener.focus());  // WebKit does not restore focus itself
    }
    opener = link;
    const line = parseInt(link.dataset.line, 10) || 0, rev = d.querySelector('[data-revision]'), rows = d.createDocumentFragment();
    const lines = src.textContent.replace(/<\\\/script/gi, '</script').replace(/^\r?\n|\r?\n$/g, '').split(/\r?\n/);
    lines.forEach((text, i) => {
      const s = d.createElement('span');
      s.dataset.n = i + 1; s.textContent = text;
      if (i + 1 === line) s.setAttribute('aria-current', 'location');
      rows.append(s);
    });
    dlg.querySelector('b').textContent = link.dataset.src + (line ? ':' + line : '');
    dlg.querySelector('small').textContent = rev ? rev.dataset.revision : '';
    pre.replaceChildren(rows);
    pre.style.setProperty('--w', String(lines.length).length);
    if (!dlg.open) dlg.showModal();
    const hit = pre.querySelector('[aria-current]');
    if (hit) hit.scrollIntoView({ block: 'center' }); else pre.scrollTop = 0;
    return true;
  }
  d.addEventListener('click', e => {
    const a = e.target.closest('a.inspect');
    if (a && inspect(a)) e.preventDefault();
  });

  /* ---------- rail search: h2, h3, glossary terms and map nodes ---------- */
  const box = d.querySelector('input.atlas-search');
  if (box) {
    const out = d.createElement('output'), index = [], text = el => el.textContent.replace(/\s+/g, ' ').trim().toLowerCase();
    let hits = [];
    box.after(out);
    all('main h2, main h3, main .term dt').forEach(el => { if (!el.closest('.node-detail')) index.push({ el, text: text(el) }); });
    nodes.forEach(n => index.push({ el: n.el, node: n, text: n.id.toLowerCase() + ' ' + text(n.el) }));
    index.sort((a, b) => (a.el.compareDocumentPosition(b.el) & 4 ? -1 : 1));
    const run = () => {
      const q = box.value.trim().toLowerCase(), seen = new Set();
      hits = q ? index.filter(it => it.text.includes(q)).sort((a, b) => a.text.indexOf(q) - b.text.indexOf(q)) : [];
      hits.forEach(h => { const c = chap(h.el); if (c) seen.add(c.id); });
      all('.rail ol > li').forEach(li => {
        const a = li.querySelector('a[href^="#"]');
        li.hidden = !!q && !(a && seen.has(a.getAttribute('href').slice(1)));
      });
      out.textContent = q ? (hits.length ? HITS(hits.length) : NONE) : '';
    };
    box.addEventListener('input', run);
    box.addEventListener('keydown', e => {
      if (e.key === 'Escape') { box.value = ''; run(); }
      if (e.key !== 'Enter' || !hits.length) return;
      e.preventDefault();
      if (hits[0].node) select(hits[0].node);
      reveal(hits[0].el, hits[0].node ? 'center' : 'start', true);
    });
  }

  /* ---------- Escape and the hash ---------- */
  clear();
  d.addEventListener('keydown', e => {
    if (e.key === 'Escape' && current && !dlg?.open && !e.target.matches('input, textarea, select')) toggle(current);
  });
  addEventListener('hashchange', restore);
  restore();
})();
