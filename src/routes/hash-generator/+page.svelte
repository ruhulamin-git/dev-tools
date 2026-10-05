<script lang="ts">
	import {
		CTA,
		JsonLd,
		LeadMagnetInline,
		PageHeader,
		RelatedTools,
		SeoContent,
		TrustStrip
	} from '$lib/shared/components';
	import { getToolBySlug } from '$lib/shared/config/tools';
	import { onDestroy, onMount } from 'svelte';
	import HashInput from './components/HashInput.svelte';
	import HashOutput from './components/HashOutput.svelte';
	import { formatHash, getComparisonStatus } from './utils/hash';
	import HashWorker from './utils/hash.worker?worker';

	const currentTool = getToolBySlug('hash-generator')!;

	// State
	let inputType = $state<'text' | 'file'>('text');
	let textInput = $state('');
	let fileInput: File | null = $state(null);
	let secretKey = $state('');
	let isUpperCase = $state(false);
	let compareHash = $state('');
	let isLoading = $state(false);
	let progress = $state(0);

	// Active input source tracking
	let activeSource = $state<'text' | 'file' | null>(null);
	let textTabDisabled = $state(false);
	let fileTabDisabled = $state(false);

	// Debounce timer for text input
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	// Track last processed file to prevent duplicate processing
	let lastProcessedFile: File | null = null;

	// Track selected algorithm for conditional CTAs
	let selectedAlgorithm = $state<string | null>(null);
	let isUsingWeakAlgorithm = $derived(selectedAlgorithm === 'MD5' || selectedAlgorithm === 'SHA-1');
	let isHashingPassword = $derived(
		textInput.length >= 8 &&
			textInput.length <= 128 &&
			/[A-Z]/.test(textInput) &&
			/[a-z]/.test(textInput) &&
			/[0-9]/.test(textInput)
	);

	// Results
	type HashResult = {
		algorithm: string;
		hash: string;
		loading: boolean;
		error?: string;
	};

	let results = $state<Record<string, HashResult>>({
		MD5: { algorithm: 'MD5', hash: '', loading: false },
		'SHA-1': { algorithm: 'SHA-1', hash: '', loading: false },
		'SHA-256': { algorithm: 'SHA-256', hash: '', loading: false },
		'SHA-384': { algorithm: 'SHA-384', hash: '', loading: false },
		'SHA-512': { algorithm: 'SHA-512', hash: '', loading: false }
	});

	const algorithms = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

	let worker: Worker;
	let copied: string | null = $state(null);

	// SEO content data
	const seoData = {
		howToSteps: {
			title: 'How to Generate Cryptographic Hashes',
			steps: [
				{
					title: 'Choose Input Type',
					description:
						'Select Text mode to hash strings, passwords, or data. Select File mode to verify file integrity by generating checksums for downloads, backups, or software distributions.'
				},
				{
					title: 'Enter Your Data',
					description:
						'For text mode, paste or type your input. For file mode, drag and drop or click to upload your file. The tool supports files of any size and processes them efficiently in chunks.'
				},
				{
					title: 'Select Algorithm',
					description:
						'Choose the appropriate hashing algorithm: SHA-256/SHA-512 for security-critical applications, or MD5/SHA-1 for non-security checksums. All hashes are generated simultaneously for comparison.'
				},
				{
					title: 'Copy or Compare',
					description:
						'Copy the generated hash to your clipboard with one click. Use the comparison feature to verify if a hash matches an expected value, useful for file integrity verification.'
				}
			]
		},
		comparison: {
			title: 'Which Hash Algorithm Should I Use?',
			description:
				'Different hashing algorithms serve different purposes. Understanding their strengths and weaknesses helps you choose the right one for your use case.',
			headers: ['Algorithm', 'Security Level', 'Best Use Case'],
			rows: [
				{
					label: 'MD5',
					columns: [
						'❌ Broken (Cryptographically Insecure)',
						'Non-security checksums, legacy systems only'
					]
				},
				{
					label: 'SHA-1',
					columns: [
						'⚠️ Deprecated (Collision attacks possible)',
						'Git commits, legacy file verification'
					]
				},
				{
					label: 'SHA-256',
					columns: [
						'✅ Secure (Industry Standard)',
						'Password hashing, digital signatures, blockchain'
					]
				},
				{
					label: 'SHA-512',
					columns: [
						'✅ Highly Secure (Stronger than SHA-256)',
						'High-security applications, long-term data integrity'
					]
				}
			]
		},
		bestPractices: {
			title: 'Best Practices for Hashing',
			practices: [
				'Never use MD5 or SHA-1 for passwords: These algorithms are cryptographically broken. Use bcrypt, Argon2, or PBKDF2 for password storage.',
				'Always salt your hashes: Add a unique random value (salt) to each password before hashing to prevent rainbow table attacks.',
				'Use SHA-256 or SHA-512 for file integrity: These algorithms are secure for verifying downloaded files, backups, and software distributions.',
				'Hash ≠ Encryption: Hashing is one-way and cannot be reversed. Use encryption (AES, RSA) when you need to decrypt data later.',
				'Verify file checksums: Always compare the hash of downloaded files with the official checksum to detect tampering or corruption.',
				'Use HMAC for message authentication: When verifying data integrity and authenticity, use HMAC (Hash-based Message Authentication Code) with a secret key.'
			]
		},
		faqs: {
			title: 'Frequently Asked Questions',
			items: [
				{
					question: 'What is the difference between hashing and encryption?',
					answer:
						'Hashing is a one-way function that cannot be reversed—you cannot get the original data back from a hash. Encryption is two-way—you can decrypt encrypted data with the correct key. Use hashing for passwords and data integrity, use encryption for confidential data that needs to be retrieved later.'
				},
				{
					question: 'Why is MD5 considered insecure?',
					answer:
						'MD5 is cryptographically broken due to collision vulnerabilities—two different inputs can produce the same hash. This makes it unsuitable for security purposes like password storage or digital signatures. However, MD5 is still acceptable for non-security checksums like verifying file integrity in trusted environments.'
				},
				{
					question: 'Which algorithm should I use for password hashing?',
					answer:
						'Do NOT use MD5, SHA-1, SHA-256, or SHA-512 directly for passwords. These are too fast and vulnerable to brute-force attacks. Instead, use specialized password hashing algorithms like bcrypt, Argon2, or PBKDF2, which are designed to be slow and include built-in salting.'
				},
				{
					question: 'What is a salt and why do I need it?',
					answer:
						'A salt is a unique random value added to each password before hashing. It prevents rainbow table attacks (pre-computed hash databases) and ensures that identical passwords produce different hashes. Always use a unique salt for each password, never reuse salts.'
				},
				{
					question: 'Is my data safe when using this tool?',
					answer:
						"Yes! All hashing happens entirely in your browser using JavaScript and Web Workers. Your data never leaves your device—it's not sent to our servers, stored in any database, or transmitted over the internet. Your privacy is guaranteed by design."
				}
			]
		}
	};

	// Reactive logic for text input
	$effect(() => {
		if (textInput && textInput.trim() !== '') {
			if (activeSource !== 'text') {
				fileInput = null;
				clearFileInput();
				activeSource = 'text';
				inputType = 'text';
				fileTabDisabled = true;
				textTabDisabled = false;
			}
			if (debounceTimer) clearTimeout(debounceTimer);
			debounceTimer = setTimeout(() => {
				generateHash('text', textInput);
			}, 150);
		}
	});

	// Reactive logic for file input
	$effect(() => {
		if (fileInput && fileInput !== lastProcessedFile) {
			if (activeSource !== 'file') {
				textInput = '';
				activeSource = 'file';
				inputType = 'file';
				textTabDisabled = true;
				fileTabDisabled = false;
			}
			lastProcessedFile = fileInput;
			generateHash('file', fileInput);
		}
	});

	function clearFileInput() {
		const fileInputElement = document.getElementById('file-upload') as HTMLInputElement;
		if (fileInputElement) {
			fileInputElement.value = '';
		}
	}

	function handleTabChange(newTab: 'text' | 'file') {
		if (activeSource === null) {
			inputType = newTab;
		}
	}

	onMount(() => {
		worker = new HashWorker();
		worker.onmessage = (e) => {
			const { algorithm, hash, error: workerError, done } = e.data;

			if (done) {
				isLoading = false;
				progress = 100;
				return;
			}

			if (workerError) {
				results[algorithm].error = workerError;
				results[algorithm].loading = false;
			} else {
				results[algorithm].hash = hash;
				results[algorithm].loading = false;
			}
		};
	});

	onDestroy(() => {
		if (worker) worker.terminate();
		if (debounceTimer) clearTimeout(debounceTimer);
	});

	function generateHash(type: 'text' | 'file', payload: string | File) {
		if (!payload) return;
		if (type === 'text' && typeof payload === 'string' && !payload.trim()) return;

		isLoading = true;
		progress = 10;

		algorithms.forEach((algo) => {
			results[algo] = { ...results[algo], hash: '', loading: true, error: undefined };
		});

		worker.postMessage({
			type,
			payload,
			algorithms,
			secret: secretKey
		});
	}

	function handleGenerate() {
		if (activeSource === 'text' && textInput?.trim()) {
			generateHash('text', textInput);
		} else if (activeSource === 'file' && fileInput) {
			generateHash('file', fileInput);
		}
	}

	function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			fileInput = target.files[0];
		}
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
			fileInput = e.dataTransfer.files[0];
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
	}

	function copyToClipboard(text: string, algo: string) {
		navigator.clipboard.writeText(formatHash(text, isUpperCase));
		copied = algo;
		selectedAlgorithm = algo;
		setTimeout(() => (copied = null), 2000);
	}

	function handleReset() {
		textInput = '';
		fileInput = null;
		secretKey = '';
		compareHash = '';
		isUpperCase = false;
		inputType = 'text';
		activeSource = null;
		textTabDisabled = false;
		fileTabDisabled = false;
		lastProcessedFile = null;
		selectedAlgorithm = null;

		algorithms.forEach((algo) => {
			results[algo] = { algorithm: algo, hash: '', loading: false };
		});

		isLoading = false;
		progress = 0;
		copied = null;
		clearFileInput();
	}

	const jsonLdSchema = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'Online Hash Generator',
		applicationCategory: 'DeveloperApplication',
		operatingSystem: 'Web Browser',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD'
		},
		description:
			'Generate cryptographic hashes instantly. Supports MD5, SHA-1, SHA-256, SHA-512, and RIPEMD. Verify file integrity and secure passwords. 100% Client-side privacy.',
		featureList: [
			'MD5 Hash Generation',
			'SHA-1 Hash Generation',
			'SHA-256 Hash Generation',
			'SHA-384 Hash Generation',
			'SHA-512 Hash Generation',
			'File Hash Verification',
			'Text Hash Generation',
			'Hash Comparison',
			'HMAC Support',
			'Client-Side Processing',
			'No Data Storage',
			'Copy & Download Support'
		],
		screenshot: 'https://www.devxhub.com/preview.png',
		softwareVersion: '1.0',
		author: {
			'@type': 'Organization',
			name: 'Devxhub',
			url: 'https://www.devxhub.com'
		}
	};
