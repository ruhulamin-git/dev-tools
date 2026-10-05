<script lang="ts">
	import { cn } from '$lib/shared/utils';
	import { ReloadIcon } from '../icons';

	interface Props {
		onGenerate: () => void;
		isGenerating?: boolean;
	}

	let { onGenerate, isGenerating = false }: Props = $props();

	const handleClick = (e: MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (!isGenerating && onGenerate) {
			onGenerate();
		}
	};
</script>

<div class="flex gap-3">
	<button
		type="button"
		onclick={(e) => handleClick(e)}
		disabled={isGenerating}
		class={cn(
			'inline-flex items-center justify-center rounded-md text-sm font-medium whitespace-nowrap ring-offset-white transition-colors focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
			'bg-slate-900 text-white hover:bg-slate-800',
			'h-11 rounded-md px-8',
			!isGenerating && 'cursor-pointer',
			'flex-1'
		)}
	>
		<ReloadIcon class="mr-2" animate={isGenerating} />
		Generate New Password
	</button>
</div>
