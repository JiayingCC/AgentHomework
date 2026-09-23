# Publishing the homework

The intended repository is `JiayingCC/AgentHomework`. The repository owner has authorized public sharing and GitHub Pages publication.

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
