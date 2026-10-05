<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { track } from '$lib/shared/analytics/track';
	import { getToolBySlug } from '$lib/shared/config/tools';
	import { validateEmail } from '$lib/shared/utils/emailValidation';

	interface Props {
		title: string;
		description: string;
		toolName: string;
		maxWidth?: string;
		buttonText?: string;
		successMessage?: string;
		hookText?: string;
		/** Optional extra GTM event name fired once on successful submit (no PII). */
		submitAnalyticsEvent?: string;
	}

	let {
		title,
		description,
		toolName,
		maxWidth = '900px',
		buttonText = 'Get Free Guide',
		successMessage = 'Thanks! Your download will start shortly.',
		hookText = "We'll assign a dedicated manager for you.",
		submitAnalyticsEvent
	}: Props = $props();

	let showSuccess = $state(false);
	let name = $state('');
	let email = $state('');
	let isSubmitting = $state(false);
	let emailError = $state('');
	// Honeypot: a field real visitors never see or fill in, styled off-screen rather than
	// `type="hidden"` (which some bots already know to skip). Anything filling it in is
	// automated, so its submission is quietly accepted (no error shown, to avoid tipping the bot
	// off) without ever reaching the lead API.
	let website = $state('');
	// A human takes more than this to read the form and type a name and email; a submission
	// faster than that is a bot that filled the form programmatically.
	const MIN_SUBMIT_MS = 1500;
	const formRenderedAt = Date.now();

	// Real-time email validation
	function handleEmailInput() {
		if (email.trim()) {
			const validation = validateEmail(email);
			emailError = validation.error;
		} else {
			emailError = '';
		}
	}

	// The guide PDF comes from the tool registry, keyed by the current route's slug — not by
	// `toolName`, which is free-form display text used for the lead API's `tool` field and
	// analytics only. A tool with no guide yet (nothing in the registry's `guidePdf`) falls back
	// to the JSON guide rather than showing a broken download; see tools.ts for which slugs still
	// need a real guide written.
	const currentSlug = $derived(page.url.pathname.split('/').filter(Boolean).pop() || '');
	const guidePdf = $derived(getToolBySlug(currentSlug)?.guidePdf || 'json-guide.pdf');

	function downloadPDF() {
		const pdfFilename = guidePdf;
		const pdfUrl = `${base}/tool-pdf/${pdfFilename}`;

		// Create a temporary anchor element and trigger download
		const link = document.createElement('a');
		link.href = pdfUrl;
		link.download = pdfFilename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!name.trim() || !email.trim()) return;

		// Validate email before submission
		const validation = validateEmail(email);
		if (!validation.valid) {
			emailError = validation.error;
			return;
		}

		isSubmitting = true;
		emailError = '';

		// A filled honeypot or a too-fast submit means a bot, not a visitor. Skip the lead API
		// entirely — but still show the same success state and download below, so nothing about
		// the response tells an automated script it was detected.
		const looksLikeBot = website.trim() !== '' || Date.now() - formRenderedAt < MIN_SUBMIT_MS;

		try {
			if (!looksLikeBot) {
				// Send lead data to API using FormData (same as Postman form-data)
				const formData = new FormData();
				formData.append('name', name.trim());
				formData.append('email', email.trim());
				formData.append('tool', toolName);

				const apiUrl = import.meta.env.VITE_LEADMAGNET_API_URL;
				const controller = new AbortController();
				const timeout = setTimeout(() => controller.abort(), 8000);
				try {
					await fetch(`${apiUrl}/leadmagnet/`, {
						method: 'POST',
						body: formData,
						signal: controller.signal
					});
				} finally {
					clearTimeout(timeout);
				}
			}
		} catch {
			// Silently handle errors
		}

		// Download PDF regardless of API response
		downloadPDF();

		track('lead_magnet_download', {
			page_location: typeof window !== 'undefined' ? window.location.href : undefined,
			form_name: toolName,
			file_name: guidePdf
		});

		if (typeof window !== 'undefined') {
			window.dataLayer = window.dataLayer || [];
			if (submitAnalyticsEvent) {
				const onceKey = `dxh_invoice_evt_${submitAnalyticsEvent}`;
				let already = false;
				try {
					already = !!sessionStorage.getItem(onceKey);
					if (!already) sessionStorage.setItem(onceKey, '1');
				} catch {
					/* ignore */
				}
				if (!already) {
					window.dataLayer.push({ event: submitAnalyticsEvent });
				}
			}
		}

		showSuccess = true;

		// Reset after 3 seconds
		setTimeout(() => {
			showSuccess = false;
			name = '';
			email = '';
			website = '';
			isSubmitting = false;
		}, 3000);
	}
