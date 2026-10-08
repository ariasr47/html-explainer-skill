# From one skill to a plugin with page types, including an architecture atlas

Proposal, 2026-10-07. Status: for Rodrigo's decision. Nothing here is built. An agent with no other context can execute it from this file plus `docs/research/2026-10-07-next-level.md`.

## Verdict in three lines

1. Yes, make it a plugin. The thing worth sharing is the design system, the writing contract and the checker; page types sit on top of that one core and must never re-explain it.
2. Keep the skill count small: one core skill with a registry of page types, plus two skills that need their own machinery, `explainer-gather` (two-way pages) and `explainer-atlas` (generated and curated architecture reference). Three skills, one reviewer agent, one hook.
3. The atlas is the big one. FormIntact's backend atlas is the model: inventories parsed from source, every claim anchored to a file and line at a recorded revision, three states kept apart (current, built but dormant, adopted target), a companion skill that navigates it and insists on checking current source before any claim about today. Generalise that pipeline; do not generalise its prose.

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
html-explainer/                      plugin root = this repository
  .claude-plugin/plugin.json         name html-explainer, version 1.0.0, skills, agents, hooks
  .claude-plugin/marketplace.json    the repo is its own one-plugin marketplace
  skills/
    html-explainer/SKILL.md          core contract; page types live in types/
    html-explainer/types/            decision.md status.md spec.md release.md research.md handover.md
    explainer-gather/SKILL.md        two-way pages: answer fields, collect bar, merge
    explainer-atlas/SKILL.md         architecture atlas: inventory, curate, render, verify, companion skill
  agents/explainer-reviewer.md       fidelity gate, Sonnet
  hooks/hooks.json                   PostToolUse checker on explainer and atlas pages
  assets/
    template.html design-system.md diagrams.md writing.md checklist.md gallery.html
    atlas/template.html atlas.css atlas.js components.md
  scripts/
    check.mjs                        structure, prose limits, contrast from tokens, type rules
    build.mjs                        inlines template CSS into any page; regenerates gallery
    diagram.mjs                      text description to SVG on the grid rules
    atlas/inventory.mjs render.mjs verify.mjs drift.mjs companion.mjs
  examples/                          one finished page per type
  README.md LICENSE CHANGELOG.md
```

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

## Migration from today's repository

1. Phase 0 from the research roadmap first (contrast tokens, glyphs, gallery synced with your skim fix), on the current layout.
2. Move files into the plugin layout above; rewrite paths to `${CLAUDE_PLUGIN_ROOT}`; version 1.0.0; changelog.
3. Retire double loading: either point the junction at `skills/html-explainer` or remove the junction and install the plugin from your catalog. Not both, or the skill triggers twice.
4. Add `gather`. Your brother gets it by updating the plugin.
5. Add `atlas` with the two adapters, using FormIntact as the first regression case: the generalised pipeline must reproduce its backend atlas's inventory counts (38 routes, 23 tables, 267 columns, 19 schema files, 11 packages, 44 import edges) before it is trusted on another repository.
6. Publish: commit the marketplace manifest to the public repo, bump the catalog package, submit to the community registry when stable.

## Effort and lanes

| Step | Lane | Effort |
|---|---|---|
| Phase 0 fixes | Sonnet | 1 hour |
| Plugin restructure, hook, reviewer agent, examples | Sonnet | 1 day |
| gather skill | Sonnet | 1 day |
| atlas: inventory adapters for the two stacks, render, verify | Sonnet build, Opus review | 3 days |
| atlas: curate step prompt and companion-skill generator | Opus or Fable for the prompt design | 1 day |
| atlas regression against FormIntact, drift script | Sonnet | 1 day |

The atlas is the expensive part, in build time and in per-run curation cost. Say so in each run's report.

## Risks

- Generic source extraction is hard; adapters will be shallow at first. The verify step protects against wrong anchors, not against missing ones. Report inventory coverage honestly.
- A 2 to 3 MB folder is not an explainer. Keep the single-file 400 KB rule for every other type.
- The atlas is a dated snapshot. The companion skill's "check current source first" rule is what keeps it from becoming a lie; carry it over verbatim in spirit.
- Two install routes at once (junction and plugin) will double-trigger the skill. Pick one.

## Decision requested

A. Plugin with three skills (core with a type registry, gather, atlas), one reviewer agent, one hook. Recommended.
B. Keep one skill and add only the type registry; no gather or atlas machinery yet.
C. Separate plugins per type (explainer, gather, atlas) sharing nothing. Not recommended: three copies of the design system to keep in sync.
