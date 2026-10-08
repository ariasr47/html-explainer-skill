# Visual system for explainers

This is a guide, not a layout. Every explainer shows something different: a decision, a status, an architecture, a spec, a release. The system gives you a calm page frame, a small vocabulary of components with a fixed meaning, and rules for colour and type. You choose which components the content needs and in what order.

Files named without a folder (`template.html`, `gallery.html`, `atlas.css`, `merge.html`) sit beside this file in `assets/`. Diagram rules are in `diagrams.md` and prose rules are in `writing.md`.

## Who it is for and why it looks like this

The reader has severe ADHD and a short working memory. Concretely:

- They lose the thread when they scroll. So context is restated where it is needed, and a sticky rail always shows where they are.
- They can hold three things. So the page names the three things up front and never asks for a fourth.
- Their attention goes to whatever moves or is brightest. So nothing moves on its own, and saturated colour is spent only on meaning.
- They skim first and read second, if at all. So the page must work as a skim: answer, chapter map, diagram captions, remember lines. Skim mode makes this literal.
- Finishing something feels good and keeps them going. So chapters have a done checkbox and the rail shows progress.
- Dense text is a wall. So paragraphs are short, type is large, lines are 62 characters, and the machinery lives in folds.

## Page identity

Every page opens with `<html lang="en" data-type="explainer">`.

- `lang` is `en` or `ja`. Other codes are allowed and fall back to the English rules. The language sets the fonts, the line measure, and whether the checker counts words or characters (see Japanese typography).
- `data-type` names the page's job: `explainer` (the default when missing), `decision`, `status`, `spec`, `release`, `research`, `handover`, `gather` or `atlas`. Every type keeps the same opening and closing contract and adds required components. The six content types are in `../skills/html-explainer/types.md`. `gather` and `atlas` have their own skills.

## Tokens

All tokens live in `:root` in `template.html`. Change them there, nowhere else.

### Colour has meaning, and only one meaning

| Token | Meaning | Where it appears |
|---|---|---|
| `--here` cobalt | You are here, the answer, structure, links | answer bar, rail current, map numbers, step numbers, timeline current, `d-box-here` |
| `--go` green | Done, safe, yes, recommended | status rows, flow steps, recommended stamp, after-panel |
| `--wait` amber | In progress, caution, needs a check | status rows, callout.warn, flow steps |
| `--stop` red | Blocked, risk, no | status rows, callout.stop, before-panel |
| `--decide` purple | The reader must choose | decision card, the ask, status rows |
| `--memory` yellow | Offloaded working memory | keep box, remember lines, recap |

Each has a `-tint` for fills. Never use a meaning colour for decoration, and never introduce a seventh colour. If two things need to be told apart and neither carries one of these meanings, use position, a border, or a label, not a new colour.

Surfaces are cool neutrals: `--paper` fog, `--card` white, `--well` inset for diagrams and code. Text is deep navy `--ink`, never pure black, with `--ink-soft` and `--ink-faint` for secondary and tertiary.

Dark mode is automatic through `prefers-color-scheme` and can be forced with `data-theme` on `<html>`. Every token is redefined for dark; components never hard-code a colour.

### Text on a meaning fill, and the glyph rule

Text drawn on a meaning fill uses the matching `--on-*` token and never plain white: `--on-here`, `--on-go`, `--on-wait`, `--on-stop`, `--on-decide`, and `--on-soft` for the neutral `--ink-soft` fill. They are white in the light theme and near-black navy in both dark blocks, where the meaning colours are lighter. Map numbers, step numbers, flow numbers, the recommended stamp, the skip link and the pressed rail buttons all use them. The checker computes contrast from the tokens and fails any text pair under 4.5 to 1 in either theme: the inks on paper and card, `--here` on card, and each `--on-*` on its fill.

Colour is never the only signal (WCAG 1.4.1). Each status dot carries a glyph: ✓ go, ! wait, ✕ stop, ? decide, ● here, ★ memory, drawn in the matching `--on-*` colour. Done points on a timeline show ✓, and a flow card in go, wait or stop shows the same glyph in its corner, in the state colour. A new component that uses a meaning colour must pair it with a glyph, a word, or a position. The checker fails a stylesheet whose done dots lose their glyph.

