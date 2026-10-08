# From one skill to a plugin with page types, including an architecture atlas

Proposal, 2026-10-07. **Status: greenlit by Rodrigo on 2026-10-07, option A, all five build steps (fixes, restructure, gather, Japanese, atlas) under the lean rule.** Nothing is built yet. An agent with no other context can execute it from this file plus `docs/research/2026-10-07-next-level.md`. Build order and the reader-feature carry-overs are in "What carries over from the research" at the end.

## Verdict in three lines

1. Yes, make it a plugin. The thing worth sharing is the design system, the writing contract and the checker; page types sit on top of that one core and must never re-explain it.
2. Keep the skill count small: one core skill with a registry of page types, plus two skills that need their own machinery, `explainer-gather` (two-way pages) and `explainer-atlas` (generated and curated architecture reference). Three skills, one reviewer agent, one hook.
3. The atlas is the big one. FormIntact's backend atlas is the model: inventories parsed from source, every claim anchored to a file and line at a recorded revision, three states kept apart (current, built but dormant, adopted target), a companion skill that navigates it and insists on checking current source before any claim about today. Generalise that pipeline; do not generalise its prose.

## Lean rule (added 2026-10-07, supersedes anything heavier below)

Rodrigo's constraint: extremely lean, performant, no loss of design quality or visual experience, no testing, nothing ceremonious. Applied to this proposal:

**Kept, because it is the product.** The design system (tokens, components, template), the writing and diagram rules, the fonts, dark mode, skim and one-chapter modes, the gather mechanic, the Japanese block, the atlas visual components. One checker, because it is a 50 ms lint with no dependencies that keeps the visual contract honest; it is the only quality tool.

**Cut.** The reviewer agent, the PostToolUse hook, evals, example pages per type, the atlas screenshot verifier, the drift script, the companion-skill generator, the changelog ceremony, the three manual reads (replaced by "open it once"). The stack-specific inventory adapters for the atlas are cut too; the agent reads the code, writes anchors, and a 30-line script confirms each `file:line` exists at the recorded revision.

**Budgets that define lean here.**

| Thing | Budget |
|---|---|
| Core `SKILL.md` | under 600 words; reference files loaded only when the step needs them |
| Each type entry | under 150 words, all types in one `types.md` |
| `explainer-gather/SKILL.md` and `modes.md` | under 400 words plus one table |
| `explainer-atlas/SKILL.md` | under 500 words |
| Template CSS and script | about 15 KB and under 6 KB, zero dependencies, interactive in well under 100 ms |
| Any explainer page | under 400 KB, single file; atlas folder under 3 MB only because it embeds source |
| Scripts | `check.mjs`, `translate.mjs`, `anchors.mjs`, optional `diagram.mjs`; each zero-dependency Node, each under 300 lines |
| Release | a git tag and the version field in `plugin.json`; nothing else |

The diagram compiler stays optional because it is lean in the direction that matters: the agent writes ten lines of description instead of sixty lines of hand-placed SVG, with fewer errors and fewer tokens.

## Why a plugin and not more skills

| Need | Skill can | Plugin adds |
|---|---|---|
| Several page types sharing one template, checker and guides | Only by copying files into each skill | One `assets/` and `scripts/` folder shared by all skills, referenced through `${CLAUDE_PLUGIN_ROOT}` |
| Quality gate that runs by itself | No | A `PostToolUse` hook: whenever a `.html` is written under `docs/explainers/` or `docs/architecture/`, run the checker and surface failures |
| A reviewer that is not anchored on the writer | Ad hoc subagent prompt each time | A defined `explainer-reviewer` agent (Sonnet) with a fixed brief: read only the answer bar, keep box and remember lines against the source |
| Install for your brother and others in one line | Clone into a folder | `/plugin marketplace add ariasr47/html-explainer-skill` then `/plugin install`, with versions and a changelog |
| Codex and Claude from one source | Two layouts by hand | Your catalog already expects `skills/<name>/SKILL.md`; the plugin layout is that layout |

Cost of the move: one restructuring pass, path changes from `~/.claude/skills/...` to `${CLAUDE_PLUGIN_ROOT}`, and a decision about the junction (see Migration).

