<script lang="ts">
	interface Step {
		title: string;
		description: string;
	}

	interface ComparisonRow {
		label: string;
		columns: Array<string | string[]>;
	}

	interface FAQ {
		question: string;
		answer: string;
	}

	interface Props {
		howToSteps?: {
			title?: string;
			steps: Step[];
		};
		comparison?: {
			title?: string;
			description?: string;
			headers: string[];
			rows: ComparisonRow[];
		};
		bestPractices?: {
			title?: string;
			practices: string[];
		};
		faqs?: {
			title?: string;
			items: FAQ[];
		};
		/** Optional body text rendered directly beneath the FAQ accordion. */
		disclaimer?: string;
	}

	let { howToSteps, comparison, bestPractices, faqs, disclaimer }: Props = $props();
	
	let openFaqIndex = $state<number | null>(null);
	
	function toggleFaq(index: number) {
		openFaqIndex = openFaqIndex === index ? null : index;
	}
</script>

<div class="mt-16 space-y-16">
	<!-- How to Steps Section -->
	{#if howToSteps}
		<section>
			<h2 class="mb-6 text-3xl font-bold text-slate-100">
				{howToSteps.title || 'How to Create a Custom QR Code'}
			</h2>
			
			<div class="grid gap-6 md:grid-cols-2">
				{#each howToSteps.steps as step, index}
					<div class="space-y-4">
						<div>
							<h3 class="mb-2 text-xl font-semibold text-[#FFD700]">Step {index + 1}</h3>
							<p class="text-base text-slate-200">{step.description}</p>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Comparison Table Section -->
	{#if comparison}
		<section>
			<h2 class="mb-6 text-3xl font-bold text-slate-100">
				{comparison.title || 'Static vs. Dynamic QR Codes'}
			</h2>
			{#if comparison.description}
				<p class="mb-6 text-base text-slate-200">{comparison.description}</p>
			{/if}
			
			<div class="overflow-x-auto">
				<table class="w-full border-collapse">
					<thead>
						<tr class="bg-[#2a1e56] border border-[#ffffff1a]">
							{#each comparison.headers as header, index}
								<th
									scope="col"
									class="p-4 text-left font-semibold text-slate-100"
									class:border-r={index < comparison.headers.length - 1}
									class:border-[#ffffff1a]={index < comparison.headers.length - 1}
								>
									{header}
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each comparison.rows as row}
							<tr>
								<th
									scope="row"
									class="border border-[#ffffff1a] p-4 text-left font-medium text-slate-200"
								>
									{row.label}
								</th>
								{#each row.columns as column}
									<td class="border border-[#ffffff1a] p-4 text-base text-slate-200">
										{#if Array.isArray(column)}
											<ul class="list-disc space-y-1 pl-5">
												{#each column as item}
													<li>{item}</li>
												{/each}
											</ul>
										{:else}
											{column}
										{/if}
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>
	{/if}

	<!-- Best Practices Section -->
	{#if bestPractices}
		<section>
			<h2 class="mb-6 text-3xl font-bold text-slate-100">
				{bestPractices.title || 'Best Practices for Printing QR Codes'}
			</h2>
			
			<div class="grid gap-6 w-full md:grid-cols-2">
				{#each [bestPractices.practices.slice(0, Math.ceil(bestPractices.practices.length / 2)), bestPractices.practices.slice(Math.ceil(bestPractices.practices.length / 2))] as column}
					<ul class="space-y-3 text-base text-slate-200">
						{#each column as practice}
							<li class="flex items-center gap-2">
								<svg class="h-3 w-3 text-[#FFD700] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
									<path
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									/>
								</svg>
								<span>{practice}</span>
							</li>
						{/each}
					</ul>
				{/each}
			</div>
		</section>
	{/if}

	<!-- FAQ Section -->
	{#if faqs}
		<section>
			<h2 class="mb-8 text-3xl font-bold text-slate-100">
				{faqs.title || 'Frequently Asked Questions'}
			</h2>
			
			<div class="space-y-4">
				{#each faqs.items as faq, index}
					<div class="rounded-lg border border-[#ffffff1a] bg-[#2a1e56]">
						<button 
							class="flex w-full cursor-pointer items-center justify-between p-6 text-xl font-semibold text-[#FFD700] hover:text-[#FFC700] transition-colors text-left"
							onclick={() => toggleFaq(index)}
							aria-expanded={openFaqIndex === index}
						>
							<span>{faq.question}</span>
							<svg 
								class="h-5 w-5 transition-transform flex-shrink-0" 
								class:rotate-180={openFaqIndex === index}
								fill="none" 
								stroke="currentColor" 
								viewBox="0 0 24 24"
							>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
							</svg>
						</button>
						{#if openFaqIndex === index}
							<div class="px-6 pb-6 pt-2">
								<p class="text-base text-slate-200">{faq.answer}</p>
							</div>
						{/if}
					</div>
				{/each}
			</div>

			{#if disclaimer}
				<p class="mt-8 text-base leading-relaxed text-slate-300">
					{disclaimer}
				</p>
			{/if}
		</section>
	{:else if disclaimer}
		<p class="text-base leading-relaxed text-slate-300">{disclaimer}</p>
	{/if}
</div>
