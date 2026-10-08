---
name: explainer-atlas
description: Use when asked for an architecture atlas, a system map, a backend or frontend reference, how a system fits together, or onboarding to a codebase.
---

# Explainer atlas

An atlas is an explainer page that maps one layer of a codebase. Every claim about code carries a file and line anchor, and three states are never mixed: current, dormant, target. It is a dated snapshot, so say so in the opening, and check current source before describing today's behaviour.

## Inputs

- Repository path.
- Layer: backend, frontend, data, infra or whole system.
- The example entity to follow through the system, such as one uploaded file from request to deletion.
- Where the adopted target comes from: a contract, a proposal file or none.

## Steps

1. Read the code one layer at a time. Note the commit hash and date. This is the expensive step, so say so in your report.
2. Write anchored content. Every claim that names code carries `<span class="anchor" data-src="relative/path.py" data-line="120">path.py:120</span>`, with `data-src` relative to the repository root.
3. Compose chapters from this menu and keep only what applies: system map, one entity's journey, how data moves, request traces, processes and lifetimes, API, data model, storage and retention, identity and trust, states and failures, stack and deploy, sources and glossary. Put the journey before the reference chapters, so the page teaches first and answers lookups second.
4. Follow the core contract in `../html-explainer/SKILL.md`: answer bar, keep box and chapter map first, engineering detail in folds, a remember line closing every chapter.
5. Before the first diagram, add a legend: a `div.legend` holding `span.state-current`, `span.state-dormant` and `span.state-target`, each saying what its state means. Draw dormant nodes with `d-dormant` and target nodes with `d-target`, and name the state in the node label.
6. Put the revision stamp in the meta line: `<span data-revision="a1b2c3d">Revision a1b2c3d, 2026-10-07</span>`.
7. Mark up the map, source inspector, traces, matrix and rail search as documented at the top of `../../assets/atlas.js`. Draw every map edge on its own track with a label, and give each trace an `id`.
8. Run `node ../../scripts/check.mjs index.html`, then `node ../../scripts/anchors.mjs index.html --repo <path> --rev <hash>`. Fix every FAIL, missing file and out of range line.

## Output

A folder `docs/architecture/<layer>-atlas/` with `index.html` and copies of `../../assets/atlas.css` and `../../assets/atlas.js`. Start `index.html` from `../../assets/template.html`, set `data-type="atlas"` on `<html>`, link `atlas.css` after the template style block, and load `atlas.js` with `defer` after the template script. Keep the folder under 3 MB: embedded sources count.

## Reference

FormIntact's backend atlas in `C:\Dev\pdf-translator\docs\architecture\backend-atlas\` shows the quality to aim for. It is a reference, not a template to copy.
