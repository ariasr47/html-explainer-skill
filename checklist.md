# Ship checklist

Run `node scripts/check.mjs <file.html>` first. It measures the things below that can be measured. Then do the three reads.

## Measured by the script

- Title is 2 to 8 words and is not "explainer".
- Exactly one `.answer`, one `.keep` with at most 3 items, one `.recap`.
- 3 to 7 `.chapter` sections, each with an `h2`, a `.remember`, and (after the first) a `.from`.
- Every `figure.figure` has an `svg` with a `<title>` and a `figcaption.take`.
- Every SVG uses `viewBox` and no hard-coded fill colours outside the `d-*` classes.
- No paragraph over 40 words, no sentence over 30 words, in the reading path (folds excluded).
- Words in the reading path per chapter under 250. Total reading-path words under 1400.
- At least one visual component (`figure`, `flow`, `split`, `timeline`, `status`, `decision`, `tiles`) per chapter.
- No `<script src=`, no `<link>` other than the Google Fonts pair, no `<img src="http`.
- `<meta name="viewport">` and `<meta name="color-scheme">` present.
- File under 400 KB.

## Three reads you do yourself

1. **The skim read.** Turn on skim mode. Read what is left, top to bottom. Does it tell the whole story? If a chapter goes blank in skim mode, it has no visual and no remember line; fix it.
2. **The phone read.** Open at 390 px wide. No horizontal scroll. Diagram text still readable (zoom in if you must, but it should not be needed). The rail chips scroll sideways. Decision options stack.
3. **The dark read.** Toggle dark. Every diagram still visible. No white boxes. Yellow memory surfaces still read as yellow.

## Delivery

- Save into the repo when there is one: `docs/explainers/YYYY-MM-DD-<topic>.html`. Otherwise the working folder.
- Open it in the browser pane, or publish it as an artifact when the reader is on another device. Both, if unsure.
- In the chat reply, give the answer line and the link. Not the contents.
