# Publishing

Everything needed to release this extension, written for someone opening the project after a
long gap. Section 4 is the one you want for a routine release; the earlier sections are the
one-time setup and are worth reading only if something is missing or you are starting a new
extension from scratch.

Two registries matter, and both take the **same `.vsix` file** with no code changes:

| Registry | Who uses it | Account needed |
| --- | --- | --- |
| Visual Studio Marketplace | VS Code | Microsoft + Azure DevOps |
| Open VSX | Cursor, Windsurf, VSCodium, Gitpod, Theia | Eclipse Foundation |

Open VSX exists because Microsoft's Marketplace terms permit access only from official
Microsoft products, so every fork needs somewhere else to fetch from. Publishing to only one
means a real slice of users cannot install the extension at all.

## Current identities

| | Value |
| --- | --- |
| Marketplace ID | `devxhub.cron-expression-explainer` |
| Open VSX ID | `devxhub.cron-expression-explainer` |
| Publisher / namespace | `devxhub` |
| Repository | `https://github.com/layesh/cron-explainer-vscode` |
| Git remote | `git@github.com-layesh:layesh/cron-explainer-vscode.git` |

The git remote uses an SSH host alias, not plain `github.com`, because two GitHub accounts
share this machine. See `~/.ssh/config`.

---

## 1. Creating a new extension (skip for this project)

### Check the name first

The single most wasteful mistake. The Marketplace requires the `name` field to be unique
**across every publisher**, not merely within yours — so a stranger's extension blocks your
name even when your full `publisher.name` pair is free, and the error message does not say so.
Check before writing a line of code:

```bash
curl -s -X POST "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json;api-version=3.0-preview.1" \
  -d '{"filters":[{"criteria":[{"filterType":10,"value":"YOUR-NAME"}],"pageSize":50,"pageNumber":1}],"flags":914}' \
  | python -c "import json,sys; print([e['publisher']['publisherName']+'.'+e['extensionName'] for e in json.load(sys.stdin)['results'][0]['extensions']])"
```

`name` is a machine identifier and never shown to users; `displayName` is the title on the
listing. They do not need to match, which is the escape hatch when a good short name is taken.

### Layout

This project is a pnpm workspace with the engine split from the editor integration:

```
packages/core        parsing, description, lint. No vscode import. Shared with the web tool.
packages/extension   hover, completion, diagnostics, and the rules that find expressions.
```

The split matters for testing: `vscode` only exists inside a running editor, so anything
importing it can be tested only by mocking an editor. Keeping detection logic in
`packages/extension/src/detect.ts`, free of that import, is what makes it testable directly.

### Manifest fields that are permanent

Once published, these cannot be changed — only superseded by a new version, or in some cases
not at all:

- `publisher` and `name` — together they form the extension ID and every install URL.
- `version` — a published version can never be replaced, only bumped or unpublished.

Everything else (`displayName`, `description`, `icon`, `categories`, `keywords`) is free to
change in any later release.

---

## 2. Visual Studio Marketplace setup (one time)

### 2.1 Microsoft account

Azure DevOps requires one. It can use **any** email address, including Gmail — no
`@outlook.com` mailbox needed. Sign up at `account.microsoft.com`.

### 2.2 Azure DevOps organisation

Go to **`https://dev.azure.com`** — *not* `portal.azure.com`, which is Azure the cloud
platform and unrelated. Accept the "New organization" prompt.

The organisation name is irrelevant: it never appears on the listing, and its only job is to
issue a token. Organisation names are globally unique across all Microsoft customers, so a
name being taken means nothing about your publisher. Skip the "create a project" screen
entirely — tokens are issued at account level.

### 2.3 Personal Access Token

User icon (top right, next to your avatar) → **Personal access tokens** → **New Token**.

| Field | Value |
| --- | --- |
| Organization | **All accessible organizations** |
| Scopes | Custom defined → **Marketplace** → **Manage** |
| Expiration | up to 1 year |

The Organization field defaults to your current org, and leaving it that way produces a `401`
that explains nothing. If Marketplace is not in the scope list, click **Show all scopes**.

Copy the token immediately — it is shown once.

### 2.4 Publisher

At `https://marketplace.visualstudio.com/manage`, create a publisher whose **ID** matches the
`publisher` field in the manifest. The ID is permanent; the display name is not.

---

## 3. Open VSX setup (one time)

> **Status: blocked, appeal filed 2026-09-08.** `ovsx create-namespace devxhub` is rejected by
> the automated similarity check — *"Namespace name 'devxhub' is too similar to existing
> namespace(s): dev-hub"*. An issue requesting manual review has been opened on
> `EclipseFdn/open-vsx.org`, citing the existing `devxhub` publisher on the VS Code Marketplace
> and `devxhub` vendor on the JetBrains Marketplace. Nothing is published to Open VSX yet.
>
> If the appeal fails, the fallback is a distinct namespace such as `devxhub-tools`. Note the
> cost before choosing it: `ovsx` has no namespace override — the namespace is read from
> `publisher` in the packaged manifest — so the extension would become
> `devxhub-tools.cron-expression-explainer` on Open VSX while staying
> `devxhub.cron-expression-explainer` on the VS Code Marketplace, and every release would need
> a second `.vsix` built with `publisher` rewritten.

1. Sign in at **`https://open-vsx.org`** with GitHub.
2. Sign the **Eclipse Foundation Publisher Agreement** — a profile prompt links to it. This
   needs an Eclipse Foundation account registered to the same email as your GitHub account,
   which is the step people get stuck on: if the emails differ, the agreement will not attach
   to your Open VSX identity.
