# Mindplay

A small psychology playground built for an agentic-workflow homework assignment.

## Try it locally

From this assignment folder, run:

```sh
python3 -m http.server 4187 --bind 127.0.0.1 --directory site
```

Open http://127.0.0.1:4187. Use an HTTP server: JavaScript modules do not reliably load by double-clicking the HTML file.

## What works

- **Color clash:** an unscored practice trial followed by 12 shuffled color-naming trials, with matched ink-color distributions between conditions. Results separate accuracy and correct-response timing. Tab interruptions discard the current word's timing.
- **Little things, remembered:** a self-paced six-word recognition activity, with exactly six selections among twelve options and explanatory results.
- **Plot twist:** three everyday scenarios that teach confirmation bias, the availability heuristic, and sunk-cost reasoning.
- **Knowledge garden:** three sourced explanations and eight expandable psychology concepts.
- **Agent studio:** a recorded workflow, examples of real review feedback, eight workflow terms, and a copyable task-brief generator.
- Local completion badges and participation points; replaying cannot earn the same award twice. The lesson-only route also counts as participation.
- Responsive layout, keyboard controls, solid-background preference, reduced-motion styles, and native modal dialogs.

## Run checks

With Node.js 20 or later, from this folder:

```sh
node --test tests/core.test.mjs
```

There is no package installation or build step. HTML, CSS, and JavaScript modules are served directly. The optional DM Sans font loads from Google Fonts; local system fonts are fallbacks.

## What the agent workflow actually did

The lead agent designed and implemented the website. A research agent delivered sourced lesson content and later wrote tests. An independent reviewer evaluated the game design and implementation. The lead agent integrated their work, fixed findings, and tested the result in a browser. The development record is in `../../notes/mindplay-workflow.md`.

The website contains no live AI service. Its agent-studio controls are an educational walkthrough and a local prompt generator. Copy a generated brief into an agent tool to start a real iteration.

## Publish with GitHub Pages

The `site/` directory is the complete public website. Publish only its contents, including the SVG and `.mjs` files. All assets use relative paths, so the site works under a project URL such as `/mindplay/`.

On a public website-only repository, upload the contents of `site/` to the root, add a `.nojekyll` file, and select **Settings → Pages → Deploy from a branch → main → /(root)**. Keep research notes, tests, and homework reflection in the private homework repository.

GitHub's current plan for the JiayingCC account does not enable Pages for private repositories. The AgentHomework repository was restored to private as requested. A separate public website-only repository requires the user's decision; no plan purchase is needed for that route.

## Limits

These are educational activities, not validated psychological assessments. Browser timing is approximate, and recognition-game results do not measure IQ or memory capacity. Progress is stored only in this browser, with a session-only fallback if storage is unavailable. No personal response data is sent to a server.

## A next iteration to try in class

Play one game. Find a specific confusing moment. Ask an agent to explain the current behavior, propose one small change, implement it, and run a check that would catch the original problem. Record what you accepted, rejected, and learned.
