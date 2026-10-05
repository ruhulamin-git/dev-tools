<script lang="ts">
	import { Card } from '$lib/shared/components/ui';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';

	type Hadith = {
		category: string;
		ar: string;
		en: string;
		bn: string;
		transliteration: string;
		reference: string;
	};

	interface Props {
		hadiths: Hadith[];
		selectedLanguage?: 'ar' | 'en' | 'bn';
		autoRotateInterval?: number; // in milliseconds
		class?: string;
	}

	let {
		hadiths,
		selectedLanguage = $bindable('ar'),
		autoRotateInterval = 10000, // 10 seconds default
		class: className = ''
	}: Props = $props();

	let currentIndex = $state(0);
	let isPaused = $state(false);
	let intervalId: ReturnType<typeof setInterval> | null = null;

	const getHadithText = (hadith: Hadith, lang: 'ar' | 'en' | 'bn') => {
		return hadith[lang];
	};

	const nextHadith = () => {
		currentIndex = (currentIndex + 1) % hadiths.length;
	};

	const prevHadith = () => {
		currentIndex = (currentIndex - 1 + hadiths.length) % hadiths.length;
	};

	const goToHadith = (index: number) => {
		currentIndex = index;
	};

	const startAutoRotate = () => {
		if (intervalId) clearInterval(intervalId);
		intervalId = setInterval(() => {
			if (!isPaused) {
				nextHadith();
			}
		}, autoRotateInterval);
	};

	const stopAutoRotate = () => {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
	};

	// Reset to first hadith when language changes
	$effect(() => {
		currentIndex = 0;
	});

	// Restart auto-rotate when language or interval changes
	$effect(() => {
		stopAutoRotate();
		startAutoRotate();
		return () => stopAutoRotate();
	});

	onMount(() => {
		startAutoRotate();
		return () => stopAutoRotate();
	});
</script>

<div
	class="relative w-full {className}"
	onmouseenter={() => (isPaused = true)}
	onmouseleave={() => (isPaused = false)}
	role="region"
	aria-label="Hadith carousel"
>
	<!-- Main Carousel Container -->
	<div class="relative overflow-hidden rounded-lg">
		<div class="relative h-[400px] xl:mx-12 lg:mx-12 md:mx-12 sm:h-[450px] md:h-[500px]">
			{#key currentIndex}
				{#each hadiths as hadith, index (index)}
					{#if index === currentIndex}
						<div
							class="absolute inset-0 flex items-center justify-center p-6"
							transition:slide={{ axis: 'x', duration: 400 }}
						>
							<Card class="h-full w-full p-6 sm:p-8 md:p-10">
								<div class="flex h-full flex-col items-center justify-center text-center">
									<!-- Category Badge -->
									<div class="mb-4">
										<span
											class="inline-block rounded-full px-4 py-1 text-xs font-semibold tracking-wide uppercase {hadith.category ===
											'hope'
												? 'bg-green-100 text-green-800 '
												: 'bg-orange-100 text-orange-800 '}"
										>
											{hadith.category}
										</span>
									</div>

									<!-- Hadith Text -->
									<p
										class="mb-6 text-2xl leading-relaxed font-bold text-slate-900 sm:text-3xl md:text-4xl  {selectedLanguage ===
										'ar'
											? 'font-arabic'
											: ''}"
									>
										{getHadithText(hadith, selectedLanguage)}
									</p>

									<!-- Transliteration -->
									<p class="mb-4 text-base text-slate-600 italic sm:text-lg ">
										{hadith.transliteration}
									</p>

									<!-- Reference -->
									<p class="mt-auto text-sm text-slate-500 ">
										{hadith.reference}
									</p>
								</div>
							</Card>
						</div>
					{/if}
				{/each}
			{/key}
		</div>

		<!-- Navigation Buttons -->
		<button
			onclick={prevHadith}
			class="absolute top-1/2 left-0 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg transition-all hover:bg-white hover:shadow-xl "
			aria-label="Previous hadith"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6 text-slate-900 "
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
		</button>

		<button
			onclick={nextHadith}
			class="absolute top-1/2 right-0 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg transition-all hover:bg-white hover:shadow-xl "
			aria-label="Next hadith"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6 text-slate-900 "
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
			</svg>
		</button>
	</div>

	<!-- Dots Indicator -->
	<div class="mt-6 flex justify-center gap-2">
		{#each hadiths as _, index}
			<button
				onclick={() => goToHadith(index)}
				class="h-2 rounded-full transition-all {index === currentIndex
					? 'w-8 bg-white'
					: 'w-2 bg-gray-300 hover:bg-gray-400 '}"
				aria-label={`Go to hadith ${index + 1}`}
			>
			</button>
		{/each}
	</div>

	<!-- Counter -->
	<div class="mt-4 text-center text-sm text-white">
		{currentIndex + 1} / {hadiths.length}
	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');

	.font-arabic {
		font-family: 'Amiri', serif;
	}
</style>