## Plugin layout

```
html-explainer/                      plugin root = this repository (lean layout)
  .claude-plugin/plugin.json         name html-explainer, version, skills
  .claude-plugin/marketplace.json    the repo is its own one-plugin marketplace
  skills/
    html-explainer/SKILL.md          core contract, under 600 words
    html-explainer/types.md          decision, status, spec, release, research, handover; one short entry each
    explainer-gather/SKILL.md        two-way pages; modes.md holds the variants table
    explainer-atlas/SKILL.md         architecture atlas composition and anchor rules
  assets/
    template.html                    tokens, components, :lang(ja) block, optional script
    design-system.md diagrams.md writing.md gallery.html
    atlas.css atlas.js               system map tracks, inspector, search, permalinks; loaded only by atlas pages
    i18n/ui.ja.json glossary.example.json
    merge.html                       single-file merge tool for gather answers
  scripts/
    check.mjs                        structure, prose limits, contrast from tokens, type and language rules
    translate.mjs                    text nodes to strings.<lang>.json and back
    anchors.mjs                      confirms every file:line anchor exists at the recorded revision
    diagram.mjs                      optional: text description to SVG on the grid rules
  README.md LICENSE
```

The earlier heavier layout (agents, hooks, examples, atlas inventory and verify pipeline) is withdrawn under the lean rule above.

The checker reads a `data-type` attribute on `<html>` (`explainer`, `gather`, `atlas`) and applies that type's extra rules.

## Page types as a registry, not as skills

Most "types" are compositions of the same components, so they are reference files the core skill reads, each with the same five headings: when to use it, chapter composition, required components, extra checker rules, example page. Adding a type is adding one file.

| Type | Job | Required beyond the core contract |
|---|---|---|
| explainer | Understand one thing | nothing |
| decision | Rule on options a session poses | one decision card per ruling, recommendation marked, do-nothing stated, the ask |
| status | Where are we, what is next | timeline with one "you are here", status board, next steps, a "since last time" list |
| spec | Approve a feature before it is built | what it does (flow), what changes for you (split, wireframe when UI is touched), how we know it works (status board of checks), risks, approve or hold |
| release | What shipped | tiles for counts that matter, before/after per theme, what to do differently |
| research | Findings with evidence | evidence strength per finding, sources in folds, open questions |
| handover | Hand a session or a person the state of work | state, in-flight, next, evidence links, what is a claim versus verified |

Two types need their own machinery and therefore their own skill:

