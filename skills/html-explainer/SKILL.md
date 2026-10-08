---
name: html-explainer
description: Use when asked for an "html explainer", a visual explainer, a page that explains something "in simple plain english", "with lots of visuals and diagrams", or "for someone with ADHD / short working memory"; also when a spec, decision, status update, architecture, or release needs to be understood and approved by a reader who cannot hold a long document in their head.
argument-hint: "[topic or file to explain]"
---

# HTML explainer

A single-file HTML page that lets a reader with a short working memory understand one thing and, if needed, decide. The page is a skim first and a read second. Colour has meaning, nothing moves on its own, and the page never asks the reader to remember more than three things.

Past explainers written without this skill averaged 1,300 words of prose, most had no diagram at all, and one in thirteen opened with the answer. The reader's feedback was "too much text, pack it with visuals" and "I'm not following". This skill exists so that never happens again.

## What you produce

One `.html` file, started from `template.html` in this skill folder, with this shape in this order:

1. **Answer bar**: the whole page in one sentence.
2. **Keep box**: at most three facts the reader must carry.
3. **Chapter map**: 3 to 7 chapters, one line each on what the reader gets.
4. **Chapters**: one idea each. Every chapter opens by restating the one fact it builds on, contains at least one visual component, puts machinery in a fold, and closes with one remember line.
5. **Recap**: the remember lines collected.
6. **The ask** (only when a decision is needed): one question, 2 to 4 choices, the recommendation marked, and what happens if the reader does nothing.

## Process

1. **Write the answer line first.** Then the three keep facts. Then the chapter titles as spoken sentences. If any of these will not come, read the source material again; the page is not ready to be written.
2. **Pick the visual for each chapter from the relationship it holds** (sequence, branch, before/after, position in time, choice, health, parts). The table in `diagrams.md` maps relationship to component. Prefer the CSS components; write an SVG only for branches or nesting.
3. **Copy `template.html`, fill it, delete what the content does not need.** Keep the tokens, base CSS and script untouched unless the content genuinely needs a new component; then add it using the existing tokens.
4. **Write the prose last**, under the rules in `writing.md`: paragraphs under forty words, one idea per sentence, jargon defined where it first appears, exact names and commands in folds.
5. **Run the checker** and fix every FAIL: `node <skill dir>/scripts/check.mjs <file.html>`.
6. **Do the three reads** from `checklist.md`: skim mode, phone width, dark theme. Fix what breaks.
7. **Deliver**: save into `docs/explainers/YYYY-MM-DD-<topic>.html` when in a repo, open it in the browser pane or publish it as an artifact, and reply with the answer line and the link.

## Reference files

| File | Read it when |
|---|---|
| `template.html` | Always. It is the starting point and holds every token and component. |
| `design-system.md` | Choosing components, colours, page composition by page type. |
| `diagrams.md` | Drawing any SVG or choosing between flow, split, timeline, status. |
| `writing.md` | Writing any prose on the page. |
| `checklist.md` | Before delivering. |
| `gallery.html` | To see every component rendered with real content. |

## Quick reference

| Reader needs to | Component |
|---|---|
| Know the point | `p.answer` |
| Carry facts across scrolling | `div.keep`, `p.from`, `p.remember`, `section.recap` |
| See a sequence | `ol.flow` (linear) or SVG in `figure.figure` (branches) |
| Compare two states | `div.split` with `.before` and `.after` |
| Choose | `div.decision` with `div.options`, and `section.ask` at the end |
| Know where things stand | `ul.status`, `ol.timeline` with one `li.here` |
| Act | `ol.steps` |
| Understand a word | `dfn` plus `dl.term` |
| Verify or dig | `details.fold` |

## Common mistakes

- **A report with a stylesheet.** Prose paragraphs stacked under headings, no visuals. The checker fails a chapter with no visual component for this reason.
- **The answer at the end.** "In conclusion" is a smell. The answer bar is the first thing after the title.
- **"As we saw above."** The reader did not see it; they scrolled. Restate it in `p.from`.
- **Colour as decoration.** Six meaning colours, each with one meaning, everywhere. A seventh colour is a bug.
- **A diagram that repeats the paragraph.** The diagram replaces the paragraph. Delete the paragraph and write the take-away caption.
- **Machinery in the reading path.** Commands, hashes, paths, tables of numbers go in a fold. The page must read with every fold closed.
- **More than three keep facts, or a fourth chapter idea.** Split the page or cut.
- **Hard-coded colours in SVG.** They vanish in dark mode. Use the `d-*` classes.
