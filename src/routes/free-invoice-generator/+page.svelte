<script lang="ts">
	import { CTA, JsonLd, LeadMagnetInline, PageHeader, SeoContent } from '$lib/shared/components';
	import { pushInvoiceEventOnce } from './analytics';
	import InvoiceGenerator from './components/InvoiceGenerator.svelte';

	/** Visible “Last updated” line — change this when the page content is revised. */
	const lastUpdated = '25 August 2026';

	const pageDescription =
		'Build and download a PDF invoice in minutes. Tax ID, currency codes, and full bank details for domestic or overseas clients. Free, no sign-up, nothing stored.';

	const disclaimer =
		'General information, not tax or legal advice. Invoice requirements vary by country — confirm your obligations with a qualified accountant.';

	const crossBorderPoints = [
		{
			title: 'The wire is returned or held.',
			body: 'USD payments to banks outside the US route through a correspondent bank. Leave those details off and the transfer can sit unallocated or bounce back with fees deducted.'
		},
		{
			title: "The client's finance team rejects it.",
			body: 'Many B2B buyers cannot process a supplier invoice without a tax registration number on it. Yours is called a BIN, VAT number, GSTIN, EIN or ABN depending on where you are.'
		},
		{
			title: 'The tax treatment is ambiguous.',
			body: 'A blank tax line and a zero-rated export line look identical on paper and mean completely different things to an auditor. Exports of services are usually zero-rated, not untaxed — but only if the invoice says so.'
		},
		{
			title: 'The currency is unclear.',
			body: '"$" is the US, Canadian, Australian, Singapore and Hong Kong dollar. On a cross-border invoice, write the ISO code.'
		}
	];

	// Single source for visible FAQ accordion and FAQPage JSON-LD — keep in sync by construction.
	const faqItems = [
		{
			question: 'Is this really free?',
			answer:
				'Yes. No account, no trial, no watermark, no usage cap. We build custom business software; this tool is how people find us.'
		},
		{
			question: 'Is my invoice data stored anywhere?',
			answer:
				'No. Your invoice is built entirely in your browser and never sent to our servers. Nothing you type is saved between visits, so download your PDF before closing the tab. The only thing kept on your device is your invoice number counter, so sequential numbering continues where you left off.'
		},
		{
			question: 'What do I need on an invoice to a client in another country?',
			answer:
				"Requirements vary by country and by your client's internal policy, but these are commonly expected: your legal business name and address, your tax registration number, a unique sequential invoice number, issue and due dates, the service period, an itemised list with units, an explicit currency code, the tax treatment, and complete payment details. For a wire, that usually includes SWIFT/BIC and often a correspondent bank. Check your own obligations with an accountant."
		},
		{
			question: 'What is a correspondent bank and do I need one?',
			answer:
				'An intermediary bank that routes a payment between two banks with no direct relationship — common for USD payments to banks outside the US. Your bank can tell you which one it uses. Omitting it is a frequent cause of delayed and returned transfers.'
		},
		{
			question: 'What does OUR, SHA or BEN mean?',
			answer:
				"Who pays the wire fees. OUR — the sender pays all charges. BEN — the recipient pays, deducted from the amount. SHA — each side pays their own bank's charges, the most common default."
		},
		{
			question: 'What is a zero-rated export invoice?',
			answer:
				'Many countries treat exported services as taxable at 0% rather than as outside the tax system — the two are not the same to an auditor, so where that treatment applies the invoice should state it rather than simply omitting a tax line. Whether it applies to you depends on your country and the nature of the supply.'
		},
		{
			question: 'Which currencies are supported?',
			answer:
				'USD, EUR, GBP, JPY, CAD, AUD, INR, and BDT. The PDF prints the ISO code alongside the total, so there is no ambiguity between the various dollar currencies.'
		},
		{
			question: 'Can I add my logo and brand colour?',
			answer: 'Yes — upload a logo and set an accent colour.'
		}
	];

	const softwareApplicationSchema = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'Free Invoice Generator',
		applicationCategory: 'FinanceApplication',
		operatingSystem: 'Web',
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD'
		},
		description: pageDescription,
		featureList: [
			'Invoice Creation',
			'PDF Download',
			'Logo Upload',
			'Accent Colour',
			'Multiple Currencies',
			'Tax Calculation',
			'Discount Support',
			'Payment Terms',
			'Live Preview',
			'No Sign-up Required',
			'100% Free'
		]
	};

	const faqPageSchema = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqItems.map((item) => ({
			'@type': 'Question',
			name: item.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: item.answer
			}
		}))
	};

	const seoData = {
		howToSteps: {
			title: 'How to Create a Professional Invoice',
			steps: [
				{
					title: 'Enter Your Business Details',
					description:
						'Add your company name, address, email, and phone number. Upload your business logo for a professional look. Enter your registration number in the Tax ID field — the label updates by country (VAT, GSTIN, EIN, ABN, and similar).'
				},
				{
					title: 'Add Client Information',
					description:
						"Enter your client's name, company, address, and contact details. This ensures the invoice is properly addressed and helps with record-keeping and payment tracking."
				},
				{
					title: 'List Items and Prices',
					description:
						'Add line items with descriptions, quantities, and unit prices. The tool automatically calculates subtotals. Include tax rates and discounts if needed. Set your preferred currency (USD, EUR, GBP, etc.).'
				},
				{
					title: 'Download as PDF',
					description:
						'Review your invoice in the live preview. Set the invoice number, issue date, and due date. Download as a professional PDF ready to send to your client via email or print.'
				}
			]
		},
		comparison: {
			title: 'When to use a free generator, and when to buy software',
			headers: ['', 'This generator', 'Invoicing SaaS'],
			rows: [
				{
					label: 'Cost',
					columns: ['Free, no account', 'Monthly subscription']
				},
				{
					label: 'Start-up time',
					columns: ['Immediate', 'Sign-up and onboarding']
				},
				{
					label: 'Cross-border fields',
					columns: [
						'Tax IDs, export tax treatment, correspondent bank, charge bearer',
						'Varies; often US/EU-centric'
					]
				},
				{
					label: 'Your data',
					columns: ['Never leaves your browser', 'Stored on their servers']
				},
				{
					label: 'Saved between visits',
					columns: [
						'Invoice contents, no — download before you close the tab',
						'Yes'
					]
				},
				{
					label: 'Recurring billing, reminders, accounting sync',
					columns: ['No', 'Yes']
				},
				{
					label: 'Best for',
					columns: [
						'Freelancers, agencies, one-off and occasional invoices',
						'High-volume and recurring billing'
					]
				}
			]
		},
		bestPractices: {
			title: 'What Every Invoice Must Include (Legal Requirements)',
			practices: [
				'Unique Invoice Number: Sequential numbering (INV-001, INV-002) for tracking and accounting. Required by tax authorities in most countries.',
				'Invoice Date: The date the invoice is issued. Critical for payment terms and tax reporting.',
				'Due Date: Clear payment deadline (e.g., "Net 30" means payment due in 30 days). Reduces late payments.',
				'Business Details: Your legal business name, address, and contact information. Required for legal validity.',
				'Tax ID (VAT/GST): Your tax registration number if applicable. Mandatory for B2B transactions in many countries.',
				'Itemized List: Clear description, quantity, unit price, and total for each item or service. Prevents payment disputes.'
			]
		},
		faqs: {
			title: 'Frequently Asked Questions',
			items: faqItems
		}
	};
