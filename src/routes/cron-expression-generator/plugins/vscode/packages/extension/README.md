# Cron Expression Explainer

A VS Code extension that explains cron expressions where you actually write them, so you
never have to copy one into a website to find out what it does.

Hover a schedule to see what it means in plain English and the next five times it runs:

- GitHub Actions workflows and Kubernetes CronJobs (YAML)
- Spring `@Scheduled`, in Java and in Kotlin
- Terraform `schedule_expression` and `recurrence`, including AWS's `cron(...)` wrapper

Completion offers the common schedules for whichever dialect the cursor is in, each with its
description beside it. Expressions that are legal but probably a mistake are reported as
warnings in the Problems panel.

## Dialects

Each of these file types reads cron slightly differently, and the extension reads each one in
its own dialect:

| Dialect | Fields | Where |
| --- | --- | --- |
| Unix | 5 | GitHub Actions, Kubernetes, Terraform `recurrence` |
| Seconds | 6, seconds first | Spring `@Scheduled(cron = ...)` |
| EventBridge | 6 plus year, `?` in one day field | Terraform `schedule_expression` |

The same six characters can mean two different days in two files in the same repository —
EventBridge numbers Sunday as 1, Unix numbers it as 0.

## Warnings

- a step that leaves a gap at the end of each hour, such as `*/7`
- a day-of-month and day-of-week pair, which cron treats as OR rather than AND
- a day several months do not have
- yet another job landing on the busiest minute on the machine

These are warnings rather than errors because every one of them is legal cron.

## Layout

This is a pnpm workspace with two packages:

- `packages/core` — the parsing, description and lint engine, with no dependency on VS Code,
  a framework or the DOM. It is the same code that runs the web version, copied rather than
  reimplemented.
- `packages/extension` — the editor integration. `src/detect.ts` holds the rules that locate
  an expression in a line of text and deliberately imports nothing from `vscode`, which is
  what makes it testable; `src/sites.ts` is the only module that places those hits into a
  document.

### On detection

The sibling IntelliJ plugin gets a parsed syntax tree from the platform, so it can ask whether
a string really is the value of a `schedule:` key. VS Code provides text, a language id and a
position, so detection here is line-and-regex work. It is less precise, and the tradeoff is
deliberate: the cost of a spurious hover is a tooltip nobody asked for, while the cost of a
parser is a parser.

## Developing

```
pnpm install
pnpm test          # engine tests plus the detection rules
pnpm typecheck
pnpm build         # bundles to packages/extension/dist/extension.js
pnpm package       # produces a .vsix
```

Press <kbd>F5</kbd> to launch an Extension Development Host with `samples/` open — one file
per supported format.

## Publishing

See [PUBLISHING.md](PUBLISHING.md) for the release routine, the one-time registry setup, and
the errors worth recognising. Section 4 is the routine; the rest is only needed when something
is missing.

## Related

- The IntelliJ version: [cron-explainer-plugin](https://github.com/layesh/cron-explainer-plugin)
- The web version: [devxhub.com/tools](https://www.devxhub.com/tools/)

## License

MIT — see [LICENSE](LICENSE).

---

[Donate](https://donate.devxhub.com/) |
[GitHub](https://github.com/layesh/cron-explainer-vscode) |
[Issues](https://github.com/layesh/cron-explainer-vscode/issues)
