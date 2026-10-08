# html-explainer

A Claude Code plugin, also usable as a standalone skill, that turns a spec, a decision, a status update, an architecture, or a release into a single-file HTML page designed for a reader with severe ADHD and a short working memory. The page opens with the answer, names the three facts to keep, gives every chapter a visual, restates context where the reader lands, and ends with a recap and one question.

It is a visual system and a vocabulary of components, not a fixed layout. Each explainer chooses the components its content needs, and every page gives the reader tools of their own: skim mode, one chapter at a time, read aloud, a reading ruler, text size, keyboard shortcuts, and a link that resumes where they left off.

## Install

### As a plugin

```text
/plugin marketplace add ariasr47/html-explainer-skill
/plugin install html-explainer@html-explainer-skill
```

The plugin adds three skills: `html-explainer`, `explainer-gather` and `explainer-atlas`. Claude Code picks them up when a request matches their descriptions. To update later, refresh the marketplace from the `/plugin` menu.

### As a standalone skill

Clone into your personal skills directory (all projects) or a project's skills directory (that project only):

```bash
# personal, all projects
git clone https://github.com/ariasr47/html-explainer-skill ~/.claude/skills/html-explainer

# or one project
git clone https://github.com/ariasr47/html-explainer-skill .claude/skills/html-explainer
```

The root `SKILL.md` is a small shim. It points to `skills/html-explainer/SKILL.md`, and from there to the gather and atlas skills, so a clone works as it always did. To update later, run `git pull` inside that folder.

> **Use one route, not both.** A junction, symlink or clone under a skills folder and a plugin install of this same repository each register the skill, so it triggers twice. Pick the plugin or the standalone folder, and remove the other.

There is no build step. The scripts need Node 18 or newer and use only Node's built-in modules. Google Fonts are optional; pages fall back to system fonts.

### Local plugin packaging

This checkout is the plugin. `.claude-plugin/plugin.json` names it `html-explainer`, sets the version (`1.0.0`) and lists the three skill folders. `.claude-plugin/marketplace.json` makes the repository a one-plugin marketplace named `html-explainer-skill`, with the plugin source at `./`. Change the two files together. A release is a git tag plus the `version` field; nothing else.

Skills reach the template, guides and scripts by paths relative to their own `SKILL.md` (for example `../../assets/template.html`), never through `~/.claude/...` or environment variables. The repository root is both the plugin root and, through the root shim, a standalone skill folder, so one set of files serves both routes.

To try this checkout as a plugin on a separate installation, add its local marketplace and install its plugin:

```text
/plugin marketplace add /absolute/path/to/html-explainer-skill
/plugin install html-explainer@html-explainer-skill
```

On Rodrigo's machine the personal skill folder is a junction to this checkout, served by the root shim. Leave the junction in place and do not also install the plugin there. Existing standalone clones stay valid: `git pull` brings them to this version through the shim.

The portfolio's portable packages are generated separately, with each skill under `skills/<skill-name>/SKILL.md` for cross-provider packaging. Maintain this source and regenerate those packages when publishing changes. Packaging does not require a particular source checkout location, and catalog packaging and any registry submission stay the maintainer's call.

## Use

Ask in plain words, for example:

- "Create an html explainer for the spec."
- "Explain where we are with the project as an html explainer, simple plain english, lots of diagrams."
- "Make an html explainer for the three decisions you need from me."
- "Make a page that asks my team these questions and collects their answers."
- "Write a backend architecture atlas for this repository."

The agent writes the page from `assets/template.html`, runs `scripts/check.mjs`, opens it once in a browser, saves it under `docs/explainers/` when working in a repository, and gives you the link. You can also call a skill by name: `/html-explainer <topic>` on a standalone install, or type `/` and pick it from the list when installed as a plugin.

## The three skills

**`html-explainer`** is the core. It writes a single-file page from the template: an answer bar, a keep box of at most three facts, a chapter map, chapters that each carry a visual and a remember line, a recap, and one question when a decision is needed. `skills/html-explainer/types.md` adds six page types (decision, status, spec, release, research, handover), each with its chapters, required components and checker rules.

**`explainer-gather`** builds pages that ask as well as explain. Each question is an answer field with a stable id. Answers autosave in the browser, and the reader copies them as Markdown or JSON, or downloads a file. Ten modes cover collecting, confirming, choosing, prioritising, annotating, checking, interview protocols, survey pilots, readouts and recurring questions.

