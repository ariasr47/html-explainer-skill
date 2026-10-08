# Taking the explainer to the next level

Research and brainstorm, 2026-10-07. Status: proposal. Nothing in this document has been built; the "Measured today" section is evidence, the rest is a plan an agent with no other context can execute.

## The one idea

The reader's problem is load, not boredom. "Next level" means more understanding per second of attention, not more pixels. Every richer visual has to pass four gates before it enters the system:

1. **Relationship gate.** It shows a relationship a static picture cannot hold (change over time, a mechanism in motion, a physical shape, a what-if).
2. **Control gate.** The reader starts it, steps it, and stops it. Nothing plays on its own.
3. **Fallback gate.** Offline, in print, and with reduced motion on, the reader gets a static picture that still makes the point.
4. **Budget gate.** Single file stays under 400 KB. A page that needs a library ships as a small folder with a stated budget, or loads the library on demand from a pinned CDN with an integrity hash.

WebGL and Three.js pass gate 1 only for physically spatial subjects. For software architecture, data, and decisions they fail it, and an isometric 2.5D SVG does the job with no library.

## Measured today

### Accessibility audit of `gallery.html` (axe-core 4.10.2, both themes)

| Pair | Light | Dark | AA needs |
|---|---|---|---|
| Kicker text (`--ink-faint`) on paper | 3.23 | 5.27 | 4.5 |
| Kicker text on card | 3.54 | 4.77 | 4.5 |
| White on `--here` (map numbers, step numbers, focus Next) | 6.16 | **2.47** | 4.5 |
| White on `--go` (recommended stamp) | 4.35 | **1.97** | 4.5 |
| White on `--decide` (ask button) | 5.63 | **2.30** | 4.5 |
| White on `--ink-soft` (flow numbers) | 7.09 | **2.07** | 4.5 |
| Amber `--wait` text on card | 3.99 | 9.00 | 4.5 (3.0 if large) |
| Body, links, tints, memory surfaces | 5.6 to 14.6 | 6.7 to 12.8 | pass |

Two systematic defects. In light mode the tertiary text colour is too faint. In dark mode every "white text on a meaning fill" pair fails, because the fills are lightened for dark backgrounds while the text stays white. axe also flagged 21 SVG and pseudo-element texts as "could not determine background"; by token maths they pass.

**Fix:** darken `--ink-faint` to about `#5f6f7f` in light mode, and add "on-colour" tokens (`--on-here`, `--on-go`, `--on-decide`, `--on-soft`) that are white in light mode and `--paper` in dark mode, used wherever text sits on a fill. Then make the checker compute these ratios from the tokens so this cannot regress.

**Colour-only meaning.** Status dots, timeline dots and flow-step borders carry meaning by colour alone, which fails WCAG 1.4.1 for colour-blind readers. Add a glyph to each: a check for go, an exclamation for wait, a cross for stop, a question mark for decide, a pin for here.

### Library sizes (minified, jsDelivr, 2026-10-07)

| Library | Size | Verdict for a single-file page |
|---|---|---|
| Rough.js | 27 KB | Fits. Sketchy rendering of the existing SVG vocabulary. |
| GSAP core | 70 KB | Fits as opt-in for a scrubbable animation. |
| dagre (layout) | 93 KB | Build-time only; never ship to the reader. |
| Lottie light | 164 KB | Opt-in only, with a poster. |
| Chart.js | 200 KB | Rarely needed; the CSS tiles and SVG cover most cases. |
| Observable Plot | 202 KB | Opt-in for real data. Needs D3 too in some builds. |
| Rive | 213 KB | Opt-in; needs authored assets. |
| D3 | 273 KB | Opt-in for real data; over budget with the page. |
| Vega-Lite + Vega | 244 + 502 KB | Too heavy. |
| Three.js (module) | 675 KB | Lazy-load only, behind an explicit "Explore in 3D" button. |
| model-viewer | 933 KB | Lazy-load only; the simplest honest 3D path for glTF models. |
| ECharts | 1,006 KB | Too heavy. |
| p5.js | 1,030 KB | Too heavy. |
| Mermaid | 2,511 KB (lazy chunks behind a 24 KB entry) | Never at runtime. Pre-render to SVG at build time if used at all. |
| Babylon.js | 4,935 KB | Never. |

