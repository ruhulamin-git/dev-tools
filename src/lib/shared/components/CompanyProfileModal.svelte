<script lang="ts">
	import BadgeCheckIcon from './icons/BadgeCheckIcon.svelte';
	import CloseIcon from './icons/CloseIcon.svelte';
	import SpinnerIcon from './icons/SpinnerIcon.svelte';
	import { track } from '$lib/shared/analytics/track';
	import { validateEmail as checkEmail } from '$lib/shared/utils/emailValidation';

	interface Props {
		showModal: boolean;
		onClose: () => void;
	}

	let { showModal, onClose }: Props = $props();

	// Configuration
	const pdfUrl =
		import.meta.env.VITE_PROFILE_PDF_URL ||
		'https://cdn.devxhub.com/public/devxhub-company-profile-v1.1.4.pdf';

	// Form state
	let name = $state('');
	let email = $state('');
	let isProcessing = $state(false);

	// Validation state
	let errors = $state({
		name: '' as string,
		email: '' as string
	});

	// Touched fields for error display
	let touched = $state({
		name: false,
		email: false
	});

	const trialBadges = ['No Contract', 'No Commitment', 'Keep the Work'];

	// Modal scroll lock
	$effect(() => {
		if (showModal) {
			document.body.style.overflow = 'hidden';
			document.body.classList.add('modal-open');
		} else {
			document.body.style.overflow = '';
			document.body.classList.remove('modal-open');
		}

		return () => {
			document.body.style.overflow = '';
			document.body.classList.remove('modal-open');
		};
	});

	// Validation functions
	function validateName(): boolean {
		errors.name = '';

		if (!name.trim()) {
			errors.name = 'Full Name is Required';
			return false;
		}

		if (name.length > 40) {
			errors.name = 'Maximum Character is 40';
			return false;
		}

		return true;
	}

	function validateEmail(): boolean {
		errors.email = '';

		if (!email.trim()) {
			errors.email = 'Email is Required';
			return false;
		}

		const result = checkEmail(email);
		if (!result.valid) {
			errors.email = result.error;
			return false;
		}

		return true;
	}

	function validateForm(): boolean {
		const isNameValid = validateName();
		const isEmailValid = validateEmail();
		return isNameValid && isEmailValid;
	}

	// URL validation
	function isValidUrl(url: string): boolean {
		try {
			const parsedUrl = new URL(url);
			return ['http:', 'https:'].includes(parsedUrl.protocol);
		} catch {
			return false;
		}
	}

	// Extract filename from URL
	function getFilenameFromUrl(url: string): string {
		try {
			const urlObj = new URL(url);
			const pathname = urlObj.pathname;
			const filename = pathname.substring(pathname.lastIndexOf('/') + 1);

			if (filename && filename.endsWith('.pdf')) {
				return filename;
			}

			return 'devxhub-company-profile.pdf';
		} catch (error) {
			console.warn('Could not extract filename from URL, using fallback', error);
			return 'devxhub-company-profile.pdf';
		}
	}

	// Download PDF
	async function downloadPdf(): Promise<void> {
		if (!isValidUrl(pdfUrl)) {
			throw new Error('Invalid PDF URL');
		}

		const response = await fetch(pdfUrl);
		if (!response.ok) {
			throw new Error(`Failed to download PDF: ${response.status} ${response.statusText}`);
		}

		const blob = await response.blob();
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');

		const fileName = getFilenameFromUrl(pdfUrl);

		link.href = url;
		link.download = fileName;
		link.style.display = 'none';

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		URL.revokeObjectURL(url);
	}

	// API submission
	async function submitToApi(formData: { name: string; email: string }): Promise<any> {
		const baseUrl = import.meta.env.VITE_API_BASE_URL;
		const response = await fetch(`${baseUrl}/api/posts/followups`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name: formData.name,
				email: formData.email
			})
		});

		if (!response.ok) {
			throw new Error(`API error: ${response.status}`);
		}

		return response.json();
	}

	// Form submission
	async function submitForm(event: Event): Promise<void> {
		event.preventDefault();

		// Mark fields as touched
		touched.name = true;
		touched.email = true;

		if (!validateForm()) {
			return;
		}

		isProcessing = true;

		try {
			// Submit form data to API
			const apiResponse = await submitToApi({
				name: name.trim(),
				email: email.trim()
			});

			// If success is true or the response indicates ok, complete the flow
			if (
				apiResponse.success ||
				apiResponse.ok ||
				apiResponse.message === 'Successfully follow up contact message saved.'
			) {
				// This used to check for `window.gtag` before firing, but this app only ever
				// loads GTM's gtm.js, never the separate gtag.js library — `window.gtag` is
				// never defined, so this event has never actually fired. track() pushes to the
				// dataLayer GTM already reads.
				track('portfolio_download', { label: 'portfolio_pdf' });

				// Download the PDF
				await downloadPdf();

				// Close modal
				onClose();

				// Reset form
				name = '';
				email = '';
				errors = { name: '', email: '' };
				touched = { name: false, email: false };
			} else {
				throw new Error('There was an issue with your submission. Please try again.');
			}
		} catch (error: any) {
			console.error('Form submission error:', error);
			alert(error.message || 'An unexpected error occurred during submission');
		} finally {
			isProcessing = false;
		}
	}

	function handleBackdropClick(event: MouseEvent): void {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}

	function handleNameBlur(): void {
		touched.name = true;
		validateName();
	}

	function handleEmailBlur(): void {
		touched.email = true;
		validateEmail();
	}
