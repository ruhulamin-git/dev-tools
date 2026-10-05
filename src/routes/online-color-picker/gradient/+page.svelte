<script lang="ts">
	import { base } from '$app/paths';
	import {
		Card,
		CTA,
		JsonLd,
		LeadMagnetInline,
		PageHeader,
		SeoContent
	} from '$lib/shared/components';
	import { isValidHex, normalizeHex } from '$lib/shared/utils';
	import {
		CSSCodeDisplay,
		GradientPresets,
		GradientPreview,
		GradientSettings,
		GradientStopsTrack,
		StopControls
	} from '../components/gradient';

	interface GradientStop {
		color: string;
		position: number;
	}

	let stops = $state<GradientStop[]>([
		{ color: '#8B5CF6', position: 0 },
		{ color: '#3B82F6', position: 50 },
		{ color: '#EC4899', position: 100 }
	]);
	let angle = $state(135);
	let gradientType = $state<'linear' | 'radial'>('linear');
	let selectedStopIndex = $state(1);
	let copiedField = $state<string | null>(null);

	const gradientCSS = $derived.by(() => {
		const sortedStops = [...stops].sort((a, b) => a.position - b.position);
		const stopsStr = sortedStops.map((s) => `${s.color} ${s.position}%`).join(', ');
		if (gradientType === 'linear') {
			return `linear-gradient(${angle}deg, ${stopsStr})`;
		}
		return `radial-gradient(circle, ${stopsStr})`;
	});

	const presets = [
		{ colors: ['#FF9A9E', '#FECFEF'], angle: 135 },
		{ colors: ['#84fab0', '#8fd3f4'], angle: 120 },
		{ colors: ['#e0c3fc', '#8ec5fc'], angle: 120 },
		{ colors: ['#f093fb', '#f5576c'], angle: 120 },
		{ colors: ['#43e97b', '#38f9d7'], angle: 90 },
		{ colors: ['#5ee7df', '#b490ca'], angle: 0 },
		{ colors: ['#30cfd0', '#330867'], angle: 0 },
		{ colors: ['#accbee', '#e7f0fd'], angle: 0 },
		{ colors: ['#2CD8D5', '#C5C1FF', '#FFBAC3'], angle: -45 },
		{ colors: ['#FF057C', '#8D0B93', '#321575'], angle: -45 },
		{ colors: ['#0ba360', '#3cba92'], angle: 0 },
		{ colors: ['#667eea', '#764ba2'], angle: 135 }
	];

	function applyPreset(preset: { colors: string[]; angle: number }) {
		const newStops = preset.colors.map((color, i) => ({
			color: color.toUpperCase(),
			position: Math.round((i / (preset.colors.length - 1)) * 100)
		}));
		stops = newStops;
		angle = preset.angle < 0 ? 360 + preset.angle : preset.angle;
		selectedStopIndex = 0;
	}

	function addStop() {
		if (stops.length >= 5) return;
		const newPosition = 50;
		stops = [...stops, { color: '#6366F1', position: newPosition }].sort(
			(a, b) => a.position - b.position
		);
		selectedStopIndex = stops.findIndex((s) => s.position === newPosition);
	}

	function removeStop(index: number) {
		// Remove the stop
		const newStops = stops.filter((_, i) => i !== index);
		stops = newStops;

		// Update selectedStopIndex to a valid value
		if (newStops.length === 0) {
			// If no stops left, add a default one
			stops = [{ color: '#3B82F6', position: 50 }];
			selectedStopIndex = 0;
		} else if (selectedStopIndex >= newStops.length) {
			// If selected index is out of bounds, select the last stop
			selectedStopIndex = newStops.length - 1;
		} else if (selectedStopIndex > index) {
			// If we removed a stop before the selected one, adjust index
			selectedStopIndex = selectedStopIndex - 1;
		}
		// If selectedStopIndex === index, it will automatically show the next stop at that position
	}

	function updateStopColor(index: number, color: string) {
		if (isValidHex(color)) {
			const newStops = [...stops];
			newStops[index] = { ...newStops[index], color: normalizeHex(color) };
			stops = newStops;
		}
	}

	function updateStopPosition(index: number, position: number) {
		const newStops = [...stops];
		newStops[index] = { ...newStops[index], position: Math.max(0, Math.min(100, position)) };
		stops = newStops;
	}

	async function copyToClipboard(text: string, field: string) {
		await navigator.clipboard.writeText(text);
		copiedField = field;
		setTimeout(() => (copiedField = null), 2000);
	}

	async function copyCSS() {
		await copyToClipboard(`background: ${gradientCSS};`, 'css');
	}

	// SEO content data
	const seoData = {
		howToSteps: {
			title: 'How to Create CSS Gradients',
			steps: [
				{
					title: 'Add Color Stops',
					description:
						'Click on the gradient track to add color stops (up to 5). Each stop represents a color transition point. Drag stops to adjust their position along the gradient.'
				},
				{
					title: 'Customize Colors',
					description:
						'Select a color stop and use the color picker to change its color. You can also enter HEX codes directly for precise color matching.'
				},
				{
					title: 'Adjust Gradient Type & Angle',
					description:
						'Choose between linear (straight line) or radial (circular) gradients. For linear gradients, adjust the angle (0-360°) to control the direction of the color flow.'
				},
				{
					title: 'Copy CSS Code',
					description:
						'Click "Copy CSS" to get ready-to-use code. Paste it directly into your stylesheet as a background property. Works in all modern browsers.'
				}
			]
		},
		comparison: {
			title: 'Linear vs Radial Gradients',
			description:
				'CSS supports two main gradient types, each creating different visual effects for backgrounds and UI elements.',
			headers: ['Feature', 'Linear Gradient', 'Radial Gradient'],
			rows: [
				{
					label: 'Direction',
					columns: ['Straight line (adjustable angle)', 'Circular/elliptical from center']
				},
				{
					label: 'Best For',
					columns: ['Headers, buttons, cards, backgrounds', 'Spotlights, focus effects, orbs']
				},
				{
					label: 'CSS Syntax',
					columns: ['linear-gradient(135deg, ...)', 'radial-gradient(circle, ...)']
				},
				{
					label: 'Common Use',
					columns: ['More common, versatile', 'Less common, special effects']
				}
			]
		},
		bestPractices: {
			title: 'Best Practices for CSS Gradients',
			practices: [
				'Limit color stops: Use 2-3 colors for clean, professional gradients. Too many stops create muddy, complex visuals.',
				'Consider performance: Complex gradients with many stops can impact rendering performance on mobile devices.',
				'Test accessibility: Ensure text over gradients maintains sufficient contrast (4.5:1 minimum) across all color transitions.',
				'Use subtle angles: 45°, 90°, 135° angles feel more natural than arbitrary values like 73° or 214°.',
				'Avoid pure black/white: Use near-black (#1a1a1a) and off-white (#f5f5f5) for more sophisticated gradients.',
				'Combine with opacity: Layer gradients over images using rgba() colors for overlay effects without blocking content.'
			]
		},
		faqs: {
			title: 'Frequently Asked Questions',
			items: [
				{
					question: 'What is the difference between linear and radial gradients?',
					answer:
						'Linear gradients transition colors along a straight line at a specified angle (e.g., top to bottom, diagonal). Radial gradients transition colors in a circular or elliptical pattern from a center point outward. Linear gradients are more common for backgrounds and UI elements, while radial gradients work well for spotlight effects and focus areas.'
				},
				{
					question: 'How do I create a gradient that goes from top to bottom?',
					answer:
						'For a top-to-bottom gradient, set the angle to 180 degrees. In CSS, this is written as linear-gradient(180deg, #color1, #color2). You can also use the keyword syntax: linear-gradient(to bottom, #color1, #color2). 0° points right, 90° points up, 180° points down, and 270° points left.'
				},
				{
					question: 'Can I animate CSS gradients?',
					answer:
						'CSS gradients cannot be directly animated with transitions or animations. However, you can animate the background-position of a larger gradient, use pseudo-elements with opacity transitions, or animate CSS custom properties (variables) that define gradient colors. For complex gradient animations, consider using JavaScript or CSS animations on overlaid elements.'
				},
				{
					question: 'Why does my gradient look banded or striped?',
					answer:
						'Gradient banding occurs when there are not enough color steps to create a smooth transition, especially in large areas or with similar colors. To reduce banding: (1) Add intermediate color stops, (2) Use colors with more contrast, (3) Add subtle noise textures, or (4) Use dithering techniques. This is more noticeable on low-quality displays.'
				},
				{
					question: 'How do I make a gradient background for text?',
					answer:
						'Use background-clip: text and -webkit-background-clip: text with a transparent text color. Example: background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; This creates a gradient effect on the text itself rather than the background.'
				}
			]
		}
	};

	const jsonLdSchema = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'CSS Gradient Generator',
		applicationCategory: 'DesignApplication',
		operatingSystem: 'Web Browser',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD'
		},
		description:
			'Design custom linear and radial gradients. Manage color stops, preview in real-time, and get ready-to-use CSS code.',
		featureList: [
			'Linear Gradients',
			'Radial Gradients',
			'Color Stop Management',
			'Angle Control',
			'CSS Code Export',
			'Gradient Presets',
			'Real-time Preview',
			'Up to 5 Color Stops'
		]
	};
