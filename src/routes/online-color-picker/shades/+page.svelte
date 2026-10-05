<script lang="ts">
	import { CTA, JsonLd, LeadMagnetInline, PageHeader, SeoContent } from '$lib/shared/components';
	import {
		generateShades,
		generateTints,
		hexToRgb,
		isValidHex,
		normalizeHex,
		rgbToHsl
	} from '$lib/shared/utils';
	import { ColorControls, ColorGrid } from '../components/shades';

	let baseColor = $state('#3B82F6');
	let steps = $state(5);
	let format = $state<'hex' | 'rgb' | 'hsl'>('hex');
	let copiedField = $state<string | null>(null);

	const tints = $derived(generateTints(baseColor, steps));
	const shades = $derived(generateShades(baseColor, steps));

	function handleColorInput(e: Event) {
		const target = e.target as HTMLInputElement;
		let value = target.value.toUpperCase();
		if (!value.startsWith('#')) value = '#' + value;
		if (isValidHex(value)) {
			baseColor = normalizeHex(value);
		}
	}

	async function copyToClipboard(text: string, field: string) {
		await navigator.clipboard.writeText(text);
		copiedField = field;
		setTimeout(() => (copiedField = null), 2000);
	}

	async function copyAllTints() {
		const colors = tints.map((c) => formatColor(c, format)).join(', ');
		await copyToClipboard(colors, 'allTints');
	}

	async function copyAllShades() {
		const colors = shades.map((c) => formatColor(c, format)).join(', ');
		await copyToClipboard(colors, 'allShades');
	}

	function getPercentage(index: number, total: number, isTint: boolean): number {
		if (isTint) {
			return Math.round(((total - index) / total) * 100);
		}
		return Math.round(((index + 1) / (total + 1)) * 100);
	}

	function formatColor(hex: string, fmt: 'hex' | 'rgb' | 'hsl'): string {
		if (fmt === 'hex') return hex;
		const rgb = hexToRgb(hex);
		if (fmt === 'rgb') return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
		const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
		return `${hsl.h}°, ${hsl.s}%, ${hsl.l}%`;
	}

	// SEO content data
	const seoData = {
		howToSteps: {
			title: 'How to Generate Tints and Shades',
			steps: [
				{
					title: 'Select Your Base Color',
					description:
						'Choose a base color using the color picker or enter a HEX code. This will be the middle point of your color scale.'
				},
				{
					title: 'Adjust Number of Steps',
					description:
						'Choose how many tints (lighter) and shades (darker) to generate. More steps create smoother gradients, fewer steps create more distinct variations.'
				},
				{
					title: 'Choose Output Format',
					description:
						'Select HEX for web development, RGB for design tools, or HSL for easier color manipulation and adjustments.'
				},
				{
					title: 'Copy and Export',
					description:
						'Click individual colors to copy them, or use "Copy All" to export the entire scale for use in design systems, Tailwind configs, or CSS variables.'
				}
			]
		},
		comparison: {
			title: 'Tints vs Shades: Understanding Color Variations',
			description:
				'Tints and shades are fundamental color variations used in design systems and UI frameworks.',
			headers: ['Aspect', 'Tints (Lighter)', 'Shades (Darker)'],
			rows: [
				{
					label: 'Definition',
					columns: ['Base color + white', 'Base color + black']
				},
				{
					label: 'Use Cases',
					columns: [
						'Backgrounds, hover states, disabled elements',
						'Text, borders, active states, shadows'
					]
				},
				{
					label: 'Accessibility',
					columns: ['Lower contrast, use for backgrounds', 'Higher contrast, better for text']
				},
				{
					label: 'Common Names',
					columns: ['50, 100, 200, 300, 400 (Tailwind)', '600, 700, 800, 900 (Tailwind)']
				}
			]
		},
		bestPractices: {
			title: 'Best Practices for Color Scales',
			practices: [
				'Use 9-11 steps for comprehensive design systems: Provides enough variation for all UI states without overwhelming choices.',
				'Test contrast ratios: Ensure text colors (darker shades) meet WCAG AA standards (4.5:1) against background colors (lighter tints).',
				'Name consistently: Use numeric scales (50-900) like Tailwind or descriptive names (lightest, lighter, base, darker, darkest).',
				'Consider HSL for adjustments: HSL makes it easier to create consistent lightness steps across different hues.',
				'Export as CSS variables: Define your scale once and reuse throughout your application for consistency.',
				'Test in dark mode: Ensure your tints work well on dark backgrounds and shades work on light backgrounds.'
			]
		},
		faqs: {
			title: 'Frequently Asked Questions',
			items: [
				{
					question: 'What is the difference between tints, shades, and tones?',
					answer:
						'Tints are created by adding white to a base color (making it lighter). Shades are created by adding black (making it darker). Tones are created by adding gray (reducing saturation). This tool generates tints and shades. For tones, use the HSL format and adjust the saturation value.'
				},
				{
					question: 'How many color steps should I use in my design system?',
					answer:
						'Most modern design systems use 9-11 steps (e.g., Tailwind uses 50, 100, 200...900). This provides enough variation for backgrounds, borders, text, and interactive states. For simpler projects, 5-7 steps may be sufficient. More steps create smoother transitions but can be overwhelming.'
				},
				{
					question: 'How do I use these colors in Tailwind CSS?',
					answer:
						'Export your colors and add them to tailwind.config.js under the colors section. For example: colors: { primary: { 50: "#EFF6FF", 100: "#DBEAFE", 500: "#3B82F6", 900: "#1E3A8A" } }. Then use them as bg-primary-50, text-primary-900, etc.'
				},
				{
					question: 'Why do my tints look washed out?',
					answer:
						'Pure tints (adding white) can appear washed out because they reduce saturation. For more vibrant tints, use HSL format and increase the lightness while maintaining or slightly increasing saturation. This creates more vivid lighter colors that work better for modern UI designs.'
				},
				{
					question: 'What format should I use for CSS?',
					answer:
						'HEX is most common and compact for CSS. RGB is useful when you need to add transparency (rgba). HSL is best for programmatic color manipulation and creating consistent scales. Modern browsers support all three formats, so choose based on your workflow and team preferences.'
				}
			]
		}
	};

	const jsonLdSchema = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'Color Shades & Tints Generator',
		applicationCategory: 'DesignApplication',
		operatingSystem: 'Web Browser',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD'
		},
		description:
			'Generate perfect lighter tints and darker shades from any base color. Export in HEX, RGB, or HSL formats.',
		featureList: [
			'Tints Generator',
			'Shades Generator',
			'HEX Format',
			'RGB Format',
			'HSL Format',
			'Adjustable Steps',
			'Copy All Colors',
			'Design System Ready'
		]
	};
