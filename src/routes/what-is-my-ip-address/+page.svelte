<!-- SEO handled by /tools/+layout.svelte -->

<script lang="ts">
	import { CTA, LeadMagnetInline, PageHeader, SeoContent } from '$lib/shared/components';
	import IPLocationBody from './components/IPLocationBody.svelte';

	// SEO content data
	const seoData = {
		howToSteps: {
			title: 'How to Use the IP Address Lookup Tool',
			steps: [
				{
					title: 'Automatic Detection',
					description:
						'Your IP address is automatically detected and displayed when you load this page. No action required.'
				},
				{
					title: 'View Geolocation Data',
					description:
						'See your country, city, region, ISP (Internet Service Provider), and approximate coordinates.'
				},
				{
					title: 'Lookup Any IP',
					description:
						'Enter any IPv4 or IPv6 address in the search box to look up its geolocation and network information.'
				},
				{
					title: 'Copy or Share',
					description:
						'Use the copy button to quickly copy your IP address for troubleshooting or sharing with support teams.'
				}
			]
		},
		comparison: {
			title: "IPv4 vs IPv6: What's the Difference?",
			description:
				'Understanding the two versions of Internet Protocol addresses and why both exist.',
			headers: ['Feature', 'IPv4', 'IPv6'],
			rows: [
				{
					label: 'Format',
					columns: [
						'192.168.1.1 (32-bit, dotted decimal)',
						'2001:0db8:85a3::8a2e:0370:7334 (128-bit, hexadecimal)'
					]
				},
				{
					label: 'Address Space',
					columns: ['~4.3 billion addresses', '340 undecillion addresses (virtually unlimited)']
				},
				{
					label: 'Adoption',
					columns: ['Universal (legacy standard)', 'Growing (modern standard)']
				},
				{
					label: 'Security',
					columns: ['IPsec optional', 'IPsec built-in']
				},
				{
					label: 'NAT Required',
					columns: ['Yes (due to address exhaustion)', 'No (enough addresses for all devices)']
				}
			]
		},
		bestPractices: {
			title: 'Best Practices for IP Address Management',
			practices: [
				'Use Static IPs for Servers: Assign static IP addresses to servers, databases, and critical infrastructure to ensure consistent accessibility.',
				'Implement IP Whitelisting: Restrict access to sensitive systems by allowing only specific IP addresses or ranges.',
				"Monitor IP Reputation: Check if your IP is blacklisted (RBL) if you're experiencing email delivery issues or blocked access.",
				'Use VPNs for Privacy: Mask your real IP address when accessing public networks or bypassing geo-restrictions.',
				'Plan for IPv6 Migration: As IPv4 addresses become scarce, ensure your infrastructure supports IPv6 for future-proofing.'
			]
		},
		faqs: {
			title: 'Frequently Asked Questions',
			items: [
				{
					question: 'How does IP geolocation work?',
					answer:
						"IP geolocation uses databases maintained by organizations like MaxMind and IP2Location. These databases map IP address ranges to physical locations by analyzing data from ISPs, regional internet registries (RIRs), and user-submitted information. The accuracy varies: country-level is ~95% accurate, city-level is ~50-75% accurate. Geolocation cannot pinpoint your exact street address—it shows the location of your ISP's infrastructure."
				},
				{
					question: 'Why is my IP location wrong?',
					answer:
						"IP geolocation is not GPS. Common reasons for inaccuracy: (1) You're using a VPN or proxy, which shows the VPN server's location instead of yours. (2) Your ISP routes traffic through a different city. (3) Mobile networks often show the carrier's headquarters location. (4) The geolocation database is outdated. If you're not using a VPN and the location is wildly incorrect, your ISP may have recently changed their routing infrastructure."
				},
				{
					question: 'What is the difference between public and private IP addresses?',
					answer:
						'Public IPs are globally unique addresses assigned by your ISP, visible to the internet (e.g., 203.0.113.45). Private IPs are used within local networks and are not routable on the internet (e.g., 192.168.x.x, 10.x.x.x). Your router uses NAT (Network Address Translation) to allow multiple devices with private IPs to share one public IP.'
				},
				{
					question: 'Can someone hack me with my IP address?',
					answer:
						'Your IP address alone is not enough to "hack" you. However, it can reveal your approximate location and ISP. Risks include: (1) DDoS attacks (flooding your network with traffic). (2) Port scanning to find vulnerable services. (3) Social engineering (using your location for phishing). Mitigation: Use a firewall, keep your router firmware updated, and avoid exposing unnecessary services to the internet.'
				},
				{
					question: 'Does my IP address change?',
					answer:
						'Most home users have dynamic IPs, which change periodically (when you restart your router or after a lease expires). Business and server users often have static IPs that never change. You can request a static IP from your ISP, usually for a fee. Mobile networks assign dynamic IPs that change frequently.'
				},
				{
					question: 'What is IPv6 and why do I need it?',
					answer:
						'IPv6 is the next-generation internet protocol designed to replace IPv4. IPv4 has only 4.3 billion addresses, which are nearly exhausted. IPv6 provides 340 undecillion addresses (enough for every grain of sand on Earth). Benefits: No need for NAT, better security (IPsec built-in), improved routing efficiency. Adoption is growing, but IPv4 will coexist for years due to legacy infrastructure.'
				}
			]
		}
	};
</script>

<svelte:head>
	<script type="application/ld+json">
		{JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'SoftwareApplication',
			name: 'What Is My IP Address?',
			applicationCategory: 'DeveloperApplication',
			operatingSystem: 'Any',
			offers: {
				'@type': 'Offer',
				price: '0',
				priceCurrency: 'USD'
			},
			description:
				'Find your IP address instantly. Get detailed geolocation data including country, city, ISP, and coordinates. Supports both IPv4 and IPv6 lookups.'
		})}
	</script>
</svelte:head>

<article class="mx-auto">
	<PageHeader
		title="What Is My IP Address?"
		description="Find your IP address instantly. Get detailed geolocation data including country, city, ISP, and coordinates."
	/>

	<section aria-label="IP address lookup interface">
		<IPLocationBody />
	</section>

	<!-- Internal Linking - Unix Timestamp Converter Upsell (for network testing) -->
	<div
		class="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20"
	>
		<div class="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
			<div class="flex-1">
				<h3 class="mb-1 text-sm font-semibold text-blue-900 dark:text-blue-300">
					⏱️ Testing network latency or VPN connection?
				</h3>
				<p class="text-sm text-blue-700 dark:text-blue-400">
					Check exact timestamps with our Unix Timestamp Converter for precise timing analysis.
				</p>
			</div>
			<a
				href="https://www.devxhub.com/tools/unix-timestamp-converter"
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
				Convert Timestamps
			</a>
		</div>
	</div>

	<!-- SEO Content Section -->
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
			title="Geolocation Marketing: How to Personalize Content by Region"
			description="Implement IP geolocation while respecting user privacy."
			toolName="What Is My IP Address?"
			hookText="Shows businesses how to use IP data to show the right currency, language, and offers to users."
		/>
	</div>

	<div class="mt-10">
		<CTA
			title="Need to restrict access by location?"
			description="Geo-fencing and firewall rules are critical for enterprise security. Our Cloud Engineers configure AWS WAF and Cloudflare to protect your apps."
			buttonText="View DevOps & Cloud Solutions"
			buttonUrl="https://www.devxhub.com/devops-solutions"
		/>
	</div>
</article>
