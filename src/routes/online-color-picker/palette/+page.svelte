<script lang="ts">
	import { CTA, JsonLd, LeadMagnetInline, PageHeader, SeoContent } from '$lib/shared/components';
	import {
		generateAnalogous,
		generateComplementary,
		generateMonochromatic,
		generateTriadic,
		hexToRgb,
		hslToRgb,
		isValidHex,
		normalizeHex,
		rgbToHex,
		rgbToHsl
	} from '$lib/shared/utils';
	import {
		BaseColorPicker,
		ExportOptions,
		HarmonySelector,
		PaletteDisplay,
		PalettePreview
	} from '../components/palette';

	type HarmonyType =
		'complementary' | 'analogous' | 'triadic' | 'monochromatic' | 'split' | 'square';

	let baseColor = $state('#3B82F6');
	let harmonyType = $state<HarmonyType>('complementary');
	let copiedField = $state<string | null>(null);

	const harmonies: { type: HarmonyType; label: string; icon: string }[] = [
		{ type: 'complementary', label: 'Complementary', icon: '◐' },
		{ type: 'analogous', label: 'Analogous', icon: '◔' },
		{ type: 'triadic', label: 'Triadic', icon: '△' },
		{ type: 'monochromatic', label: 'Monochromatic', icon: '▤' },
		{ type: 'split', label: 'Split Compl.', icon: '⬡' },
		{ type: 'square', label: 'Square', icon: '◻' }
	];

	function generateSplitComplementary(hex: string): string[] {
		const rgb = hexToRgb(hex);
		const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
		return [0, 150, 210].map((offset) => {
			const newH = (hsl.h + offset) % 360;
			const newRgb = hslToRgb(newH, hsl.s, hsl.l);
			return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
		});
	}

	function generateSquare(hex: string): string[] {
		const rgb = hexToRgb(hex);
		const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
		return [0, 90, 180, 270].map((offset) => {
			const newH = (hsl.h + offset) % 360;
			const newRgb = hslToRgb(newH, hsl.s, hsl.l);
			return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
		});
	}

	const palette = $derived.by(() => {
		switch (harmonyType) {
			case 'complementary':
				return generateComplementary(baseColor);
			case 'analogous':
				return generateAnalogous(baseColor);
			case 'triadic':
				return generateTriadic(baseColor);
			case 'monochromatic':
				return generateMonochromatic(baseColor);
			case 'split':
				return generateSplitComplementary(baseColor);
			case 'square':
				return generateSquare(baseColor);
			default:
				return [baseColor];
		}
	});

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

	async function copyAllColors() {
		const colors = palette.join(', ');
		await copyToClipboard(colors, 'all');
	}

	async function exportAsCSS() {
		const css = palette.map((color, i) => `  --color-${i + 1}: ${color};`).join('\n');
		const fullCSS = `:root {\n${css}\n}`;
		await copyToClipboard(fullCSS, 'css');
	}

	async function exportAsJSON() {
		const json = JSON.stringify(palette, null, 2);
		await copyToClipboard(json, 'json');
	}

	// SEO content data
	const seoData = {
		howToSteps: {
			title: 'How to Generate Color Palettes',
			steps: [
				{
					title: 'Choose Your Base Color',
					description:
						'Select a primary color using the color picker or enter a HEX code. This will be the foundation of your color harmony.'
				},
				{
					title: 'Select a Harmony Type',
					description:
						'Choose from complementary (opposite colors), analogous (adjacent colors), triadic (evenly spaced), monochromatic (same hue variations), split-complementary, or square harmonies based on color theory.'
				},
				{
					title: 'Preview Your Palette',
					description:
						'View your generated palette with real-world UI examples showing how the colors work together in buttons, cards, and text.'
				},
				{
					title: 'Export for Your Workflow',
					description:
						'Copy individual colors, export as CSS variables, or download as JSON for use in design systems, Tailwind configs, or style guides.'
				}
			]
		},
		comparison: {
			title: 'Color Harmony Types Explained',
			description:
				'Different harmony types create different moods and visual effects. Choose based on your design goals.',
			headers: ['Harmony Type', 'Best For', 'Visual Effect'],
			rows: [
				{
					label: 'Complementary',
					columns: ['High contrast designs, CTAs', 'Bold, energetic, attention-grabbing']
				},
				{
					label: 'Analogous',
					columns: ['Cohesive, harmonious designs', 'Calm, unified, natural']
				},
				{
					label: 'Triadic',
					columns: ['Vibrant, balanced designs', 'Playful, dynamic, colorful']
				},
				{
					label: 'Monochromatic',
					columns: ['Minimalist, elegant designs', 'Sophisticated, clean, professional']
				},
				{
					label: 'Split-Complementary',
					columns: ['Balanced contrast', 'Vibrant but less tension than complementary']
				},
				{
					label: 'Square',
					columns: ['Complex, rich designs', 'Diverse, balanced, multi-faceted']
				}
			]
		},
		bestPractices: {
			title: 'Best Practices for Color Palettes',
			practices: [
				'Use 60-30-10 rule: 60% dominant color, 30% secondary, 10% accent for balanced designs.',
				'Test accessibility: Ensure sufficient contrast ratios (4.5:1 minimum) between text and background colors.',
				'Limit your palette: Stick to 3-5 colors maximum to maintain visual consistency and avoid overwhelming users.',
				'Consider color psychology: Blues convey trust, reds create urgency, greens suggest growth and health.',
				'Export as CSS variables: Use CSS custom properties for easy theme switching and maintainability.',
				'Test in grayscale: Convert your design to grayscale to ensure it works without relying solely on color.'
			]
		},
		faqs: {
			title: 'Frequently Asked Questions',
			items: [
				{
					question: 'What is the difference between complementary and split-complementary colors?',
					answer:
						'Complementary colors are directly opposite on the color wheel (e.g., blue and orange), creating maximum contrast and visual tension. Split-complementary uses the base color plus the two colors adjacent to its complement, offering high contrast with less tension and more harmony. Split-complementary is often easier to balance in designs.'
				},
				{
					question: 'When should I use monochromatic color schemes?',
					answer:
						'Monochromatic schemes (variations of a single hue) work best for minimalist, elegant, or professional designs. They create a cohesive, sophisticated look and are easier to execute well. Use them for portfolios, corporate sites, or when you want the content to be the focus. Add neutral colors (white, gray, black) for contrast.'
				},
				{
					question: 'How do I export my palette for Tailwind CSS?',
					answer:
						'Use the JSON export option to get your colors as an array. Then add them to your tailwind.config.js file under the colors section. For example: colors: { primary: "#3B82F6", secondary: "#8B5CF6" }. You can also use CSS variables and reference them in Tailwind.'
				},
				{
					question: 'What is the 60-30-10 rule in color design?',
					answer:
						'The 60-30-10 rule is a classic design principle: use your dominant color for 60% of the design (backgrounds, large sections), your secondary color for 30% (supporting elements), and your accent color for 10% (CTAs, highlights). This creates visual hierarchy and balance without overwhelming the user.'
				},
				{
					question: 'Can I use these palettes for print design?',
					answer:
						'These palettes are generated in RGB/HEX format for digital screens. For print, you need to convert to CMYK, which has a smaller color gamut. Some vibrant screen colors will appear duller when printed. Use our main color picker tool to see CMYK values and test print samples before final production.'
				}
			]
		}
	};

	const jsonLdSchema = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'Color Palette Generator',
		applicationCategory: 'DesignApplication',
		operatingSystem: 'Web Browser',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD'
		},
		description:
			'Create perfect color combinations based on color theory rules. Generate complementary, analogous, triadic, and monochromatic palettes.',
		featureList: [
			'Complementary Colors',
			'Analogous Colors',
			'Triadic Colors',
			'Monochromatic Palettes',
			'Split-Complementary',
			'Square Harmony',
			'CSS Export',
			'JSON Export',
			'Real-time Preview'
		]
	};
