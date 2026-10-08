# Build spec: html-explainer plugin v1.0

Date 2026-10-07. Greenlit scope: option A of `docs/proposals/2026-10-07-plugin-and-atlas.md` under its lean rule. This file is the integration contract for parallel implementers. Every name below (file, class, attribute, token, flag) is final; implementers use these names exactly and invent no others.

## Repository layout after the build

```
.claude-plugin/plugin.json          name "html-explainer", version "1.0.0", skills: the three skill folders
.claude-plugin/marketplace.json     unchanged shape; plugin source "./"
SKILL.md                            root shim: points standalone installs to skills/html-explainer/SKILL.md
skills/html-explainer/SKILL.md      core contract, under 600 words
skills/html-explainer/types.md      decision, status, spec, release, research, handover
skills/explainer-gather/SKILL.md    under 400 words
skills/explainer-gather/modes.md    one table plus short notes
skills/explainer-atlas/SKILL.md     under 500 words
assets/template.html                the single source of CSS, components, optional script
assets/gallery.html                 every component with real content, same CSS block as template
assets/design-system.md  writing.md  diagrams.md
assets/atlas.css  atlas.js          add-on for atlas pages only
assets/merge.html                   single-file merge tool for gather answers
assets/i18n/ui.ja.json              Japanese interface strings
assets/i18n/glossary.example.json   example term glossary for translation
scripts/check.mjs  translate.mjs  anchors.mjs
README.md  LICENSE  AGENTS.md  docs/
```

Path rule inside every SKILL.md: relative to the SKILL.md file itself, for example `../../assets/template.html` and `../../scripts/check.mjs`. Never `~/.claude/...`, never `${CLAUDE_PLUGIN_ROOT}`. The repository root is both the standalone skill folder (via junction or clone) and the plugin root, so relative paths work on both routes.

## Page identity

`<html lang="en" data-type="explainer">`. `lang` is `en` or `ja` (others allowed, rules fall back to English). `data-type` is one of `explainer`, `decision`, `status`, `spec`, `release`, `research`, `handover`, `gather`, `atlas`. Missing `data-type` means `explainer`.

## Template changes (owner: template agent)

### Tokens

Light `:root` changes: `--ink-faint: #5f6f7f`. New tokens in light: `--on-here: #ffffff; --on-go: #ffffff; --on-wait: #ffffff; --on-stop: #ffffff; --on-decide: #ffffff; --on-soft: #ffffff;`. In both dark blocks: all six `--on-*` become `#0e151c`. Every place that draws text on a meaning fill uses the matching `--on-*` token instead of `#fff`: `.skip`, `.rail .tools button[aria-pressed="true"]`, `.map a::before`, `.flow li::before` (uses `--on-soft`, and `--on-here` for `.here`), `.steps > li::before`, `.decision > h3::before`, `.option[data-rec]::after`, `.ask .choices > *[data-rec]`, `.focus-nav button[data-next]`, `.d-num`. Target: every text-on-fill pair at or above 4.5:1 in both themes.

### Glyphs (WCAG 1.4.1)

`.status li::before` gets text content by state: `.go` "✓", `.wait` "!", `.stop` "✕", `.decide` "?", `.here` "●", `.memory` "★", default none. The circle keeps its fill; glyph colour is the matching `--on-*` token; font-size 0.65rem, centred (make the pseudo-element a grid). `.timeline li.go::before` content "✓" in `--on-go`, 0.6rem. `.flow li.go/.wait/.stop::after` adds a small glyph in the top-right corner coloured with the state colour on the card: "✓", "!", "✕". `.tile.go .n::after`, `.tile.stop .n::after`: no change (number tiles are not status).

### Japanese block

Append to the font `<link>`: `&family=BIZ+UDPGothic:wght@400;700&family=BIZ+UDGothic`. Add this CSS block after the base section:

