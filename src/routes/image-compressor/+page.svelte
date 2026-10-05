<script lang="ts">
	import { CTA, JsonLd, LeadMagnetInline, PageHeader, SeoContent } from '$lib/shared/components';
	import CompressorForm from './components/CompressorForm.svelte';

	// SEO content data
	const seoData = {
		howToSteps: {
			title: 'How to Compress Images Online',
			steps: [
				{
					title: 'Upload Your Images',
					description:
						'Drag and drop or click to upload JPG, PNG, GIF, or WebP images. You can compress multiple images at once for batch processing. All compression happens in your browser—images never leave your device.'
				},
				{
					title: 'Choose Compression Level',
					description:
						'Select your desired quality level. Higher compression = smaller file size but slight quality loss. Use the preview to compare original vs. compressed images before downloading.'
				},
				{
					title: 'Preview and Compare',
					description:
						'View side-by-side comparison of original and compressed images. Check the file size reduction percentage and ensure quality meets your needs. Adjust compression if needed.'
				},
				{
					title: 'Download Optimized Images',
					description:
						'Download individual images or all at once as a ZIP file. Use optimized images on your website to improve loading speed, SEO rankings, and user experience.'
				}
			]
		},
		comparison: {
			title: 'Lossy vs. Lossless Compression: Which Should You Use?',
			description:
				'Understanding compression types helps you balance file size and image quality for your specific use case.',
			headers: ['Feature', 'Lossy Compression', 'Lossless Compression'],
			rows: [
				{
					label: 'File Size Reduction',
					columns: ['60-80% smaller', '10-30% smaller']
				},
				{
					label: 'Quality',
					columns: ['Slight quality loss (often imperceptible)', 'No quality loss (pixel-perfect)']
				},
				{
					label: 'Best For',
					columns: ['Web images, social media, thumbnails', 'Logos, graphics, print materials']
				},
				{
					label: 'Formats',
					columns: ['JPEG, WebP (lossy mode)', 'PNG, GIF, WebP (lossless mode)']
				},
				{
					label: 'Reversible',
					columns: ['No (data is permanently removed)', 'Yes (can decompress to original)']
				},
				{
					label: 'Use Case',
					columns: ['Photos, hero images, blog posts', 'Logos, icons, screenshots with text']
				}
			]
		},
		bestPractices: {
			title: 'Why Compress Images? (Core Web Vitals & SEO)',
			practices: [
				'Improve Page Speed: Large images are the #1 cause of slow websites. Compressed images load faster, improving user experience and reducing bounce rates.',
				'Boost SEO Rankings: Google uses Core Web Vitals (LCP, FID, CLS) as ranking factors. Optimized images improve LCP (Largest Contentful Paint) scores.',
				'Save Bandwidth: Smaller images reduce server bandwidth costs and data usage for mobile users, especially in regions with slow internet.',
				'Better Mobile Experience: Mobile users on 3G/4G connections benefit most from compressed images. Faster loading = higher engagement.',
				'Use Modern Formats: WebP offers 25-35% better compression than JPEG/PNG. Use WebP with JPEG/PNG fallbacks for older browsers.',
				"Compress Before Upload: Always compress images before uploading to your CMS (WordPress, Shopify). Don't rely solely on server-side compression."
			]
		},
		faqs: {
			title: 'Frequently Asked Questions',
			items: [
				{
					question: 'Will compressing images reduce quality?',
					answer:
						'It depends on the compression level. Lossy compression (JPEG, WebP) reduces file size by 60-80% with minimal visible quality loss. Lossless compression (PNG) maintains perfect quality but offers less size reduction (10-30%). Our tool lets you preview and adjust compression to find the perfect balance.'
				},
				{
					question: 'What image formats are supported?',
					answer:
						'We support all major web image formats: JPEG/JPG, PNG, GIF, and WebP. WebP is recommended for modern websites as it offers superior compression while maintaining quality. Our tool can convert between formats during compression.'
				},
				{
					question: 'Is my image data safe and private?',
					answer:
						'Yes! All image compression happens entirely in your browser using JavaScript. Your images are never uploaded to our servers, stored in any database, or transmitted over the internet. Your data remains 100% private and secure on your device.'
				},
				{
					question: 'How much can I compress images without losing quality?',
					answer:
						'For JPEG photos, you can typically compress by 60-70% without noticeable quality loss. For PNG graphics with transparency, 20-40% compression is safe. Use our preview feature to compare before/after and find the optimal compression level for your needs.'
				},
				{
					question: 'Will compressed images improve my website SEO?',
					answer:
						'Yes! Google uses page speed as a ranking factor, and images are often the largest files on a page. Compressed images improve Core Web Vitals scores (especially LCP - Largest Contentful Paint), which directly impacts SEO rankings. Faster sites also have lower bounce rates and higher engagement.'
				}
			]
		}
	};

	const jsonLdSchema = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'Online Image Compressor',
		applicationCategory: 'MultimediaApplication',
		operatingSystem: 'Web Browser',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD'
		},
		description:
			'Compress images by up to 80% without losing quality. Supports JPG, PNG, GIF, and WebP. Improve website speed and SEO instantly. Private client-side compression.',
		featureList: [
			'Image Compression',
			'JPEG Compression',
			'PNG Compression',
			'WebP Compression',
			'GIF Compression',
			'Batch Processing',
			'Quality Control',
			'Preview Comparison',
			'Lossy Compression',
			'Lossless Compression',
			'Client-Side Processing',
			'No Upload Required',
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
		title="Free Online Image Compressor"
		description="Compress images by up to 80% without losing quality. Supports JPG, PNG, GIF, and WebP. Improve website speed and SEO instantly—all processing happens in your browser."
	/>

	<CompressorForm />

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
			title="Download: The Website Speed Optimization Checklist"
			description="Complete guide to optimizing images, Core Web Vitals, and page speed for better SEO rankings."
			toolName="Image Compressor"
			hookText="Slow images cost you money. Learn how to optimize images for web performance, improve Core Web Vitals scores, and boost SEO rankings. Includes tools, techniques, and benchmarks."
			buttonText="Download Free Checklist"
		/>
	</div>

	<!-- Conversion CTA -->
	<div class="mt-10">
		<CTA
			title="Is Your Website Still Slow?"
			description="Image compression is just one step. We optimize Core Web Vitals, server response times, and React rendering for lightning-fast websites."
			buttonText="Hire Performance Experts"
			buttonUrl="https://www.devxhub.com/full-stack-development"
		/>
	</div>
</div>