</script>

<svelte:head>
	<JsonLd data={jsonLdSchema} />
</svelte:head>

<div class="flex flex-col gap-8">
	<!-- Page Header -->
	<PageHeader
		title="CSS Gradient Generator"
		description="Design custom linear and radial gradients, manage color stops, and export ready-to-use CSS code."
	/>

	<section aria-label="Gradient generator interface">
		<div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
			<!-- Left: Gradient Preview & Controls -->
			<div class="flex flex-col gap-6 lg:col-span-8">
				<!-- Gradient Preview -->
				<GradientPreview {gradientCSS} {copiedField} onCopyCSS={copyCSS} />

				<!-- Gradient Controls -->
				<Card class="flex flex-col gap-6 p-6">
					<!-- Gradient Stops Track -->
					<GradientStopsTrack
						{stops}
						{selectedStopIndex}
						onAddStop={addStop}
						onSelectStop={(i) => (selectedStopIndex = i)}
						onUpdateStopPosition={updateStopPosition}
					/>

					<div class="h-px w-full bg-slate-200"></div>

					<!-- Selected Stop Controls -->
					<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
						{#if stops[selectedStopIndex]}
							<StopControls
								stop={stops[selectedStopIndex]}
								canRemove={true}
								onUpdateColor={(color) => updateStopColor(selectedStopIndex, color)}
								onUpdatePosition={(position) => updateStopPosition(selectedStopIndex, position)}
								onRemove={() => removeStop(selectedStopIndex)}
							/>

							<!-- Gradient Settings -->
							<GradientSettings
								{gradientType}
								bind:angle
								onTypeChange={(type) => (gradientType = type)}
								onAngleChange={(newAngle) => (angle = newAngle)}
							/>
						{/if}
					</div>
				</Card>
			</div>

			<!-- Right: CSS Code & Presets -->
			<div class="flex flex-col gap-6 lg:col-span-4">
				<!-- CSS Code -->
				<CSSCodeDisplay {gradientCSS} {copiedField} onCopyCSS={copyCSS} />

				<!-- Presets -->
				<GradientPresets {presets} onApplyPreset={applyPreset} />
			</div>
		</div>

		<!-- Navigation -->
		<div class="mt-5 flex flex-wrap justify-center gap-4">
			<a
				href="{base}/online-color-picker"
				class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
			>
				← Color Picker
			</a>
			<a
				href="{base}/online-color-picker/shades"
				class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
			>
				Shades & Tints
			</a>
			<a
				href="{base}/online-color-picker/named-colors"
				class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
			>
				Named Colors →
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
			title="CSS Gradient Mastery: From Basics to Advanced Animations"
			description="Create stunning gradients without sacrificing performance."
			toolName="Gradient Generator"
			hookText="Gradients can make or break your design. Learn advanced CSS techniques that create stunning visuals without sacrificing performance."
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
