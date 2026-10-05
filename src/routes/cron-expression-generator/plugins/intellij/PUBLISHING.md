# Publishing

Everything needed to release this plugin, written for someone opening the project after a long
gap. Section 4 is the routine release; the earlier sections are one-time setup, worth reading
only if something is missing or you are starting a new plugin.

JetBrains differs from the VS Code Marketplace in one way that shapes everything here:
**every upload is reviewed by a human**, taking around two business days for a first
submission. There is no publish-and-it-is-live path.

## Current identities

| | Value |
| --- | --- |
| Plugin ID | `com.devxhub.cron-explainer` (permanent — changing it orphans every install) |
| Marketplace | `https://plugins.jetbrains.com/plugin/34146-cron-expression-explainer` |
| Vendor | `devxhub` (organization), support `khairul.bashar@devxhub.com` |
| Repository | `https://github.com/layesh/cron-explainer-plugin` |
| Git remote | `git@github.com-layesh:layesh/cron-explainer-plugin.git` |
| Licence | MIT |

The git remote uses an SSH host alias, not plain `github.com`, because two GitHub accounts
share this machine. See `~/.ssh/config`.

Requires **JDK 21**. The platform has required it since 2024.2, and compiling to anything
higher produces class files the IDE refuses to load.

---

## 1. Where things live

| What | Where |
| --- | --- |
| Version number | `build.gradle.kts` → `version = "0.1.0"` |
| Plugin ID, vendor, description | `src/main/resources/META-INF/plugin.xml` |
| Release notes | `CHANGELOG.md` → rendered into `<change-notes>` at build time |
| Supported IDE range | `build.gradle.kts` → `ideaVersion { sinceBuild / untilBuild }` |
| Marketplace icon | `src/main/resources/META-INF/pluginIcon.svg` (+ `_dark`) |

The version is **not** in `plugin.xml` — `pluginConfiguration.version` reads it from Gradle, so
`build.gradle.kts` is the single place to edit.

Change notes are rendered from `CHANGELOG.md` by the `org.jetbrains.changelog` plugin rather
than written into `plugin.xml`, so a release cannot ship notes that disagree with the
changelog.

### Module layout

```
core/    parsing, description, lint. No IntelliJ dependency. Ported from the TypeScript engine.
src/     the IDE integration: annotators, completion contributors, per-language PSI lookup.
```

Every language integration is **optional** at the descriptor level — separate
`cron-{yaml,java,kotlin,hcl}.xml` files referenced by `<depends optional="true">`. That is why
the plugin installs into IDEs lacking YAML, Java, Kotlin or Terraform and the remaining halves
keep working. An `<annotator language="yaml">` in the main `plugin.xml` would break loading in
any IDE without YAML.

---

## 2. Marketplace setup (one time — already done)

1. A **JetBrains Account** at `https://account.jetbrains.com`. Personal is fine; it is only the
   login. Ownership is expressed by the vendor, not the account.
2. A **vendor profile** at `https://plugins.jetbrains.com/author/me`. For an organization
   vendor, the support email must sit on the same domain as the vendor URL — that is what
   JetBrains verifies. This project uses vendor `devxhub`, `https://www.devxhub.com`,
   `khairul.bashar@devxhub.com`, and those must match `<vendor>` in `plugin.xml`.

Vendor verification and plugin approval are independent. A free plugin can be approved and
live while the organization badge is still pending; the badge only becomes mandatory for paid
or freemium listings, which additionally need the vendor agreement and billing details.

### The first upload is manual

There is no CLI path for a plugin that does not yet exist. Go to
`https://plugins.jetbrains.com/plugin/add`, upload the zip, and choose the **organization
vendor** rather than your personal one — picking wrong means a support request to transfer,
not a settings change. Category: **Code tools**.

---

## 3. Building and verifying

```bash
./gradlew test            # core engine tests
./gradlew runIde          # sandbox IDE with the plugin installed, samples/ ready to open
./gradlew buildPlugin     # build/distributions/cron-explainer-plugin-<version>.zip
./gradlew verifyPlugin    # JetBrains' own compatibility checker
```

`verifyPlugin` is the one that matters before any release. `untilBuild` is deliberately left
open (`null`) so future IDE versions can install the plugin without a rebuild — the verifier is
what makes that claim honest rather than hopeful. Read its output for `Compatible`.

`runIde` opens a sandbox IDE. **Close it before running `buildPlugin`** — see troubleshooting.

---

## 4. Releasing a new version

### 4.1 Change, and verify by hand

```bash
./gradlew test
./gradlew runIde
```

`samples/` holds one file per supported format, chosen to include the awkward cases — an
unparseable value, an uneven step, a February 31st, a five-field expression where EventBridge
needs six.

### 4.2 Bump the version

In `build.gradle.kts`:

```kotlin
version = "0.1.1"
```

### 4.3 Write the change notes

Add a section to `CHANGELOG.md` headed with the **exact** version string:

```markdown
## [0.1.1]

### Fixed
- ...
```

The build looks up `getOrNull(project.version)` and falls back to `getUnreleased()`. If the
heading does not match the version, the release silently ships the Unreleased section instead
— worth checking the rendered notes in the built zip if anything looks wrong.

### 4.4 Build and verify

```bash
./gradlew clean buildPlugin verifyPlugin
```