3. Profile → **Access Tokens** → generate one. Shown once.
4. Create the namespace:

   ```bash
   npx ovsx create-namespace devxhub -p <token>
   ```

The namespace starts **unverified**, which puts a small "not verified" note on the listing.
Clearing it means opening an ownership claim issue on the `EclipseFdn/open-vsx.org` repository.
Optional, and not a blocker.

---

## 4. Releasing a new version

The routine. Assumes sections 2 and 3 are done.

### 4.1 Make the change and verify

```bash
cd "D:/My Workshop/Development/vscode/cron-explainer-vscode"
pnpm install          # only if dependencies changed
pnpm test             # engine tests plus detection rules
pnpm typecheck
pnpm build
```

Then press <kbd>F5</kbd> in VS Code to launch an Extension Development Host with `samples/`
open, and confirm the change by hand. `samples/` holds one file per supported format, chosen
to include the awkward cases — an unparseable value, an uneven step, a February 31st.

### 4.2 Update the changelog

Add the change under a new version heading in `CHANGELOG.md`, then mirror it:

```bash
cp CHANGELOG.md packages/extension/CHANGELOG.md
```

The copy inside `packages/extension` is the one that ships; `.vscodeignore` excludes
everything else, and `vsce` only reads files beside the manifest.

### 4.3 Bump, package, and publish to the Marketplace

`vsce publish <patch|minor|major>` bumps `package.json` and publishes in one step:

```powershell
cd "D:\My Workshop\Development\vscode\cron-explainer-vscode\packages\extension"
$env:VSCE_PAT = Read-Host "Paste Azure DevOps PAT" -MaskInput
npx vsce publish patch --no-dependencies
```

Use `Read-Host`, never `$env:VSCE_PAT = "the-token"` — PowerShell writes every typed command
to `ConsoleHost_history.txt` in plain text. Avoid `vsce login` for the same reason: when the
Windows credential store is unavailable it silently falls back to storing the token in clear
text at `C:\Users\<you>\.vsce`.

`--no-dependencies` is required. Without it `vsce` tries to resolve the workspace dependency
`@devxhub/cron-core`, which is not on any registry; esbuild has already bundled it into
`dist/extension.js`, so there is nothing to resolve.

### 4.4 Publish the same file to Open VSX

`vsce publish` bumped the version, so package that exact version and push it:

```powershell
npx vsce package --no-dependencies
$env:OVSX_PAT = Read-Host "Paste Open VSX token" -MaskInput
npx ovsx publish cron-expression-explainer-<version>.vsix
```

`ovsx` reads `OVSX_PAT` from the environment, so no `-p` flag is needed.

### 4.5 Clean up and tag

```powershell
Remove-Item Env:VSCE_PAT, Env:OVSX_PAT
```

```bash
cd "D:/My Workshop/Development/vscode/cron-explainer-vscode"
git add -A
git commit -m "Release <version>"
git tag -a v<version> -m "<version> — <summary>"
git push origin main --follow-tags
```

Do not add `Co-Authored-By` or session trailers to commits in this project.

### 4.6 Verify the real install

```
ext install devxhub.cron-expression-explainer
```

Install from the Marketplace into VS Code and hover one expression. The `.vsix` tested locally
and the published artifact are identical bytes, but the *activation* path differs — a wrong
`activationEvents` entry only appears on a genuine install, and it fails silently, looking
exactly like an extension that does nothing.

---

## 4a. Donations

The manifest carries a sponsor link:

```json
"sponsor": { "url": "https://donate.devxhub.com/" }
```

`vsce` validates it is `http`/`https` and packaging fails otherwise. It becomes the
`Microsoft.VisualStudio.Code.SponsorLink` property plus a `__sponsor_extension` tag, which
surfaces a **Sponsor** button on the listing and in the Extensions view.

It is baked into the package, so a change to it only reaches users on the next published
version — there is no way to edit it on the listing. Verify it survived packaging with:

```bash
python -c "import zipfile,json; print(json.loads(zipfile.ZipFile('cron-expression-explainer-<version>.vsix').read('extension/package.json')).get('sponsor'))"
```

## 5. Troubleshooting

**`Request timeout: /_apis/gallery`** — transient network failure to the Marketplace. Before
retrying, check whether the upload actually landed, because a timeout can mean the server
accepted it and only the response was lost:

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  "https://marketplace.visualstudio.com/items?itemName=devxhub.cron-expression-explainer"
```

A published version can never be replaced, so retrying a publish that already succeeded fails
with a confusing "version already exists".

**`401 Unauthorized`** — nearly always a PAT scoped to one organisation instead of **All
accessible organizations**. Regenerate rather than debug. Also check the token has not expired;
they last at most a year.

**"The extension ... already exists in the Marketplace. Please use a different name"** while
your publisher page shows no extensions — the `name` is taken by another publisher. Global
namespace. See section 1.

**A newly published version 404s on its listing page** but appears in the gallery API — normal.
It is in automated verification, which usually clears within ten minutes.

**`vsce package` fails on a missing icon** — the manifest points at a file that is not there.
Either add `icon.png` (128×128) or remove the `icon` field.

**Java, Kotlin, or Terraform files show nothing** — VS Code only assigns those language ids
when the corresponding language extension is installed. Without them the file is plain text and
this extension correctly does nothing, which looks identical to a bug. YAML is built in.

---

## 6. Related

- IntelliJ version of this plugin: `https://github.com/layesh/cron-explainer-plugin`,
  published as `com.devxhub.cron-explainer`. JetBrains reviews manually, taking about two
  business days, unlike either registry here.
- Web version: `https://www.devxhub.com/tools/`. `packages/core` is copied from it. If the
  engine changes in one place it must be copied to the other; the shared test suites are what
  catch a divergence.
