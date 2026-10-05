# Editor plugins — reference snapshot

**This is a read-only copy. Do not edit it, and do not build from it.**

A point-in-time snapshot of the two editor plugins that share this tool's cron engine, kept
here so that anyone working on the web tool can read how the same problem was solved in an
IDE without hunting for another repository. It was last copied on **2026-09-08** at version
**0.1.1** of both plugins, with no git history, no dependencies and no build output.

## The real repositories

Changes go here, not to the copy:

| | Repository | Published as |
| --- | --- | --- |
| IntelliJ | `https://github.com/layesh/cron-explainer-plugin` | [`com.devxhub.cron-explainer`](https://plugins.jetbrains.com/plugin/34146-cron-expression-explainer) |
| VS Code | `https://github.com/layesh/cron-explainer-vscode` | [`devxhub.cron-expression-explainer`](https://marketplace.visualstudio.com/items?itemName=devxhub.cron-expression-explainer) |

Each carries a `PUBLISHING.md` covering its release routine, registry setup, and the errors
worth recognising.

## What is worth reading here

Three implementations of one engine, which is the interesting part:

- **`../utils/`** — the TypeScript original, which this web page runs.
- **`vscode/packages/core/src/`** — the same TypeScript, copied. The VS Code extension bundles
  it with esbuild, so it never reaches a registry.
- **`intellij/core/src/main/kotlin/`** — a hand-written Kotlin port. It cannot share the
  TypeScript, so the test suites were ported alongside it; those tests are what stop the two
  drifting apart on what an expression means.

The editor integrations differ more than the engines do:

- **`intellij/src/main/kotlin/`** — the platform hands the plugin a parsed syntax tree, so it
  can ask whether a string really is the value of a `schedule:` key. See the `*CronSite`
  objects, one per language.
- **`vscode/packages/extension/src/detect.ts`** — VS Code offers text, a language id and a
  position, so detection is line-and-regex work anchored on the key that introduces a
  schedule. Less precise, deliberately.

## If you need to work on a plugin

Clone the real repository. This copy has no dependencies installed, no git history to branch
from, and no remote to push to. It will drift from the published plugins over time, and
nothing here will tell you when it has.
