# Page types

Set the type on `<html data-type="...">`. Every type keeps the core contract (answer bar, keep box, chapter map, chapters, recap). Each entry adds only what that type needs. A page with no type is a plain `explainer`.

## decision

### When
The reader must rule on options that a session poses.

### Chapter composition
One chapter per option or ruling, each with a split or a small diagram. Then the recap and the ask.

### Required components
A `.decision` card for each ruling, one option marked recommended, and a line saying what happens if the reader does nothing. A closing `.ask`.

### Checker rules
At least one `.decision` and one `.ask`.

### Example topic
Three rulings on how the nightly export should behave.

## status

### When
The reader needs to know where things stand and what comes next.

### Chapter composition
A timeline chapter, a status board chapter, a "since last time" list, and a next-steps chapter. Add an ask only if something is blocked on the reader.

### Required components
`ol.timeline` with one `li.here`, `ul.status` for the health of each item, a short list of what changed since last time, `ol.steps` for what happens next.

### Checker rules
At least one `.timeline` with exactly one `li.here` and at least one `.status`.

### Example topic
Where the Japanese launch stands this week.

## spec

### When
The reader must approve a feature before it is built.

### Chapter composition
What it does (a flow). What changes for you (a split, plus a wireframe when a screen changes). How we know it works (a status board of checks). The risks. End with the ask: approve or hold.

### Required components
`ol.flow`, `div.split`, `ul.status` for the checks, a `div.callout` for each risk, `section.ask`.

### Checker rules
At least one `.split` and one `.status`.

### Example topic
Approve "remember my last filter" on the orders page.

## release

### When
The reader needs to know what shipped and what to do differently now.

### Chapter composition
The counts that matter as tiles. One chapter per theme, each with a before and after. A short chapter on what changes in practice.

### Required components
`div.tiles` with a label saying what each number means, `div.split` for each theme, `ol.steps` for what to do differently.

### Checker rules
At least one `.tiles` and one `.split`.

### Example topic
What shipped in version 2.4.

## research

### When
The reader needs findings and how far to trust each one.

### Chapter composition
One chapter per finding, each carrying its evidence and its strength, with sources in a fold. Then what this changes (a split) and the open questions. Ask only if the findings force a choice.

### Required components
Evidence as `div.tiles`, `ul.status` or `ol.timeline`. Source quotes in `details.fold`. A strength label on every finding.

### Checker rules
At least one `.status` or `.tiles`, and at least one `details.fold`.

### Example topic
What eleven interviews say about why new users stop at step two.

## handover

### When
A session or a person takes over work in progress.

### Chapter composition
State. Work in flight. What is next. What is verified and what is only a claim. Evidence links in folds.

### Required components
`ul.status` for state and in-flight work, verified items green and unchecked claims amber. `ol.steps` for next actions. `details.fold` for evidence links.

### Checker rules
At least one `.status` and one `.steps`.

### Example topic
Handing the invoice migration to the next session.
