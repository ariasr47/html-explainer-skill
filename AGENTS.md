# HTML explainer maintenance

- This checkout is the source of truth for this plugin. On Rodrigo's machine it is installed as a Claude Code plugin from the GitHub marketplace (`html-explainer@html-explainer-skill`, user scope); the former junction at `~/.claude/skills/html-explainer` was retired on 2026-10-07. After pushing a change, update the installed copy with `claude plugin update html-explainer@html-explainer-skill` or the plugin UI.
- Preserve existing user changes, including edits to `template.html`. Keep the skill's relative references working; `SKILL.md`, templates, guides, and `scripts/check.mjs` travel together.
- Update `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` together when plugin metadata changes. Local metadata is not evidence that a release was published.
- The checker requires Node 18 or newer and no extra packages. For page or design changes, run `node scripts/check.mjs <file.html>` and open the page once in a browser. Skills live under `skills/`, shared files under `assets/`. If the template CSS changes, keep the gallery's copy in sync.
- Portable portfolio packages under `../../catalog/plugins` are generated copies. Make changes in this source, then regenerate the packages using the portfolio's build procedure.
