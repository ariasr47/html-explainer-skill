# html-explainer

A Claude Code skill that turns a spec, a decision, a status update, an architecture, or a release into a single-file HTML page designed for a reader with severe ADHD and a short working memory. The page opens with the answer, names the three facts to keep, gives every chapter a visual, restates context where the reader lands, and ends with a recap and one question.

It is a visual system and a vocabulary of components, not a fixed layout. Each explainer chooses the components its content needs.

## Install

Copy this folder to your personal skills directory (all projects) or to a project's skills directory (that project only):

```bash
# personal, all projects
git clone https://github.com/ariasr47/html-explainer-skill ~/.claude/skills/html-explainer

# or one project
git clone https://github.com/ariasr47/html-explainer-skill .claude/skills/html-explainer
```

Or copy the folder by hand. There is no build step and no dependency. The checker needs Node 18 or newer.

To update later, run `git pull` inside that folder.

Claude Code picks the skill up automatically when a request matches its description. You can also invoke it directly with `/html-explainer <topic>`.

## Use

Ask in plain words, for example:

- "Create an html explainer for the spec."
- "Explain where we are with the project as an html explainer, simple plain english, lots of diagrams."
- "Make an html explainer for the three decisions you need from me."

The agent writes the page from `template.html`, runs `scripts/check.mjs`, checks it at phone width and in dark mode, saves it under `docs/explainers/` when working in a repository, and gives you the link.

## What is in the folder

| File | Purpose |
|---|---|
| `SKILL.md` | The instructions the agent follows |
| `template.html` | The starting page: tokens, base CSS, every component, optional script |
| `gallery.html` | Every component rendered with real content; also the visual style guide |
| `design-system.md` | Colour meaning, type, layout, component vocabulary, composition patterns |
| `diagrams.md` | How to choose and draw diagrams that read at a glance |
| `writing.md` | Plain-English rules and the page contract |
| `checklist.md` | The ship checklist |
| `scripts/check.mjs` | Structural linter, zero dependencies |

## Check a page by hand

```bash
node ~/.claude/skills/html-explainer/scripts/check.mjs docs/explainers/2026-09-16-rate-limits.html
```

Exit code 0 means every hard rule passed. Warnings are advice.

## Design in one paragraph

Cool fog paper, deep navy ink, one cobalt for "you are here", four meaning colours (green done, amber caution, red blocked, purple your choice), and yellow for anything the reader is asked to remember. Lexend for headings, Atkinson Hyperlegible Next for body, 18 px base, 62-character lines, left aligned. Dark mode automatic. No motion except what the reader triggers. Works offline, on a phone, and printed.

## Editing the system

All tokens and component CSS live in the `<style>` block of `template.html`. `gallery.html` carries a copy of that block so it stays a single file; after changing the template, paste the new block into the gallery too, then run the checker on both. Keep the six meaning colours to one meaning each, and add a component only when a new kind of information needs one.

## Licence

MIT. Fonts are loaded from Google Fonts under the SIL Open Font License and are optional; the page falls back to the system stack.
