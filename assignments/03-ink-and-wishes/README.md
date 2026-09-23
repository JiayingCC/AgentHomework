# Ink & Wishes — 墨与愿

A small, interactive Chinese-calligraphy studio made for an agentic-workflow assignment. First working build: September 22, 2026.

The student chose the subject and revised the visual brief to **minimal fluid glass, with no pastel palette**. The website uses quiet paper, dark ink, translucent controls, and a red-envelope creation mode.

## Try the website

From the repository root:

```sh
python3 -m http.server 4190 --bind 127.0.0.1 --directory assignments/03-ink-and-wishes/site
```

Open [the local studio](http://127.0.0.1:4190/). Keep the terminal running. This address works on your own computer; it is not a public website address. Use an HTTP server rather than opening `index.html` directly because the site uses JavaScript modules and local JSON files.

No build step, framework, API key, account, or package installation is required. Everything needed by the page is in `site/`. Relative asset URLs make it suitable for a GitHub Pages subdirectory. The new calligraphy website has **not yet been published**.

## What works in this release

- Six short lessons: **山、水、永、安、春、福**, with pronunciation, meaning, cultural references, and visible credits.
- A reference for each character (3–13 strokes) you can play, pause, or step through.
- A character-specific “find the next stroke” game with explanations, retries, and first-attempt feedback: two questions for 山, three for the others.
- A drawing surface with a size slider, optional tracing guide, undo/redo, and clear confirmation. Ink brush / 毛笔 is the default: tapered strokes, speed-responsive width, bristle texture, and an ink-load control. Steady and Flow remain available.
- A red-envelope front made from your actual drawing, with a 1200 × 2000 PNG download. A practice sheet downloads at 1200 × 1200.
- Three named, editable works saved in this browser through IndexedDB. Each work remembers its character. Reopen, replace, download, or remove a work. A full collection requires an explicit replacement choice.
- Separate drafts and undo histories while switching characters. Save a draft to keep it after a reload; unsaved drafts last only for the current page session.
- “Behind the ink”: the development process, six workflow terms, and an iteration-prompt builder.
- Responsive layout, labeled controls, reduced-motion support, and a solid-controls alternative to glass.

Saved works belong to this browser and origin. Clearing browser data can remove them; changing the port, browser, or website address gives a different collection. Download a PNG for a portable image copy. PNGs do not preserve editable stroke data.

## A short class demonstration

1. Choose **山**, open **The story of 山**, then watch its three-stroke reference.
2. Try its two-question warm-up; explain what happens after a wrong answer.
3. Draw a few marks. Try undo/redo, switch to 水 and back to see the draft stay, and change brush size.
4. Choose **Make it a wish**, name the design, and save it.
5. Reload, open **Your collection**, reopen the work, and download its PNG.
6. Open **Behind the ink**. Enter a specific improvement and generate a task brief for the next agent iteration.

## Homework evidence

- [Latest character-library iteration](notes/character-library.md)
- [Brush and background iteration](notes/brush-iteration.md)
- [Design decisions](notes/design.md)
- [Actual workflow and iterations](notes/workflow.md)
- [Checks and remaining uncertainties](notes/verification.md)
- [Sources and glyph provenance](notes/sources.md)
- [Blank learner-trial worksheet](notes/learner-trial.md)
- [Automated checks](tests/*.test.mjs)

Run the checks from the repository root with a current Node.js installation:

```sh
node --test assignments/03-ink-and-wishes/tests/*.test.mjs
```

The website runs in the browser without live AI calls. “Behind the ink” records agent-assisted development; it does not simulate a live team of agents or invent participant feedback.

## Limits and the next iteration

This release focuses on a complete practice-to-keepsake journey across six characters. Couplets, a searchable dictionary, accounts, cloud syncing, pen tilt, realistic ink diffusion, and aesthetic grading remain outside this build. Compatible pens can provide pressure input to Ink brush, but physical pen testing remains pending. No learner study has compared the brush modes.

Human calligraphy review, physical phone/tablet testing, and a three-classmate learner trial are still pending. The next useful iteration is to collect those observations, correct the highest-impact issue, and then add a reviewed Spring Festival couplet layout. Publication to GitHub Pages and the student's own reflection remain assignment steps.

## Files and credits

`site/brush.mjs` creates the tapered, textured ink marks; `site/app.mjs` connects the interface, `lessons.mjs` holds the six lessons and generates their quizzes, `core.mjs` contains validation rules, `storage.mjs` handles editable works, and `render.mjs` draws the previews and exports. The test suite contains 20 checks.

The six unmodified character datasets are from **Hanzi Writer Data 2.0.1 / Make Me a Hanzi**, derived from Arphic fonts. The full Arphic Public License is bundled in `site/data/ARPHICPL.TXT`, and its attribution is visible in the website. `site/data/manifest.json` records each asset's checksum. The [source record](notes/sources.md) explains which references support which claims. No museum images or proprietary fonts are bundled.

Mindplay remains separately in `assignments/02-mindplay/`.