</script>

<svelte:head>
	<JsonLd data={jsonLdSchema} />
</svelte:head>

<div class="flex flex-col gap-8">
	<PageHeader
		title="Color Shades & Tints Generator"
		description="Generate perfect lighter tints and darker shades from any base color. Export in HEX, RGB, or HSL formats for design systems."
	/>

	<section aria-label="Shades and tints generator interface">
		<!-- Controls -->
		<ColorControls
			{baseColor}
			bind:steps
			{format}
			onColorInput={handleColorInput}
			onStepsChange={(newSteps) => (steps = newSteps)}
			onFormatChange={(newFormat) => (format = newFormat)}
		/>

		<!-- Tints Section -->
		<ColorGrid
			title="Tints (Lighter)"
			colors={tints}
			{baseColor}
			{format}
			{copiedField}
			{formatColor}
			{getPercentage}
			onCopyColor={(color) => copyToClipboard(formatColor(color, format), color)}
			onCopyAll={copyAllTints}
			isTint={true}
		/>

		<!-- Shades Section -->
		<ColorGrid
			title="Shades (Darker)"
			colors={shades}
			{baseColor}
			{format}
			{copiedField}
			{formatColor}
			{getPercentage}
			onCopyColor={(color) => copyToClipboard(formatColor(color, format), color)}
			onCopyAll={copyAllShades}
			isTint={false}
		/>
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
			title="Color Shades & Tints: Design System Implementation"
			description="Create professional shade palettes for scalable design systems."
			toolName="Shades & Tints Generator"
			hookText="Consistent color scales are the foundation of scalable design systems. Learn how to create professional shade palettes."
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