```css
:lang(ja) {
  --font-head: "BIZ UDPGothic", "Yu Gothic UI", "Yu Gothic", "Hiragino Sans", "Meiryo", "Noto Sans JP", sans-serif;
  --font-body: "BIZ UDPGothic", "Yu Gothic", "Hiragino Sans", "Meiryo", "Noto Sans JP", sans-serif;
  --font-code: "BIZ UDGothic", "Cascadia Code", Consolas, monospace;
  --measure: 36em;
  line-height: 1.75; letter-spacing: .03em; line-break: strict; hyphens: none;
}
:lang(ja) h1, :lang(ja) h2, :lang(ja) h3, :lang(ja) h4 { letter-spacing: 0; line-height: 1.35; }
:lang(ja) em, :lang(ja) i { font-style: normal; font-weight: 700; }
:lang(ja) .answer { line-height: 1.5; }
```

### Gather components (CSS and script in the template; markup documented in the gallery)

Markup the gather skill will write:

```html
<div class="answer-field" data-q="q1">
  <label for="q1">Question as a full sentence?</label>
  <p class="hint">What a good answer contains.</p>
  <textarea id="q1" rows="3"></textarea>
</div>

<fieldset class="answer-field" data-q="q2" data-kind="choice">
  <legend>Question as a full sentence?</legend>
  <label><input type="radio" name="q2" value="A"> Option A</label>
  <label><input type="radio" name="q2" value="B"> Option B</label>
  <textarea id="q2-why" rows="2" aria-label="Why"></textarea>   <!-- optional reason -->
</fieldset>
```

`data-kind`: `text` (default), `choice` (radio), `multi` (checkbox), `scale` (radios 1 to 5), `rank` (an `ol` of items, each with up and down buttons; the script records the order), `confirm` (three radios: understood, agree, concern, plus a textarea). The collect bar:

```html
<div class="collect" hidden>
  <input class="respondent" type="text" placeholder="Your name (optional)" aria-label="Your name">
  <span class="count"></span>
  <button type="button" data-copy>Copy all answers</button>
  <button type="button" data-download>Download .md</button>
  <button type="button" data-json>Copy JSON</button>
</div>
```

Behaviour (script, zero dependencies, inside the existing optional script block): autosave every field under `localStorage["explainer:" + pathname + ":answers"]` keyed by `data-q`; `.collect` becomes visible once one field has a value and shows "3 of 5 answered"; the rail link of the chapter containing an answered field gets class `answered` (dot turns `--go`); copy and download produce the Markdown shape below; JSON copy produces the object below. Everything works offline; nothing is sent anywhere.

Markdown shape (exact):

```
# {title}: answers from {name or "anonymous"} on {YYYY-MM-DD} ({lang})

## [{q}] {question text verbatim}
{answer, or chosen option labels joined by ", ", or ranked items one per line}

## Not answered
[{q}] {question text}
```

JSON shape: `{"title","lang","name","date","answers":[{"q","kind","question","answer"}],"unanswered":[{"q","question"}]}`.

### Chapter time

Kicker convention: "Chapter 2 of 6, about 1 minute" (English) and "第2章 / 全6章、約1分" (Japanese). No script; the writer computes it (English 200 words a minute, Japanese 500 characters a minute, rounded up).

### Gallery

Rebuild `assets/gallery.html` with the template's full `<style>` and script blocks copied verbatim, keep its existing chapters, and add one chapter "Ask and collect" demonstrating two `.answer-field` kinds and the `.collect` bar, and show the glyphs in the colour chapter.

## Checker (owner: checker agent), `scripts/check.mjs`

Keep every current rule. Add:

