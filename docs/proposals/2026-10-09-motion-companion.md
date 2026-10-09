# Claude Motion as a companion to explainer pages

Proposal, 2026-10-09. Status: for Rodrigo's decision. Nothing built.

## What Claude Motion is (as reported on 8 and 9 October 2026)

- A beta feature inside Claude (claude.ai) that turns supplied text, charts, shapes and images into animated explainers. Anthropic says it writes code to animate the material rather than using a video-generation model; no generated footage, no AI-generated people.
- Output is an editable animation exported as MP4; wording, figures and timing can be revised by prompt. Finished work can be handed to Runway, Adobe, Descript, HeyGen and others.
- Availability during the beta is reported as Team and Enterprise plans; Enterprise admins enable it under Organization settings, Artifacts. One outlet claims all plans; treat that as unconfirmed.
- No API and no Claude Code surface were reported, so the plugin cannot render a Motion itself. It can prepare everything a Motion needs and take the result back.

## Where it earns its place, by the evidence already in this repository

The research pass of 2026-10-07 found that motion helps when it shows state transitions, causality, uncertainty or a narrative, when it is segmented into learner-paced steps, and when each visual has one stated job. It found no comprehension gain from motion as decoration, and that novices learn better from static diagrams when the motion carries no job. So:

| Use | Verdict | Why |
|---|---|---|
| System design walkthrough: one request travelling through the system map | Yes, the best case | State transitions and causality in sequence; the atlas already has the map and the trace as steps |
| Data flow: where one kind of data goes and where it is kept out | Yes | Same reason; the "how data moves" chapter is already a sequence |
| Release story: what changed, before and after | Yes, short | Narrative with a clear job; pairs with the release page |
| Onboarding and customer-facing walkthroughs | Yes | The audiences that watch rather than read; the brother's coworkers, prospective customers |
| Decision pages | No | A decision needs scanning back and forth; a video cannot be skimmed |
| Gather pages | No | They exist to be typed into |
| The atlas as a whole | No | A reference is looked up, not watched; one trace from it is the right unit |
| Anything with numbers the reader must verify | No | Numbers belong in tiles and folds where they can be checked |

Rules for any video the skill produces: one job per video, 30 to 90 seconds, three to six beats, a pause between beats, no autoplay on the page, the static page remains the canonical artifact and the video is a companion inside it.

## The lean adoption

Three small pieces, no new skill:

1. **Storyboard script.** `scripts/storyboard.mjs page.html --out folder` reads a finished page and writes `storyboard.md` (title, answer line, then one scene per chapter: heading, chapter time as the scene length, the stepper steps or the figure caption as beats, the remember line as the closing card) and exports every `figure` SVG as a standalone `.svg` file with the page's light-theme colours baked in. These are exactly the "text, charts, shapes and images" Motion asks for. Zero dependencies, about 120 lines.
2. **Video figure.** A `figure.video` component in the template: a poster (the chapter's own diagram), a play button, native `<video controls>` with the MP4 and a `.vtt` caption track generated from the beat texts, no autoplay, respects reduced motion, hidden in print with the poster left in place. The Japanese twin reuses the same MP4 with a Japanese caption track from the translated strings.
3. **One paragraph in the core skill** and a row in the design system: when a chapter holds a sequence with more than four steps, offer a Motion companion; hand the storyboard folder to Claude Motion in claude.ai; drop the MP4 back next to the page.

Effort: about half a day on Sonnet. Blocked until Motion is available on Rodrigo's and his brother's plans.

## Decision requested

A. Build the three pieces now so the pages are Motion-ready, and use Motion when the plan allows.
B. Wait for Motion to reach the plan or an API, then build.
C. Not for this skill.