</script>

{#if showModal}
	<!-- Modal Backdrop -->
	<div
		class="modal-backdrop fixed inset-0 z-[999999] flex items-center justify-center p-4 transition-opacity duration-300 ease-out"
		onclick={handleBackdropClick}
		onkeydown={(e) => e.key === 'Escape' && onClose()}
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
		tabindex="-1"
	>
		<div class="modal-backdrop-overlay fixed inset-0"></div>

		<!-- Modal Content -->
		<div
			class="modal-content relative flex max-h-[90dvh] w-full max-w-[520px] flex-col overflow-y-auto rounded-lg bg-white shadow-xl transition-all duration-300 ease-out sm:rounded-xl"
		>
			<!-- Header -->
			<div class="relative bg-[#4a0e7f] px-5 pt-6 pr-14 pb-8 sm:px-8 sm:pt-8 sm:pr-16 sm:pb-10">
				<button
					onclick={onClose}
					class="absolute top-3 right-3 z-10 flex cursor-pointer items-center justify-center rounded-full p-1.5 text-white transition-all duration-200 hover:scale-110 hover:bg-white/15 active:scale-95"
					aria-label="Close modal"
					type="button"
				>
					<CloseIcon />
				</button>

				<p class="text-xs leading-[21px] text-white/85 sm:text-sm">
					One bad hire. Three months gone.
				</p>
				<h1
					id="modal-title"
					class="pt-2 text-[22px] leading-tight font-bold text-white sm:text-[26px] sm:leading-[34px] md:text-[30px] md:leading-[37.5px]"
				>
					Start with a
					<span class="text-[#f5c800]">20-hour risk-free</span>
					trial instead.
				</h1>
			</div>

			<!-- Body -->
			<div class="flex-1 overflow-y-auto bg-white px-5 pt-6 pb-6 sm:px-8 sm:pt-7 sm:pb-8">
				<p class="text-[13px] leading-[22.4px] text-[#6b7280] sm:text-sm">
					Vague timelines, junior devs, surprise invoices — you've seen it. We earn your trust
					before you spend a dollar.
				</p>

				<form onsubmit={submitForm} class="w-full">
					<!-- Name Field -->
					<div class="pt-5 sm:pt-6">
						<label
							for="name"
							class="block text-[10px] leading-[16.5px] font-bold tracking-[1.2px] text-[#111827] uppercase sm:text-[11px]"
						>
							Full Name
						</label>
						<input
							id="name"
							bind:value={name}
							type="text"
							class="w-full border-b border-[#d1d5db] bg-transparent pt-2 pb-1 pl-0 text-sm text-[#111827] outline-none placeholder:text-[#9ca3af] focus:ring-0 focus:outline-none sm:text-[15px]"
							placeholder="John"
							onblur={handleNameBlur}
						/>
						{#if touched.name && errors.name}
							<p class="fullName-error mt-1 text-sm text-red-500">
								{errors.name}
							</p>
						{/if}
					</div>

					<!-- Email Field -->
					<div class="pt-4 pb-5 sm:pt-5 sm:pb-6">
						<label
							for="email"
							class="block text-[10px] leading-[16.5px] font-bold tracking-[1.2px] text-[#111827] uppercase sm:text-[11px]"
						>
							Work Email
						</label>
						<input
							id="email"
							bind:value={email}
							type="email"
							class="w-full border-b border-[#d1d5db] bg-transparent pt-2 pb-1 pl-0 text-sm text-[#111827] outline-none placeholder:text-[#9ca3af] focus:ring-0 focus:outline-none sm:text-[15px]"
							placeholder="you@company.com"
							onblur={handleEmailBlur}
						/>
						{#if touched.email && errors.email}
							<p class="email-error mt-1 text-sm text-red-500">
								{errors.email}
							</p>
						{/if}
					</div>

					<!-- Submit Button -->
					<button
						type="submit"
						class="button-link-hover flex w-full items-center justify-center rounded-lg bg-[#f5c800] px-4 py-3 text-sm font-bold tracking-[0.8px] text-[#111827] transition-colors duration-300 disabled:opacity-70 sm:py-[14.4px] sm:text-[15px] sm:tracking-[1px]"
						disabled={isProcessing}
					>
						{#if isProcessing}
							<span class="flex items-center gap-2">
								<SpinnerIcon />
								<span>Processing...</span>
							</span>
						{:else}
							<span>START MY TRIAL</span>
						{/if}
					</button>

					<p class="mt-4 px-1 text-center text-xs leading-[19.5px] text-[#6b7280] sm:text-[13px]">
						5 trials open this month -
						<span class="font-bold text-[#111827]">2 left</span>
					</p>

					<!-- Divider -->
					<div class="mt-5 border-b border-black/12 sm:mt-6"></div>

					<!-- Trial Badges -->
					<div
						class="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 pt-4 sm:gap-x-6 sm:pt-5 md:gap-x-8"
					>
						{#each trialBadges as badge (badge)}
							<div class="flex items-center gap-1.5">
								<BadgeCheckIcon />
								<span
									class="text-xs leading-[19.5px] whitespace-nowrap text-[#374151] sm:text-[13px]"
								>
									{badge}
								</span>
							</div>
						{/each}
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		overflow: hidden;
	}

	.modal-backdrop-overlay {
		backdrop-filter: blur(3px);
		background: rgba(255, 255, 255, 0.2);
		pointer-events: none;
	}

	.modal-content {
		display: flex;
		flex-direction: column;
	}

	.button-link-hover {
		position: relative;
		isolation: isolate;
		overflow: hidden;
		transition: color 300ms cubic-bezier(0.4, 0, 0.2, 1);
		outline: none;
	}

	.button-link-hover:focus-visible {
		outline: none;
		ring: 2px;
		ring-color: rgba(255, 215, 0, 0.5);
	}

	.button-link-hover::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		border-radius: 9999px;
		background-color: #e6c200;
		transform: scale(0);
		transform-origin: left bottom;
		transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
	}

	.button-link-hover:hover::before,
	.button-link-hover:focus-visible::before {
		transform: scale(1);
	}

	.button-link-hover:hover,
	.button-link-hover:focus-visible {
		@apply text-[#111111];
	}

	:global(body.modal-open) {
		overflow: hidden !important;
	}

	input {
		outline: none !important;
		box-shadow: none !important;
		-webkit-tap-highlight-color: transparent !important;
		border: none !important;
		border-bottom: 1px solid #d1d5db !important;
	}

	input:focus,
	input:active,
	input:focus-visible {
		outline: none !important;
		box-shadow: none !important;
		border-color: #d1d5db !important;
		-webkit-tap-highlight-color: transparent !important;
	}
</style>
