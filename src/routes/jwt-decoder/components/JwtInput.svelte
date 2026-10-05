<script lang="ts">
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription,
		Textarea,
		Button
	} from '$lib/shared/components/ui';

	interface Props {
		token: string;
		onTokenChange: (token: string) => void;
		onDecode: () => void;
		onLoadSample: () => void;
		onReset: () => void;
		sampleJWT: string;
	}
	let { token, onTokenChange, onDecode, onLoadSample, onReset, sampleJWT }: Props = $props();
</script>

<Card class="border-slate-200 shadow-lg dark:border-slate-800">
	<CardHeader>
		<div class="flex items-center justify-between">
			<div>
				<CardTitle>JWT Token Input</CardTitle>
				<CardDescription>Paste your JWT token below to decode it instantly</CardDescription>
			</div>
			<Button
				variant="ghost"
				size="sm"
				class="gap-1.5 text-slate-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
				onclick={onReset}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg
				>
				Reset
			</Button>
		</div>
	</CardHeader>
	<CardContent class="space-y-4">
		<div class="space-y-2">
			<Textarea
				id="jwt-token-input"
				value={token}
				oninput={(e) => onTokenChange((e.target as HTMLTextAreaElement).value)}
				placeholder="Paste your JWT token here..."
				rows={6}
				class="min-h-[120px] font-mono text-sm"
			/>
		</div>
		<div class="flex flex-col gap-2 sm:flex-row sm:gap-3">
			<Button onclick={onDecode} class="flex-1 sm:flex-none">Decode Token</Button>
			<Button
				variant={token === sampleJWT ? 'secondary' : 'outline'}
				onclick={onLoadSample}
				class="flex-1 sm:flex-none"
			>
				Load Sample
			</Button>
		</div>
	</CardContent>
</Card>
