<script lang="ts">
	import { toJsonLdScript } from '$lib/shared/utils/jsonLd';

	interface Props {
		/** One schema.org object, or several to emit as separate script tags. */
		data: Record<string, unknown> | Record<string, unknown>[];
	}

	const { data }: Props = $props();

	const scripts = $derived(toJsonLdScript(data));
</script>

<!--
	Audited sink: `toJsonLdScript` (jsonLd.ts, covered by jsonLd.test.ts) escapes every value so
	`<`, `>` and `&` can never reach the DOM, and the only tags it ever produces are inert
	`application/ld+json` scripts.
-->
<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html scripts}
