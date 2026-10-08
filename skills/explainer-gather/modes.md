# Gather modes

Pick one mode per page. A mode that needs two controls uses two fields.

| Mode | The reader does | `data-kind` | Merged view |
|---|---|---|---|
| collect | Answers open questions after each chapter | `text` | Answers grouped by question, respondent named |
| confirm | Marks each chapter understood, agree or concern, with a comment | `confirm` | Who has a concern where, most concerns first |
| choose | Picks one option per decision and says why | `choice`, with the reason box | Tally per option, reasons listed under each |
| prioritise | Orders items, or scores each one | `rank`, or `scale` per item | Combined ranking, items people disagree on flagged |
| annotate | Reviews a draft and comments per section | `text`, one per section | Comments by section, then by respondent |
| check | Answers a check question, then writes the idea back in a sentence | `choice`, then `text` for the teach-back | Author scores each question, teach-backs side by side |
| protocol | An interviewer follows a script and records notes per question | `text`, one copy per interview, interviewee in the name box | Notes per question across all interviews |
| pilot | A test respondent answers the survey and says what was unclear | The survey's own kind, plus `text` per question | Clarity problems per question |
| readout | Reacts to each finding | Two `scale` fields (surprising, actionable), one `text` | Reactions per finding, findings nobody would act on stand out |
| recurring | Answers the same questions on several dates | Any kind, same ids | Change over time per question |

The merge tool groups by question and exports CSV. Build tallies, scores and rankings from the CSV.

## Rules

1. One question per field. A second idea gets its own field.
2. Stable `data-q` ids never change between versions or languages, so answers merge.
3. The page passes `../../scripts/check.mjs` with every field empty.
