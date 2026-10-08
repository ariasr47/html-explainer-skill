# Visual system for explainers

This is a guide, not a layout. Every explainer shows something different: a decision, a status, an architecture, a spec, a release. The system gives you a calm page frame, a small vocabulary of components with a fixed meaning, and rules for colour and type. You choose which components the content needs and in what order.

## Who it is for and why it looks like this

The reader has severe ADHD and a short working memory. Concretely:

- They lose the thread when they scroll. So context is restated where it is needed, and a sticky rail always shows where they are.
- They can hold three things. So the page names the three things up front and never asks for a fourth.
- Their attention goes to whatever moves or is brightest. So nothing moves on its own, and saturated colour is spent only on meaning.
- They skim first and read second, if at all. So the page must work as a skim: answer, chapter map, diagram captions, remember lines. Skim mode makes this literal.
- Finishing something feels good and keeps them going. So chapters have a done checkbox and the rail shows progress.
- Dense text is a wall. So paragraphs are short, type is large, lines are 62 characters, and the machinery lives in folds.

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

### Type

| Role | Face | Why |
|---|---|---|
| Headings, kickers, labels, numbers | Lexend 500 to 700 | Designed to reduce visual stress in reading; wide, even, calm at large sizes |
| Body | Atkinson Hyperlegible Next 400 and 700 | Designed for maximum letter distinction (b/d, I/l/1, O/0) |
| Code | Atkinson Hyperlegible Mono | Same letterforms for anything the reader must type |

Fallback is the Segoe UI Variable and system stack, so an offline file still reads well. The scale is 18 px base with a 1.25 ratio: 18, 22.5, 28, 35, 44. Body line height is 1.6, headings 1.15. Prose width is 62 characters. Text is always left aligned, never justified, never all caps.

Headings are sentences a person would say, not labels: "Why this needs you at all" not "Rationale". Kickers are small, sentence case, and only where they carry information (chapter position, page purpose).

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
| Chapter | `section.chapter` | One idea | Has `.from`, a body, optional folds, one `.remember` |
| Carry-forward | `p.from` | The one prior fact this chapter needs | Restated in full, never "as above" |
| Remember line | `p.remember` | The one sentence to keep from the chapter | Copied verbatim into the recap |
| Figure | `figure.figure` + `figcaption.take` | A relationship that prose cannot hold | Always has a take-away caption |
| Flow | `ol.flow` | A linear sequence | 3 to 7 steps, states via `.here .go .wait .stop` |
| Split | `div.split` | Two states of the same thing | `.before` red, `.after` green |
| Decision | `div.decision` + `div.options` | A choice the reader owns | One recommended option, a "do nothing" line |
| Status board | `ul.status` | Health of several items | One dot colour per row, one line each |
| Timeline | `ol.timeline` | Position in time | Exactly one `li.here` |
| Steps | `ol.steps` | Ordered actions | Bold verb first, one line, detail in a fold |
| Tiles | `div.tiles` | Numbers that change the decision | Label says what the number means |
| Metaphor | `div.metaphor` | An analogy with an exact mapping | One per chapter at most; say where it stops |
| Callout | `div.callout` `.tip .warn .stop` | Something that changes what the reader does | Not for asides |
| Term box | `dl.term` | Plain-English definitions | Directly under the first use |
| Fold | `details.fold` | Machinery: commands, paths, tables, reasoning | Page must read with all folds closed |
| Focus mode | rail button `[data-focus]` + `.focus-nav` | One chapter on screen at a time, reader paced | Built into the template; needs no content work beyond self-contained chapters |
| Recap | `section.recap` | The remember lines, collected | Nothing new |
| The ask | `section.ask` | One question with 2 to 4 choices | Recommendation marked, "if you do nothing" stated |

## Composition patterns by page type

These are starting points, not templates. Drop what the content does not need.

- **Decision page**: answer → keep → map → one chapter per option or per ruling (each with a split or a small diagram) → a `.decision` per ruling → recap → ask.
- **Status / where are we**: answer → keep → map → timeline chapter with `li.here` → status board chapter → "what is next" chapter with steps → recap → ask only if something is blocked on the reader.
- **Spec / feature**: answer → keep → map → "what it does" chapter with a flow → "what changes for you" chapter with a split and a wireframe if UI is touched → "how we know it works" chapter with a status board of checks → "risks" chapter with callouts → recap → ask (approve / hold).
- **Architecture / how it works**: answer → keep → map → one chapter per layer, each with one SVG box map and a metaphor → "how a request travels" chapter with a flow → recap.
- **What shipped**: answer → keep → map → tiles for the counts that matter → one chapter per theme with split before/after → "what to do differently now" steps → recap.
- **Research findings**: answer → keep → map → one chapter per finding, each carrying its evidence as tiles, a timeline, or a status board and the source quotes in a fold → "what this changes" chapter with a split → recap → ask only if the findings force a choice.
- **Mixed page**: most real pages mix two of the above. Take the chapter shapes from one and the closing from the other. The opening and closing contract never changes.

## The one memorable thing

The page spends its boldness on memory offloading: the yellow keep box at the top, the yellow remember line closing every chapter, and the yellow recap at the end are the same colour on purpose. The reader learns in one page that yellow means "this is what you keep". Everything else stays quiet so that stays loud.

## What the evidence says

A verified research pass (September 2026, sources fetched and each claim adversarially checked) sorted the system's choices into three bins.

**Backed by evidence**

- Short single-topic paragraphs, a visible completed / current / pending state for a multi-step read, and a cue that restores context after attention is lost. W3C COGA "Making Content Usable" says all three. This is why the chapter rail, the done checkboxes, and the "Before this" line exist.
- Labels on the thing they name, never in a separate legend. Mayer and Moreno's spatial contiguity effect, corroborated by a later meta-analysis. This is why diagram text lives inside boxes and on arrows.
- A measure of 50 to 75 characters is the craft consensus (the page uses 62). Later empirical work questions how much it matters; treat it as convention, not law.
- Reader-controlled pacing. A small 2026 pilot found attention-adaptive chunking beat a static page, but only as a bundle and with eleven participants. A static file cannot adapt, so the page offers two reader-controlled approximations: skim mode and one-chapter-at-a-time mode.

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
- Bionic bolding, dyslexia novelty fonts, and diagram legends. See the evidence section above.
- A page that needs the network. Fonts are progressive; everything else is inline.