Confirm the verifier prints `Compatible`, then find the artifact at:

```
build/distributions/cron-explainer-plugin-<version>.zip
```

### 4.5 Upload

**Manually** — `https://plugins.jetbrains.com/plugin/34146-cron-expression-explainer/edit`,
Versions → Upload update.

**Or wire the CLI**, which is worth doing if releases become frequent. Not currently
configured; add to `build.gradle.kts` and check the current plugin docs, as this block is
untested in this project:

```kotlin
intellijPlatform {
    publishing {
        token = providers.environmentVariable("PUBLISH_TOKEN")
        // channels = listOf("eap")   // omit for a stable release
    }
}
```

Get a **permanent token** at `https://plugins.jetbrains.com/author/me/tokens`, then:

```powershell
$env:PUBLISH_TOKEN = Read-Host "Paste JetBrains token" -MaskInput
./gradlew publishPlugin
Remove-Item Env:PUBLISH_TOKEN
```

Use `Read-Host`, never a literal assignment — PowerShell writes every typed command to
`ConsoleHost_history.txt` in plain text.

### 4.6 Signing (optional)

The Marketplace applies its own signature on upload, so an unsigned plugin publishes fine and
this has never been a blocker. Signing yourself proves the artifact came from you and is worth
adding if the plugin is ever distributed outside the Marketplace. It needs a certificate chain
and private key; see JetBrains' plugin signing documentation.

### 4.7 Commit and tag

```bash
git add -A
git commit -m "Release <version>"
git tag -a v<version> -m "<version> — <summary>"
git push origin main --follow-tags
```

Do not add `Co-Authored-By` or session trailers to commits in this project.

### 4.8 Wait for review

Roughly two business days for a first submission; updates are usually faster. You are emailed
when the status changes. The listing shows the previous version until approval completes.

---

## 4a. Donations

A listing field, not a descriptor field — nothing in `plugin.xml` or `build.gradle.kts`
changes, and no release is needed.

Plugin admin panel → **Monetization** tab → add the link and a title for it:

| Field | Value |
| --- | --- |
| Link | `https://donate.devxhub.com/` |
| Title | short label, e.g. `Support devxhub` |

The donate option appears next to the Download button. JetBrains takes no commission and does
not process the transaction, and it prompts users who rate the plugin 4–5 stars to donate.

**Do not put a donation link in the plugin description.** JetBrains provides the dedicated
field precisely so that descriptions stay free of them, and they reserve the right to remove
links that appear elsewhere. The `<description>` in `plugin.xml` links to
`devxhub.com/tools`, which is a product link rather than a donation one, and is fine.

Because this is a listing field it can be edited or removed at any time without a release —
the opposite of the VS Code extension, where the sponsor URL is baked into the published
package.

## 5. Troubleshooting

**`java.io.IOException: There is not enough space on the disk`** — Gradle's transforms cache.
Each `bundledPlugin(...)` or `plugin(...)` addition triggers a fresh full extraction of the IDE
under a new hash, roughly 3.6 GB each, and Gradle never reclaims the old ones. It reached 26 GB
here once and filled the disk completely.

```bash
./gradlew --stop
rm -rf ~/.gradle/caches/*/transforms
```

Always safe — transforms are derived and rebuild on the next build, at the cost of one slow
build. To see what else is worth clearing:

```bash
du -sh ~/.gradle/caches/* | sort -rh
```

Old `caches/<version>/` directories for Gradle versions no longer in use can go, along with
their `~/.gradle/wrapper/dists/gradle-<version>-bin` twins — but check the modification date
first, since a version can look stale by name and still be in weekly use. Leave
`caches/modules-2` alone unless desperate: it is the downloaded dependency jars, shared across
every project, and clearing it forces a full re-download everywhere.

**`:prepareSandbox FAILED` — "The requested operation cannot be performed on a file with a
user-mapped section open"** — a sandbox IDE from `runIde` is holding a jar memory-mapped.
Close it. If it is not visibly open, find and stop it:

```powershell
Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like "*idea*sandbox*" } |
  Select-Object ProcessId, CommandLine
```

**Change notes are wrong or empty in the built plugin** — the `CHANGELOG.md` heading does not
match `version` in `build.gradle.kts` exactly, so the build fell back to Unreleased.

**Plugin fails to load with a `kotlin-stdlib` conflict** — the platform ships its own. This is
why `gradle.properties` sets `kotlin.stdlib.default.dependency=false`; do not remove it.

**Terraform support stops compiling after an IDE bump** — `org.intellij.plugins.hcl` is a
Marketplace plugin, not a bundled one, so its version is pinned by hand in `build.gradle.kts`
(`252.26199.7`) against the 252 branch. Bumping the target IDE means finding the matching HCL
build.

---

## 6. Related

- VS Code version: `https://github.com/layesh/cron-explainer-vscode`, published as
  `devxhub.cron-expression-explainer` on both the VS Code Marketplace and Open VSX. Its
  `PUBLISHING.md` covers those registries, which publish in minutes with no human review.
- Web version: `https://www.devxhub.com/tools/`. `core/` is a Kotlin port of the TypeScript
  engine behind it, and the ported test suites are what keep the two from drifting — if a lint
  rule or description changes in one, it must be changed in the other.
