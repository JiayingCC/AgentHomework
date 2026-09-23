# Publishing Ink & Wishes

Ink & Wishes is hosted on GitHub Pages from the public `JiayingCC/AgentHomework` repository.

- [Website](https://jiayingcc.github.io/AgentHomework/)
- [Couplet workshop](https://jiayingcc.github.io/AgentHomework/#couplets)
- [AI workflow guide](https://jiayingcc.github.io/AgentHomework/#process)
- [Source repository](https://github.com/JiayingCC/AgentHomework)
- [Deployment runs](https://github.com/JiayingCC/AgentHomework/actions/workflows/pages.yml)

## What gets published

`scripts/build-pages.mjs` copies the contents of `assignments/03-ink-and-wishes/site/` into the ignored `build/pages/` directory. It cleans the previous bundle first, so removed pages are not carried into a later deployment. Only the Ink & Wishes website assets and a `deployment.json` file are published; development notes and repository metadata are excluded.

The root URL opens the writing studio. Hash routes provide the couplet workshop (`#couplets`), collection (`#collection`), and development workflow (`#process`). `deployment.json` identifies the source commit used to build the site.

## Automatic updates

After a push to `main`, `.github/workflows/pages.yml`:

1. Checks out the source and sets up Node.js.
2. Runs the 26 Ink & Wishes tests.
3. Builds and uploads the website artifact.
4. Publishes the artifact through GitHub Pages if the build succeeds.

The workflow can also be started manually from Actions. Check both the successful deployment run and the live website before treating a change as published.

## Build locally

From the repository root:

```sh
node --test assignments/03-ink-and-wishes/tests/*.test.mjs
node scripts/build-pages.mjs
python3 -m http.server 4191 --bind 127.0.0.1 --directory build/pages
```

Open `http://127.0.0.1:4191/`. The normal development preview can serve the source folder directly; this command checks the packaged deployment.

## Publication evidence

The first public release was verified on September 22, 2026. Anonymous HTTPS requests returned HTTP 200 for the homepage, application and couplet modules, character data, and landscape. The downloaded files matched the local source and the deployment record reported the expected commit.

On the public origin, a test brush mark in a couplet heading was saved, survived a reload, and reopened in the correct character space. No console errors were reported during that check. The test work was removed through the UI afterward. These are deployment checks, not a learner study.

Artwork remains local to the visitor's browser and website origin. Publishing the code does not upload drawings, transfer saved works from localhost, or sync them across devices.
