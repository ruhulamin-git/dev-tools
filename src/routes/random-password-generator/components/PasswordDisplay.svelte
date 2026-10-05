<script lang="ts">
	import { Button, Label, Tooltip, Input } from '$lib/shared/components/ui';
	import { calculatePasswordStrength } from '../utils';
	import { CheckIcon, CopyIcon, ReloadIcon } from '../icons';
	import QRCodeDisplay from './QRCodeDisplay.svelte';

	interface Props {
		password: string;
		onCopy: () => void;
		onGenerate: () => void;
		copied?: boolean;
		isGenerating?: boolean;
	}

	let { password, onCopy, onGenerate, copied = false, isGenerating = false }: Props = $props();

	const strength = $derived(calculatePasswordStrength(password));
</script>

<div class="space-y-2">
	<div class="space-y-2">
		<Label htmlFor="password-display">Generated Password</Label>
		<div class="flex gap-2">
			{#key password}
				<Input
					id="password-display"
					type="text"
					readonly
					value={password}
					class="h-11 font-mono text-lg"
					ariaLabel="Generated password"
				/>
			{/key}
			<Tooltip text="Generate New Password">
				<Button
					onclick={() => {
						if (onGenerate) {
							onGenerate();
						}
					}}
					variant="outline"
					size="icon"
					aria-label="Generate new password"
					class="bg-slate-900 text-white shadow-lg hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-50"
				>
					<ReloadIcon animate={isGenerating} />
				</Button>
			</Tooltip>
			<Tooltip text={copied ? 'Copied!' : 'Copy to Clipboard'}>
				<Button
					onclick={onCopy}
					variant="outline"
					size="icon"
					aria-label="Copy password"
					class="{copied ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-900 hover:bg-slate-800'} text-white shadow-lg dark:text-slate-900 {copied ? 'dark:bg-green-500 dark:hover:bg-green-600' : 'dark:bg-white dark:hover:bg-slate-50'}"
				>
					{#if copied}
						<CheckIcon />
					{:else}
						<CopyIcon />
					{/if}
				</Button>
			</Tooltip>
		</div>
	</div>

	<!-- Password Strength Indicator -->
	{#if password}
		<div class="mt-4">
			<div class="mb-2 flex items-center justify-between text-sm">
				<span class="font-medium text-slate-900 dark:text-slate-100">Strength:</span>
				<span class="font-semibold text-slate-900 dark:text-slate-100">{strength.label}</span>
			</div>
			<div class="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
				<div
					class="h-full transition-all duration-300 {strength.color}"
					style="width: {(strength.score / 4) * 100}%"
				></div>
			</div>
		</div>
	{/if}

	<!-- QR Code Display -->
	<QRCodeDisplay {password} />
</div>
