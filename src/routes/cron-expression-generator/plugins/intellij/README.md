# Cron Expression Explainer

An IntelliJ Platform plugin that explains cron expressions where you actually write them,
so you never have to copy one into a website to find out what it does.

Hover a schedule to see what it means in plain English and the next five times it runs:

- GitHub Actions workflows and Kubernetes CronJobs (YAML)
- Spring `@Scheduled`, in Java and in Kotlin
- Terraform `schedule_expression` and `recurrence`, including AWS's `cron(...)` wrapper

Code completion offers the common schedules for whichever dialect the file is in, each with
its plain-English description beside it.

## Dialects

Each of those file types reads cron slightly differently, and the plugin reads each one in
its own dialect:

| Dialect | Fields | Where |
| --- | --- | --- |
| Unix | 5 | GitHub Actions, Kubernetes, Terraform `recurrence` |
| Seconds | 6, seconds first | Spring `@Scheduled(cron = ...)` |
| EventBridge | 6 plus year, `?` in one day field | Terraform `schedule_expression` |

The same six characters can mean two different days in two files in the same repository —
EventBridge numbers Sunday as 1, Unix numbers it as 0.

## Warnings

The plugin also flags expressions that are perfectly legal and probably not what you meant:

- a step that leaves a gap at the end of each hour, such as `*/7`
- a day-of-month and day-of-week pair, which cron treats as OR rather than AND
- a day several months do not have
- yet another job landing on the busiest minute on the machine

## Building

Requires JDK 21.

```
./gradlew build          # compile and run the tests
./gradlew runIde         # launch a sandbox IDE with the plugin installed
./gradlew buildPlugin    # produce build/distributions/cron-explainer-plugin-<version>.zip
./gradlew verifyPlugin   # run the JetBrains plugin verifier
```

The `samples/` directory holds one file per supported format, for trying the plugin out in
the sandbox IDE.

## Layout

- `core/` — the dialect-independent parsing, description and lint engine, with no IntelliJ
  dependency. Ported from the TypeScript implementation behind the web version.
- `src/` — the IDE integration: annotators, completion contributors and the PSI-specific
  code that locates a cron expression in each file type.

Each language integration is optional at the descriptor level, so the plugin installs into
IDEs that lack YAML, Java, Kotlin or Terraform support and the remaining halves keep working.

## Publishing

See [PUBLISHING.md](PUBLISHING.md) for the release routine, Marketplace setup, and the errors
worth recognising. Section 4 is the routine; the rest is only needed when something is missing.

## Web version

The same explainer runs in the browser, alongside our other developer tools, at
[devxhub.com/tools](https://www.devxhub.com/tools/).

## License

MIT — see [LICENSE](LICENSE).
