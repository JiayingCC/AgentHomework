# Publishing the homework

The intended repository is `JiayingCC/AgentHomework`. The repository owner has authorized public sharing and GitHub Pages publication.

## Verified publication — September 22, 2026

- [Public calligraphy website](https://jiayingcc.github.io/AgentHomework/)
- [Public couplet workshop](https://jiayingcc.github.io/AgentHomework/#couplets)
- [Preserved Mindplay website](https://jiayingcc.github.io/AgentHomework/mindplay/)
- [Public source repository](https://github.com/JiayingCC/AgentHomework)
- [Successful first deployment](https://github.com/JiayingCC/AgentHomework/actions/runs/35808817816)

The CLI authenticated as JiayingCC, and the repository was confirmed to be owned by that account with administrator access. Its visibility was changed from private to public at the owner's request. The earlier remote Mindplay history and local calligraphy history were merged without force-pushing; Mindplay source files remained byte-identical.

GitHub Actions passed all **40 tests** across both projects and published commit `c9226fb84d371fffaddb8ad49dacd88bbbd98a01`. Anonymous HTTPS requests returned HTTP 200 for the homepage, application module, couplet module, glyph data, landscape asset, and Mindplay homepage. Their bytes matched the local source, and `deployment.json` reported the expected commit. The website was also opened in the in-app browser, where character data loaded and the couplet interface was exercised.

A test brush mark in a heading character was saved on the public origin. After reloading, the saved couplet reopened with its 1/14 occupied-space count and heading selection intact. The browser reported no console errors. The agent-created test work was removed through the UI afterward. These are deployment checks, not a learner study.

## How later updates publish

`scripts/build-pages.mjs` packages only the website assets into the ignored `build/pages/` folder:

- `/`: Ink & Wishes, including the six-character lessons and couplet workshop.
- `/mindplay/`: the earlier Mindplay website, preserved separately.
- `/deployment.json`: the Git commit used to build the deployed version.

`.github/workflows/pages.yml` runs both projects' tests, builds the bundle, and publishes it through GitHub Pages after a push to `main`. A failed test prevents the deployment job. The workflow can also be started manually from Actions.

The expected URL is `https://jiayingcc.github.io/AgentHomework/`, subject to the repository's actual Pages settings. A configured workflow does not by itself prove the website is live: check the successful Actions run, the Pages URL, and the deployed commit before marking publication complete.

For a local build check:

```sh
node --test assignments/03-ink-and-wishes/tests/*.test.mjs assignments/02-mindplay/tests/*.test.mjs
node scripts/build-pages.mjs
python3 -m http.server 4191 --bind 127.0.0.1 --directory build/pages
```

Artwork saved in the localhost preview stays in that browser origin. The public website has its own browser-local collection; deployment does not upload users' drawings or transfer local saved works.
