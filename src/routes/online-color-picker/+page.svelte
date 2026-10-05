<script lang="ts">
	import { CTA, JsonLd, LeadMagnetInline, PageHeader, SeoContent } from '$lib/shared/components';
	import {
		addToColorHistory,
		clearColorHistory,
		generateAnalogous,
		generateShades,
		generateTints,
		getColorHistory,
		getContrastRatio,
		hexToRgb,
		hexToRgba,
		hslaToString,
		hslToRgb,
		isValidHex,
		normalizeHex,
		rgbaToString,
		rgbToCmyk,
		rgbToHex,
		rgbToHsl,
		rgbToHsla
	} from '$lib/shared/utils';
	import {
		ColorFormats,
		ColorHarmonies,
		ColorHistory,
		ColorPickerCanvas,
		ContrastChecker,
		CurrentColorDisplay,
		QuickLinks,
		TintsAndShades
	} from './components';

	let selectedColor = $state('#3B82F6');
	let alpha = $state(1);
	let hue = $state(217);
	let saturationValue = $state(100); // For the SV picker (0-100)
	let brightnessValue = $state(96); // For the SV picker (0-100)
	let copiedField = $state<string | null>(null);
	let isDragging = $state(false);
	let pickerRef = $state<HTMLDivElement | null>(null);
	let colorHistory = $state<string[]>([]);

	// Load history on mount
	$effect(() => {
		colorHistory = getColorHistory();
	});

	// Derived values
	const rgb = $derived(hexToRgb(selectedColor));
	const rgba = $derived(hexToRgba(selectedColor, alpha));
	const hsl = $derived(rgbToHsl(rgb.r, rgb.g, rgb.b));
	const hsla = $derived(rgbToHsla(rgb.r, rgb.g, rgb.b, alpha));
	const cmyk = $derived(rgbToCmyk(rgb.r, rgb.g, rgb.b));
	const rgbaString = $derived(rgbaToString(rgb.r, rgb.g, rgb.b, alpha));
	const hslaString = $derived(hslaToString(hsl.h, hsl.s, hsl.l, alpha));
	const contrastWhite = $derived(getContrastRatio(selectedColor, '#FFFFFF'));
	const contrastBlack = $derived(getContrastRatio(selectedColor, '#000000'));
	const analogousColors = $derived(generateAnalogous(selectedColor));
	const tints = $derived(generateTints(selectedColor, 5));
	const shades = $derived(generateShades(selectedColor, 5));

	// Pure hue color for the gradient background
	const pureHueColor = $derived.by(() => {
		const rgb = hslToRgb(hue, 100, 50);
		return rgbToHex(rgb.r, rgb.g, rgb.b);
	});

	// Convert HSV to RGB and update selected color
	function updateColorFromHSV() {
		// HSV to RGB conversion
		const h = hue / 360;
		const s = saturationValue / 100;
		const v = brightnessValue / 100;

		let r, g, b;
		const i = Math.floor(h * 6);
		const f = h * 6 - i;
		const p = v * (1 - s);
		const q = v * (1 - f * s);
		const t = v * (1 - (1 - f) * s);

		switch (i % 6) {
			case 0:
				r = v;
				g = t;
				b = p;
				break;
			case 1:
				r = q;
				g = v;
				b = p;
				break;
			case 2:
				r = p;
				g = v;
				b = t;
				break;
			case 3:
				r = p;
				g = q;
				b = v;
				break;
			case 4:
				r = t;
				g = p;
				b = v;
				break;
			case 5:
				r = v;
				g = p;
				b = q;
				break;
			default:
				r = 0;
				g = 0;
				b = 0;
		}

		selectedColor = rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
	}

	function handlePickerInteraction(e: MouseEvent | TouchEvent) {
		if (!pickerRef) return;

		const rect = pickerRef.getBoundingClientRect();
		const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
		const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

		const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
		const y = Math.max(0, Math.min(clientY - rect.top, rect.height));

		saturationValue = Math.round((x / rect.width) * 100);
		brightnessValue = Math.round(100 - (y / rect.height) * 100);
	}

	function handlePickerMouseDown(e: MouseEvent) {
		isDragging = true;
		handlePickerInteraction(e);
	}

	function handlePickerMouseMove(e: MouseEvent) {
		if (isDragging) {
			handlePickerInteraction(e);
		}
	}

	function handlePickerMouseUp() {
		isDragging = false;
	}

	function handleHexInput(e: Event) {
		const target = e.target as HTMLInputElement;
		let value = target.value.toUpperCase();
		if (!value.startsWith('#')) value = '#' + value;
		if (isValidHex(value)) {
			selectedColor = normalizeHex(value);
			// Update HSV values from the new color
			const newRgb = hexToRgb(selectedColor);
			const r = newRgb.r / 255;
			const g = newRgb.g / 255;
			const b = newRgb.b / 255;
			const max = Math.max(r, g, b);
			const min = Math.min(r, g, b);
			const d = max - min;

			brightnessValue = Math.round(max * 100);
			saturationValue = max === 0 ? 0 : Math.round((d / max) * 100);

			if (d !== 0) {
				let h = 0;
				switch (max) {
					case r:
						h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
						break;
					case g:
						h = ((b - r) / d + 2) / 6;
						break;
					case b:
						h = ((r - g) / d + 4) / 6;
						break;
				}
				hue = Math.round(h * 360);
			}
		}
	}

	async function copyToClipboard(text: string, field: string) {
		await navigator.clipboard.writeText(text);
		copiedField = field;
		setTimeout(() => (copiedField = null), 2000);
	}

	function selectFromHistory(hex: string) {
		selectedColor = hex;
		// Update HSV values from the selected color
		const newRgb = hexToRgb(hex);
		const r = newRgb.r / 255;
		const g = newRgb.g / 255;
		const b = newRgb.b / 255;
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		const d = max - min;

		brightnessValue = Math.round(max * 100);
		saturationValue = max === 0 ? 0 : Math.round((d / max) * 100);

		if (d !== 0) {
			let h = 0;
			switch (max) {
				case r:
					h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
					break;
				case g:
					h = ((b - r) / d + 2) / 6;
					break;
				case b:
					h = ((r - g) / d + 4) / 6;
					break;
			}
			hue = Math.round(h * 360);
		}
	}

	function handleClearHistory() {
		clearColorHistory();
		colorHistory = [];
	}

	// Update color when HSV values change
	$effect(() => {
		updateColorFromHSV();
	});

	// Add to history when color changes
	$effect(() => {
		addToColorHistory(selectedColor);
	});

	// SEO content data
	const seoData = {
		howToSteps: {
			title: 'How to Use the Color Picker Tool',
			steps: [
				{
					title: 'Pick a Color',
					description:
						'Click anywhere on the color canvas to select your desired color. Drag the hue slider to change the base color, then fine-tune saturation and brightness on the canvas.'
				},
				{
					title: 'Adjust Transparency',
					description:
						'Use the alpha slider to control opacity (0-100%). Perfect for creating semi-transparent overlays or background colors with RGBA/HSLA values.'
				},
				{
					title: 'Copy Color Codes',
					description:
						'Click the copy button next to any color format (HEX, RGB, HSL, CMYK) to instantly copy the value to your clipboard for use in CSS, design tools, or code.'
				},
				{
					title: 'Check Contrast & Generate Palettes',
					description:
						'View contrast ratios against white and black backgrounds to ensure WCAG accessibility compliance. Explore color harmonies, tints, and shades for complete palette generation.'
				}
			]
		},
		comparison: {
			title: 'Understanding Color Formats: HEX vs RGB vs HSL vs CMYK',
			description:
				'Different color formats serve different purposes in design and development. Choose the right format for your workflow.',
			headers: ['Format', 'Use Case', 'Example'],
			rows: [
				{
					label: 'HEX',
					columns: ['Web design & CSS (most common)', '#FF5733']
				},
				{
					label: 'RGB',
					columns: ['Screen displays, digital design', 'rgb(255, 87, 51)']
				},
				{
					label: 'HSL',
					columns: ['Adjusting shades, designer-friendly', 'hsl(9, 100%, 60%)']
				},
				{
					label: 'CMYK',
					columns: ['Print design (offset printing)', 'cmyk(0%, 66%, 80%, 0%)']
				}
			]
		},
		bestPractices: {
			title: 'Best Practices for Color Selection & Accessibility',
			practices: [
				'Ensure sufficient contrast: Text should have a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text (WCAG AA standard).',
				'Use HSL for color variations: HSL makes it easier to create lighter/darker versions of a color by adjusting the lightness value.',
				'Test on multiple devices: Colors appear differently on various screens due to calibration and display technology.',
				'Consider color blindness: Use tools to simulate how your colors appear to users with color vision deficiencies.',
				'Limit your palette: Stick to 2-3 primary colors and 2-3 accent colors for a cohesive design system.',
				'Use CMYK for print: Convert RGB/HEX colors to CMYK before sending designs to print to avoid color shifts.'
			]
		},
		faqs: {
			title: 'Frequently Asked Questions',
			items: [
				{
					question: 'What is the difference between HEX and RGB?',
					answer:
						'HEX and RGB represent the same colors but in different formats. HEX uses hexadecimal notation (#FF5733), while RGB uses decimal values (rgb(255, 87, 51)). HEX is more compact and commonly used in CSS, while RGB is more human-readable and easier to adjust programmatically.'
				},
				{
					question: 'How do I create a gradient in CSS?',
					answer:
						'CSS gradients use the linear-gradient() or radial-gradient() functions. For example: background: linear-gradient(to right, #FF5733, #3B82F6); creates a horizontal gradient from orange to blue. Use our gradient generator tool to visually create and copy CSS gradient code.'
				},
				{
					question: 'What is WCAG contrast ratio and why does it matter?',
					answer:
						'WCAG (Web Content Accessibility Guidelines) defines minimum contrast ratios to ensure text is readable for users with visual impairments. Level AA requires 4.5:1 for normal text and 3:1 for large text. Level AAA requires 7:1 and 4.5:1 respectively. Our contrast checker helps you meet these standards.'
				},
				{
					question: 'When should I use HSL instead of RGB?',
					answer:
						'HSL (Hue, Saturation, Lightness) is preferred when you need to create color variations. Adjusting the lightness value makes it easy to create tints (lighter) and shades (darker) of the same color. Designers often find HSL more intuitive than RGB for color manipulation.'
				},
				{
					question: 'Can I use these colors for print design?',
					answer:
						'For print, you should convert RGB/HEX colors to CMYK (Cyan, Magenta, Yellow, Key/Black). Our tool shows the CMYK equivalent, but note that RGB has a wider color gamut than CMYK, so some vibrant screen colors may appear duller when printed.'
				},
				{
					question: 'What are color harmonies and how do I use them?',
					answer:
						'Color harmonies are combinations of colors that are aesthetically pleasing based on color theory. Analogous colors (adjacent on the color wheel) create harmonious, cohesive designs. Complementary colors (opposite on the wheel) create high contrast and visual interest. Our tool generates these automatically.'
				}
			]
		}
	};

	const jsonLdSchema = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'Advanced Color Picker & Palette Generator',
		applicationCategory: 'DesignApplication',
		operatingSystem: 'Web Browser',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD'
		},
		description:
			'Pick colors, generate palettes, and create CSS gradients instantly. Convert between HEX, RGB, HSL, and CMYK. Test contrast ratios for accessibility.',
		featureList: [
			'Color Picker Canvas',
			'HEX to RGB Converter',
			'RGB to HSL Converter',
			'CMYK Color Values',
			'Contrast Ratio Checker',
			'WCAG Compliance Testing',
			'Color Harmonies Generator',
			'Tints and Shades',
			'Gradient Generator',
			'Palette Generator',
			'Color History',
			'One-Click Copy'
		],
		screenshot: 'https://www.devxhub.com/social-share-images/Devxhub-_ColorPicker.png',
		softwareVersion: '1.0',
		author: {
			'@type': 'Organization',
			name: 'Devxhub',
			url: 'https://www.devxhub.com'
		}
	};
