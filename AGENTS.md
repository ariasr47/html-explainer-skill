# HTML explainer maintenance

- This checkout is the source of truth for this skill. On Rodrigo's machine the personal Claude installation points here through a compatibility junction; preserve that link when maintaining his local project. Other installations need no junction.
- Preserve existing user changes, including edits to `template.html`. Keep the skill's relative references working; `SKILL.md`, templates, guides, and `scripts/check.mjs` travel together.
- Update `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` together when plugin metadata changes. Local metadata is not evidence that a release was published.
- The checker requires Node 18 or newer and no extra packages. For page or design changes, run `node scripts/check.mjs <file.html>` and open the page once in a browser. Skills live under `skills/`, shared files under `assets/`. If the template CSS changes, keep the gallery's copy in sync.
- Portable portfolio packages under `../../catalog/plugins` are generated copies. Make changes in this source, then regenerate the packages using the portfolio's build procedure.