</script>

<!-- Lead Magnet Card - Two Column Layout -->
<div
	class="mx-auto overflow-hidden rounded-xl border border-[#ffffff1a] bg-gradient-to-br from-[#2a1e56] to-[#3d2c79] shadow-xl transition-all duration-300"
	style="max-width: {maxWidth};"
>
	{#if showSuccess}
		<!-- Success State -->
		<div class="p-8 text-center">
			<div class="mb-4 flex justify-center">
				<div class="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
					<svg
						class="h-8 w-8 text-emerald-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
				</div>
			</div>
			<h2 class="mb-2 text-xl font-bold text-white">Success!</h2>
			<p class="text-slate-300">
				{successMessage}
			</p>
		</div>
	{:else}
		<!-- Two Column Layout -->
		<div class="grid grid-cols-1 gap-8 p-5 md:grid-cols-2 md:gap-12">
			<!-- Left Side: Hook Content -->
			<div class="flex flex-col justify-center">
				<h2 class="mb-4 text-xl font-bold text-white md:text-2xl">
					{title}
				</h2>
				<div class="flex items-start gap-3">
					<div class="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center">
						<svg class="h-5 w-5 text-[#FFD700]" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>
					<p class="text-base text-slate-300 md:text-lg">
						{hookText}
					</p>
				</div>
			</div>

			<!-- Right Side: Form -->
			<div class="flex flex-col justify-center rounded-lg bg-white p-6">
				<form onsubmit={handleSubmit} class="space-y-3">
					<!--
						Honeypot: real visitors never see this field (positioned off-screen, not
						`display:none`/`hidden`, which some bots already know to skip), and it's
						excluded from the tab order and from screen readers. Anything that fills
						it in is automated — see the `website` check in handleSubmit.
					-->
					<div class="absolute left-[-9999px]" aria-hidden="true">
						<label for="lead-website">Website</label>
						<input
							id="lead-website"
							name="website"
							bind:value={website}
							type="text"
							tabindex="-1"
							autocomplete="off"
						/>
					</div>

					<div>
						<label for="lead-name" class="mb-1.5 block text-sm font-medium text-slate-700">
							Full Name
						</label>
						<input
							id="lead-name"
							bind:value={name}
							type="text"
							placeholder="Jane Doe"
							required
							disabled={isSubmitting}
							class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						/>
					</div>

					<div>
						<label for="lead-email" class="mb-1.5 block text-sm font-medium text-slate-700">
							Email*
						</label>
						<input
							id="lead-email"
							bind:value={email}
							oninput={handleEmailInput}
							type="email"
							placeholder="you@example.com"
							required
							disabled={isSubmitting}
							class="w-full rounded-lg border {emailError
								? 'border-red-500'
								: 'border-slate-300'} bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						/>
						{#if emailError}
							<p class="mt-1 text-xs text-red-500">{emailError}</p>
						{/if}
					</div>

					<button
						type="submit"
						disabled={isSubmitting || !name.trim() || !email.trim() || !!emailError}
						class="w-full rounded-full bg-[#FFD700] px-6 py-2.5 text-sm font-semibold text-[#1D1A20] shadow-lg transition-all hover:shadow-xl hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1139] focus-visible:outline-none disabled:cursor-not-allowed"
					>
						{isSubmitting ? 'Sending...' : buttonText}
					</button>
				</form>
			</div>
		</div>
	{/if}
</div>