</script>

<svelte:head>
	<JsonLd data={jsonLdSchema} />
</svelte:head>

<svelte:window onmousemove={handlePickerMouseMove} onmouseup={handlePickerMouseUp} />

<div class="flex flex-col gap-8">
	<!-- Page Header -->
	<PageHeader
		title="Online Color Picker and Palette Generator"
		description="Pick colors, generate palettes, and create CSS gradients instantly. Convert between HEX, RGB, HSL, and CMYK. Test contrast ratios for accessibility."
	/>

	<section aria-label="Color picker interface">
		<!-- Main Color Picker Section -->
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
			<!-- Left: Visual Picker -->
			<div class="flex flex-col gap-4 lg:col-span-5">
				<ColorPickerCanvas
					bind:hue
					bind:pickerRef
					{saturationValue}
					{brightnessValue}
					{alpha}
					{selectedColor}
					{pureHueColor}
					onPickerMouseDown={handlePickerMouseDown}
					onAlphaChange={(value) => (alpha = value)}
				/>

				<CurrentColorDisplay
					{selectedColor}
					{alpha}
					{copiedField}
					onCopy={() => copyToClipboard(selectedColor, 'main')}
				/>
			</div>

			<!-- Right: Color Values & Contrast -->
			<div class="flex flex-col gap-6 lg:col-span-7">
				<ColorFormats
					{selectedColor}
					{rgb}
					{hsl}
					{cmyk}
					{rgbaString}
					{hslaString}
					{copiedField}
					onHexInput={handleHexInput}
					onCopy={copyToClipboard}
				/>

				<ContrastChecker {selectedColor} {contrastWhite} {contrastBlack} />
			</div>
		</div>

		<!-- Recent Colors History -->
		<ColorHistory
			{colorHistory}
			onSelectColor={selectFromHistory}
			onClearHistory={handleClearHistory}
		/>

		<!-- Color Harmonies -->
		<ColorHarmonies {analogousColors} {selectedColor} onSelectColor={selectFromHistory} />

		<!-- Shades & Tints -->
		<TintsAndShades {tints} {shades} onCopy={copyToClipboard} />

		<!-- Quick Links -->
		<QuickLinks />
	</section>

	<!-- Internal Linking - Image Compressor Upsell -->
	<div
		class="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20"
	>
		<div class="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
			<div class="flex-1">
				<h3 class="mb-1 text-sm font-semibold text-blue-900 dark:text-blue-300">
					🖼️ Working with heavy images?
				</h3>
				<p class="text-sm text-blue-700 dark:text-blue-400">
					Optimize them first with our Image Compressor to reduce file size without losing quality.
				</p>
			</div>
			<a
				href="https://www.devxhub.com/tools/image-compressor"
				class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold whitespace-nowrap text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 7l5 5m0 0l-5 5m5-5H6"
					/>
				</svg>
				Compress Images
			</a>
		</div>
	</div>

	<!-- SEO Content Section -->
	<div class="mt-10">
		<SeoContent
			howToSteps={seoData.howToSteps}
			comparison={seoData.comparison}
			bestPractices={seoData.bestPractices}
			faqs={seoData.faqs}
		/>
	</div>

	<div class="mt-10">
		<LeadMagnetInline
			title="The 2026 UI/UX Color Psychology Handbook"
			description="Master color psychology, accessibility, and brand color systems."
			toolName="Color Picker & Converter"
			hookText="Designers and frontend devs often pick colors that look good but fail accessibility standards."
		/>
	</div>

	<div class="mt-10">
		<CTA
			title="Need a pixel-perfect UI implementation?"
			description="Translating Figma to React is hard. Our frontend team builds pixel-perfect, responsive component libraries."
			buttonText="Hire Frontend Developers"
			buttonUrl="https://www.devxhub.com/full-stack-development"
		/>
	</div>
</div>