- **Contrast from tokens.** Parse the light `:root` block and the `:root[data-theme="dark"]` block; compute WCAG ratios for: `--ink` on `--paper`, `--ink` on `--card`, `--ink-soft` on `--card`, `--ink-faint` on `--paper`, `--ink-faint` on `--card`, `--here` on `--card`, and each `--on-X` on `--X` for here, go, wait, stop, decide, and `--on-soft` on `--ink-soft`. FAIL under 4.5 for text pairs (the `--on-*` pairs included); report both themes.
- **Colour-only.** FAIL if the CSS lacks `.status li.go::before` with a `content:` declaration, or `.timeline li.go::before` with `content:`.
- **Type rules by `data-type`.** decision: at least one `.decision` and one `.ask`. status: at least one `.timeline` with exactly one `li.here` and at least one `.status`. spec: at least one `.split` and one `.status`. release: at least one `.tiles` and one `.split`. research: at least one `.status` or `.tiles`, and at least one `details.fold`. handover: at least one `.status` and one `.steps`. gather: at least one `.answer-field`; every `.answer-field` has a unique `data-q` and a non-empty `label` or `legend`; exactly one `.collect`. atlas: one `.legend` containing `.state-current`, `.state-dormant`, `.state-target`; at least one `.sysmap`; every `.anchor` has `data-src` and `data-line`; one element with `data-revision`.
- **Language rules.** Read `lang`. For `ja`: count characters instead of words (every non-space, non-punctuation character counts one); limits paragraph 90, sentence 60 (split on 。！？), keep item 25, answer bar 70; reading time 500 characters a minute; skip the middle-dot and Title Case warnings; FAIL on `font-style: italic` outside `<style>` or inside a `:lang(ja)` rule; FAIL if the CSS has no `:lang(ja)` block; FAIL if under 20% of letters are CJK. For `en`: FAIL if over 30% of letters are CJK. Missing `lang`: FAIL.
- **Fonts.** FAIL if the Google Fonts link is present but lacks `BIZ+UDPGothic` when `lang="ja"`.
- Output unchanged in shape: `PASS`/`FAIL`, title line, FAIL lines, warn lines, `--json`.

## Gather skill (owner: gather agent)

`skills/explainer-gather/SKILL.md`: description starts "Use when"; triggers: ask and collect, gather requirements, questionnaire, get answers from coworkers, collect feedback, review and annotate, poll a decision, prioritise, interview notes, pilot a survey, readout reactions. Body: what you produce (a core page with `data-type="gather"`, one `.answer-field` per question, exactly one `.collect`, questions as full sentences a reader can answer without the chapter, hint says what a good answer holds), process (write questions first, then the explaining chapters that make each question answerable, pick a mode from `modes.md`, build from `../../assets/template.html`, run `../../scripts/check.mjs`, deliver the page and point the author at `../../assets/merge.html`). Under 400 words.

`modes.md`: the ten-mode table from the proposal (collect, confirm, choose, prioritise, annotate, check, protocol, pilot, readout, recurring) with columns: mode, the reader does, `data-kind` to use, merged view. Plus three short rules: one question per field; stable `data-q` ids that never change between versions or languages; page passes the checker with every field empty.

`assets/merge.html`: a single file using the template's tokens (copy the `:root` and dark blocks and base type rules, nothing else). A textarea and a file-drop zone accept any number of pasted Markdown copies or JSON copies in the shapes above; parse both; group by `q`; show a table per question with one row per respondent (name, date, lang, answer); unanswered shown as a count; buttons: Copy Markdown, Copy JSON, Download CSV (columns q, question, respondent, date, lang, answer). Works offline, zero dependencies, dark mode, phone width. Interface strings in English; a `data-ui` attribute set is not required.

## Internationalisation (owner: i18n agent)

`assets/i18n/ui.ja.json`: an object mapping every English interface string in the template to Japanese. Minimum keys: "Skip to content", "Chapters", "Skim mode", "One chapter at a time", "Dark / light", "Previous", "Next", "Done", "Keep in your head (only these)", "Before this:", "Remember:", "Take from this:", "Recap", "What I need from you", "If you do nothing:", "recommended", "Recommended", "Reading time about {n} minutes", "Chapter {n} of {m}, about {t} minute(s)", "Copy all answers", "Download .md", "Copy JSON", "Your name (optional)", "answered", "Not answered", "answers from {name} on {date}", "anonymous", "Show the machinery", "Show the sources". Values: ざっと読む, 1章ずつ, ダーク / ライト, 前へ, 次へ, 完了, 覚えておくこと（これだけ）, 前提：, 覚える：, ここが要点：, まとめ, お願いしたいこと, 何もしない場合：, おすすめ, 読了目安 約{n}分, 第{n}章 / 全{m}章、約{t}分, 回答をすべてコピー, .md をダウンロード, JSON をコピー, お名前（任意）, 回答済み, 未回答, {name} の回答（{date}）, 匿名, 詳細を見る, 出典を見る. Add any other string found in the template.