**`explainer-atlas`** writes an architecture atlas for a repository, one layer at a time: backend, frontend, data, infrastructure or the whole system. It is a folder with `index.html`, `atlas.css` and `atlas.js`. Every claim that names code carries a file and line anchor, the three states (current, dormant, target) stay visually apart, and `scripts/anchors.mjs` confirms each anchor exists at the recorded revision.

**The merge tool.** `assets/merge.html` merges gathered answers. Open it in a browser, paste or drop any number of copied answers (Markdown or JSON), and it groups them by question with one row per respondent. It exports Markdown, JSON or CSV, works offline and needs no install.

**Japanese.** With `<html lang="ja">` the template switches to BIZ UDPGothic, a looser line height, strict line breaking and no italics, and the checker counts characters instead of words. `assets/i18n/ui.ja.json` holds the interface strings, and `scripts/translate.mjs` (`extract`, `apply`, `check`) turns a finished English page into a Japanese one with identical layout and question ids, so English and Japanese answers merge by question.

## What is in the folder

| Path | Purpose |
|---|---|
| `.claude-plugin/` | Plugin and one-plugin marketplace metadata |
| `SKILL.md` | Shim for standalone installs; points to `skills/html-explainer/SKILL.md` |
| `skills/html-explainer/` | Core skill: `SKILL.md` and `types.md` |
| `skills/explainer-gather/` | Ask and collect: `SKILL.md` and `modes.md` |
| `skills/explainer-atlas/` | Architecture atlas: `SKILL.md` |
| `assets/template.html` | The starting page: tokens, base CSS, every component, optional script |
| `assets/gallery.html` | Every component rendered with real content; also the visual style guide |
| `assets/design-system.md`, `diagrams.md`, `writing.md` | Colour meaning, type, layout and components; how to choose and draw diagrams; plain-English rules and the page contract |
| `assets/atlas.css`, `atlas.js` | Add-on for atlas pages only |
| `assets/merge.html` | Single-file merge tool for gathered answers |
| `assets/i18n/` | `ui.ja.json` (Japanese interface strings) and `glossary.example.json` (term glossary for translation) |
| `scripts/check.mjs` | Structural linter, zero dependencies |
| `scripts/translate.mjs` | Extracts a page's text to JSON and applies a translation back |
| `scripts/anchors.mjs` | Confirms atlas file and line anchors exist |
| `AGENTS.md` | Maintenance notes for this source checkout |
| `docs/` | Proposals, the build spec and research |
| `LICENSE` | MIT licence |

## Check a page by hand

```bash
node /path/to/html-explainer-skill/scripts/check.mjs docs/explainers/2026-09-16-rate-limits.html
```

Replace the path with the folder where the repository lives (for a standalone install, the clone folder). Exit code 0 means every hard rule passed. Warnings are advice, and `--json` prints the result as JSON.

From this checkout, you can also check the bundled examples:

```bash
node scripts/check.mjs assets/template.html
node scripts/check.mjs assets/gallery.html
```

The checker verifies document structure, contrast, language and content limits. It does not replace opening the page once in a browser.

## Design in one paragraph

Cool fog paper, deep navy ink, one cobalt for "you are here", four meaning colours (green done, amber caution, red blocked, purple your choice), and yellow for anything the reader is asked to remember. Colour is never the only signal: status dots carry a glyph, and text on a colour fill reaches 4.5 to 1 in both themes. Lexend for headings, Atkinson Hyperlegible Next for body, 18 px base, 62-character lines, left aligned. Dark mode automatic. No motion except what the reader triggers. Works offline, on a phone, and printed.

## Editing the system

All tokens and component CSS live in the `<style>` block of `assets/template.html`, and the optional reader script sits at its end. `assets/gallery.html` carries a copy of that style block so it stays a single file; after changing the template, paste the new block into the gallery too, then run the checker on both. Atlas-only CSS and script live in `assets/atlas.css` and `assets/atlas.js`, never in the template. Keep the six meaning colours to one meaning each, and add a component only when a new kind of information needs one. If you move a file, update the relative paths in the `SKILL.md` files.

## Licence

MIT. Fonts are loaded from Google Fonts under the SIL Open Font License and are optional; the page falls back to the system stack.