### Type

| Role | Face | Why |
|---|---|---|
| Headings, kickers, labels, numbers | Lexend 500 to 700 | Designed to reduce visual stress in reading; wide, even, calm at large sizes |
| Body | Atkinson Hyperlegible Next 400 and 700 | Designed for maximum letter distinction (b/d, I/l/1, O/0) |
| Code | Atkinson Hyperlegible Mono | Same letterforms for anything the reader must type |

Fallback is the Segoe UI Variable and system stack, so an offline file still reads well. The scale is 18 px base with a 1.25 ratio: 18, 22.5, 28, 35, 44. Body line height is 1.6, headings 1.15. Prose width is 62 characters. Text is always left aligned, never justified, never all caps. Japanese pages swap the whole stack; see Japanese typography below.

Headings are sentences a person would say, not labels. A chapter heading is the question the chapter answers: "Why does this need you at all?" not "Rationale". Kickers are small, sentence case, and only where they carry information: the page purpose above the title, and above each chapter its position and reading time ("Chapter 2 of 6, about 1 minute", counted at 200 words a minute, or 500 characters a minute in Japanese, rounded up).

### Japanese typography

A `:lang(ja)` block in the template swaps the type system when `<html lang="ja">`. Nothing else changes.

| Rule | English page | Japanese page |
|---|---|---|
| Body face | Atkinson Hyperlegible Next | BIZ UDPGothic (a universal-design face built for legibility, on Google Fonts), falling back to Yu Gothic, Hiragino Sans, Meiryo, Noto Sans JP |
| Heading face | Lexend | BIZ UDPGothic bold; one family for all Japanese text |
| Code face | Atkinson Hyperlegible Mono | BIZ UDGothic, the monospaced sibling |
| Line height | 1.6 body, 1.15 headings | 1.75 body, 1.35 headings |
| Measure | 62 characters | about 36 em (35 to 40 full-width characters) |
| Letter spacing | none, headings -0.01 em | 0.03 em body, 0 headings |
| Emphasis | bold, no italics by rule | bold or 「 」; italics forbidden, Japanese has none |
| Line breaking | `text-wrap: pretty`, manual hyphens | `line-break: strict`, no hyphenation, `text-wrap: pretty` |
| Numbers and dates | 1,250; 2026-10-07 | half-width digits throughout; 2026年10月7日 |
| Interface strings | Skim mode, One chapter at a time, Done, Remember, Recap, What I need from you | ざっと読む, 1章ずつ, 完了, 覚えておく, まとめ, お願いしたいこと, from `i18n/ui.ja.json` |

Offline, the system fonts above are good on Windows and macOS, so the fallback is not a degradation. The Google Fonts link must carry BIZ UDPGothic when `lang="ja"`, and the checker fails a Japanese page without it.

For `lang="ja"` the checker counts characters, not words: paragraph 90, sentence 60 (split on 。！？), keep item 25, answer bar 70, reading time at 500 characters a minute. The middle-dot and Title Case warnings are off, italics fail, and the page must carry the `:lang(ja)` block. Register and phrasing rules are in the Japanese section of `writing.md`. `../scripts/translate.mjs` turns a finished English page into a Japanese one with the same layout and question ids.

### Space and shape

Radius follows hierarchy: chapters 18 px, components 10 px, chips full. Borders are 1.5 px hairlines; meaning borders go to 2 or 2.5 px. There are no drop shadows on content; the only elevation is the sticky rail on narrow screens. Chapters are separated by 2 rem of paper, which is the page's main rhythm.

### Layout

