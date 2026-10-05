# Usage Examples - New Features

This document provides examples of how to use shared features in the Devxhub Tools app.

## 1. Copy to Clipboard

### Using the CopyButton Component

```svelte
<script lang="ts">
	import { CopyButton } from '$lib/shared/components';

	let textToCopy = $state('Hello, World!');
</script>

<CopyButton text={textToCopy} label="Copy Text" successMessage="Text copied successfully!" />
```

### Using the Utility Function Directly

```svelte
<script lang="ts">
	import { copyToClipboard } from '$lib/shared/utils';
	import { toast } from '$lib/shared/stores/toastStore';

	let text = $state('Some text to copy');

	async function handleCopy() {
		const success = await copyToClipboard(text);
		if (success) {
			toast.success('Copied to clipboard!');
		} else {
			toast.error('Failed to copy');
		}
	}
</script>

<button onclick={handleCopy}>Copy</button>
```

## 2. Toast Notifications

### Basic Usage

```svelte
<script lang="ts">
	import { toast } from '$lib/shared/stores/toastStore';
</script>

<button onclick={() => toast.success('Operation successful!')}> Show Success </button>

<button onclick={() => toast.error('Something went wrong')}> Show Error </button>

<button onclick={() => toast.warning('Please check your input')}> Show Warning </button>

<button onclick={() => toast.info('Here is some information')}> Show Info </button>
```

### Custom Duration

```svelte
<script lang="ts">
	import { toast } from '$lib/shared/stores/toastStore';
</script>

<!-- Toast that stays for 5 seconds (default for errors) -->
<button onclick={() => toast.error('Error message', 5000)}> Show Error </button>

<!-- Persistent toast (won't auto-dismiss) -->
<button onclick={() => toast.info('Important info', 0)}> Show Persistent Toast </button>
```

**Note:** The `<Toaster />` component is already included in the root layout, so toasts will automatically appear.

## 3. Tool Metadata System

### Accessing Tool Information

```svelte
<script lang="ts">
	import { tools, getLiveTools, getToolBySlug, getToolsByCategory } from '$lib/shared/config/tools';

	// Get all tools
	const allTools = tools;

	// Get only live tools
	const liveTools = getLiveTools();

	// Find a specific tool
	const jsonTool = getToolBySlug('json');

	// Get tools by category
	const devTools = getToolsByCategory('developer');
</script>
```

### Adding a New Tool

Edit `src/lib/shared/config/tools.ts`:

```typescript
export const tools: Tool[] = [
	// ... existing tools
	{
		name: 'My New Tool',
		slug: 'my-tool',
		description: 'Description of my tool',
		category: 'developer',
		status: 'live', // only 'live' status is supported
		priority: 1,
		keywords: ['keyword1', 'keyword2']
	}
];
```

**Note:** Tools now use path-based URLs (devxhub.com/tools/[slug]) instead of subdomains, per Devxhub Tools Development Specification v2.0. Use `getToolUrl(tool)` to generate the correct URL.

## 4. Per-Route SEO

### Using in a Tool Page

```svelte
<!-- src/routes/tools/my-tool/+page.svelte -->
<script lang="ts">
	import {
		getRouteSEO,
		defaultAggregateRating,
		generateToolBreadcrumbSchema
	} from '$lib/shared/utils/routeSEO';
	import { getToolBySlug, getToolUrl } from '$lib/shared/config/tools';
	import { page } from '$app/stores';

	const baseUrl = import.meta.env.PUBLIC_SITE_URL || 'https://www.devxhub.com';
	const currentUrl = `${baseUrl}${$page.url.pathname}`;
	const tool = getToolBySlug('my-tool');
	const toolUrl = tool ? getToolUrl(tool, baseUrl) : currentUrl;

	const { seoTags, schemaMarkup } = getRouteSEO({
		toolName: 'My Tool',
		description: 'A free online tool for...',
		url: currentUrl,
		keywords: ['tool', 'online', 'free'],
		aggregateRating: defaultAggregateRating
	});

	const schemaJson = JSON.stringify(schemaMarkup);
	const breadcrumbSchema = tool ? generateToolBreadcrumbSchema(tool.name, toolUrl, baseUrl) : null;
	const breadcrumbJson = breadcrumbSchema ? JSON.stringify(breadcrumbSchema) : '';
	const schemaScript = '<script type="application/ld+json">' + schemaJson + '<\/script>';
	const breadcrumbScript = breadcrumbJson
		? '<script type="application/ld+json">' + breadcrumbJson + '<\/script>'
		: '';
</script>

<svelte:head>
	<title>{seoTags.title}</title>
	<meta name="description" content={seoTags.description} />
	<link rel="canonical" href={seoTags.canonical} />

	<!-- Open Graph tags -->
	<meta property="og:title" content={seoTags['og:title']} />
	<meta property="og:description" content={seoTags['og:description']} />
	<meta property="og:url" content={seoTags['og:url']} />
	<meta property="og:image" content={seoTags['og:image']} />

	<!-- Twitter Card tags -->
	<meta name="twitter:card" content={seoTags['twitter:card']} />
	<meta name="twitter:title" content={seoTags['twitter:title']} />
	<meta name="twitter:description" content={seoTags['twitter:description']} />

	<!-- Schema.org JSON-LD -->
	{@html schemaScript}
	{@html breadcrumbScript}
</svelte:head>

<h1>My Tool</h1>
<!-- Tool content here -->
```

