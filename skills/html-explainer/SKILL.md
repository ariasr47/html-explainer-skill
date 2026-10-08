---
name: html-explainer
description: Use when asked for an "html explainer", a visual explainer, a page that explains something "in simple plain english", "with lots of visuals and diagrams", or "for someone with ADHD / short working memory"; also when a spec, decision, status update, architecture, or release needs to be understood and approved by a reader who cannot hold a long document in their head.
argument-hint: "[topic or file to explain]"
---

# HTML explainer

A single-file HTML page that lets a reader with a short working memory understand one thing and, if needed, decide. Colour has meaning and nothing moves on its own.

Paths are relative to this file.

## What you produce

One `.html` file from `../../assets/template.html`, in this order:

1. **Answer bar**: the whole page in one sentence.
2. **Keep box**: at most three facts to carry.
3. **Chapter map**: 3 to 7 chapters, one line each.
4. **Chapters**: one idea each. Each opens by restating the fact it builds on, has a visual component, puts machinery in a fold, and closes with one remember line.
5. **Recap**: the remember lines.
6. **The ask**, only when a decision is needed: one question, 2 to 4 choices, the recommendation marked, and what happens if the reader does nothing.

## Page identity and conventions

- Start with `<html lang="en" data-type="explainer">`. `lang` is `en` or `ja`. `data-type` is `explainer` (default), `decision`, `status`, `spec`, `release`, `research` or `handover`, each defined in `types.md`.
- Pages that collect answers (`gather`) or map a system (`atlas`) add rules. Also read `../explainer-gather/SKILL.md` or `../explainer-atlas/SKILL.md`.
- Chapter kicker: "Chapter 2 of 6, about 1 minute" (200 words a minute, rounded up). Japanese: "第2章 / 全6章、約1分" (500 characters a minute).
- Headings ask the question the chapter answers: "What changes for you?", not "Impact".
- The default state of any interactive element already makes the point: the first step and the first tab carry it. Readers skip clicks.

## Process

1. **Write the answer line first**, then the three keep facts, then the chapter headings. If any will not come, reread the source.
2. **Pick each chapter's visual from the relationship it holds** (sequence, branch, before and after, time, choice, health, parts) using `../../assets/diagrams.md`. Prefer CSS components; draw an SVG only for branches or nesting.
3. **Copy the template, fill it, delete what you do not need.** Keep the tokens, base CSS and script. `../../assets/design-system.md` explains the components; `../../assets/gallery.html` shows them.
4. **Write the prose last** under `../../assets/writing.md`: paragraphs under forty words, one idea per sentence.
5. **Check:** `node ../../scripts/check.mjs <page.html>`. Fix every FAIL.
6. **Deliver:** save as `docs/explainers/YYYY-MM-DD-<topic>.html` in a repo, open it once in a browser, reply with the answer line and the link.

## Quick reference

- Know the point: `p.answer`
- Carry facts: `div.keep`, `p.from`, `p.remember`, `section.recap`
- See a sequence: `ol.flow`, or SVG in `figure.figure` for branches
- Compare two states: `div.split`
- Choose: `div.decision`, then `section.ask`
- Know where things stand: `ul.status`, `ol.timeline` with one `li.here`
- Act: `ol.steps`
- Verify or dig: `details.fold`
- See change over time in one picture: `figure.stepper`
- See several views of one thing: `div.views`
- See where this chapter sits in the whole: `figure.minimap`

## Common mistakes

- **The answer at the end.** It belongs right after the title.
- **"As we saw above."** The reader scrolled. Restate it in `p.from`.
- **Colour as decoration.** Six meaning colours, one meaning each, never colour alone.
- **A diagram that repeats the paragraph.** Delete the paragraph, write the take-away caption.