```
≥1100 px                                      <1100 px
┌──────────┬───────────────────────────────┐   ┌──────────────────────────┐
│ rail     │ kicker                        │   │ rail (sticky chip strip) │
│ chapters │ H1                            │   ├──────────────────────────┤
│ • here   │ answer bar                    │   │ kicker / H1              │
│ • done   │ keep box (3 lines)            │   │ answer bar               │
│ tools    │ chapter map (cards)           │   │ keep box                 │
│          │ ┌───────────────────────────┐ │   │ map (1 column)           │
│          │ │ chapter 1                 │ │   │ chapter 1 …              │
│          │ │  from / prose / figure    │ │   │                          │
│          │ │  fold / remember          │ │   │                          │
│          │ └───────────────────────────┘ │   │                          │
│          │ recap · ask                   │   │ recap · ask              │
└──────────┴───────────────────────────────┘   └──────────────────────────┘
```

Prose stays inside 62 ch. Figures, flows, decision grids, status boards and timelines may use the full column width. The eye reads left aligned text and left to right diagrams; nothing is centred except labels inside boxes.

## The component vocabulary

Each component encodes one kind of information. Use it only for that. Full markup is in `template.html` and rendered in `gallery.html`.

| Component | Class | Information it encodes | Rules |
|---|---|---|---|
| Answer bar | `p.answer` | The whole page in one sentence | Exactly one per page, before anything else |
| Keep box | `div.keep` | The three facts to carry | Max three lines, under fifteen words each |
| Chapter map | `ol.map` | What the chapters are and what each gives | 3 to 7 entries, one line each |
| Chapter | `section.chapter` | One idea | Has a kicker with position and time, `.from`, a body, optional folds, one `.remember` |
| Carry-forward | `p.from` | The one prior fact this chapter needs | Restated in full, never "as above" |
| Remember line | `p.remember` | The one sentence to keep from the chapter | Copied verbatim into the recap |
| Figure | `figure.figure` + `figcaption.take` | A relationship that prose cannot hold | Always has a take-away caption. Scrolls sideways on a phone; an `svg.narrow` twin replaces the wide drawing there |
| Take line | `p.take` straight after a component | What a status board, split, flow or tiles proves | One line; every chapter's picture gets one |
| Stepper | `figure.stepper` + `.stepper-nav` | Change over time, one step at a time | Everything stays visible and steps not lit are dimmed; the caption shows the current step; step 1 carries the point; no autoplay |
| Views | `div.views` + `.views-tabs` + `.view` | Several views of one thing | The first tab is open and carries the point; the others are `hidden` |
| Minimap | `figure.minimap` | Where this chapter sits in the whole | The page's master SVG, small; `data-lit` names the lit node and the rest dim |
| Flow | `ol.flow` | A linear sequence | 3 to 7 steps, states via `.here .go .wait .stop` |
| Split | `div.split` | Two states of the same thing | `.before` red, `.after` green |
| Decision | `div.decision` + `div.options` | A choice the reader owns | One recommended option, a "do nothing" line |
| Status board | `ul.status` | Health of several items | One dot colour per row, one line each |
| Timeline | `ol.timeline` | Position in time | Exactly one `li.here` |
| Steps | `ol.steps` | Ordered actions | Bold verb first, one line, detail in a fold |
| Tiles | `div.tiles` | Numbers that change the decision | Label says what the number means. The number never wraps and shrinks to fit its tile, so keep it short: `$24k`, not `$24,000+` |
| Metaphor | `div.metaphor` | An analogy with an exact mapping | One per chapter at most; say where it stops |
| Callout | `div.callout` `.tip .warn .stop` | Something that changes what the reader does | Not for asides |
| Term box | `dl.term` | Plain-English definitions | Directly under the first use |
| Fold | `details.fold` | Machinery: commands, paths, tables, reasoning | Page must read with all folds closed |
| Focus mode | rail button `[data-focus]` + `.focus-nav` | One chapter on screen at a time, reader paced | Built into the template; needs no content work beyond self-contained chapters |
| Read aloud | `button.read-aloud` | The chapter spoken, one block at a time | In each chapter header, only where the browser can speak; folds and SVG text are skipped; the block being read is `.speaking` |
| Reading ruler | rail button `[data-ruler]` | One block at full strength, the rest dimmed | Reader-triggered and remembered |
| Resume | `div.resume` | Where the reader left off | Under the answer bar, only when the stored chapter is not the first |
| Keys | `dialog.keys` | Keyboard shortcuts | J next chapter, K previous, F one-chapter mode, S skim, D theme, R ruler, ? this list; the rail has a Keys button too |
| Finish state | `.finished` chip + `body[data-finished]` | Every chapter is done | Set when all Done boxes are ticked; the recap dot in the rail turns green; no confetti, no motion |
| Text size | rail button `[data-size]` | The reader's own type size | Cycles normal, 20 px, 22 px; remembered |
| Recap | `section.recap` | The remember lines, collected | Nothing new |
| The ask | `section.ask` | One question with 2 to 4 choices | Recommendation marked, "if you do nothing" stated |
| Answer field | `.answer-field` | A question the reader answers | A full-sentence question, a stable `data-q`, a `.hint` saying what a good answer holds |
| Collect bar | `.collect` | The reader's answers, ready to send | Exactly one per page, hidden until a field has a value |