`assets/i18n/glossary.example.json`: `{"terms":[{"en":"explainer","ja":"説明ページ","keep":false},{"en":"FormIntact","ja":"FormIntact","keep":true}]}` plus five more realistic entries; `keep: true` means leave the English term as is.

`scripts/translate.mjs`, zero dependencies:

- `node translate.mjs extract page.html > strings.json`: walks the document in order and emits `{"source":"page.html","lang":"en","items":[{"i":0,"kind":"text"|"attr","path":"main > section#core > p:nth-of-type(2)","attr":"placeholder"|null,"text":"..."}]}` for every non-empty text node outside `<style>` and `<script>` (SVG `<text>` and `<title>` included), and for attributes `title`, `aria-label`, `placeholder`, `alt`, `content` of `meta[name=description]`, and `<title>`. Text inside `<code>` and `<pre>` is included with `"kind":"code"` so the translator can leave it.
- `node translate.mjs apply page.html strings.ja.json --lang ja --ui ../assets/i18n/ui.ja.json > page.ja.html`: replaces each item by index with the translated `text`, sets `<html lang="ja">`, rewrites interface strings that exactly match a key in `ui.ja.json` (even if the strings file left them untranslated), and fails with a clear message if item counts differ. Whitespace around text nodes is preserved. No DOM library: implement a small tag/text tokenizer that is faithful enough for the template's HTML (no unclosed tags, attributes always quoted).
- `node translate.mjs check page.html page.ja.html`: reports items whose text is unchanged and are not `kind:"code"`, so the author sees what was left in English.

Also add a Japanese section to `assets/writing.md`: sentence under 60 characters, paragraph under 90, one idea, plain business Japanese (です・ます) for coworkers, no italics, 「」 for terms, half-width digits, 年月日 dates, the register table (coworkers, executives, engineers, public), and the rule that question ids and layout never change in translation.

## Atlas (owner: atlas agent)

`skills/explainer-atlas/SKILL.md`, under 500 words: use when asked for an architecture atlas, a system map, a backend or frontend reference, how the system fits together, onboarding to a codebase. Inputs: repository path, layer (backend, frontend, data, infra, whole system), the example entity to follow, where the adopted target comes from (a contract, a proposal file, or none). Steps: read the code one layer at a time; write anchored content (every claim that names code carries `<span class="anchor" data-src="relative/path.py" data-line="120">path.py:120</span>`); compose chapters from this menu, keeping only what applies: system map, one entity's journey, how data moves, request traces, processes and lifetimes, API, data model, storage and retention, identity and trust, states and failures, stack and deploy, sources and glossary; opening keeps the core contract (answer, keep, map); a `.legend` with the three states appears before the first diagram; a `[data-revision]` stamp with the commit hash and date sits in the meta line; output is a folder `docs/architecture/<layer>-atlas/` with `index.html`, `atlas.css`, `atlas.js` copied from `../../assets/`, budget 3 MB; run `../../scripts/check.mjs` and `../../scripts/anchors.mjs index.html --repo <path> --rev <hash>`; FormIntact's backend atlas in `C:\Dev\pdf-translator\docs\architecture\backend-atlas\` is the reference for quality, not a template to copy.

`assets/atlas.css` and `assets/atlas.js`, loaded by atlas pages after the template block with `<link rel="stylesheet" href="atlas.css">` and `<script src="atlas.js" defer></script>`:

- `.legend` row with `.state-current` (solid border), `.state-dormant` (amber dashed border, `--wait`), `.state-target` (dashed `--line-strong`, transparent fill). SVG classes `d-dormant` (fill `--wait-tint`, stroke `--wait`, dasharray 6 4) and `d-target` (fill none, stroke `--line-strong`, dasharray 6 6) for diagram nodes.
- `.sysmap` figure: an SVG whose nodes carry `data-node="id"` and edges `data-edge="from>to"` with a `<text class="d-text-s">` label each on its own track. Script: click or Enter on a node adds `is-selected` to it, `is-lit` to its edges and neighbours, dims the rest, and shows the matching `.node-detail[data-node="id"]` block (hidden otherwise); Escape clears.
- `.inspect` links: `<a class="inspect" href="#src-<id>" data-src="path" data-line="n">Inspect implementation</a>` open a `<dialog class="inspector">` showing the `<script type="text/plain" id="src-<id>" data-src="path">` snippet with line numbers and the anchored line highlighted; print shows nothing of the dialog.
- `.trace` swimlane: `ol.trace` with `li[data-lane="api"]` rendered on a CSS grid of lanes named by the `data-lanes="browser,api,engine,db"` attribute on the `ol`; step number and one-line label; keyboard reachable.
- `table.matrix` (if this part dies, trust matrix): sticky first column, cell classes `.go .wait .stop`.
- Rail search: `<input type="search" class="atlas-search">` in the rail tools filters rail entries and jumps on Enter; indexes `h2`, `h3`, `.term dt`, `[data-node]` ids.
- Permalinks: selecting a node or a trace writes `#<chapter-id>/<node-or-trace-id>` with `history.replaceState`; on load the hash restores the selection and scrolls.
- Everything respects `prefers-reduced-motion`, works with keyboard, and prints as static content.

