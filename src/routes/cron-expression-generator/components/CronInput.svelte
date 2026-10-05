<script lang="ts">
	// Instrument Serif is used nowhere else in the tools, so it's loaded here rather than
	// site-wide in app.css — Vite bundles this into this route's own chunk, so no other page
	// pays for a font request it never renders.
	import '@fontsource/instrument-serif/400-italic.css';
	import { Check, Copy } from '$lib/shared/icons';
	import { toast } from '$lib/shared/stores/toastStore';
	import { copyToClipboard } from '$lib/shared/utils/clipboard';
	import { DIALECTS, fieldRangeAt, type CronResult, type Dialect } from '../utils/cron';

	interface Props {
		value: string;
		result: CronResult;
		/** Caret position, bound back to the parent so the breakdown can highlight. */
		cursor: number;
		/** Whether the field has focus. The caret position only means something while it does. */
		focused: boolean;
		dialect: Dialect;
		onrandom: () => void;
	}

	let {
		value = $bindable(),
		result,
		cursor = $bindable(),
		focused = $bindable(),
		dialect,
		onrandom
	}: Props = $props();

	let input = $state<HTMLInputElement | null>(null);

	/** The caret moves on input, click, arrow keys and selection — track them all. */
	function syncCursor() {
		if (input) cursor = input.selectionStart ?? 0;
	}

	/**
	 * Select a field's text in the input, so clicking a card in the breakdown puts the caret
	 * on the part of the expression it describes. Called from the parent via `bind:this`.
	 */
	export function selectField(index: number) {
		const range = fieldRangeAt(value, index, dialect);
		if (!input || !range) return;

		input.focus({ preventScroll: true });
		input.setSelectionRange(range[0], range[1]);
		// Set both here rather than waiting on the deferred focus handler: the caret position
		// is already known, so the highlight can move in the same update as the selection.
		cursor = range[0];
		focused = true;
	}

	/**
	 * When a click focuses the field, the browser positions the caret *after* this event
	 * fires, so selectionStart still reads its stale value here — reading it now would light
	 * up the minute field for a frame before the click corrected it.
	 *
	 * Deferring to the next task lets the caret settle, and flipping `focused` in the same
	 * callback means the highlight appears once, already on the right field.
	 */
	function onFocus() {
		setTimeout(() => {
			if (!input || document.activeElement !== input) return;
			syncCursor();
			focused = true;
		});
	}

	let copied = $state(false);
	let copyTimer: ReturnType<typeof setTimeout>;

	async function copy() {
		if (await copyToClipboard(value.trim())) {
			copied = true;
			toast.success('Expression copied to clipboard!');
			clearTimeout(copyTimer);
			copyTimer = setTimeout(() => (copied = false), 2000);
		} else {
			toast.error('Failed to copy');
		}
	}

	const showError = $derived(!result.valid && value.trim() !== '');
</script>

<div class="space-y-3">
	<label for="cron-expression" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
		Cron expression
	</label>

	<div class="flex flex-col gap-2 sm:flex-row">
		<!-- The standing highlight lives on this wrapper, not on the input: app.css forces
		     `box-shadow: none !important` on every input site-wide, so a ring-* on the field
		     itself is silently dropped. focus-within intensifies it when the field is active,
		     on top of the crisp 2px ring app.css already forces on input:focus. -->
		<div
			class="relative flex w-full items-center rounded-lg ring-4 transition-[box-shadow] duration-150 {showError
				? 'ring-red-500/15 focus-within:ring-red-500/35 dark:ring-red-400/15 dark:focus-within:ring-red-400/35'
				: 'ring-blue-500/15 focus-within:ring-blue-500/35 dark:ring-blue-400/15 dark:focus-within:ring-blue-400/35'}"
		>
			<input
				bind:this={input}
				bind:value
				id="cron-expression"
				type="text"
				inputmode="text"
				autocomplete="off"
				autocapitalize="off"
				autocorrect="off"
				spellcheck="false"
				placeholder={DIALECTS[dialect].sample}
				aria-describedby="cron-explanation"
				aria-invalid={showError ? 'true' : undefined}
				oninput={syncCursor}
				onclick={syncCursor}
				onkeyup={syncCursor}
				onselect={syncCursor}
				onfocus={onFocus}
				onblur={() => (focused = false)}
				class="w-full rounded-lg border-2 py-3 pr-12 pl-4 font-mono text-xl tracking-wide text-slate-900 transition-[border-color,background-color] duration-150 placeholder:text-slate-300 focus:outline-none sm:text-2xl dark:text-slate-100 dark:placeholder:text-slate-600 {showError
					? 'border-red-300 bg-red-50/50 focus:border-red-500 dark:border-red-500/60 dark:bg-slate-800'
					: 'border-blue-300 bg-blue-50/50 focus:border-blue-500 dark:border-blue-500/50 dark:bg-slate-800'}"
			/>

			<!-- Sits inside the field, the way crontab.guru does. Always visible rather than
			     revealed on hover, so it is reachable on touch devices too. -->
			<button
				type="button"
				onclick={copy}
				disabled={value.trim() === ''}
				aria-label={copied ? 'Expression copied' : 'Copy expression'}
				class="absolute right-2 rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 dark:hover:bg-slate-700 dark:hover:text-blue-400"
			>
				{#if copied}
					<Check class="h-5 w-5 text-green-500" />
				{:else}
					<Copy class="h-5 w-5" />
				{/if}
			</button>
		</div>

		<button
			type="button"
			onclick={onrandom}
			class="shrink-0 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none sm:py-0 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:focus-visible:ring-offset-slate-900"
		>
			Random example
		</button>
	</div>

	<!-- The live region is always present so screen readers announce changes in place
	     rather than hearing an element appear and disappear on every keystroke. -->
	<p
		id="cron-explanation"
		role="status"
		aria-live="polite"
		class="cron-explanation min-h-10 text-2xl leading-snug sm:min-h-11 sm:text-3xl {result.valid
			? 'text-slate-900 dark:text-slate-100'
			: showError
				? 'text-red-600 dark:text-red-400'
				: 'text-slate-500 dark:text-slate-400'}"
	>
		{result.valid ? result.description : result.error}
	</p>

	{#if result.valid && result.expandedFrom}
		<p class="text-xs text-slate-500 dark:text-slate-400">
			<code class="font-mono">{result.expandedFrom}</code> is shorthand for
			<code class="font-mono">{result.fields.map((f) => f.value).join(' ')}</code>
		</p>
	{/if}
</div>

<style>
	/*
	 * The plain-English answer is what the visitor came for, so it gets its own voice rather
	 * than reading like form helper text under the field. Instrument Serif ships in a single
	 * 400 weight, so 600 is a browser-synthesised bold.
	 * It holds up well at this size; adding a text-stroke on top of it starts to fill in the
	 * counters of the italic a and e, so the weight does the work on its own.
	 */
	.cron-explanation {
		font-family: 'Instrument Serif', Georgia, 'Times New Roman', serif;
		font-style: italic;
		font-weight: 600;
		letter-spacing: 0.015em;
	}
</style>