The stepper, the tabs and the reader tools are reader-triggered. Nothing autoplays, `prefers-reduced-motion` is respected, and with JavaScript off the page reads without them.

### Interactive figures

Readers skip clicks. An interactive figure must make its point in its default state, with nothing clicked: the stepper opens on step 1 with everything visible, the first tab is open, the minimap arrives already lit, and the atlas system map reads before any node is selected. The first step and the first tab carry the point, and the caption states the conclusion. Interaction adds detail for the reader who wants it; it never holds the point back.

### Ask and collect

A `data-type="gather"` page lets its chapters ask questions. The mechanic lives in the template script. The modes and the process are in `../skills/explainer-gather/SKILL.md`, and the markup of every kind is in the gallery chapter "Ask and collect".

- `data-kind` on an `.answer-field` picks the control: `text` (the default), `choice` (radio), `multi` (checkbox), `scale` (radios 1 to 5), `rank` (a list with up and down buttons), or `confirm` (understood, agree or concern, plus a comment).
- Answers save in the browser as the reader types. The `.collect` bar appears with the first answer and shows "3 of 5 answered", and the rail dot of an answered chapter turns green.
- Copy all answers, Download .md and Copy JSON are the only ways answers leave the page. The Markdown copy has one `## [q] question` block per answer and a `## Not answered` list at the end. The JSON copy carries the same data. `merge.html` reads either shape and merges any number of respondents by question id.
- The page must pass the checker with every field empty.

## Composition patterns by page type

These are starting points, not templates. Drop what the content does not need. `../skills/html-explainer/types.md` lists the required components and checker rules for each type.

- **Decision page**: answer → keep → map → one chapter per option or per ruling (each with a split or a small diagram) → a `.decision` per ruling → recap → ask.
- **Status / where are we**: answer → keep → map → timeline chapter with `li.here` → status board chapter → "what is next" chapter with steps → recap → ask only if something is blocked on the reader.
- **Spec / feature**: answer → keep → map → "what it does" chapter with a flow → "what changes for you" chapter with a split and a wireframe if UI is touched → "how we know it works" chapter with a status board of checks → "risks" chapter with callouts → recap → ask (approve / hold).
- **Architecture / how it works**: answer → keep → map → one chapter per layer, each with one SVG box map and a metaphor → "how a request travels" chapter with a flow → recap. A reference anchored to code is an atlas page; see the atlas add-on below.
- **What shipped**: answer → keep → map → tiles for the counts that matter → one chapter per theme with split before/after → "what to do differently now" steps → recap.
- **Research findings**: answer → keep → map → one chapter per finding, each carrying its evidence as tiles, a timeline, or a status board and the source quotes in a fold → "what this changes" chapter with a split → recap → ask only if the findings force a choice.
- **Ask and collect**: answer → keep → map → one chapter per topic, each teaching only what its question needs and ending with its answer fields → recap → the collect bar.
- **Mixed page**: most real pages mix two of the above. Take the chapter shapes from one and the closing from the other. The opening and closing contract never changes.

## Atlas add-on