### Rodrigo's state since v1.0 (re-verified against git on 2026-10-07)

- The skill checkout moved to `C:\Dev\agent-skills\projects\html-explainer-skill`; `~/.claude/skills/html-explainer` is a junction to it. A separate local catalog packages it as a plugin (`rodrigo-agent-skills` marketplace, version 0.1.0, unpublished).
- Uncommitted in the checkout: a skim-mode fix in `template.html` (skim mode emptied decision cards and before/after panels because the exemption named the wrapper class, not the inner list), README packaging notes, `AGENTS.md`, `.claude-plugin/`. `gallery.html` does not yet carry the skim fix.
- Remote `main` is still at the research commit from 2026-09-16.

## Brainstorm

### A. A ladder of visual technology, and when to climb it

| Tier | What | Ship cost | Climb when |
|---|---|---|---|
| 0 | CSS components (flow, split, status, timeline, decision, tiles) | 0 | Sequence, comparison, health, position, choice |
| 1 | Inline SVG (branch, map, nested boxes, wireframe) | 0 | Branches, nesting, layout |
| 2 | Interactive SVG and CSS, no library: stepper, perspectives tabs, reveal-on-tap, toggles, sliders bound to CSS variables | 2 to 5 KB of script | Change over time, several views of one thing, what-if on one variable |
| 3 | Small 2D libraries: Rough.js, GSAP, Plot or D3 | 30 to 300 KB, opt-in | Real datasets, scrubbable animation of a mechanism |
| 4 | Pre-rendered diagrams: Mermaid or dagre at build time, output SVG | 0 at runtime | Large graphs the agent should not hand-place |
| 5 | 3D: model-viewer or Three.js, lazy-loaded behind a button, poster first | 700 to 950 KB on demand | The subject is a physical object, place, or mechanism |

Tier 2 is where almost all the gain is for this reader, and it costs nothing in dependencies.

### B. New components worth building (each with the relationship it encodes)

1. **Stepper figure.** One SVG, several states, Previous and Next, a caption that changes per step. Mayer's segmenting (learner-paced chunks) and signalling in one component. Replaces most reasons to animate.
2. **Perspectives tabs.** The same subject from two to four views: user flow, data flow, timeline, who-owns-what. Directly answers the 2026-08-29 ask for "different views or perspectives or ways of visualizing the problem". Tabs, not scroll, so only one view is on screen.
3. **Repeated mini-map.** The page's master diagram drawn small at the top of each chapter with the current part lit in cobalt. The frame never changes, only the highlight. Orientation for a reader who lost the thread.
4. **Isometric stack.** 2.5D layered architecture in pure SVG via a projection helper; an "explode" toggle separates the layers. Gives the 3D feeling without WebGL, occlusion, or a 700 KB download.
5. **Panel strip.** Three or four comic panels, each a small SVG scene with one caption line. For narratives: what happened in an incident, what a user goes through.
6. **Screenshot frame.** A real screenshot in a device or browser frame with numbered callout pins and tap-to-zoom. Inline data URI capped at 150 KB each, or a sibling `assets/` folder when the page ships as a folder. Concrete imagery is missing from the system today.
7. **Knob.** A range slider bound to a CSS variable or a tiny formula for one-variable what-ifs (cost against volume, latency against batch size). Preset buttons first, free sliding second: guided exploration beats free exploration for novices.
8. **Reveal on tap.** A diagram node that shows its one-line detail when tapped. Progressive disclosure inside the picture.
9. **3D viewer.** `model-viewer` with a poster image, loaded only after the reader presses "Explore in 3D". Keyboard orbit, no auto-rotate under reduced motion, poster in print. Only for physical subjects.
10. **Glyph redundancy.** Every colour dot and coloured step number gets a glyph, so meaning survives colour blindness and greyscale print.

### C. Reading aids that are not visuals

