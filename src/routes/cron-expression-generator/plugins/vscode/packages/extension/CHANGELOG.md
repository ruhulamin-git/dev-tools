# Changelog

All notable changes to this extension are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.1.1]

### Added

- A Sponsor button on the listing and in the Extensions view, and Donate, GitHub and Issues
  links at the end of the README. The sponsor link was added after 0.1.0 had already been
  published, and it is baked into the package rather than editable on the listing, so this is
  the release that actually delivers it.

## [0.1.0]

### Added

- Hover explanations for cron expressions in GitHub Actions and Kubernetes YAML, Spring
  `@Scheduled` in Java and Kotlin, and Terraform `schedule_expression` and `recurrence`.
  Each hover gives a plain-English description and the next five run times in local time.
- Three dialects read correctly rather than interchangeably: five-field Unix, six-field
  seconds-first for Spring, and AWS EventBridge, which adds a year field and numbers Sunday
  as 1 instead of 0.
- Completion offering the common schedules for the dialect at the cursor, each labelled with
  its description. Terraform EventBridge values are completed inside AWS's `cron(...)`
  wrapper, which Terraform requires.
- Diagnostics at two volumes. An expression shaped like cron that will not parse is an
  error, because the schedule the author wrote does not exist. An unparseable value that is
  not shaped like cron is only a warning: `schedule:` is not a reserved key, so prose sitting
  under one means this extension looked in the wrong place rather than that the file is wrong.
- Warnings for expressions that parse but usually are not what was meant: an uneven step, an
  OR between day-of-month and day-of-week, a day short months do not have, and jobs piling
  onto the busiest minute.