An architecture atlas is a folder, not a single file: `index.html` beside `atlas.css` and `atlas.js`, copied from `assets/` and loaded after the template block with `<link rel="stylesheet" href="atlas.css">` and `<script src="atlas.js" defer></script>`. Only atlas pages load them. Composition and anchor rules are in `../skills/explainer-atlas/SKILL.md`.

The add-on keeps three states apart everywhere, with one `.legend` before the first diagram. It is the single exception to the no-legend rule: it explains three line styles, and every node is still labelled on the node.

| State | Meaning | Look |
|---|---|---|
| Current | Behaviour that runs today | Solid border, `.state-current` |
| Dormant | Built but off, or test-only | Amber dashed border, `.state-dormant`; SVG nodes use `d-dormant` |
| Target | Adopted but not built | Dashed `--line-strong` border and no fill, `.state-target`; SVG nodes use `d-target` |

It adds a clickable system map (`.sysmap`), an "Inspect implementation" dialog for anchored source (`.inspect`), a trace swimlane (`ol.trace`), a trust matrix (`table.matrix`), rail search, and permalinks. Every claim that names code carries a `.anchor` with `data-src` and `data-line`. All of it works from the keyboard, respects `prefers-reduced-motion`, and prints as static content. Like every interactive figure, the system map must make its point before anything is selected.

## The one memorable thing

The page spends its boldness on memory offloading: the yellow keep box at the top, the yellow remember line closing every chapter, and the yellow recap at the end are the same colour on purpose. The reader learns in one page that yellow means "this is what you keep". Everything else stays quiet so that stays loud.

## What the evidence says

A verified research pass (September 2026, sources fetched and each claim adversarially checked) sorted the system's choices into three bins.

**Backed by evidence**

- Short single-topic paragraphs, a visible completed / current / pending state for a multi-step read, and a cue that restores context after attention is lost. W3C COGA "Making Content Usable" says all three. This is why the chapter rail, the done checkboxes, and the "Before this" line exist.
- Labels on the thing they name, never in a separate legend. Mayer and Moreno's spatial contiguity effect, corroborated by a later meta-analysis. This is why diagram text lives inside boxes and on arrows.
- A measure of 50 to 75 characters is the craft consensus (the page uses 62). Later empirical work questions how much it matters; treat it as convention, not law.
- Reader-controlled pacing. A small 2026 pilot found attention-adaptive chunking beat a static page, but only as a bundle and with eleven participants. A static file cannot adapt, so the page offers reader-controlled approximations: skim mode and one-chapter-at-a-time mode, plus the reader tools in the component vocabulary.

**Refuted, so the system will not add them**

- Bionic-style bolding of word beginnings. Peer-reviewed eye tracking shows no speed gain, no change in eye movements, and no "auto-completion" effect. Multiple studies converge on a null.
- Dyslexia-specific typefaces such as OpenDyslexic. No reading-speed or fixation benefit over ordinary fonts. General-legibility faces with distinct letterforms are the better bet, which is what Atkinson Hyperlegible Next is.

**Design choices, not evidence**

- The three-fact cap on the keep box. The popular "working memory holds three to four items" figure did not survive verification as stated. Three is kept because it is small, memorable, and forces the writer to choose. Do not cite it as science.
- Chapter length, the effect of a current-section map on comprehension, and an 80-character line limit attributed to WCAG all failed verification. The chapter rules stay as craft defaults.

## What this system refuses

- Cream paper with a warm-clay accent, or a near-black page with a single neon accent. Both read as generated and neither serves reading.
- All-caps eyebrows, tracked-out labels, middle-dot meta strings, monospace for anything that is not code.
- Cards for everything. A chapter is a card; the things inside it mostly are not.
- Entrance animations, parallax, hover effects that change layout. Motion only answers the reader's action: a fold opening, a checkbox ticking, the progress bar following the scroll.
- Numbered markers on things that are not a sequence.
- Bionic bolding, dyslexia novelty fonts, and diagram legends (the atlas keeps one legend for its three line styles). See the evidence section above.
- Meaning carried by colour alone, and text on a fill below 4.5 to 1.
- An interactive figure whose default state hides the point.
- A page that needs the network. Fonts are progressive; everything else is inline.
