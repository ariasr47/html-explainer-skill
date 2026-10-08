---
name: explainer-gather
description: Use when asked to "ask and collect", gather requirements, write a questionnaire, get answers from coworkers, collect feedback, review and annotate a draft, poll a decision, prioritise items, capture interview notes, pilot a survey, or collect reactions to a readout.
argument-hint: "[topic, and who will answer]"
---

# Explainer gather

An explainer page that also asks questions. The reader learns a little, answers in the page and sends the answers back. Follow the core contract in `../html-explainer/SKILL.md`.

## What you produce

One `.html` file with `<html lang="en" data-type="gather">`:

- One `.answer-field` per question, at the end of the chapter that makes it answerable.
- Exactly one `.collect` bar.
- Every question is a full sentence the reader can answer without rereading the chapter.
- Every hint says what a good answer contains.

```html
<div class="answer-field" data-q="q1">
  <label for="q1">Which step in approvals costs your team the most time?</label>
  <p class="hint">Name the step and give one example from last month.</p>
  <textarea id="q1" rows="3"></textarea>
</div>
```

Other kinds set `data-kind` on the field: `choice`, `multi`, `scale`, `rank`, `confirm`. Copy their markup and the `.collect` bar from the "Ask and collect" chapter of `../../assets/gallery.html`.

## Process

1. Write the questions first. Give each a stable id (`q1`, `q2`) that never changes, even in a translation.
2. Pick a mode from `modes.md`. It names the `data-kind` to use.
3. Write the chapters that make each question answerable. Teach only what the answer needs.
4. Build from `../../assets/template.html`. Its script autosaves answers, counts them and builds the copies.
5. Run `node ../../scripts/check.mjs <file.html>` and fix every FAIL. The page must pass with every field empty.
6. Open the page once in a browser. Fill one field and check that the collect bar appears.

## Delivery

Save under `docs/explainers/` and reply with the answer line and the link. Then tell the author how answers come back:

- Each respondent clicks Copy all answers, Download .md or Copy JSON, and sends the result by any channel.
- The author opens `../../assets/merge.html` in a browser and pastes or drops every copy.
- The merge tool groups answers by question and exports Markdown, JSON or CSV.

Nothing leaves a respondent's browser unless they send it.
