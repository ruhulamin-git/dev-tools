# Security

## Reporting a vulnerability

Please report security issues to [Devxhub](https://www.devxhub.com/contact) rather than opening
a public GitHub issue. Every tool in this app runs entirely client-side — nothing a visitor
types, pastes, or uploads is sent to a server — so most realistic risk here is DOM-based XSS
(a crafted input reaching the page unescaped) rather than server-side compromise.

## What's in place

- **Dependency audit**: `pnpm audit --prod` is checked in CI (`.github/workflows/ci.yml`,
  currently report-only — see that file for why) and is clean as of this writing (0 known
  vulnerabilities, prod and dev). Where a transitive dependency resolves below its own
  already-published patched version, `pnpm.overrides` in `package.json` pins it up — each
  override is scoped to the exact version range the vulnerable resolution came from (not a bare
  package name with an open-ended range), specifically to avoid silently pulling a consumer onto
  an incompatible major version. If you add one, verify the override doesn't cross a major
  version boundary the resolving package doesn't expect (check what `pnpm why <package>` shows
  before and after).
- **Trusted Types**: `src/lib/shared/utils/trustedTypes.ts` defines a named `devx-html` policy
  that actually sanitizes (strips script/iframe/object/embed, event handler attributes, and
  `javascript:`/`data:text/html` URLs) rather than passing content through unchanged, for the one
  place in the app that sets `innerHTML` outside of Svelte's own `{@html}` handling.
- **JSON-LD**: every `<script type="application/ld+json">` on the site is built through
  `src/lib/shared/components/JsonLd.svelte`, which escapes `<`, `>`, `&`, and the U+2028/U+2029
  line separators — never hand-templated per page.
- **Markdown sanitization**: `src/routes/online-markdown-editor/utils/markdownParser.ts` runs
  user-authored Markdown through `rehype-sanitize` with a schema that drops `style` and
  media-embedding tags, restricts link/image URL schemes, and forces `rel="noopener noreferrer
  nofollow"` on every link.
- **Other `{@html}` sinks** (the diff checker's and JSON/TS viewers' syntax highlighters) escape
  their input before any highlighting markup is added; each is marked as an audited sink for
  eslint's `svelte/no-at-html-tags` with a comment explaining why, and covered by tests that
  assert no live element/attribute can result from a crafted payload.
- **CSP**: `docker/nginx.conf` sets both an enforced `Content-Security-Policy` and a
  `Content-Security-Policy-Report-Only` policy (the same minus `'unsafe-eval'`) — see the
  comments there for what's been verified and what's still an open question (a per-deployment
  backend URL and two routes with independent font-loading, for `connect-src`/`style-src`).
- **Non-root container**: the production image (`docker/Dockerfile.prod`) runs as a non-root
  `nginx` user via `nginxinc/nginx-unprivileged`, with both base images pinned by digest.
- **Consent-gated analytics**: `src/lib/shared/analytics/track.ts` checks
  `consent.ts` before pushing any event; analytics defaults to denied until
  `ConsentBanner.svelte` records an explicit choice.

## Known gaps

- The GTM container (embedded in `src/app.html`) is configured to load third-party tracking
  scripts (Apollo.io, LinkedIn Insight, Meta/Facebook Pixel) that CSP currently blocks —
  intentionally, since unblocking them is a product/privacy decision, not a technical one. See
  the comment above the CSP header in `docker/nginx.conf`.
- `ACCESSIBILITY_AUDIT.md` documents keyboard-navigation and focus-management gaps (dropdown menus,
  mobile menu focus trap) that are correctness/accessibility issues, not directly
  security-relevant, but are tracked there rather than here.