- **gather** (your brother's use): answer fields, collect bar, copy-all in a fixed Markdown shape, JSON copy, merge tool, respondent line. Checker: every field labelled, question text verbatim in the output, page passes with every field empty.
- **atlas**: below.

## The atlas type, generalised from FormIntact

What the FormIntact atlas does that a normal explainer cannot, and the plugin must keep:

- **Inventories parsed from source**, not written by hand: routes, tables and columns, schema files, packages and import edges, processes and entry points, configuration keys. Recorded in `inventory.json` with the revision, build time and counts.
- **Every claim anchored**: file, line, revision. "Inspect implementation" opens a read-only snapshot with line numbers. Curated content lives in a structured file (`content.json`), not in prose, so anchors can be checked by a script.
- **Three states kept apart everywhere**: current composed behaviour, built but dormant or test-only, adopted target not built. One legend, one visual grammar (solid, half, dashed).
- **One example entity travels**: a PDF from upload to erasure. The reader follows one thing through the whole system.
- **Reference interactions**: select a component to see what it owns and connects to, search, permalinks per view (`#traces/5`), an engineering-detail toggle, print.
- **Verification script** with screenshots at five widths, offline check, console check, keyboard, print. Report JSON kept with the snapshot.
- **A companion skill** that navigates the atlas, maps questions to anchors and current source files, and refuses to describe today's behaviour from the snapshot alone.

The pipeline the `explainer-atlas` skill runs:

1. **Inventory** (script, deterministic, no dependencies). Adapters per stack; first two are the ones you use: Python with FastAPI and SQL migrations, and Next.js with TypeScript. Anything without an adapter falls back to an agent-written inventory whose anchors the verify step still checks.
2. **Curate** (agent). Opus or Fable for this step, per the budget rule: architecture reasoning is the one place it pays. Output is `content.json`: chapters, journey, traces hop by hop, data kinds, failure matrix, trust matrix, state machines, glossary, each item with anchors.
3. **Render** (script). Inventory plus content plus the atlas template become `index.html` with `atlas.css` and `atlas.js`. Folder budget 3 MB; embedded sources count.
4. **Verify** (script). Core checker plus atlas rules: every anchor resolves inside the recorded revision, no anchor outside the snapshot, legend present, one "you are here" per journey, screenshots at 1440, 1024, 768, 390 and 320, zero network requests, clean console, keyboard reachable, print layout.
5. **Companion skill** (script). Emits `.claude/skills/<project>-<layer>-atlas/SKILL.md` and the Codex twin from a template: question to anchor to source table, the dated-snapshot rule, refresh steps.
6. **Drift** (script, optional hook or scheduled task). Compares inventory hashes with the working tree and writes the "since the last snapshot" list; marks chapters stale.

What changes for an ADHD reader compared with the FormIntact original: the atlas opens with the explainer contract (answer bar, three keep facts, chapter map), every chapter closes with a remember line, engineering detail is folded by default, and skim and one-chapter modes work. Two reading modes are explicit: **learn** (follow the example entity) and **look up** (search, permalinks, inspector).

Layers the type should accept from day one: backend, frontend, data, infra, whole system. Inputs: repository path, layer, the example entity to follow, and where "adopted target" comes from (a `.spire` contract, a proposal file, or none).

## The gather family: variants of "ask and collect"

Rodrigo's brother is a research manager. "Ask and collect" is one member of a family that shares one mechanic (a question with a stable id, an answer control, autosave, copy-all in a fixed shape, a merge tool) and differs only in the answer control and the merged view. Build the mechanic once in `explainer-gather`; add variants as `modes/<name>.md`, each with its answer control, copy-all shape, merge view and one example.

| Mode | The reader does | Answer control | Merged view for the author |
|---|---|---|---|
| collect (today) | Answers open questions after each chapter | Short or long text | Answers grouped by question, respondent named |
| confirm | Reads a brief or plan and marks each chapter understood, agree, or concern, with an optional comment | Three-state choice plus text | Who has a concern where; chapters with the most concerns first |
| choose | Picks one option per decision and gives a one-line reason | Single choice plus text | Tally per option with the reasons listed under each |
| prioritise | Orders items or spends points across them | Drag-free ranking (up and down buttons) or a points field per item | Combined ranking with spread; items people disagree on flagged |
| annotate | Reviews a draft (survey, interview guide, report) and comments per section | Comment pin per section, several allowed | Comments by section, by respondent |
| check | Learns, then answers check questions and writes the idea back in one sentence | Choice with an expected answer, plus a teach-back text | Score per question; the teach-back sentences side by side. Self-explanation is one of the few interactive mechanisms the evidence ties to comprehension |
| protocol | An interviewer follows a script and records notes per question | Long text per question, timestamp per entry | Notes per question across all interviews; this is qualitative data collection |
| pilot | A test respondent answers a survey and says what was unclear per question | The survey's own control plus a "what was unclear" text | Clarity problems per question |
| readout | Stakeholders read findings and react per finding | Scales for surprising and actionable, plus "what would you do" | Reactions per finding; the findings nobody would act on stand out |
| recurring | The same questions answered on several dates | Any of the above with a date | Change over time per question |

Shared rules: every question carries a stable `data-q` id so answers merge across versions and across languages; answers never leave the page except through copy, download or an optional "copy and open email" button; the merge tool accepts pasted copies and files, groups by `data-q`, and tags each respondent with language and date; exports are Markdown, JSON and CSV (the research manager's spreadsheet is the real destination). Optional: dictate an answer with the browser's speech recognition, which works in Japanese and English in Chrome.

## Two languages, one page: English and Japanese

The brother writes in English and then produces a Japanese version for a Japanese audience. Today the template would render Japanese in whatever system font is around and apply English rules to it. The plugin must treat language as a first-class input.

**Workflow.** One source, two outputs, by a sidecar: `scripts/translate.mjs` extracts every text node of a finished page into `strings.<lang>.json` keyed by element path and question id; an agent translates the file against a project glossary (product names, terms kept in English or in katakana, consistently); the script writes the second page with `lang`, direction, fonts, number and date formats, and interface strings swapped from `assets/i18n/ui.<lang>.json`. Layout, ids and `data-q` are identical in both files, so a Japanese respondent's copied answers merge with an English respondent's by question id. Optional third output: one file with a language toggle, for mixed teams; the budget allows it because text is small.

**Audience and register** are inputs to the brief, not afterthoughts: coworkers (plain business Japanese, です・ます), executives (shorter, headings may end in a noun), engineers (terms in English allowed), public or customers (the principles of やさしい日本語: short sentences, one idea, common words, furigana only here). The same page type reads differently for each.

**Japanese typography in the design system** (a `:lang(ja)` block in the template, nothing else changes):

| Rule | English page | Japanese page |
|---|---|---|
| Body face | Atkinson Hyperlegible Next | BIZ UDPGothic (a universal-design face built for legibility, on Google Fonts), falling back to Yu Gothic, Hiragino Sans, Meiryo, Noto Sans JP |
| Heading face | Lexend | BIZ UDPGothic bold; one family for all Japanese text |
| Code face | Atkinson Hyperlegible Mono | BIZ UDGothic (the monospaced sibling) |
| Line height | 1.6 body, 1.15 headings | 1.75 body, 1.35 headings |
| Measure | 62 characters | about 36 em (35 to 40 full-width characters) |
| Letter spacing | none, headings -0.01 em | 0.03 em body, 0 headings |
| Emphasis | bold, no italics by rule | bold or 「 」; italics forbidden, Japanese has none |
| Line breaking | `text-wrap: pretty`, manual hyphens | `line-break: strict`, no hyphenation, `text-wrap: pretty` |
| Numbers and dates | 1,250; 2026-10-07 | half-width digits throughout; 2026年10月7日 |
| Interface strings | Skim mode, One chapter at a time, Done, Remember, Recap, What I need from you | ざっと読む, 1章ずつ, 完了, 覚えておく, まとめ, お願いしたいこと, from `ui.ja.json` |

Offline, the system fonts above are good on Windows and macOS, so the fallback is not a degradation.

**Checker by language.** The `lang` attribute is required and must match the text (a CJK-ratio check). For Japanese the limits switch from words to characters: paragraph under 90 characters, sentence under 60 (split on 。), keep-box line under 25, answer bar under 70; reading time at about 500 characters a minute; the middle-dot warning is off because ・ is ordinary punctuation; the Title Case warning is off; `font-style: italic` fails; a `:lang(ja)` font stack must be present. Mixed pages are allowed when each block carries its own `lang`.

**Later, not now:** right-to-left languages need the template to move from physical to logical properties (`border-inline-start`, `padding-inline-start`) and `dir="rtl"` support. Rodrigo's PDF project already met this problem; park it with a marker in the template until a reader needs it.

Plugin layout additions: `skills/explainer-gather/modes/*.md`, `scripts/translate.mjs`, `scripts/merge.html` (or the merge view inside the gather page), `assets/i18n/ui.ja.json` and `glossary.example.json`, `assets/template.html` gains the `:lang(ja)` block, `examples/` gains one English and one Japanese pair.

## Migration from today's repository

1. Phase 0 from the research roadmap first (contrast tokens, glyphs, gallery synced with your skim fix), on the current layout.
2. Move files into the plugin layout above; rewrite paths to `${CLAUDE_PLUGIN_ROOT}`; version 1.0.0; changelog.
3. Retire double loading: either point the junction at `skills/html-explainer` or remove the junction and install the plugin from your catalog. Not both, or the skill triggers twice.
4. Add `gather` with the collect mode, then the Japanese block and the translate sidecar, because the brother's two most frequent needs are those two. Other gather modes follow one at a time, each with an example. He gets each by updating the plugin.
5. Add `atlas` as a composition plus the `atlas.css` and `atlas.js` add-on and the anchor check. FormIntact's backend atlas is the reference for what good looks like; there is no regression suite.
6. Publish: commit the marketplace manifest to the public repo and tag. Catalog packaging and any registry submission stay Rodrigo's call.

## Effort and lanes

| Step (lean edition) | Lane | Effort |
|---|---|---|
| Phase 0 fixes: contrast tokens, glyphs in dots, gallery synced | Sonnet | 1 hour |
| Plugin restructure, `types.md`, paths to `${CLAUDE_PLUGIN_ROOT}` | Sonnet | half a day |
| gather: collect mode, `merge.html`, exports | Sonnet | 1 day |
| gather: the other modes as table rows plus the few extra controls they need | Sonnet | half a day |
| Japanese: `:lang(ja)` block, `ui.ja.json`, `translate.mjs`, language rules in the checker | Sonnet, one Japanese-fluent read | half a day to 1 day |
| atlas: `atlas.css` and `atlas.js` add-on, `anchors.mjs`, skill text; FormIntact's atlas is the reference, not a regression suite | Sonnet build, one Opus design read | 1.5 to 2 days |

Per atlas run, the curation (reading the code and writing anchored content) is the cost; say so in each run's report. Everything else is scripts.

## Risks

- Generic source extraction is hard; adapters will be shallow at first. The verify step protects against wrong anchors, not against missing ones. Report inventory coverage honestly.
- A 2 to 3 MB folder is not an explainer. Keep the single-file 400 KB rule for every other type.
- The atlas is a dated snapshot. The companion skill's "check current source first" rule is what keeps it from becoming a lie; carry it over verbatim in spirit.
- Two install routes at once (junction and plugin) will double-trigger the skill. Pick one.

## What carries over from the research

Mapping of `docs/research/2026-10-07-next-level.md` to the greenlit build.

| Research recommendation | Status after the lean plugin decision |
|---|---|
| Contrast tokens, darker tertiary ink, glyphs in dots (WCAG 1.4.1) | Built in step 0 (template and checker) |
| Labels on the diagram, one job per visual (caption rule) | Already in the design system; unchanged |
| Default state of any interactive figure must carry the point (readers skip clicks) | Rule added to the core skill and design system in step 1 |
| Headings as the question the chapter answers; time per chapter in the kicker | Rules added in step 1; no code |
| Answer fields, collect bar, merge tool (the brother's use) | Step 2, with the ten modes as table rows |
| English and Japanese from one page, Japanese fonts and limits | Step 3 |
| Isometric and system-map visuals for architecture, anchored claims, three states | Step 4, the atlas add-on |
| Stepper figure (fixed segments), perspectives tabs, repeated mini-map | Still recommended; not in the five steps. Proposed as step 5, about one day, zero dependencies |
| Read aloud (Web Speech API), reading ruler, resume where you left off, keyboard shortcuts, finish state | Still recommended; same step 5 |
| Comfort controls for spacing | Low expected effect; optional in step 5 or skipped |
| Screenshot frame, concreteness fading | Still valid; later, opt-in rich media |
| Knob with presets before sliders | Still valid; later |
| 3D viewer behind a button, physical subjects only; animation only with a stated job | Policy text in the design system; nothing built |
| Diagram compiler | Optional script; not in this build |
| Inliner for the gallery | Dropped; the gallery carries a copy of the style block |
| Fidelity gate, evals, example pages, verifier, drift, companion generator, ask-this-page | Withdrawn by the lean rule (ask-this-page stays an idea) |
| Panel strip (comics), scroll-triggered narratives, bionic bolding, dyslexia fonts | Not recommended by the evidence; not built |

## Decision requested

A. Plugin with three skills (core with a type registry, gather, atlas), one reviewer agent, one hook. Recommended.
B. Keep one skill and add only the type registry; no gather or atlas machinery yet.
C. Separate plugins per type (explainer, gather, atlas) sharing nothing. Not recommended: three copies of the design system to keep in sync.