- **Read aloud.** Web Speech API, built into every browser, zero dependencies. A button per chapter; the sentence being read is highlighted. The evidence for text-to-speech helping struggling readers is the strongest of anything in this list.
- **Paragraph focus.** Dim everything except the paragraph under the pointer or the keyboard caret. The "reading ruler" idea, done with CSS.
- **Comfort controls.** Text size, letter and word spacing, line length. Readers with dyslexia benefit from wider spacing; WCAG 1.4.12 already requires the page to survive it.
- **Time per chapter.** "About 1 minute" in each chapter kicker, computed from the word count. Time blindness is an ADHD core trait; a known cost lowers the barrier to starting.
- **Resume.** Remember the last chapter in view and offer "Continue from chapter 3" at the top on return.
- **Keyboard.** J and K for chapters, F for focus mode, S for skim, D for dark.
- **Finish state.** When every chapter is ticked, the recap becomes the page's hero and a quiet "Done" appears. Immediate completion feedback, no confetti unless motion is allowed and the reader opted in.
- **Question-led headings.** A writing rule: each chapter heading is the question it answers. Curiosity carries attention further than a label does. Zero cost.
- **Ask this page.** When published as a claude.ai artifact, a box that sends "explain chapter 3 more simply" to Claude and shows the answer inline. The rescue path ("I'm not following") built into the page. Online only, opt-in.

### D. Tooling that raises the floor

- **Diagram compiler.** `scripts/diagram.mjs`: a tiny text description (nodes, edges, lanes, states) becomes an SVG that follows the grid rules and uses the `d-*` classes. Layered layout for small graphs in plain JavaScript, no dependency. Agents stop hand-placing coordinates, which is where today's diagram errors come from. Can also emit stepper states.
- **Inliner.** `scripts/build.mjs` inlines the template's style block into any page and regenerates the gallery, so the CSS has one source.
- **Checker v2.** Contrast computed from tokens for both themes; colour-only check (dots need glyphs); exactly one `li.here` per timeline; exactly one ask; external scripts allowed only from a whitelist with an integrity hash and only when a poster fallback exists; `prefers-reduced-motion` handled when anything moves; two size budgets (400 KB single file, 2 MB folder).
- **Fidelity gate.** A second agent reads only the answer bar, keep box and remember lines against the source and reports mismatches. Shape checks cannot catch "not quite what we were expecting"; this can.
- **Evals.** Five fixed briefs (decision, status, spec, architecture, research) run on every skill change, scored by the checker plus a short rubric. The `skill-creator` skill already supports evals.
- **Reference pages.** One finished example per page type under `examples/`.

### F. Two-way pages: explain, ask, collect

Rodrigo's brother already uses the skill this way with coworkers: the page explains a topic, asks questions where it needs input, and the reader types answers into text fields; at the end the page combines every answer into one copyable text he pastes back. That is a different job from "understand and approve", and the system should support it as a first-class page type rather than something each page improvises.

Components:

1. **Answer field.** `div.answer-field` under any decision card, chapter, or question: a labelled `textarea` (or radio group for fixed choices) with the question restated above it, autosaved to the browser so a closed tab loses nothing, and a small "answered" tick that also lights the rail dot. Nothing leaves the page.
2. **Collect bar.** A sticky footer that appears once any field is filled: "3 of 5 answered · Copy all answers". Copy produces a structured text in a fixed shape, so the author can paste it into a ticket, a chat, or another explainer:

   ```
   # <page title> — answers from <name, optional> on <date>
   ## <question 1, verbatim>
   <answer>
   ## <question 2>
   <answer>
   (unanswered questions are listed under "Not answered")
   ```

   Also offered: download as `.md`, and copy as JSON for tooling.
3. **Merge tool.** For the author: paste several people's copied answers and get one combined view per question, with each respondent named. Pure client-side, in the same page or a sibling `merge.html` the skill ships.
4. **Respondent line.** An optional name field at the top so the copied text says who answered. Never required, never sent anywhere.

Writing rules that come with it: one question per field, the question is a full sentence the reader could answer without the chapter, and the field says what a good answer contains ("one sentence on the constraint, one on the deadline"). Checker rules: every field has a visible label, the copy output includes the question text verbatim, and the page still passes with every field empty.

Page-type composition, **requirements gathering**: answer bar states what will be decided from the answers → keep box → map → one chapter per topic, each ending with its answer field instead of a remember line → collect bar → the ask becomes "copy your answers and send them to <name>".

### G. Known applications so far

| Use | Who | What the page must do |
|---|---|---|
| Understand a spec before approving it | Rodrigo | Answer first, one visual per chapter, approve or hold at the end |
| Rule on decisions posed by a session | Rodrigo | Decision cards, recommendation marked, do-nothing stated |
| Status: where are we, what is next | Rodrigo | Timeline with "you are here", status board, next steps |
| Research findings | Rodrigo | Evidence as tiles and status boards, sources in folds |
| Explain to coworkers and gather their requirements | Rodrigo's brother | Answer fields, collect bar, copy-all text, merge |
| Likely next: onboarding and handover, incident review, customer-facing product explainer, teaching a concept | open | Panel strip for narratives, screenshot frame, read aloud |

