<script lang="ts">
	import { base } from '$app/paths';
	import { ArrowRight } from '$lib/shared/icons';

	interface Props {
		title?: string;
		description?: string;
		buttonText?: string;
		buttonUrl?: string;
		buttonAriaLabel?: string;
		buttonOnClick?: () => void;
		secondaryButtonText?: string;
		secondaryButtonUrl?: string;
		secondaryButtonAriaLabel?: string;
		imageSrc?: string;
	}

	const {
		title = 'Need Custom Development?',
		description = "Let's build something amazing together",
		buttonText = 'Contact Devxhub',
		buttonUrl = 'https://www.devxhub.com/contact',
		buttonAriaLabel = 'Contact Devxhub for custom development services',
		buttonOnClick,
		secondaryButtonText,
		secondaryButtonUrl,
		secondaryButtonAriaLabel,
		imageSrc = '/images/cta.webp'
	}: Props = $props();
</script>

<section
	class="relative overflow-hidden rounded-xl border border-[#ffffff1a] bg-gradient-to-br from-[#2a1e56] to-[#3d2c79] shadow-xl"
	aria-labelledby="cta-heading"
>
	<!-- Background Pattern -->
	<div class="absolute inset-0 text-white opacity-10" aria-hidden="true">
		<div
			class="absolute inset-0"
			style="background-image: radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0); background-size: 40px 40px;"
		></div>
	</div>

	<!-- Two Column Layout: 2/3 for content, 1/3 for image -->
	<div class="relative grid grid-cols-1 gap-8 p-6 sm:p-8 md:grid-cols-3 md:gap-12 md:p-10">
		<!-- Left Side: Content (2 columns) -->
		<div class="flex flex-col justify-center md:col-span-2">
			<h2 id="cta-heading" class="sixth-h-tag mb-2 sm:mb-3">
				{title}
			</h2>
			<p class="secondary-p-tag mb-4 sm:mb-6">
				{description}
			</p>
			<div class="flex flex-col gap-3 sm:flex-row sm:gap-4">
				<a
					href={buttonUrl}
					rel="external noopener noreferrer"
					class="group inline-flex items-center justify-center gap-2 rounded-full bg-[#FFD700] px-6 py-3 text-sm font-semibold text-[#1D1A20] shadow-lg transition-all hover:shadow-xl hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1139] focus-visible:outline-none sm:px-8 sm:py-4 sm:text-base"
					aria-label={buttonAriaLabel}
					onclick={buttonOnClick}
				>
					<span>{buttonText}</span>
					<ArrowRight
						class="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1 sm:h-5 sm:w-5"
					/>
				</a>
				{#if secondaryButtonText && secondaryButtonUrl}
					<a
						href={secondaryButtonUrl}
						rel="external noopener noreferrer"
						class="group inline-flex items-center justify-center gap-2 rounded-full bg-slate-700 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-slate-600 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1139] focus-visible:outline-none sm:px-8 sm:py-4 sm:text-base"
						aria-label={secondaryButtonAriaLabel || secondaryButtonText}
					>
						<span>{secondaryButtonText}</span>
						<ArrowRight
							class="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1 sm:h-5 sm:w-5"
						/>
					</a>
				{/if}
			</div>
		</div>

		<!-- Right Side: Image (1 column) -->
		<div class="flex items-center justify-center md:col-span-1">
			<img
				src="{base}{imageSrc}"
				alt="Contact us illustration"
				class="h-auto w-full max-w-sm rounded-lg object-contain"
				loading="lazy"
			/>
		</div>
	</div>
</section>
