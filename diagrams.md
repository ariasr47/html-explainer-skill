# Diagrams that carry the meaning

The most common complaint about past explainers: "too much text, pack it with visuals" and "the flow diagrams are not of high quality, the paths are confusing". A diagram earns its place when it shows a relationship that prose would have to hold in the reader's memory: a sequence, a branch, a before/after, a where-are-we, a who-talks-to-whom.

## Choose the form from the relationship

| The content is | Use | Component |
|---|---|---|
| A sequence with no branches, 3 to 7 steps | CSS flow | `ol.flow` (no SVG needed) |
| A sequence with branches or loops | SVG flowchart, left to right | `figure.figure > svg` |
| Two states of the same thing | Before / after | `div.split` with `.before` and `.after` |
| Progress through time with a current point | Timeline | `ol.timeline` with one `li.here` |
| Parts and how they connect | SVG box-and-line map | `figure.figure > svg` |
| A choice between options | Decision card | `div.decision > div.options` |
| Health of several items | Status board | `ul.status` |
| One layer inside another | Nested SVG boxes | `figure.figure > svg` |
| A single number that decides something | Tile | `div.tiles > div.tile` |

Reach for CSS components first. Write an SVG only when the relationship has branches, nesting, or crossing lines.

## Rules for an SVG that reads at a glance

1. **One relationship per diagram.** Seven nodes maximum. If there are more, draw two diagrams or nest a fold.
2. **Reading direction is left to right, then top to bottom.** Time and causality flow rightwards. Never make the reader's eye go up or backwards; loops are drawn as a labelled return arrow below the row.
3. **Every node is a rounded box with one label of at most four words.** Details go in a second, smaller line (`.d-text-s`) or in the caption.
4. **Colour means one thing.** `d-box-here` for the current point (one per diagram), `d-box-go` done or safe, `d-box-wait` in progress or caution, `d-box-stop` blocked or risk, `d-box-decide` the reader's choice. Everything else is a plain `d-box`. Never colour for decoration.
5. **Arrows are labelled when the edge carries a condition** ("if the file exists", "every 5 min"). Unlabelled arrows mean "then".
6. **Crossing lines are a bug.** Rearrange the nodes. A grid of 3 columns by 2 rows solves almost everything.
7. **Use the `d-*` classes and never hard-coded colours**, so the diagram is correct in dark mode and in print.
8. **Always a `<title>`** inside the SVG and a `figcaption.take` below it that states the single conclusion. The caption is the diagram's reason to exist. If you cannot write it, delete the diagram.
9. **`viewBox` only, no width or height attributes.** The container scales it. Keep the aspect ratio between 2:1 and 5:1 so it never becomes a tall strip on a phone. Text inside is 15 px in viewBox units for an 800-wide box; do not go below 13.
10. **Real content only.** No placeholder nodes, no "etc.", no decorative icons.

## Layout grid for an 800-wide viewBox

```
columns (x of box left edge):  20   |  300  |  580        box width 200, height 60
rows (y of box top edge):      30   |  130  |  230        gap 20 between rows
arrow from right edge x+200 to next left edge; head is a 12-wide triangle
```

Example, a branch:

```html
<figure class="figure">
  <svg viewBox="0 0 800 300" role="img" aria-labelledby="f2"><title id="f2">Where a translation request goes</title>
    <rect class="d-box" x="20" y="120" width="200" height="60" rx="10"/><text class="d-text-b" x="120" y="156" text-anchor="middle">Upload a PDF</text>
    <path class="d-line" d="M220 150 H290"/><path class="d-arrow" d="M290 144 L302 150 L290 156 Z"/>
    <rect class="d-box-decide" x="302" y="120" width="200" height="60" rx="10"/><text class="d-text-b" x="402" y="156" text-anchor="middle">Right-to-left?</text>
    <path class="d-line" d="M502 150 H540 V60 H570"/><path class="d-arrow" d="M570 54 L582 60 L570 66 Z"/>
    <text class="d-text-s" x="545" y="100" text-anchor="middle">yes</text>
    <rect class="d-box-stop" x="582" y="30" width="200" height="60" rx="10"/><text class="d-text-b" x="682" y="66" text-anchor="middle">Not supported yet</text>
    <path class="d-line" d="M502 150 H540 V240 H570"/><path class="d-arrow" d="M570 234 L582 240 L570 246 Z"/>
    <text class="d-text-s" x="545" y="200" text-anchor="middle">no</text>
    <rect class="d-box-go" x="582" y="210" width="200" height="60" rx="10"/><text class="d-text-b" x="682" y="246" text-anchor="middle">Translate</text>
  </svg>
  <figcaption class="take"><b>Take from this:</b> right-to-left files stop at the gate with a clear message, everything else goes through unchanged.</figcaption>
</figure>
```

## Wireframes and mockups

When the topic changes something the reader will see on a screen, include a wireframe: plain `d-box` rectangles for regions, `d-text-s` labels, `d-box-here` on the part that changes, and the same caption rule. Two wireframes side by side in a `.split` show before and after.

## What a bad diagram looks like

- Every box a different colour.
- Twelve nodes and lines that cross.
- Labels that are sentences.
- A diagram that restates the paragraph above it instead of replacing it.
- Icons and emoji standing in for labels.
- Hard-coded `#fff` fills that vanish in dark mode.