## 5. Navigation Menu

The navigation menu is automatically included in the Header component. It shows:

- Link to main Devxhub website
- Dropdown menu with all live tools
- Mobile-responsive hamburger menu

No additional setup needed - it uses the tool metadata automatically.

## 6. Complete Tool Page Example

Here's a complete example of a tool page using all the new features:

```svelte
<!-- src/routes/tools/json/+page.svelte -->
<script lang="ts">
	import {
		getRouteSEO,
		defaultAggregateRating,
		generateToolBreadcrumbSchema
	} from '$lib/shared/utils/routeSEO';
	import { getToolBySlug, getToolUrl } from '$lib/shared/config/tools';
	import { CopyButton } from '$lib/shared/components';
	import { toast } from '$lib/shared/stores/toastStore';
	import { page } from '$app/stores';
	import { Textarea } from '$lib/shared/components';

	const baseUrl = import.meta.env.PUBLIC_SITE_URL || 'https://www.devxhub.com';
	const currentUrl = `${baseUrl}${$page.url.pathname}`;
	const tool = getToolBySlug('json');
	const toolUrl = tool ? getToolUrl(tool, baseUrl) : currentUrl;

	const { seoTags, schemaMarkup } = getRouteSEO({
		toolName: 'JSON Formatter',
		description: 'Format, validate, and beautify JSON. Free online tool.',
		url: currentUrl,
		keywords: ['json', 'formatter', 'validator', 'beautify'],
		aggregateRating: defaultAggregateRating
	});

	const schemaJson = JSON.stringify(schemaMarkup);
	const breadcrumbSchema = tool ? generateToolBreadcrumbSchema(tool.name, toolUrl, baseUrl) : null;
	const breadcrumbJson = breadcrumbSchema ? JSON.stringify(breadcrumbSchema) : '';
	const schemaScript = '<script type="application/ld+json">' + schemaJson + '<\/script>';
	const breadcrumbScript = breadcrumbJson
		? '<script type="application/ld+json">' + breadcrumbJson + '<\/script>'
		: '';

	let input = $state('');
	let formatted = $state('');

	function formatJSON() {
		try {
			const parsed = JSON.parse(input);
			formatted = JSON.stringify(parsed, null, 2);
			toast.success('JSON formatted successfully!');
		} catch (error) {
			toast.error('Invalid JSON: ' + (error as Error).message);
			formatted = '';
		}
	}
</script>

<svelte:head>
	<title>{seoTags.title}</title>
	<meta name="description" content={seoTags.description} />
	<link rel="canonical" href={seoTags.canonical} />
	<meta property="og:title" content={seoTags['og:title']} />
	<meta property="og:description" content={seoTags['og:description']} />
	<meta property="og:url" content={seoTags['og:url']} />
	<meta property="og:image" content={seoTags['og:image']} />
	<meta name="twitter:card" content={seoTags['twitter:card']} />
	<meta name="twitter:title" content={seoTags['twitter:title']} />
	<meta name="twitter:description" content={seoTags['twitter:description']} />
	{@html schemaScript}
	{@html breadcrumbScript}
</svelte:head>

<div>
	<h1 class="mb-4 text-4xl font-bold">JSON Formatter</h1>
	<p class="mb-6 text-lg">Format, validate, and beautify your JSON data.</p>

	<div class="space-y-4">
		<div>
			<label for="input" class="mb-2 block text-sm font-medium">Input JSON</label>
			<Textarea id="input" bind:value={input} rows="10" />
		</div>

		<button onclick={formatJSON} class="rounded bg-blue-600 px-4 py-2 text-white">
			Format JSON
		</button>

		{#if formatted}
			<div>
				<div class="mb-2 flex items-center justify-between">
					<label class="block text-sm font-medium">Formatted JSON</label>
					<CopyButton text={formatted} label="Copy" />
				</div>
				<Textarea value={formatted} rows="10" readonly />
			</div>
		{/if}
	</div>
</div>
```

## 7. Environment Variables

Create a `.env` file in the root directory:

```env
PUBLIC_SITE_URL=https://www.devxhub.com
```

This is used for:

- SEO canonical URLs
- Schema markup URLs
- Sitemap generation

## Summary

All Phase 1 critical features are now implemented:

✅ **Copy to Clipboard** - `CopyButton` component and `copyToClipboard()` utility
✅ **Toast Notifications** - `toast` store with `Toaster` component
✅ **Tool Metadata System** - Centralized tool definitions in `config/tools.ts`
✅ **Navigation Menu** - Automatic navigation in Header
✅ **Per-Route SEO** - `getRouteSEO()` helper function
✅ **Header Logo Link** - Links to Devxhub main website
✅ **Footer Tool Links** - Dynamically generated from tool metadata

You're now ready to build your dev tools! 🚀
