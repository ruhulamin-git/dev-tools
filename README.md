# Devxhub Tools

The SvelteKit app behind [devxhub.com/tools](https://www.devxhub.com/tools) — 20+ free, entirely
client-side developer and productivity tools (JSON formatting, hashing, JWT decoding, image
compression, an invoice generator, and more). Every tool runs in the visitor's browser; nothing
they type, paste, or upload is ever sent to a server.

This isn't a starter template — it's the live app's source, deployed under the `/tools` base path
on the main Devxhub site. The patterns below (the tool registry, shared UI primitives, SEO
helpers) are still worth reusing if you're building something similar, but adding a route here
adds a real tool to the production site.

## Features

- ⚡ **Svelte 5** with runes
- 🎨 **Tailwind CSS v4**, configured via `@theme` tokens in `src/app.css` (see the
  `devx-*` color/radius/motion tokens)
- 📦 Shadcn-style UI primitives (`Button`, `Card`, `Input`, `Select`, …)
- 📝 TypeScript, `strict` mode
- 🔧 **One tool registry** (`src/lib/shared/config/tools.ts`) driving navigation, the home page
  grid, SEO tags, JSON-LD, the sitemap, lead-magnet PDFs, and related-tool cross-links
- ⌨️ **⌘K command palette** and a **recently-used tools** row, available from any page
- 🔔 Toast notifications, a cookie consent banner, and a typed analytics wrapper
  (`src/lib/shared/analytics/track.ts`) that respects that consent
- ♿ Accessible — see `ACCESSIBILITY_AUDIT.md` for the current state and known gaps
- 🔍 SEO — meta tags, Open Graph, Twitter Cards, escaped JSON-LD (`JsonLd.svelte`), sitemap
- 🧪 Unit tests (Vitest) and E2E tests (Playwright)

## Tech stack

- [Svelte 5](https://svelte.dev/docs) / [SvelteKit](https://kit.svelte.dev/) (static adapter —
  every route is prerendered at build time)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vitest](https://vitest.dev/) · [Playwright](https://playwright.dev/)
- [pnpm](https://pnpm.io/) (see `.nvmrc` / `packageManager` in `package.json` for the pinned
  Node/pnpm versions)

## Project structure

```
src/
├── lib/shared/
│   ├── analytics/         # track() + consent.ts — the one place events go through
│   ├── components/        # Header, Footer, Navigation, CommandPalette, ConsentBanner,
│   │                       # TrustStrip, RelatedTools, JsonLd, Toast(er), ui/ primitives
│   ├── config/
│   │   └── tools.ts       # The tool registry — see below
│   ├── invoice/           # Invoice-generator-specific domain logic
│   ├── stores/            # themeStore, toastStore
│   └── utils/             # clipboard, seo, trustedTypes, recentTools, …
├── test-stubs/            # $app/paths and $app/state stand-ins for component tests under vitest
└── routes/
    ├── +layout.svelte     # Root layout: SEO tags, JSON-LD, CommandPalette, ConsentBanner
    ├── +page.svelte       # Home page (search, category grid, recently-used row)
    └── <tool-slug>/       # One directory per tool, e.g. hash-generator/, qr-code-generator/
        ├── +page.svelte
        └── components/, utils/
```

A tool's route lives directly under `src/routes/<slug>/` — the `/tools` prefix visitors see in
production comes from `paths.base` in `svelte.config.js`, not from a `routes/tools/` folder.

## Getting started

```bash
pnpm install
pnpm run dev       # http://localhost:5173
pnpm run build     # outputs to build/
pnpm run preview   # serve the production build locally
```

## Testing

```bash
pnpm test          # unit tests (Vitest)
pnpm test:watch
pnpm test:e2e       # Playwright, against a dev server locally or a built preview in CI
pnpm run check      # svelte-check (typecheck)
pnpm run lint       # prettier --check + eslint
pnpm run ci         # lint && check && test && build — what CI runs
```

`pnpm run test:e2e` currently has some known-failing specs unrelated to any specific change —
see the note in `.github/workflows/ci.yml`, where the E2E job runs but doesn't block merges yet.

## The tool registry

`src/lib/shared/config/tools.ts` is the single source of truth for every tool — nav-level fields
(name, icon, priority) and SEO-level fields (title, description, OG image) live on the same
`Tool` record, at route granularity:

```typescript
export const tools: Tool[] = [
	{
		slug: 'hash-generator', // matches the route directory
		name: 'Hash Generator', // nav / card / lead-magnet display name
		shortDescription: 'Generate cryptographic hashes instantly…', // nav card, home grid
		seoTitle: 'Online Hash Generator (MD5, SHA256, SHA512) | Secure & Fast - Devxhub',
		seoDescription: 'Generate cryptographic hashes instantly…', // <meta description>, JSON-LD
		category: 'developer',
		status: 'live',
		priority: 2, // sort order within its category
		icon: '/tool-icons/hash.png',
		ogImage: '/social-share-images/Devxhub-_Hash Generator.png',
		guidePdf: 'hash-guide.pdf', // offered by <LeadMagnetInline>
		keywords: ['hash generator', 'md5', 'sha256' /* … */],
		related: ['json-formatter-validator', 'uuid-guid-generator', 'base64-encoder-decoder']
	}
	// … one entry per tool
];
```

A sub-route that needs its own SEO/lead-magnet entry but not its own nav card (the four
`online-color-picker/*` pages) sets `showInNav: false`. `tools.test.ts` checks registry
integrity: every non-external slug has a route directory, and every `icon`/`ogImage`/`guidePdf`
file referenced actually exists on disk.

### Adding a new tool

1. Add an entry to `tools.ts` (see above).
2. Create `src/routes/<your-slug>/+page.svelte` (plus `components/`/`utils/` as needed) —
   `<PageHeader>`, `<TrustStrip />`, `<RelatedTools tool={currentTool} />`,
   `<SeoContent>` and `<LeadMagnetInline>` are the shared pieces most tool pages compose;
   `hash-generator/+page.svelte` is a representative example to copy from.
3. Add real PDF/OG assets under `static/tool-pdf/` and `static/social-share-images/` and
   reference them from the registry entry — `tools.test.ts` will fail the build if they're
   missing.

Navigation, the home page grid, the sitemap, and JSON-LD all pick the new tool up automatically
from the registry; nothing else needs updating.

## Analytics and consent

Every `dataLayer` push goes through `track()` (`src/lib/shared/analytics/track.ts`), which checks
`consent.ts` first — analytics defaults to denied until `ConsentBanner.svelte` records a choice.
Never pass a name, email, or other personal data as a `track()` prop.

## Security

CSP, Trusted Types, and the markdown/diff sanitizers are documented inline where they're
enforced (`docker/nginx.conf`, `src/lib/shared/utils/trustedTypes.ts`,
`src/routes/online-markdown-editor/utils/markdownParser.ts`). Report a vulnerability to
[Devxhub](https://www.devxhub.com/contact) rather than opening a public issue.

## Deployment

`docker/Dockerfile.prod` builds the static site and serves it from `nginxinc/nginx-unprivileged`
(non-root, listening on 8080) with the config in `docker/nginx.conf`. `.github/workflows/ci.yml`
runs on every push and pull request; `docker-build-arm64.yml` builds and pushes the production
image on push to `main`/`dev`.

## License

MIT — see [LICENSE](./LICENSE).

## Further reading

- [Accessibility Audit](./ACCESSIBILITY_AUDIT.md)
- [Test Documentation](./tests/README.md)
- [Usage Examples](./USAGE_EXAMPLES.md)

---

Made by [Devxhub Limited](https://www.devxhub.com)
