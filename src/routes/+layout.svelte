<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import {
		CommandPalette,
		ConsentBanner,
		Footer,
		Header,
		JsonLd,
		Toaster
	} from '$lib/shared/components';
	import { getToolBySlug } from '$lib/shared/config/tools';
	import { generateSEOTags, generateSchemaMarkup } from '$lib/shared/utils/seo';
	import { recordToolVisit } from '$lib/shared/utils/recentTools';
	import '../app.css';
	// The primary UI face — regular-weight Roboto, latin subset — preloaded so the browser
	// fetches it immediately rather than waiting to parse app.css's @font-face rules first.
	// `?url` gives the hashed, built URL rather than inlining the font as a data: URI.
	import robotoRegularWoff2 from '@fontsource/roboto/files/roboto-latin-400-normal.woff2?url';

	let { children } = $props();

	// Lenis previously ran a requestAnimationFrame loop intercepting scroll/wheel input on every
	// page for smooth scrolling; native `scroll-behavior: smooth` (app.css, gated behind
	// prefers-reduced-motion) covers the same in-page-scroll feel without that constant
	// main-thread cost or the ~20KB (min+gzip) dependency, and removes the need for its `prevent`
	// escape hatch — the many `data-lenis-prevent` attributes it required on scrollable/dropdown
	// content are gone along with it.
	afterNavigate(() => {
		window.scrollTo(0, 0);
	});

	const toolSlug = $derived(page.url.pathname.split('/').filter(Boolean).pop() || '');
	const metadata = $derived(getToolBySlug(toolSlug));

	// $effect only ever runs client-side (never during SSR/prerendering), which is exactly what
	// "recently used" needs: a prerendered page has no visitor to personalize for.
	$effect(() => {
		if (metadata) recordToolVisit(metadata.slug);
	});

	// Fix: Dynamic Alt Text generation for 21 tools
	const getCleanAlt = (title: string) => {
		return title.split('|')[0].trim() + ' - Devxhub Tools';
	};

	const seoTags = $derived(
		metadata
			? generateSEOTags({
					title: metadata.seoTitle || metadata.name,
					description: metadata.seoDescription,
					url: `/${metadata.slug}`,
					image: metadata.ogImage || '/preview.png',
					imageWidth: 1200,
					imageHeight: 630,
					imageAlt: getCleanAlt(metadata.seoTitle || metadata.name), // Dynamic Clean Alt
					siteName: 'Devxhub Tools',
					locale: 'en_US',
					type: 'website',
					section: metadata.category,
					tags: metadata.keywords,
					author: 'Devxhub',
					twitterSite: '@devxhub',
					twitterCreator: '@devxhub'
				})
			: generateSEOTags({
					title: 'Devxhub Tools – Free Online Developer Tools',
					description: 'Free online tools for developers. Fast, secure, and works in your browser.',
					url: '',
					image: '/preview.png',
					imageWidth: 1200,
					imageHeight: 630,
					imageAlt: 'Devxhub Tools - Free Online Developer Tools',
					siteName: 'Devxhub Tools',
					locale: 'en_US',
					author: 'Devxhub',
					twitterSite: '@devxhub',
					twitterCreator: '@devxhub'
				})
	);

	// Invoice page owns its SoftwareApplication + FAQPage JSON-LD directly.
	// No aggregateRating here or in generateSchemaMarkup — this app collects no reviews, and
	// Google's structured-data policy treats a rating with nothing real behind it as spam.
	const schemaMarkup = $derived(
		metadata?.slug === 'free-invoice-generator'
			? null
			: metadata
				? generateSchemaMarkup({
						name: (metadata.seoTitle || metadata.name).split('–')[0].trim(),
						description: metadata.seoDescription,
						url: `${import.meta.env.PUBLIC_SITE_URL || 'https://www.devxhub.com/tools'}/${metadata.slug}`,
						applicationCategory: 'DeveloperApplication',
						operatingSystem: 'Web',
						author: 'Devxhub',
						publisher: 'Devxhub',
						keywords: metadata.keywords
					})
				: generateSchemaMarkup({
						name: 'Devxhub Tools',
						description: 'Free online tools for developers. Fast, secure, and works in your browser.',
						url: import.meta.env.PUBLIC_SITE_URL || 'https://www.devxhub.com/tools',
						applicationCategory: 'WebApplication',
						operatingSystem: 'Any',
						author: 'Devxhub',
						publisher: 'Devxhub',
						keywords: ['developer tools', 'online tools']
					})
	);
</script>

<svelte:head>
	<link
		rel="preload"
		as="font"
		type="font/woff2"
		href={robotoRegularWoff2}
		crossorigin="anonymous"
	/>
	<meta property="fb:app_id" content="966242223397117" />

	<title>{seoTags.title}</title>
	<meta name="description" content={seoTags.description} />
	<meta name="author" content={seoTags.author || 'Devxhub'} />
	{#if metadata}
		<meta name="keywords" content={metadata.keywords.join(', ')} />
	{/if}

	<link rel="canonical" href={seoTags.canonical} />

	<meta property="og:type" content={seoTags['og:type']} />
	<meta property="og:url" content={seoTags['og:url']} />
	<meta property="og:title" content={seoTags['og:title']} />
	<meta property="og:description" content={seoTags['og:description']} />
	<meta property="og:image" content={seoTags['og:image']} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:alt" content={seoTags['og:image:alt'] || seoTags.title} />
	<meta property="og:site_name" content="Devxhub Tools" />
	<meta property="og:locale" content="en_US" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={seoTags['twitter:title']} />
	<meta name="twitter:description" content={seoTags['twitter:description']} />
	<meta name="twitter:image" content={seoTags['twitter:image']} />
	<meta name="twitter:image:alt" content={seoTags['twitter:image:alt']} />
	<meta name="twitter:site" content="@devxhub" />
	<meta name="twitter:creator" content="@devxhub" />

	<meta name="robots" content="index, follow" />
	<!-- viewport, theme-color, icon and apple-touch-icon all come from app.html — declared once,
	     there, since it can reference %sveltekit.assets% for a base-path-correct icon URL, which
	     a hardcoded "/favicon.ico" here could not (it would 404 in production, where the app is
	     served under /tools). Duplicating them here just meant the browser silently preferred
	     whichever one rendered last in the document, which was this less-complete pair. -->

	{#if schemaMarkup}
		<JsonLd data={schemaMarkup} />
	{/if}
</svelte:head>

<Header />
<div id="mainApp" class="bg-devx-bg">
	<main id="main-content" tabindex="-1">
		<div class="mx-auto w-full max-w-7xl px-6 py-10">
			{@render children()}
		</div>
	</main>
	<Footer />
</div>
<Toaster />
<CommandPalette />
<ConsentBanner />
