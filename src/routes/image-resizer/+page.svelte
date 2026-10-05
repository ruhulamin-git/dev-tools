<script lang="ts">
	import { CTA, JsonLd, LeadMagnetInline, PageHeader, SeoContent } from '$lib/shared/components';
	import {
		ImageComparison,
		ImageCrop,
		ImagePreview,
		ImageResize,
		imageResizeStore,
		ImageRotateFlip,
		ImageUpload
	} from './components';

	// SEO content data
	const seoData = {
		howToSteps: {
			title: 'How to Resize Images Online',
			steps: [
				{
					title: 'Upload Your Image',
					description:
						'Drag and drop or click to upload JPG, PNG, GIF, or WebP images. All processing happens in your browser—images never leave your device for complete privacy.'
				},
				{
					title: 'Choose Resize Method',
					description:
						'Resize by percentage (50%, 200%), specific pixel dimensions (1920x1080), or select from social media presets (Facebook cover, Instagram post, LinkedIn banner). Lock aspect ratio to prevent distortion.'
				},
				{
					title: 'Crop and Rotate (Optional)',
					description:
						'Crop to remove unwanted areas or focus on specific parts. Rotate 90°, 180°, or 270°. Flip horizontally or vertically. Perfect for profile pictures and banners.'
				},
				{
					title: 'Preview and Download',
					description:
						'Compare original vs. resized image side-by-side. Check dimensions and file size. Download in your preferred format (JPG, PNG, WebP) with quality control.'
				}
			]
		},
		comparison: {
			title: 'Common Social Media Image Sizes',
			description:
				'Use these exact dimensions to ensure your images display perfectly on social media platforms without cropping or distortion.',
			headers: ['Platform', 'Image Type', 'Dimensions (pixels)'],
			rows: [
				{
					label: 'Facebook',
					columns: ['Cover Photo, Profile Picture, Post', '820 x 312, 180 x 180, 1200 x 630']
				},
				{
					label: 'Instagram',
					columns: ['Post (Square), Story, Reel', '1080 x 1080, 1080 x 1920, 1080 x 1920']
				},
				{
					label: 'LinkedIn',
					columns: ['Banner, Profile Picture, Post', '1584 x 396, 400 x 400, 1200 x 627']
				},
				{
					label: 'Twitter/X',
					columns: ['Header, Profile Picture, Post', '1500 x 500, 400 x 400, 1200 x 675']
				},
				{
					label: 'YouTube',
					columns: ['Thumbnail, Channel Art', '1280 x 720, 2560 x 1440']
				},
				{
					label: 'Pinterest',
					columns: ['Pin (Standard), Pin (Long)', '1000 x 1500, 1000 x 2100']
				}
			]
		},
		bestPractices: {
			title: 'How to Resize Without Distortion (Aspect Ratio Guide)',
			practices: [
				'Lock Aspect Ratio: Always enable "Lock Aspect Ratio" when resizing to prevent stretching or squashing. This maintains the original proportions.',
				'Understand Aspect Ratios: 16:9 (widescreen), 4:3 (standard), 1:1 (square), 9:16 (vertical). Choose the right ratio for your platform.',
				"Crop Before Resize: If your image doesn't match the target aspect ratio, crop first to remove unwanted areas, then resize to exact dimensions.",
				'Resize Down, Not Up: Enlarging images (upscaling) reduces quality. Always start with high-resolution originals and resize down.',
				'Use Presets for Social Media: Our tool includes presets for Facebook, Instagram, LinkedIn, and Twitter to ensure perfect dimensions.',
				'Export in the Right Format: Use JPG for photos (smaller file size), PNG for graphics with transparency, WebP for modern websites (best compression).'
			]
		},
		faqs: {
			title: 'Frequently Asked Questions',
			items: [
				{
					question: 'What is aspect ratio and why does it matter?',
					answer:
						'Aspect ratio is the proportional relationship between width and height (e.g., 16:9, 4:3, 1:1). It matters because resizing without maintaining aspect ratio causes distortion—images appear stretched or squashed. Always lock aspect ratio when resizing to preserve the original proportions.'
				},
				{
					question: 'Can I resize images for social media?',
					answer:
						'Yes! Our tool includes presets for all major social media platforms: Facebook cover (820x312), Instagram post (1080x1080), LinkedIn banner (1584x396), Twitter header (1500x500), and more. Select a preset to automatically resize to the correct dimensions.'
				},
				{
					question: 'Will resizing reduce image quality?',
					answer:
						'Resizing down (making images smaller) maintains quality well. Resizing up (enlarging) reduces quality because new pixels are interpolated. For best results, always start with high-resolution originals and resize down to your target dimensions.'
				},
				{
					question: "What's the difference between crop and resize?",
					answer:
						"Cropping removes parts of the image to change composition or aspect ratio. Resizing changes the overall dimensions while keeping all content. Often you'll crop first to get the right aspect ratio, then resize to exact pixel dimensions."
				},
				{
					question: 'Is my image data safe and private?',
					answer:
						'Yes! All image processing happens entirely in your browser using JavaScript. Your images are never uploaded to our servers, stored in any database, or transmitted over the internet. Your data remains 100% private and secure on your device.'
				}
			]
		}
	};

	const jsonLdSchema = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'Online Image Resizer',
		applicationCategory: 'MultimediaApplication',
		operatingSystem: 'Web Browser',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD'
		},
		description:
			'Resize images to specific pixel dimensions or percentages. Crop and rotate photos for social media headers, profile pictures, and web banners.',
		featureList: [
			'Image Resizing',
			'Crop Images',
			'Rotate Images',
			'Flip Images',
			'Aspect Ratio Lock',
			'Social Media Presets',
			'Percentage Resize',
			'Pixel Resize',
			'Format Conversion',
			'Quality Control',
			'Preview Comparison',
			'Client-Side Processing',
			'Privacy Focused',
			'Free to Use'
		],
		screenshot: 'https://www.devxhub.com/preview.png',
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

