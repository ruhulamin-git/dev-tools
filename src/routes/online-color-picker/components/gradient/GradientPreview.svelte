<script lang="ts">
	import { Card } from '$lib/shared/components';

	interface Props {
		gradientCSS: string;
		copiedField: string | null;
		onCopyCSS: () => void;
	}

	let { gradientCSS, copiedField, onCopyCSS }: Props = $props();
</script>

<Card class="overflow-hidden p-1.5">
	<div
		class="group relative aspect-2/1 w-full overflow-hidden rounded-xl"
		style="background: {gradientCSS};"
	>
		<div
			class="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/0 transition-colors group-hover:bg-black/5"
			onclick={onCopyCSS}
			role="button"
			tabindex="0"
			aria-label="Copy CSS"
		>
			<span
				class="rounded bg-white/90 px-3 py-1 font-mono text-xs font-medium text-slate-700 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100 dark:bg-slate-800/90 dark:text-slate-200"
			>
				{copiedField === 'css' ? 'Copied!' : 'Click to Copy CSS'}
			</span>
		</div>
	</div>
</Card>
