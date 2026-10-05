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
	import PasswordGenerator from './components/PasswordGenerator.svelte';

	const currentTool = getToolBySlug('random-password-generator')!;

	// SEO content data
	const seoData = {
		howToSteps: {
			title: 'Why is this tool safe? (Client-Side Encryption)',
			steps: [
				{
					title: 'Browser-Only Processing',
					description:
						"Unlike other password generators, this tool runs entirely in your browser using JavaScript. The password never leaves your device - it's not sent to our servers, stored in any database, or transmitted over the internet."
				},
				{
					title: 'Offline Capability',
					description:
						'You can even disconnect your internet connection and the tool will still work perfectly. This client-side approach ensures complete privacy and security for your generated passwords.'
				},
				{
					title: 'Cryptographically Secure',
					description:
						'The tool uses the Web Crypto API for cryptographically secure random number generation, ensuring your passwords are truly unpredictable and resistant to attacks.'
				},
				{
					title: 'No Tracking or Storage',
					description:
						'We have no way to see, store, or access the passwords you generate. Your privacy is guaranteed by design, not just by policy.'
				}
			]
		},
		comparison: {
			title: 'What makes a password "Strong"?',
			description:
				'Password strength is measured by entropy - the randomness and unpredictability of characters. A strong password combines multiple character types (uppercase, lowercase, numbers, symbols) and sufficient length to resist brute-force attacks.',
			headers: ['Password Type', 'Example', 'Strength Level'],
			rows: [
				{
					label: 'Weak Pattern',
					columns: ['Tr0ub4dor&3', 'Low - Follows predictable substitution patterns']
				},
				{
					label: 'Random Strong',
					columns: ['xK9#mP2$vL8@nQ5%', 'Very High - Truly random 16-character mix']
				},
				{
					label: 'Passphrase',
					columns: [
						'CorrectHorseBatteryStaple',
						'High - Long and memorable, but avoid dictionary words'
					]
				}
			]
		},
		bestPractices: {
			title: 'Best Practices for Password Management',
			practices: [
				'Never reuse passwords across different accounts - a breach on one site compromises all others',
				'Use a password manager to securely store and organize your passwords',
				'Enable two-factor authentication (2FA) whenever possible for an extra layer of security',
				'Change passwords immediately if you suspect a breach or unauthorized access',
				'Avoid storing passwords in plain text files, spreadsheets, or browser notes',
				'Use passwords with at least 16 characters for critical accounts like email and banking'
			]
		},
		faqs: {
			title: 'Frequently Asked Questions',
			items: [
				{
					question: 'Do you save these passwords?',
					answer:
						'Never. All password generation happens entirely in your browser using JavaScript. You can even disconnect your internet and the tool will still work. We have no way to see, store, or access the passwords you generate.'
				},
				{
					question: 'How long should my password be?',
					answer:
						'We recommend at least 16 characters for most accounts. For highly sensitive accounts (banking, email, work), consider 20+ characters. Longer passwords are exponentially harder to crack.'
				},
				{
					question: 'Should I include symbols in my password?',
					answer:
						'Yes, including symbols significantly increases password entropy and makes brute-force attacks much more difficult. Our default settings include symbols for maximum security.'
				},
				{
					question: 'Is this tool really secure?',
					answer:
						'Absolutely. The tool uses cryptographically secure random number generation (Web Crypto API) and runs entirely client-side. Your passwords are generated on your device and never transmitted anywhere.'
				}
			]
		}
	};

	let password = $state('');
	let copied = $state(false);

	const handleCopy = async () => {
		if (!password) return;
		try {
			if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(password);
				copied = true;
			}
		} catch (error) {
			console.error('Failed to copy password', error);
		} finally {
			setTimeout(() => {
				copied = false;
			}, 2000);
		}
	};

	const jsonLdSchema = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'Secure Random Password Generator',
		applicationCategory: 'UtilitiesApplication',
		operatingSystem: 'Web Browser',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD'
		},
		description:
			'Generate secure, uncrackable passwords instantly in your browser. 100% client-side with customizable length, symbols, and numbers. No data sent to servers.',
		featureList: [
			'Client-Side Generation',
			'Cryptographically Secure',
			'Customizable Length',
			'Symbol & Number Options',
			'No Server Storage',
			'Offline Capable',
			'One-Click Copy',
			'Privacy-First Design',
			'No Sign-up Required',
			'Free Forever'
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
		title="Secure & Random Password Generator"
		description="Generate secure, uncrackable passwords instantly in your browser. Customizable length, symbols, and numbers. No data is sent to our servers. Free & Privacy-first."
	/>
	<TrustStrip />

	<PasswordGenerator
		{password}
		{copied}
		onPasswordChange={(newPassword) => {
			password = newPassword;
		}}
		onCopy={handleCopy}
		onCopiedChange={(value) => {
			copied = value;
		}}
	/>

	<RelatedTools tool={currentTool} />

	<div class="mt-10">
		<SeoContent
			howToSteps={seoData.howToSteps}
			comparison={seoData.comparison}
			bestPractices={seoData.bestPractices}
			faqs={seoData.faqs}
		/>
	</div>
	<div class="mt-10">
		<LeadMagnetInline
			title="Download: The CTO's Guide to Data Privacy & GDPR Compliance"
			description="Learn enterprise-grade password policies, encryption standards, and regulatory compliance requirements."
			toolName="Password Generator"
			hookText="Protect your organization from data breaches with industry-standard security practices and compliance frameworks."
			buttonText="Download Free Security Guide"
		/>
	</div>

	<div class="mt-10">
		<CTA
			title="Worried about your app's security?"
			description="Don't let a data breach destroy your reputation. We conduct enterprise security audits and build ISO-compliant auth systems."
			buttonText="Explore Security Services"
			buttonUrl="https://www.devxhub.com/devops-solutions"
		/>
	</div>
</div>
