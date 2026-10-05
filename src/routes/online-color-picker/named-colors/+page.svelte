<script lang="ts">
	import { base } from '$app/paths';
	import { CTA, JsonLd, LeadMagnetInline, PageHeader, SeoContent } from '$lib/shared/components';
	import { ColorFilters, NamedColorGrid } from '../components/named-colors';

	interface NamedColor {
		name: string;
		hex: string;
		rgb: string;
		family: string;
	}

	const namedColors: NamedColor[] = [
		// Reds
		{ name: 'IndianRed', hex: '#CD5C5C', rgb: '205,92,92', family: 'Reds' },
		{ name: 'LightCoral', hex: '#F08080', rgb: '240,128,128', family: 'Reds' },
		{ name: 'Salmon', hex: '#FA8072', rgb: '250,128,114', family: 'Reds' },
		{ name: 'DarkSalmon', hex: '#E9967A', rgb: '233,150,122', family: 'Reds' },
		{ name: 'Crimson', hex: '#DC143C', rgb: '220,20,60', family: 'Reds' },
		{ name: 'Red', hex: '#FF0000', rgb: '255,0,0', family: 'Reds' },
		{ name: 'FireBrick', hex: '#B22222', rgb: '178,34,34', family: 'Reds' },
		{ name: 'DarkRed', hex: '#8B0000', rgb: '139,0,0', family: 'Reds' },
		// Pinks
		{ name: 'Pink', hex: '#FFC0CB', rgb: '255,192,203', family: 'Pinks' },
		{ name: 'LightPink', hex: '#FFB6C1', rgb: '255,182,193', family: 'Pinks' },
		{ name: 'HotPink', hex: '#FF69B4', rgb: '255,105,180', family: 'Pinks' },
		{ name: 'DeepPink', hex: '#FF1493', rgb: '255,20,147', family: 'Pinks' },
		{ name: 'MediumVioletRed', hex: '#C71585', rgb: '199,21,133', family: 'Pinks' },
		{ name: 'PaleVioletRed', hex: '#DB7093', rgb: '219,112,147', family: 'Pinks' },
		// Oranges
		{ name: 'Coral', hex: '#FF7F50', rgb: '255,127,80', family: 'Oranges' },
		{ name: 'Tomato', hex: '#FF6347', rgb: '255,99,71', family: 'Oranges' },
		{ name: 'OrangeRed', hex: '#FF4500', rgb: '255,69,0', family: 'Oranges' },
		{ name: 'DarkOrange', hex: '#FF8C00', rgb: '255,140,0', family: 'Oranges' },
		{ name: 'Orange', hex: '#FFA500', rgb: '255,165,0', family: 'Oranges' },
		// Yellows
		{ name: 'Gold', hex: '#FFD700', rgb: '255,215,0', family: 'Yellows' },
		{ name: 'Yellow', hex: '#FFFF00', rgb: '255,255,0', family: 'Yellows' },
		{ name: 'LightYellow', hex: '#FFFFE0', rgb: '255,255,224', family: 'Yellows' },
		{ name: 'LemonChiffon', hex: '#FFFACD', rgb: '255,250,205', family: 'Yellows' },
		{ name: 'PapayaWhip', hex: '#FFEFD5', rgb: '255,239,213', family: 'Yellows' },
		{ name: 'Khaki', hex: '#F0E68C', rgb: '240,230,140', family: 'Yellows' },
		// Purples
		{ name: 'Lavender', hex: '#E6E6FA', rgb: '230,230,250', family: 'Purples' },
		{ name: 'Thistle', hex: '#D8BFD8', rgb: '216,191,216', family: 'Purples' },
		{ name: 'Plum', hex: '#DDA0DD', rgb: '221,160,221', family: 'Purples' },
		{ name: 'Violet', hex: '#EE82EE', rgb: '238,130,238', family: 'Purples' },
		{ name: 'Orchid', hex: '#DA70D6', rgb: '218,112,214', family: 'Purples' },
		{ name: 'Magenta', hex: '#FF00FF', rgb: '255,0,255', family: 'Purples' },
		{ name: 'MediumOrchid', hex: '#BA55D3', rgb: '186,85,211', family: 'Purples' },
		{ name: 'MediumPurple', hex: '#9370DB', rgb: '147,112,219', family: 'Purples' },
		{ name: 'BlueViolet', hex: '#8A2BE2', rgb: '138,43,226', family: 'Purples' },
		{ name: 'DarkViolet', hex: '#9400D3', rgb: '148,0,211', family: 'Purples' },
		{ name: 'DarkOrchid', hex: '#9932CC', rgb: '153,50,204', family: 'Purples' },
		{ name: 'DarkMagenta', hex: '#8B008B', rgb: '139,0,139', family: 'Purples' },
		{ name: 'Purple', hex: '#800080', rgb: '128,0,128', family: 'Purples' },
		{ name: 'RebeccaPurple', hex: '#663399', rgb: '102,51,153', family: 'Purples' },
		{ name: 'Indigo', hex: '#4B0082', rgb: '75,0,130', family: 'Purples' },
		// Greens
		{ name: 'GreenYellow', hex: '#ADFF2F', rgb: '173,255,47', family: 'Greens' },
		{ name: 'Chartreuse', hex: '#7FFF00', rgb: '127,255,0', family: 'Greens' },
		{ name: 'LawnGreen', hex: '#7CFC00', rgb: '124,252,0', family: 'Greens' },
		{ name: 'Lime', hex: '#00FF00', rgb: '0,255,0', family: 'Greens' },
		{ name: 'LimeGreen', hex: '#32CD32', rgb: '50,205,50', family: 'Greens' },
		{ name: 'PaleGreen', hex: '#98FB98', rgb: '152,251,152', family: 'Greens' },
		{ name: 'LightGreen', hex: '#90EE90', rgb: '144,238,144', family: 'Greens' },
		{ name: 'MediumSpringGreen', hex: '#00FA9A', rgb: '0,250,154', family: 'Greens' },
		{ name: 'SpringGreen', hex: '#00FF7F', rgb: '0,255,127', family: 'Greens' },
		{ name: 'MediumSeaGreen', hex: '#3CB371', rgb: '60,179,113', family: 'Greens' },
		{ name: 'SeaGreen', hex: '#2E8B57', rgb: '46,139,87', family: 'Greens' },
		{ name: 'ForestGreen', hex: '#228B22', rgb: '34,139,34', family: 'Greens' },
		{ name: 'Green', hex: '#008000', rgb: '0,128,0', family: 'Greens' },
		{ name: 'DarkGreen', hex: '#006400', rgb: '0,100,0', family: 'Greens' },
		// Cyans
		{ name: 'Aqua', hex: '#00FFFF', rgb: '0,255,255', family: 'Cyans' },
		{ name: 'Cyan', hex: '#00FFFF', rgb: '0,255,255', family: 'Cyans' },
		{ name: 'LightCyan', hex: '#E0FFFF', rgb: '224,255,255', family: 'Cyans' },
		{ name: 'PaleTurquoise', hex: '#AFEEEE', rgb: '175,238,238', family: 'Cyans' },
		{ name: 'Aquamarine', hex: '#7FFFD4', rgb: '127,255,212', family: 'Cyans' },
		{ name: 'Turquoise', hex: '#40E0D0', rgb: '64,224,208', family: 'Cyans' },
		{ name: 'MediumTurquoise', hex: '#48D1CC', rgb: '72,209,204', family: 'Cyans' },
		{ name: 'DarkTurquoise', hex: '#00CED1', rgb: '0,206,209', family: 'Cyans' },
		{ name: 'Teal', hex: '#008080', rgb: '0,128,128', family: 'Cyans' },
		{ name: 'DarkCyan', hex: '#008B8B', rgb: '0,139,139', family: 'Cyans' },
		// Blues
		{ name: 'LightSteelBlue', hex: '#B0C4DE', rgb: '176,196,222', family: 'Blues' },
		{ name: 'LightBlue', hex: '#ADD8E6', rgb: '173,216,230', family: 'Blues' },
		{ name: 'SkyBlue', hex: '#87CEEB', rgb: '135,206,235', family: 'Blues' },
		{ name: 'LightSkyBlue', hex: '#87CEFA', rgb: '135,206,250', family: 'Blues' },
		{ name: 'DeepSkyBlue', hex: '#00BFFF', rgb: '0,191,255', family: 'Blues' },
		{ name: 'DodgerBlue', hex: '#1E90FF', rgb: '30,144,255', family: 'Blues' },
		{ name: 'CornflowerBlue', hex: '#6495ED', rgb: '100,149,237', family: 'Blues' },
		{ name: 'SteelBlue', hex: '#4682B4', rgb: '70,130,180', family: 'Blues' },
		{ name: 'RoyalBlue', hex: '#4169E1', rgb: '65,105,225', family: 'Blues' },
		{ name: 'Blue', hex: '#0000FF', rgb: '0,0,255', family: 'Blues' },
		{ name: 'MediumBlue', hex: '#0000CD', rgb: '0,0,205', family: 'Blues' },
		{ name: 'DarkBlue', hex: '#00008B', rgb: '0,0,139', family: 'Blues' },
		{ name: 'Navy', hex: '#000080', rgb: '0,0,128', family: 'Blues' },
		{ name: 'MidnightBlue', hex: '#191970', rgb: '25,25,112', family: 'Blues' },
		// Neutrals
		{ name: 'White', hex: '#FFFFFF', rgb: '255,255,255', family: 'Neutrals' },
		{ name: 'Snow', hex: '#FFFAFA', rgb: '255,250,250', family: 'Neutrals' },
		{ name: 'Ivory', hex: '#FFFFF0', rgb: '255,255,240', family: 'Neutrals' },
		{ name: 'WhiteSmoke', hex: '#F5F5F5', rgb: '245,245,245', family: 'Neutrals' },
		{ name: 'Gainsboro', hex: '#DCDCDC', rgb: '220,220,220', family: 'Neutrals' },
		{ name: 'Silver', hex: '#C0C0C0', rgb: '192,192,192', family: 'Neutrals' },
		{ name: 'DarkGray', hex: '#A9A9A9', rgb: '169,169,169', family: 'Neutrals' },
		{ name: 'Gray', hex: '#808080', rgb: '128,128,128', family: 'Neutrals' },
		{ name: 'DimGray', hex: '#696969', rgb: '105,105,105', family: 'Neutrals' },
		{ name: 'SlateGray', hex: '#708090', rgb: '112,128,144', family: 'Neutrals' },
		{ name: 'DarkSlateGray', hex: '#2F4F4F', rgb: '47,79,79', family: 'Neutrals' },
		{ name: 'Black', hex: '#000000', rgb: '0,0,0', family: 'Neutrals' }
	];

	const families = [
		'All',
		'Reds',
		'Pinks',
		'Oranges',
		'Yellows',
		'Greens',
		'Cyans',
		'Blues',
		'Purples',
		'Neutrals'
	];

	let searchQuery = $state('');
	let selectedFamily = $state('All');
	let copiedField = $state<string | null>(null);

	const filteredColors = $derived.by(() => {
		let colors = namedColors;

		// Filter by family
		if (selectedFamily !== 'All') {
			colors = colors.filter((c) => c.family === selectedFamily);
		}

		// Filter by search
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			colors = colors.filter(
				(c) =>
					c.name.toLowerCase().includes(query) ||
					c.hex.toLowerCase().includes(query) ||
					c.family.toLowerCase().includes(query)
			);
		}

		return colors;
	});

	async function copyToClipboard(text: string, field: string) {
		await navigator.clipboard.writeText(text);
		copiedField = field;
		setTimeout(() => (copiedField = null), 2000);
	}

	// SEO content data
	const seoData = {
		howToSteps: {
			title: 'How to Use Named CSS Colors',
			steps: [
				{
					title: 'Browse or Search',
					description:
						'Use the search box to find colors by name (e.g., "coral", "slate") or filter by color family (Reds, Blues, Greens, etc.) to narrow down your options.'
				},
				{
					title: 'Click to Copy',
					description:
						'Click any color swatch to instantly copy its HEX code to your clipboard. The color name and RGB values are also displayed for reference.'
				},
				{
					title: 'Use in CSS',
					description:
						'Named colors can be used directly in CSS: color: tomato; or background: skyblue;. They work in all modern browsers and are more readable than HEX codes.'
				},
				{
					title: 'Check Browser Support',
					description:
						'All 140+ standard CSS named colors are supported in modern browsers. Avoid deprecated colors like "darkgray" vs "darkgrey" spelling variations for consistency.'
				}
			]
		},
		comparison: {
			title: 'Named Colors vs HEX vs RGB',
			description:
				'CSS supports multiple color formats. Choose based on readability, precision, and use case.',
			headers: ['Format', 'Example', 'Best For'],
			rows: [
				{
					label: 'Named Colors',
					columns: ['tomato, skyblue, coral', 'Quick prototyping, readability, simple designs']
				},
				{
					label: 'HEX',
					columns: ['#FF6347, #87CEEB', 'Precise colors, design systems, production code']
				},
				{
					label: 'RGB',
					columns: ['rgb(255, 99, 71)', 'Programmatic color manipulation, transparency (rgba)']
				},
				{
					label: 'HSL',
					columns: ['hsl(9, 100%, 64%)', 'Color variations, tints/shades, designer-friendly']
				}
			]
		},
		bestPractices: {
			title: 'Best Practices for Named Colors',
			practices: [
				'Use for prototyping: Named colors are great for quick mockups and demos where exact color matching is not critical.',
				'Avoid in production: For brand colors and design systems, use HEX or RGB for precise color control and consistency.',
				'Be aware of variations: Some colors have multiple names (e.g., aqua = cyan, fuchsia = magenta). Stick to one for consistency.',
				'Consider accessibility: Not all named colors meet WCAG contrast requirements. Always test text/background combinations.',
				'Document your choices: If using named colors in production, document why and which ones to maintain consistency across the team.',
				'Use semantic names: Colors like "tomato" and "coral" are more memorable than HEX codes during development and code reviews.'
			]
		},
		faqs: {
			title: 'Frequently Asked Questions',
			items: [
				{
					question: 'Are CSS named colors supported in all browsers?',
					answer:
						'Yes, all 140+ standard CSS named colors are supported in all modern browsers (Chrome, Firefox, Safari, Edge) and have been for many years. They are part of the CSS Color Module Level 3 specification. However, avoid deprecated or non-standard color names for maximum compatibility.'
				},
				{
					question: 'Should I use named colors in production code?',
					answer:
						'Named colors are acceptable for prototyping and internal tools, but for production applications, HEX or RGB values are preferred. Named colors lack precision for brand colors and design systems. However, they can improve code readability in certain contexts, like utility classes or debugging styles.'
				},
				{
					question: 'What is the difference between "gray" and "grey" in CSS?',
					answer:
						'CSS supports both American (gray) and British (grey) spellings for gray colors: gray/grey, darkgray/darkgrey, lightgray/lightgrey, etc. They are identical colors. For consistency, pick one spelling convention and stick to it throughout your codebase. Most style guides prefer the American spelling "gray".'
				},
				{
					question: 'Can I use named colors with transparency?',
					answer:
						'Named colors cannot directly include transparency. To add transparency, convert to rgba() or use the color with the opacity property. For example, instead of "tomato with 50% opacity", use rgba(255, 99, 71, 0.5) or apply opacity: 0.5 to the element. Modern CSS also supports color-mix() for blending named colors.'
				},
				{
					question: 'What are the most commonly used named colors?',
					answer:
						'The most popular named colors in web development are: white, black, red, blue, green, yellow, gray, silver, orange, purple, pink, and brown. These are widely recognized and safe for quick styling. For specific shades, developers typically switch to HEX codes for precision.'
				}
			]
		}
	};

	const jsonLdSchema = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'Named CSS Colors Reference',
		applicationCategory: 'DeveloperApplication',
		operatingSystem: 'Web Browser',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD'
		},
		description:
			'Browse and search the standard CSS named color palette. Filter by color family and verify HEX values.',
		featureList: [
			'140+ Named Colors',
			'Search by Name',
			'Filter by Family',
			'HEX Values',
			'RGB Values',
			'One-Click Copy',
			'Color Families',
			'Browser Compatible'
		]
	};