`scripts/anchors.mjs`: `node anchors.mjs index.html --repo <path> [--rev <hash>]`. Collect every `.anchor` and `.inspect` with `data-src` and `data-line`. For each, confirm the file exists in the repository (at the working tree, or at `--rev` via `git show <rev>:<path>` with `MSYS_NO_PATHCONV=1` set) and that `data-line` is within its line count. Print one line per failure and a summary `N anchors, M missing files, K out of range`; exit 1 on any failure. Zero dependencies.

## Core skill, docs and manifests (owner: core agent)

- `skills/html-explainer/SKILL.md`: rewrite the current SKILL.md under 600 words. Keep: what you produce, the process, quick reference, common mistakes. Add: `data-type` and `lang` on `<html>`; the chapter-time kicker; headings as the question the chapter answers; the rule that the default state of any interactive element already makes the point; pointers to `types.md`, to `../explainer-gather/SKILL.md` and `../explainer-atlas/SKILL.md`; delivery in one line ("save under docs/explainers/, open it once in a browser, reply with the answer line and the link"). Remove the three reads and the checklist reference.
- `skills/html-explainer/types.md`: six entries (decision, status, spec, release, research, handover), each under 150 words with the five headings: when, chapter composition, required components, checker rules (as in the checker spec), one-line example topic.
- Root `SKILL.md` shim: frontmatter name `html-explainer`, the current description; body of three lines pointing to the three skills by relative path.
- `.claude-plugin/plugin.json`: version `1.0.0`, `"skills": ["./skills/html-explainer", "./skills/explainer-gather", "./skills/explainer-atlas"]`. `marketplace.json`: description updated to mention gather and atlas.
- `assets/design-system.md`: add the `--on-*` tokens and glyph rule, the gather components, the Japanese typography table, a short atlas section pointing at the add-on, and the "default state carries the point" rule for interactive figures. Remove references to `checklist.md`.
- `README.md`: install via marketplace (`/plugin marketplace add ariasr47/html-explainer-skill`, `/plugin install html-explainer@html-explainer-skill`), standalone clone still works through the root shim, one-route warning, what is in the folder (new layout), check a page, the three skills in one paragraph each, Japanese and merge tool mentions. Keep Rodrigo's packaging notes section but update paths.
- Delete `assets/checklist.md` (its three lines move into the core SKILL.md).

## Step 5: reader features (owner: template agent, after the template tasks; greenlit 2026-10-07)

All zero-dependency, all in `assets/template.html` (CSS plus the optional script block), demonstrated in `assets/gallery.html` without exceeding seven chapters (fold the demos into existing chapters). Budgets as built on 2026-10-07: the style block is 38 KB and the readable script 15 KB (about 11 KB minified); the template page is 62 KB in total. The earlier 12 KB and 18 KB figures were set before the baseline was measured and are superseded. Nothing autoplays; every feature is reader-triggered; `prefers-reduced-motion` respected; everything works with JavaScript off (the features simply do not appear).

