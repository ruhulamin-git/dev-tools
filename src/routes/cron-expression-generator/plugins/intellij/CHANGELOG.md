# Changelog

All notable changes to the Cron Expression Explainer plugin are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the plugin
follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This file is the source of the `<change-notes>` shown on the Marketplace and in the IDE's plugin
manager; the build renders the section matching the version being published, so a release with
nothing written here ships with nothing to read.

## [Unreleased]

## [0.1.1]

### Changed

- The plugin description now ends with Donate, GitHub and Issues links. The IDE's plugin
  panel does not render the Marketplace's own donation field, so the description is the only
  place a link reaches someone browsing from inside the IDE.

### Added

- Completion inside a string that is going to hold a schedule: the expressions people actually
  write, each with what it means shown beside it. Offered per dialect, so a workflow file gets
  five-field expressions, Spring gets seconds-first ones, and Terraform gets them wrapped in
  `cron(...)` where AWS requires it.

## [0.1.0] - 2026-09-07

First release.

### Added

- Explains cron expressions in plain English, on hover, where they are written - no copying an
  expression into a website to find out what it does.
- Shows the next five run times in the IDE's timezone, which is what actually answers "when does
  this fire" for expressions that read the same but do not behave the same.
- Recognises schedules in:
  - YAML `cron:` and `schedule:` keys - GitHub Actions workflows, Kubernetes CronJobs
  - Spring `@Scheduled(cron = ...)` in Java and in Kotlin
  - Terraform `schedule_expression`, `schedule` and `recurrence`, including AWS's `cron(...)`
    wrapper (requires the Terraform and HCL plugin)
- Reads each site in its own dialect, because they are not the same language: five-field Unix,
  six-field seconds-first for Spring, and AWS EventBridge, which adds a year and numbers Sunday
  as 1. The same six characters can mean different days in two files in the same repository.
- Reports errors on the field at fault rather than the whole line, so `0 24 * * *` underlines
  the `24`.
- Warns about expressions that are legal but probably not what was meant:
  - a step that does not divide evenly, leaving a short gap at the end of each hour
  - day-of-month and day-of-week together, which cron treats as OR rather than AND
  - a day-of-month that several months do not have
  - schedules on the hour, the busiest minute on every machine
- Leaves alone anything that is not a schedule: prose in a `schedule:` key, `rate(5 minutes)`,
  property placeholders, and interpolated Kotlin strings.
- Highlights the expression using the editor's own injected-fragment colour, adjustable under
  Settings | Editor | Color Scheme | Cron.

[Unreleased]: https://github.com/devxhub/cron-explainer-plugin/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/devxhub/cron-explainer-plugin/releases/tag/v0.1.0
