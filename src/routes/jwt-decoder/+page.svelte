<script lang="ts">
	import { CTA, JsonLd, LeadMagnetInline, PageHeader, SeoContent } from '$lib/shared/components';
	import { onDestroy } from 'svelte';
	import JwtDecodeOutput from './components/JwtDecodeOutput.svelte';
	import JwtInput from './components/JwtInput.svelte';
	import JwtOptions from './components/JwtOptions.svelte';
	import type { DecodedJWT, JWTValidation } from './utils/jwtValidator';
	import { decodeJWT, getTimeRemaining, validateJWT } from './utils/jwtValidator';

	let token = $state('');
	let decoded = $state<DecodedJWT | null>(null);
	let validation = $state<JWTValidation | null>(null);
	let error = $state('');
	let timeRemaining = $state('');
	let countdownInterval: number | null = null;

	// Detect if payload has been decoded (for JSON formatter upsell)
	let hasDecodedPayload = $derived(decoded?.payload && Object.keys(decoded.payload).length > 0);

	const sampleJWT =
		'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJKV1QgRGVjb2RlciIsImlhdCI6MTc2NTM1ODEwOCwiZXhwIjo1NzA5OTUwMTA4LCJhdWQiOiJ3d3cuZGV2eGh1Yi5jb20iLCJzdWIiOiJpbmZvQGRldnhodWIuY29tIiwiTmFtZSI6IkRldnhodWIgTGltaXRlZCIsIkVtYWlsIjoiaW5mb0BkZXh2aHViLmNvbSIsIlJvbGUiOlsiTWFuYWdlciIsIlByb2plY3QgQWRtaW5pc3RyYXRvciJdfQ.OCLsxVnvAzYj8l6WtySvldW86dGZKHHrw9N_6bm3KJY';

	// SEO content data
	const seoData = {
		howToSteps: {
			title: 'How to Decode and Debug JWT Tokens',
			steps: [
				{
					title: 'Paste Your JWT Token',
					description:
						'Copy the JWT token from your application, API response, or browser cookies and paste it into the input field. JWTs are typically found in Authorization headers (Bearer token) or stored in localStorage/cookies.'
				},
				{
					title: 'View Decoded Parts',
					description:
						'The tool automatically decodes the token into three parts: Header (algorithm and token type), Payload (claims and user data), and Signature (verification hash). Each part is displayed in a readable JSON format.'
				},
				{
					title: 'Check Expiration and Claims',
					description:
						'Review the exp (expiration) claim to see when the token expires. Check other standard claims like iss (issuer), sub (subject), aud (audience), and custom claims specific to your application.'
				},
				{
					title: 'Verify Signature (Optional)',
					description:
						"If you have the secret key (HS256) or public key (RS256), you can verify the token signature to ensure it hasn't been tampered with. All verification happens in your browser—keys are never sent to our servers."
				}
			]
		},
		comparison: {
			title: 'JWT vs. Session Cookies: Which Should You Use?',
			description:
				'Understanding the trade-offs between JWTs and traditional session cookies helps you choose the right authentication strategy for your application.',
			headers: ['Feature', 'JWT (Stateless)', 'Session Cookies (Stateful)'],
			rows: [
				{
					label: 'Storage',
					columns: ['Client-side (localStorage, cookies)', 'Server-side (database, Redis)']
				},
				{
					label: 'Scalability',
					columns: ['Excellent (no server state)', 'Requires sticky sessions or shared storage']
				},
				{
					label: 'Revocation',
					columns: ['Difficult (must wait for expiration)', 'Easy (delete session from server)']
				},
				{
					label: 'Size',
					columns: ['Larger (contains all claims)', 'Smaller (just session ID)']
				},
				{
					label: 'Best For',
					columns: ['Microservices, APIs, mobile apps', 'Traditional web apps, admin panels']
				}
			]
		},
		bestPractices: {
			title: 'JWT Security Best Practices',
			practices: [
				'Always use HTTPS: JWTs transmitted over HTTP can be intercepted. Always use HTTPS/TLS to encrypt the connection.',
				'Set short expiration times: Use exp claim to limit token lifetime (15-60 minutes). Implement refresh tokens for longer sessions.',
				'Never store sensitive data in payload: JWTs are Base64-encoded, not encrypted. Anyone can decode and read the payload.',
				'Use strong signing algorithms: Prefer RS256 (asymmetric) over HS256 (symmetric) for better security. Never use "none" algorithm.',
				"Validate all claims: Always verify iss, aud, exp, and nbf claims on the server. Don't trust client-side validation alone.",
				'Implement token refresh: Use short-lived access tokens with long-lived refresh tokens to balance security and user experience.'
			]
		},
		faqs: {
			title: 'Frequently Asked Questions',
			items: [
				{
					question: 'What are the three parts of a JWT?',
					answer:
						"A JWT consists of three parts separated by dots (.): 1) Header - contains the algorithm (alg) and token type (typ), 2) Payload - contains claims (user data, expiration, etc.), and 3) Signature - verifies the token hasn't been tampered with. Each part is Base64URL-encoded."
				},
				{
					question: 'What are JWT claims and why are they important?',
					answer:
						'Claims are key-value pairs in the JWT payload that contain information about the user and token. Standard claims include: iss (issuer), sub (subject/user ID), aud (audience), exp (expiration time), nbf (not before), iat (issued at), and jti (JWT ID). Custom claims can store additional user data like roles or permissions.'
				},
				{
					question: 'How do I verify a JWT signature?',
					answer:
						'For HS256 (HMAC), you need the secret key used to sign the token. For RS256 (RSA), you need the public key. Our tool can verify signatures client-side, but in production, always verify signatures on your server to prevent tampering.'
				},
				{
					question: 'What does "exp" mean and why is it important?',
					answer:
						'The exp (expiration) claim is a Unix timestamp indicating when the token expires. After this time, the token should be rejected by the server. Short expiration times (15-60 minutes) improve security by limiting the window for token theft or misuse.'
				},
				{
					question: 'Is my JWT token safe when using this tool?',
					answer:
						"Yes! All decoding and verification happens entirely in your browser using JavaScript. Your tokens and secret keys never leave your device—they're not sent to our servers, stored in any database, or transmitted over the internet. Your data remains completely private."
				}
			]
		}
	};

	const handleTokenChange = (newToken: string) => {
		token = newToken;
	};

	const handleDecode = () => {
		error = '';
		decoded = null;
		validation = null;
		timeRemaining = '';
		if (countdownInterval) {
			clearInterval(countdownInterval);
			countdownInterval = null;
		}
		if (!token.trim()) {
			error = 'Please enter a JWT token';
			return;
		}
		const decodedResult = decodeJWT(token);
		if (!decodedResult) {
			error = 'Invalid JWT token format. Please check your token and try again.';
			return;
		}
		decoded = decodedResult;
		validation = validateJWT(token);
		if (validation.expiresAt && !validation.isExpired) {
			updateCountdown();
			countdownInterval = setInterval(updateCountdown, 1000) as unknown as number;
		}
	};

	const updateCountdown = () => {
		if (validation?.expiresAt) {
			timeRemaining = getTimeRemaining(validation.expiresAt);
			if (timeRemaining === 'Expired') {
				validation = { ...validation, isExpired: true, message: 'Token has expired' };
				if (countdownInterval) {
					clearInterval(countdownInterval);
					countdownInterval = null;
				}
			}
		}
	};

	const handleLoadSample = () => {
		token = sampleJWT;
		handleDecode();
	};

	const handleReset = () => {
		token = '';
		decoded = null;
		validation = null;
		error = '';
		timeRemaining = '';
		if (countdownInterval) {
			clearInterval(countdownInterval);
			countdownInterval = null;
		}
	};

	onDestroy(() => {
		if (countdownInterval) clearInterval(countdownInterval);
	});

	const jsonLdSchema = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'JWT Decoder',
		applicationCategory: 'DeveloperApplication',
		operatingSystem: 'Web Browser',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD'
		},
		description:
			'Decode and debug JWTs (JSON Web Tokens) instantly. View Header, Payload, and Signature. Check expiration dates (exp) and claims. 100% Client-side privacy.',
		featureList: [
			'JWT Decoding',
			'Header Inspection',
			'Payload Viewing',
			'Signature Verification',
			'Expiration Checking',
			'Claims Validation',
			'HS256 Support',
			'RS256 Support',
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
		title="Online JWT (JSON Web Token) Decoder"
		description="Decode, validate, and verify JSON Web Tokens instantly. View header, payload, and signature. Check expiration dates and debug authentication issues—all processing happens in your browser."
	/>

	<div class="space-y-4 sm:space-y-6">
		<JwtInput
			{token}
			onTokenChange={handleTokenChange}
			onDecode={handleDecode}
			onLoadSample={handleLoadSample}
			onReset={handleReset}
			{sampleJWT}
		/>

		{#if error}
			<div
				class="rounded-lg border border-l-4 border-slate-200 border-l-red-500 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-800"
			>
				<div class="flex items-start gap-3">
					<div class="rounded-full bg-red-100 p-2 text-red-600 dark:bg-red-900/50">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<path
								d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
							/>
							<line x1="12" y1="9" x2="12" y2="13" />
							<line x1="12" y1="17" x2="12.01" y2="17" />
						</svg>
					</div>
					<div>
						<h3 class="text-base font-semibold text-red-700 dark:text-red-400">Invalid Token</h3>
						<p class="text-sm text-slate-600 dark:text-slate-400">{error}</p>
					</div>
				</div>
			</div>
		{/if}

		<JwtDecodeOutput {decoded} {validation} {timeRemaining} />
		{#if decoded}<JwtOptions {token} />{/if}
	</div>

	<!-- Internal Linking - JSON Formatter Upsell (when payload is decoded) -->
	{#if hasDecodedPayload}
		<div
			class="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20"
		>
			<div class="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
				<div class="flex-1">
					<h3 class="mb-1 text-sm font-semibold text-blue-900 dark:text-blue-300">
						📋 Payload messy?
					</h3>
					<p class="text-sm text-blue-700 dark:text-blue-400">
						Format it deeply with our JSON Formatter for better readability and validation.
					</p>
				</div>
				<a
					href="https://www.devxhub.com/tools/json-formatter-validator"
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
					Format JSON
				</a>
			</div>
		</div>
	{/if}

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
			title="Download: The JWT Security Checklist - Stop Token Theft"
			description="Essential JWT security practices and common vulnerabilities to avoid in your authentication system."
			toolName="JWT Decoder"
			hookText="JWTs are powerful but easily mishandled. This checklist prevents common vulnerabilities like XSS, CSRF, token theft, and insecure storage. Essential reading for full-stack developers."
			buttonText="Download Free Checklist"
		/>
	</div>

	<!-- General CTA -->
	<div class="mt-10">
		<CTA
			title="Struggling with Refresh Token rotation?"
			description="Implementing secure, persistent sessions is hard. Our backend engineers specialize in OAuth2, OIDC, and secure session management."
			buttonText="Fix Auth Issues"
			buttonUrl="https://www.devxhub.com/full-stack-development"
		/>
	</div>
</div>
