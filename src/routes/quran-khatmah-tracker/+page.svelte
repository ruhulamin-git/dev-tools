<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import './khatmah.css';
	import AppBar from './components/AppBar.svelte';
	import Home from './components/Home.svelte';
	import Room from './components/Room.svelte';
	import Toast from './components/Toast.svelte';
	import { i18n } from './lib/i18n.svelte';
	import { khatmah } from './lib/khatmah.svelte';

	let timer: ReturnType<typeof setInterval> | null = null;
	let mounted = $state(false);

	// Screen/phase identity — home → lobby → active → completed.
	const phase = $derived(khatmah.view === 'home' ? 'home' : (khatmah.state?.status ?? 'room'));

	// On every phase transition the new screen renders where the old scroll was
	// (create/start buttons sit low on the page), so jump back to the top.
	$effect(() => {
		void phase;
		if (!mounted || typeof window === 'undefined') return;
		window.scrollTo({ top: 0, behavior: 'auto' });
		if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
	});

	onMount(() => {
		i18n.init();
		khatmah.init();
		// Live timers for in-progress parts (replaces app.js's 1s DOM poll).
		timer = setInterval(() => khatmah.tick(), 1000);
		khatmah.boot(new URLSearchParams(window.location.search));
		mounted = true;
	});

	onDestroy(() => {
		if (timer) clearInterval(timer);
	});
</script>

<!-- decorative full-viewport background: gradients (CSS) + Islamic star pattern (SVG) -->
<div class="kh-bg" aria-hidden="true">
	<svg>
		<defs>
			<pattern id="khStar" width="68" height="68" patternUnits="userSpaceOnUse">
				<path d="M34 6 L40 28 L62 34 L40 40 L34 62 L28 40 L6 34 L28 28 Z" fill="none" stroke="#E3C088" stroke-opacity="0.045" />
				<rect x="20" y="20" width="28" height="28" fill="none" stroke="#8C7BD6" stroke-opacity="0.03" transform="rotate(45 34 34)" />
			</pattern>
		</defs>
		<rect width="100%" height="100%" fill="url(#khStar)" />
	</svg>
</div>

<div class="khatmah-app">
	<AppBar />
	{#if khatmah.view === 'room'}
		<Room />
	{:else}
		<Home />
	{/if}
	<Toast />
</div>
