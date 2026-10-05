<script lang="ts">
	/**
	 * Shown once, until the visitor makes a choice — never during SSR/prerendering (no visitor,
	 * no decision to ask for), and never again for a returning visitor who already decided.
	 * "Decline" is a real, equally-sized choice, not a dark pattern buried as a small link:
	 * declining still lets every tool work exactly the same, since none of them depend on
	 * analytics to function.
	 */
	import { hasConsentDecision, setAnalyticsConsent } from '$lib/shared/analytics/consent';

	// hasConsentDecision() reads localStorage directly (no reactive dependency), so this
	// evaluates once — correctly false during SSR/prerendering, and, since Svelte re-runs a
	// component's initializer on the client during hydration, correctly picking up the real
	// stored value on first client render. Svelte 5's writable $derived lets accept()/decline()
	// below override it directly rather than needing a separate $state + $effect pair.
	let visible = $derived(!hasConsentDecision());

	function accept() {
		setAnalyticsConsent(true);
		visible = false;
	}

	function decline() {
		setAnalyticsConsent(false);
		visible = false;
	}
</script>

{#if visible}
	<div
		class="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-devx-header/95 backdrop-blur-sm"
		role="region"
		aria-label="Cookie consent"
	>
		<div
			class="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-4 sm:flex-row sm:justify-between"
		>
			<p class="text-sm text-devx-text-muted">
				We use analytics to see which tools are useful and improve them. Every tool works the
				same either way — nothing you type or upload is ever sent anywhere. See our
				<a
					href="https://www.devxhub.com/privacy-policy"
					class="underline hover:text-devx-text"
					target="_blank"
					rel="noopener noreferrer">privacy policy</a
				> for details.
			</p>
			<div class="flex shrink-0 gap-3">
				<button
					type="button"
					onclick={decline}
					class="rounded-full border border-slate-600 px-4 py-2 text-sm font-medium text-devx-text transition-colors hover:bg-white/5"
				>
					Decline
				</button>
				<button
					type="button"
					onclick={accept}
					class="rounded-full bg-devx-yellow px-4 py-2 text-sm font-semibold text-[#1D1A20] shadow-lg transition-all hover:brightness-110"
				>
					Accept
				</button>
			</div>
		</div>
	</div>
{/if}