<!-- SEO handled by /tools/+layout.svelte -->

<div class="mx-auto">
	<PageHeader
		title="Free Online Image Resizer"
		description="Resize images to specific pixel dimensions or percentages. Crop and rotate photos for social media headers, profile pictures, and web banners—all processing happens in your browser."
	/>

	{#if !imageResizeStore.image.originalImage}
		<div class="mb-8 flex justify-center">
			<div class="w-full max-w-xl">
				<ImageUpload />
			</div>
		</div>
	{:else}
		<div class="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
			<aside class="space-y-6" aria-label="Image editing controls">
				<ImageUpload />
				<ImageCrop />
				<ImageRotateFlip />
				<ImageResize />
			</aside>

			<section class="space-y-6" aria-label="Image preview and comparison">
				<ImagePreview />
				<ImageComparison />
			</section>
		</div>

		<!-- Conditional Upsell: Image Compressor -->
		{#if imageResizeStore.image.resizedImageUrl}
			<div
				class="mb-8 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20"
			>
				<div class="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
					<div class="flex flex-1 items-start gap-3">
						<svg
							class="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
							/>
						</svg>
						<div class="flex-1">
							<h3 class="mb-1 text-sm font-semibold text-blue-900 dark:text-blue-300">
								🚀 Resized your image? Now optimize it for the web!
							</h3>
							<p class="text-sm text-blue-700 dark:text-blue-400">
								Reduce file size by up to 90% without losing quality. Perfect for faster website
								loading and better SEO.
							</p>
						</div>
					</div>
					<a
						href="https://www.devxhub.com/tools/image-compressor"
						class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold whitespace-nowrap text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
					>
						Try Image Compressor
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 7l5 5m0 0l-5 5m5-5H6"
							/>
						</svg>
					</a>
				</div>
			</div>
		{/if}
	{/if}

	<!-- SEO Content Section -->
	<div class="mt-10">
		<SeoContent
			howToSteps={seoData.howToSteps}
			comparison={seoData.comparison}
			bestPractices={seoData.bestPractices}
			faqs={seoData.faqs}
		/>
	</div>

	<!-- Lead Magnet -->
	<div class="mt-10">
		<LeadMagnetInline
			title="Download: The 2025 Social Media Image Size Cheat Sheet"
			description="Complete guide to image dimensions for all major social media platforms. Never get cropped awkwardly again."
			toolName="Image Resizer"
			hookText="Social media dimensions change constantly. This comprehensive guide includes Facebook, Instagram, LinkedIn, Twitter, YouTube, Pinterest, and TikTok specs. Includes aspect ratios, file size limits, and best practices."
			buttonText="Download Free Cheat Sheet"
		/>
	</div>

	<!-- Conversion CTA -->
	<div class="mt-10">
		<CTA
			title="Need a Consistent Brand Identity?"
			description="Our UI/UX team creates comprehensive design systems and brand assets for startups and enterprises. From logos to complete style guides."
			buttonText="Hire UI/UX Designers"
			buttonUrl="https://www.devxhub.com/mobile-application-development"
		/>
	</div>
</div>