</script>

<svelte:head>
	<JsonLd data={jsonLdSchema} />
</svelte:head>

<!-- SEO handled by /tools/+layout.svelte -->

<div class="mx-auto">
	<PageHeader
		title="Online Cryptographic Hash Generator"
		description="Generate secure hashes for text and files with multiple algorithms. Supports MD5, SHA-1, SHA-256, SHA-384, and SHA-512. Verify file integrity and checksums instantly—all processing happens in your browser."
	/>
	<TrustStrip />

	<div class="grid gap-8 lg:grid-cols-3">
		<div class="lg:col-span-1">
			<HashInput
				bind:inputType
				bind:textInput
				bind:fileInput
				bind:secretKey
				bind:isUpperCase
				{textTabDisabled}
				{fileTabDisabled}
				{activeSource}
				onGenerate={handleGenerate}
				onFileSelect={handleFileSelect}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onReset={handleReset}
				onTabChange={handleTabChange}
			/>
		</div>

		<div class="lg:col-span-2">
			<HashOutput
				{results}
				{algorithms}
				bind:compareHash
				{isLoading}
				{progress}
				{copied}
				onCopy={copyToClipboard}
				formatHash={(h) => formatHash(h, isUpperCase)}
				getComparisonStatus={(h) => getComparisonStatus(h, compareHash)}
			/>
		</div>
	</div>

	<!-- Internal Linking - Password Generator Upsell (when hashing password-like text) -->
	{#if isHashingPassword && activeSource === 'text'}
		<div
			class="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20"
		>
			<div class="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
				<div class="flex-1">
					<h3 class="mb-1 text-sm font-semibold text-blue-900 dark:text-blue-300">
						🔑 Hashing a password?
					</h3>
					<p class="text-sm text-blue-700 dark:text-blue-400">
						Need a stronger source string? Use our Password Generator to create high-entropy inputs
						first.
					</p>
				</div>
				<a
					href="https://www.devxhub.com/tools/random-password-generator"
					class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold whitespace-nowrap text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 7l5 5m0 0l-5 5m5-5H6"
						/>
					</svg>
					Generate Strong Password
				</a>
			</div>
		</div>
	{/if}

	<RelatedTools tool={currentTool} />

	<div class="mt-10">
		<SeoContent
			howToSteps={seoData.howToSteps}
			comparison={seoData.comparison}
			bestPractices={seoData.bestPractices}
			faqs={seoData.faqs}
		/>
	</div>

	<!-- Lead Magnet -->
	<div class="mt-10">
		<LeadMagnetInline
			title="Download: Cryptography 101 - Hashing Algorithms Explained"
			description="Choose the right hash algorithm and implement secure hashing practices for your applications."
			toolName="Hash Generator"
			hookText="Learn the difference between MD5 (unsafe) and SHA-256 (safe) for storing passwords, when to use salts, and how to prevent rainbow table attacks. Essential reading for backend developers."
			buttonText="Download Free Guide"
		/>
	</div>

	<!-- General CTA -->
	<div class="mt-10">
		<CTA
			title="Warning: MD5 is not secure for passwords"
			description="Still using legacy hashing? Our security experts can migrate your database to modern standards (Argon2/Bcrypt) without downtime."
			buttonText="Consult Security Experts"
			buttonUrl="https://www.devxhub.com/custom-software-development"
		/>
	</div>
</div>