</script>

<svelte:head>
	<JsonLd data={jsonLdSchema} />
</svelte:head>

<div class="flex flex-col gap-8">
	<PageHeader
		title="Named CSS Colors Reference"
		description="Browse the standard CSS named color palette. Click any swatch to copy its HEX value. Filter by color family or search by name."
	/>

	<section aria-label="Named colors reference interface">
		<!-- Filters -->
		<ColorFilters
			bind:searchQuery
			{selectedFamily}
			{families}
			onSearchChange={(query) => (searchQuery = query)}
			onFamilyChange={(family) => (selectedFamily = family)}
		/>

		<!-- Results Count -->
		<div class="my-5 text-sm text-slate-500 dark:text-slate-400">
			Showing {filteredColors.length} of {namedColors.length} colors
		</div>

		<!-- Color Grid -->
		<NamedColorGrid
			colors={filteredColors}
			{copiedField}
			onCopyColor={(hex) => copyToClipboard(hex, hex)}
		/>

		<!-- Empty State -->
		{#if filteredColors.length === 0}
			<div class="py-12 text-center">
				<div class="mb-4 text-4xl">🔍</div>
				<h2 class="mb-2 text-lg font-semibold text-white">No colors found</h2>
				<p class="text-slate-500 dark:text-slate-400">
					Try adjusting your search or filter criteria.
				</p>
			</div>
		{/if}

		<!-- Navigation -->
		<div class="mt-5 flex flex-wrap justify-center gap-4">
			<a
				href="{base}/online-color-picker"
				class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
			>
				← Color Picker
			</a>
			<a
				href="{base}/online-color-picker/gradient"
				class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
			>
				Gradient Generator
			</a>
			<a
				href="{base}/online-color-picker/palette"
				class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
			>
				Palette Generator
			</a>
		</div>
	</section>

	<!-- SEO Content Section -->
	<div>
		<SeoContent
			howToSteps={seoData.howToSteps}
			comparison={seoData.comparison}
			bestPractices={seoData.bestPractices}
			faqs={seoData.faqs}
		/>
	</div>

	<div class="mt-10">
		<LeadMagnetInline
			title="CSS Named Colors: Complete Reference with Use Cases"
			description="Learn which named colors are safe and which to avoid."
			toolName="Named Colors Reference"
			hookText="Named colors improve code readability, but not all are created equal. Learn which colors are safe and which to avoid."
		/>
	</div>

	<!-- CTA Section -->
	<div class="mt-10">
		<CTA
			title="Need a pixel-perfect UI implementation?"
			description="Translating Figma to React is hard. Our frontend team builds pixel-perfect, responsive component libraries."
			buttonText="Hire Frontend Developers"
			buttonUrl="https://www.devxhub.com/full-stack-development"
		/>
	</div>
</div>