</script>

<svelte:head>
	<JsonLd data={[softwareApplicationSchema, faqPageSchema]} />
</svelte:head>

<div class="mx-auto">
	<!-- C1 Hero -->
	<PageHeader
		title="Free Invoice Generator"
		description="Create and download a professional PDF invoice in under two minutes. Domestic or cross-border — with the tax ID, currency and payment details each one needs. No sign-up, no email, no account."
	/>

	<p class="mb-6 text-center text-sm text-slate-400 sm:mb-8">
		Last updated: {lastUpdated}
	</p>

	<!-- Invoice Generator -->
	<section aria-labelledby="invoice-heading" id="invoice-tool">
		<InvoiceGenerator />
	</section>

	<!-- C2 — directly beneath the tool -->
	<section class="mt-16" aria-labelledby="cross-border-heading">
		<h2 id="cross-border-heading" class="mb-4 text-3xl font-bold text-slate-100">
			Why invoices to foreign clients get paid late
		</h2>
		<p class="mb-8 max-w-3xl text-base text-slate-200">
			Most invoice templates are built for domestic billing. Send one across a border and the gaps
			show up as delays you don't find out about for a week.
		</p>
		<ul class="grid gap-4 sm:grid-cols-2">
			{#each crossBorderPoints as point}
				<li
					class="rounded-lg border border-[#ffffff1a] bg-[#2a1e56] p-5"
				>
					<p class="mb-2 text-base font-semibold text-[#FFD700]">{point.title}</p>
					<p class="text-base text-slate-200">{point.body}</p>
				</li>
			{/each}
		</ul>
		<p class="mt-6 text-base font-medium text-slate-100">
			This generator includes every one of these fields.
		</p>
	</section>

	<!-- How-to + comparison (C3) -->
	<div class="mt-10">
		<SeoContent howToSteps={seoData.howToSteps} comparison={seoData.comparison} />
	</div>

	<!-- C5 — after C2 and C3 -->
	<div class="mt-10">
		<CTA
			title="Why is this free?"
			description="We build custom ERP, CRM and billing systems for companies that have outgrown spreadsheets and off-the-shelf tools. This generator is a small piece of that work, given away. If your invoicing is one symptom of a bigger operations problem, that's the conversation we're interested in."
			buttonText="Talk to our team"
			buttonUrl="https://www.devxhub.com/contact"
			buttonAriaLabel="Talk to the Devxhub team about custom business software"
			buttonOnClick={() => pushInvoiceEventOnce('consult_cta_click')}
		/>
	</div>

	<!-- Best practices + FAQ + disclaimer -->
	<div class="mt-10">
		<SeoContent
			bestPractices={seoData.bestPractices}
			faqs={seoData.faqs}
			{disclaimer}
		/>
	</div>

	<!-- Lead Magnet -->
	<div class="mt-10">
		<LeadMagnetInline
			title="Download: Professional Invoice Design & Legal Requirements Guide"
			description="Create legally compliant invoices that get paid faster. Essential for freelancers and small businesses."
			toolName="Invoice Generator"
			hookText="Incorrect invoices can delay payments by weeks or cause legal issues. Learn what every invoice must include, payment terms best practices, and how to handle international clients."
			buttonText="Download Free Guide"
			submitAnalyticsEvent="guide_email_submit"
		/>
	</div>
</div>
