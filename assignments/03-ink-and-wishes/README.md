# Ink & Wishes — 墨与愿

A small, interactive Chinese-calligraphy studio made for an agentic-workflow assignment. First working build: September 22, 2026.

The student chose the subject and revised the visual brief to **minimal fluid glass, with no pastel palette**. The website uses quiet paper, dark ink, translucent controls, and a red-envelope creation mode.

## Try the website

From the repository root:

```sh
python3 -m http.server 4190 --bind 127.0.0.1 --directory assignments/03-ink-and-wishes/site
```

Open [the local studio](http://127.0.0.1:4190/). Keep the terminal running. This address works on your own computer; it is not a public website address. Use an HTTP server rather than opening `index.html` directly because the site uses JavaScript modules and a local JSON file.

No build step, framework, API key, account, or package installation is required. Everything needed by the page is in `site/`. Relative asset URLs make it suitable for a GitHub Pages subdirectory. The new calligraphy website has **not yet been published**.

## What works in this release

- A short lesson about **福 / fú**, with cultural references and visible credits.
- A 13-stroke reference you can play, pause, or step through.
- A three-question “find the next stroke” game with explanations, retries, and first-attempt feedback.
- A drawing surface with a size slider, optional tracing guide, undo/redo, and clear confirmation. Steady is the default brush; Flow varies width with movement speed.
- A red-envelope front made from your actual drawing, with a 1200 × 2000 PNG download. A practice sheet downloads at 1200 × 1200.
- Three named, editable works saved in this browser through IndexedDB. Reopen, replace, download, or remove a work. A full collection requires an explicit replacement choice.
- “Behind the ink”: the development process, six workflow terms, and an iteration-prompt builder.
- Responsive layout, labeled controls, reduced-motion support, and a solid-controls alternative to glass.

Saved works belong to this browser and origin. Clearing browser data can remove them; changing the port, browser, or website address gives a different collection. Download a PNG for a portable image copy. PNGs do not preserve editable stroke data.

## A short class demonstration

1. Open **The story of 福**, then watch the stroke reference.
2. Try the three-question warm-up; explain what happens after a wrong answer.
3. Draw a few marks. Try undo/redo and change brush size.
4. Choose **Make it a wish**, name the design, and save it.
5. Reload, open **Your collection**, reopen the work, and download its PNG.
6. Open **Behind the ink**. Enter a specific improvement and generate a task brief for the next agent iteration.

## Homework evidence

- [Design decisions](notes/design.md)
- [Actual workflow and iterations](notes/workflow.md)
- [Checks and remaining uncertainties](notes/verification.md)
- [Sources and glyph provenance](notes/sources.md)
- [Blank learner-trial worksheet](notes/learner-trial.md)
- [Automated checks](tests/core.test.mjs)

Run the checks from the repository root with a current Node.js installation:

```sh
node --test assignments/03-ink-and-wishes/tests/core.test.mjs
```

The website runs in the browser without live AI calls. “Behind the ink” records agent-assisted development; it does not simulate a live team of agents or invent participant feedback.

## Limits and the next iteration

This first release focuses on one complete journey. Couplets, extra characters, accounts, cloud syncing, real pressure/tilt input, realistic ink diffusion, and aesthetic grading remain outside this build. The Flow brush is experimental; no user study has established that it is better than Steady.

Human calligraphy review, physical phone/tablet testing, and a three-classmate learner trial are still pending. The next useful iteration is to collect those observations, correct the highest-impact issue, and then add a reviewed Spring Festival couplet layout. Publication to GitHub Pages and the student's own reflection remain assignment steps.

## Files and credits

`site/app.mjs` connects the interface, `core.mjs` contains validation and quiz rules, `storage.mjs` handles editable works, and `render.mjs` draws the previews and exports. `tests/` exercises the core rules.

The unmodified 福 stroke data is from **Hanzi Writer Data 2.0.1 / Make Me a Hanzi**, derived from Arphic fonts. The full Arphic Public License is bundled in `site/data/ARPHICPL.TXT`, and its attribution is visible in the website. The [source record](notes/sources.md) explains which references support which claims. No museum images or proprietary fonts are bundled.

Mindplay remains separately in `assignments/02-mindplay/`.