### E. What the system should refuse, and why

- Autoplaying 3D heroes, parallax, scroll-jacking, particle backgrounds. They spend the reader's attention on nothing.
- Mermaid or ECharts at runtime, Babylon ever. Budget.
- 3D for abstract or software subjects. Occlusion and navigation load; isometric SVG instead.
- More than one interactive figure per chapter. Each one is a decision the reader has to make.
- Scroll-triggered state changes. Use explicit steps; scrolling is for moving, not for driving.
- Bionic bolding and dyslexia novelty fonts (verified null in the September pass).

## Proposed roadmap

| Phase | Scope | Lane | Effort |
|---|---|---|---|
| 0 | Fix contrast tokens, add glyph redundancy, sync the gallery with the skim fix, commit Rodrigo's pending edits | Sonnet | 1 hour |
| 1 | Zero-dependency upgrades: answer fields and collect bar (the brother's use, made first-class), stepper, perspectives tabs, mini-map, read aloud, resume, time per chapter, keyboard, finish state, question-led heading rule, comfort controls | Sonnet | 1 to 1.5 days |
| 2 | Tooling: diagram compiler, inliner, checker v2, fidelity gate, five evals, example pages | Sonnet build, Opus review | 1 to 2 days |
| 3 | Opt-in rich media: screenshot frame, isometric stack, knob, 3D viewer policy with model-viewer, animation policy with scrubber | Sonnet | 1 to 2 days |
| 4 | Online-only: ask-this-page via artifact capabilities; publish the plugin through the local catalog, then the community registry | Sonnet | half a day |

Phase 0 and 1 give most of the value. Phase 3 is the "crazy visualization" tier and only pays off on pages about physical things.

## Research findings (primary sources, read in full, not vote-verified)

The deep-research run of 2026-10-07 completed its search and fetch phases (17 primary sources with extracted claims) and was stopped before the three-verifier vote to save session budget. Treat the numbers as reported by the papers, not as independently re-checked. Strength ratings are mine.

| Finding | Source | Strength | Implication for the page |
|---|---|---|---|
| 3D immersive data stories were rated more interesting but harder to understand than static or animated versions; 11 of 40 comments called 3D movement distracting, 7 called flashy visuals untrustworthy; the 3D build took about 90% of development time; no recall result by condition | Kim et al. 2024, arXiv 2411.18049, 600 participants | Mixed (large sample, no learning outcome) | 3D is an engagement device, never a comprehension device. Opt-in behind a button, physical subjects only. |
| Novices learn better from static diagrams than animation; experts do as well or better with animation; embedded labels on diagrams help novices (effect sizes above 1.6) and hurt experts; learner control is not reliably beneficial | Kalyuga 2007, Educational Psychology Review (expertise reversal review) | Strong in direction, narrow samples | Static first. Labels on the diagram. Animation only as opt-in with a stated job. |
| Unassisted discovery loses to explicit instruction (d = -0.38, 580 comparisons); guided discovery with feedback and scaffolding beats other instruction (d = +0.30); worked examples beat unassisted discovery by d = -0.63; discovery costs time (d = -0.72) | Alfieri, Brooks, Aldrich and Tenenbaum 2011, J. Educational Psychology, 164 studies | Strong | Sliders and simulations only with presets and worked cases first; never free exploration as the default. |
| Segmenting multimedia into chunks: retention d = 0.32, transfer about 0.3, lower load; system-paced segments confirmed (retention d = 0.42), learner-paced less confirmed; extra learner freedom added nothing measurable | Rey et al. 2019, Educational Psychology Review, 56 investigations | Strong (short lab lessons) | The stepper figure with fixed segments is the right shape. Pause points matter more than free controls. |
| Single-instruction video segments with fixed 4-second pauses cut errors by about 87% for programming novices; 17 with ADHD and 10 without; the ADHD-specific extra was a trend, not significant; 2 s pauses too short, 6 s lost engagement; self-report diverged from performance | Pimenova et al. 2026, ASSETS (arXiv 2607.24612) | Weak to mixed (small, within-participant) | Fixed short pauses between steps; do not trust "this annoys me" alone, measure. |
| Scrollytelling matched full text, nutrition labels and an interactive chart on comprehension accuracy and confidence | Mendez and Such 2026, arXiv 2603.04367, N = 454 | Mixed (one domain) | No reason to adopt scroll-driven narratives. Explicit steps instead. |
| Direct evidence that interactive articles improve learning is thin; animation's demonstrated value is limited to state transitions, uncertainty, causality and narrative; low-tech mechanisms (segmenting with pace control, details on demand, prediction and self-explanation prompts) are the ones tied to comprehension; accessibility of interactive articles is an open problem; step-based and scroll-based navigation showed no engagement difference | Hohman, Conlen, Heer and Chau, Distill 2020 | Mixed (synthesis, advocacy-leaning) | Build the low-tech mechanisms. Answer fields are self-explanation prompts. |
| Most readers scroll and skip steppers, tabs and sliders; tooltips should be assumed unseen; content that matters must not hide behind interaction | Archie Tse, NYT graphics, Malofiej 2016 | Practitioner evidence | Default state of every interactive figure must carry the point. Interaction adds depth only. |
| Students learned from 3Blue1Brown-style animations but overrated the help; learners who could name the visual's purpose learned more; dynamic visuals hurt when not tied to a clear purpose | Bos and Wigmans 2025, Utrecht, about 20 students per session | Weak | Keep the one-job caption rule for every visual. |
| Concreteness fading: start with a concrete instance, bridge to an iconic picture, fade to the abstract form | Fyfe, McNeil, Son and Goldstone 2014, systematic review | Mixed | Screenshot frame and photos earn a place; order chapters concrete to abstract when teaching a concept. |
| Comics comprehension is learned fluency, not universal; sequences need continuity (same entity drawn the same) and clear change cues; no learning comparison against text or diagrams | Cohn 2020, Psychonomic Bulletin and Review | Mixed | Panel strips are not automatically simpler. Low priority; captions and continuity rules if built. |
| Text-to-speech raised comprehension for students with reading disabilities, d = .35 (CI .14 to .56); between-subject designs d = .61; read-along highlighting never tested | Wood et al. 2018, J. Learning Disabilities, 22 studies, 2,942 readers | Strong (dyslexia samples) | Read-aloud button per chapter. Zero dependencies via the Web Speech API. |
| Text-to-speech improved comprehension in the ADHD-related reading-difficulty group, gave dyslexic readers speed but not comprehension, and disrupted typical readers | Chen, Hung and Jian 2026, Reading and Writing, eye-tracking | Mixed (one study, in press) | Read-aloud as opt-in, not default. It is for this reader specifically. |
| Digital reading rulers (grey bar, shade, underline) added about 10 to 20 words per minute for readers with and without dyslexia | Niklaus, Cai, Bylinskii and Wallace 2023, CHI, 177 readers | Mixed to strong | Paragraph focus mode in the shade or grey-bar style. |
| Dyslexia-friendly letterforms did nothing; extra letter spacing alone slowed reading unless word spacing grew too; effects tiny | Galliussi et al. 2020, Annals of Dyslexia, 128 children | Mixed | Comfort controls scale letter and word spacing together; expect little. |
| ADHD shows medium deficits in time discrimination and reproduction | Marx, Cortese, Koelch and Hacker 2022, JAACAP meta-analysis, 55 studies | Strong (for the deficit; the page implication is inference) | Time per chapter in the kicker. |
| Gamified tasks were more engaging in every study; performance effects mixed; ADHD children completed more trials when gamified | Lumsden et al. 2016, JMIR Serious Games, 33 studies | Mixed | Light completion feedback. No points, streaks or confetti by default. |
| Colour must not be the only visual means of conveying information; colour plus pattern or text is sufficient; a 3:1 lightness difference can count as the second cue | WCAG 2.2 SC 1.4.1 Understanding document | Normative | Glyphs in every dot and step number. |

What this changes in the brainstorm above: the stepper, perspectives tabs, reveal-on-tap and knob components all get one extra rule, the default state must already make the point, because most readers never click. The 3D viewer and animation tiers stay opt-in and move to phase 3. Read-aloud and the reading ruler move up to phase 1.