</script>

<svelte:head>
	<JsonLd data={jsonLdSchema} />
</svelte:head>

<div class="flex flex-col gap-8">
	<PageHeader
		title="Color Palette Generator"
		description="Create perfect color combinations based on color theory rules. Generate complementary, analogous, triadic, and monochromatic palettes."
	/>

	<section aria-label="Palette generator interface">
		<!-- Base Color Selection -->
		<BaseColorPicker
			{baseColor}
			onColorChange={(color) => (baseColor = color)}
			onColorInput={handleColorInput}
		>
			<HarmonySelector
				{harmonies}
				selectedHarmony={harmonyType}
				onSelectHarmony={(type) => (harmonyType = type)}
			/>
		</BaseColorPicker>

		<!-- Generated Palette -->
		<PaletteDisplay
			{palette}
			{baseColor}
			{copiedField}
			onCopyColor={(color) => copyToClipboard(color, color)}
			onCopyAll={copyAllColors}
		/>

		<!-- Export Options -->
		<ExportOptions {palette} {copiedField} onExportCSS={exportAsCSS} onExportJSON={exportAsJSON} />

		<!-- Preview Section -->
		<PalettePreview {palette} />
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
			title="Color Harmony Systems for Brand Design"
			description="Create cohesive brand color systems using color theory."
			toolName="Palette Generator"
			hookText="Professional designers use color harmony rules to create cohesive brands. Master these principles to elevate your design work."
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