1. **Stepper figure.** `<figure class="figure stepper" data-step="1">` containing one SVG whose elements may carry `data-steps="1,2"` (the steps on which they are lit) and a `<figcaption class="take">` with one `<span data-step-text="n">` per step, plus `<div class="stepper-nav"><button type="button" data-prev>Previous</button><span class="where"></span><button type="button" data-next>Next</button></div>`. Behaviour: everything stays visible (the default state carries the point); elements not lit on the current step get class `is-dim` (opacity .35); the caption shows only the current step's span; `.where` reads "1 of 3"; Left and Right arrow keys work while the figure has focus. No autoplay.
2. **Perspectives tabs.** `<div class="views">` with `<div class="views-tabs" role="tablist">` of `<button role="tab" data-view-tab="id" aria-selected>` and `<div class="view" data-view-panel="id">` panels; the first panel is visible by default (it must carry the point); others `hidden`. Arrow keys move between tabs.
3. **Repeated mini-map.** `<figure class="minimap" data-lit="node-id">` holding the page's master SVG where nodes carry `data-node="id"`. On load the matching node gets `is-lit` and every other node `is-dim`. Small height (max 140 px), full width, no caption required.
4. **Read aloud.** A `<button type="button" class="read-aloud" data-read>Read aloud</button>` in each chapter header next to Done, shown only when `speechSynthesis` exists. Reads the chapter's reading path (paragraphs, list items, figure captions; not folds, not SVG text) one block at a time in the page's `lang`; the block being read gets class `speaking` (left border in `--here`); the button toggles to "Stop"; starting one chapter stops another.
5. **Reading ruler.** Rail tool `<button type="button" data-ruler aria-pressed="false">Reading ruler</button>` toggles `body[data-ruler="on"]`: inside the chapter under the pointer or keyboard focus, the hovered or focused block (`p`, `li`, `figure`, `.flow`, `.status`, `.split`, `.decision`) keeps full opacity and every other block drops to .45. The "shade" style from the research. State remembered in localStorage.
6. **Resume.** The rail observer stores the current chapter id under `explainer:<pathname>:last`. On load, if a stored id exists and is not the first chapter, show `<div class="resume">Continue from <b>chapter title</b> <button type="button" data-resume>Go</button><button type="button" data-resume-dismiss aria-label="Dismiss">×</button></div>` directly under the answer bar. Go scrolls there (or selects it in one-chapter mode).
7. **Keyboard.** When focus is not in an input, textarea or contenteditable: J next chapter, K previous chapter, F toggle one-chapter mode, S toggle skim, D toggle theme, R toggle ruler, ? shows a small `<dialog class="keys">` listing them. A "Keys" button in the rail tools opens the same dialog.
8. **Finish state.** When every chapter's Done box is checked, set `body[data-finished="on"]`; the recap heading gets a `.finished` chip reading "All chapters done" and the rail's recap entry dot turns `--go`. No confetti, no motion.
9. **Text size.** Rail tool `<button type="button" data-size>Text size</button>` cycles `html[data-size]` through `""`, `"lg"` (20 px), `"xl"` (22 px); remembered in localStorage.

Checker additions (owner: checker agent): FAIL if a `.stepper` lacks `.stepper-nav` or has fewer than two `[data-step-text]`; FAIL if a `.views` block's first `[data-view-panel]` carries `hidden`; warn if a `.minimap` has no `data-lit`.

Core skill and design system additions (owner: core agent): the quick reference gains rows for stepper (change over time, one picture), views (several views of one thing), minimap (where this chapter sits in the whole); design-system.md component table gains stepper, views, minimap, read-aloud button, ruler, resume, keys, finish state and text size with their intent in one line each; writing rule: the first step and the first tab carry the point.

## Integration (owner: the orchestrating session)

After all agents finish: run `node scripts/check.mjs` on `assets/template.html`, `assets/gallery.html`, and the three docs pages; fix any FAIL; run `node scripts/translate.mjs extract assets/gallery.html` to confirm the tokenizer handles the template; run `node scripts/anchors.mjs` against a tiny fixture; confirm all SKILL.md files stay under their word budgets (`wc -w`); commit per area; push; keep the junction pointing at the repository root (the root shim serves it).
