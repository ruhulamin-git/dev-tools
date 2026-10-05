<script lang="ts">
	import { base } from '$app/paths';
	import { CTA, LeadMagnetInline, PageHeader, SeoContent } from '$lib/shared/components';
	import CronExplainer from './components/CronExplainer.svelte';

	// SEO content data
	const seoData = {
		howToSteps: {
			title: 'How to Use the Cron Expression Generator',
			steps: [
				{
					title: 'Type or Paste an Expression',
					description:
						'Enter a cron expression and pick its dialect — 5-field Unix, 6-field Seconds for Spring and Quartz, or AWS EventBridge. The plain-English explanation updates as you type, so you never have to hit a button to check your work.'
				},
				{
					title: 'Read the Field Breakdown',
					description:
						'Every field in the chosen dialect is labelled with its name and allowed range. Move the cursor through the expression and the matching field highlights, so you learn which position controls what.'
				},
				{
					title: 'Check the Next Run Times',
					description:
						'The next five runs are calculated in your own timezone, with a relative countdown beside each one. This is the fastest way to catch an expression that parses correctly but fires at the wrong time.'
				},
				{
					title: 'Start From a Common Example',
					description:
						'Pick one of the curated examples, or press Random example to cycle through them. Each one demonstrates a different operator — steps, ranges, lists, and shorthand macros.'
				}
			]
		},
		comparison: {
			title: 'Cron Special Characters',
			description:
				'Five characters do almost all the work in a cron expression. Learning what each one means makes most schedules readable at a glance.',
			headers: ['Character', 'Example', 'What It Means'],
			rows: [
				{
					label: '* (asterisk)',
					columns: ['* * * * *', 'Every value in the field — every minute of every day']
				},
				{
					label: ', (comma)',
					columns: ['15 2,14 * * *', 'A list of specific values — 02:15 and 14:15']
				},
				{
					label: '- (hyphen)',
					columns: ['0 9-17 * * *', 'An inclusive range — every hour from 09:00 to 17:00']
				},
				{
					label: '/ (slash)',
					columns: ['*/15 * * * *', 'A step — every 15th minute, starting from 0']
				},
				{
					label: '@ (macro)',
					columns: ['@daily', 'Shorthand for a common schedule — the same as 0 0 * * *']
				}
			]
		},
		bestPractices: {
			title: 'Cron Best Practices',
			practices: [
				'Remember that day-of-month and day-of-week are OR, not AND: if you restrict both fields, the job runs when EITHER matches. "5 4 4 9 6" runs on September 4th and on every Saturday in September, not only on a September 4th that falls on a Saturday.',
				'Avoid scheduling everything on the hour: thousands of jobs firing at 0 * * * * create a thundering herd. Offset your jobs to a random minute so load spreads out.',
				'Be careful with day 29, 30, and 31: a job scheduled for the 31st silently skips the months that do not have one. Use a first-of-month schedule and subtract a day in your code if you need month-end.',
				'Know which timezone your cron daemon uses: system crontabs usually run in the server timezone or UTC, not the timezone of whoever wrote the schedule. Daylight saving transitions can skip or repeat a job.',
				'Do not use cron for sub-minute work: one minute is the smallest interval standard cron supports. Reach for a queue or a long-running worker instead of a job that sleeps in a loop.',
				'Redirect output and set a timeout: an unattended job that writes to stdout fills mail spools, and one that hangs will still be running when the next run starts.'
			]
		},
		faqs: {
			title: 'Frequently Asked Questions',
			items: [
				{
					question: 'What are the five fields in a cron expression?',
					answer:
						'In order: minute (0-59), hour (0-23), day of month (1-31), month (1-12 or JAN-DEC), and day of week (0-6 or SUN-SAT, where both 0 and 7 mean Sunday). Fields are separated by whitespace, and each accepts *, lists, ranges, and steps.'
				},
				{
					question: 'Does the day-of-month field AND or OR with day-of-week?',
					answer:
						'It ORs. When both fields are restricted to specific values, cron runs the job whenever either field matches — this surprises almost everyone the first time. "0 0 1 * 1" runs on the 1st of every month AND on every Monday. If only one of the two is restricted and the other is *, the behaviour is the intuitive one.'
				},
				{
					question: 'What timezone are the next run times shown in?',
					answer:
						"Your browser's local timezone, which is named above the list. Nothing is sent to a server — the calculation happens in your browser. Bear in mind that your cron daemon may run in a different timezone, commonly UTC, so verify before relying on the exact clock times."
				},
				{
					question: 'Does this tool support Quartz or 6-field cron?',
					answer:
						'Yes. Use the dialect selector above the input. Alongside 5-field Unix cron there is Seconds (6 fields, used by Spring @Scheduled, node-cron and Quartz) and AWS EventBridge (6 fields with a trailing year and no seconds). Picking the right one matters more than it sounds: the same six characters can mean two different days in two dialects, because EventBridge numbers Sunday as 1 while Unix numbers it as 0. Our free editor plugins apply the same distinction automatically, choosing the dialect from the file type rather than asking.'
				},
				{
					question: 'What do @daily, @hourly, and the other macros mean?',
					answer:
						'They are shorthands most cron implementations accept. @hourly is 0 * * * *, @daily and @midnight are 0 0 * * *, @weekly is 0 0 * * 0, @monthly is 0 0 1 * *, and @yearly and @annually are 0 0 1 1 *. @reboot is different — it runs once at startup and has no recurring schedule, so there is nothing to preview.'
				},
				{
					question: 'Why does my job scheduled for the 31st sometimes not run?',
					answer:
						'Because four months have only 30 days and February has 28 or 29. A "0 0 31 * *" schedule simply has no matching date in those months, so it silently skips them. The next-run preview makes this visible — enter the expression and you will see the gaps.'
				},
				{
					question: 'Is my expression sent to a server?',
					answer:
						'No. Parsing, description, and run-time calculation all happen in your browser using client-side JavaScript. Nothing about your schedule leaves your device.'
				}
			]
		}
	};
</script>

<!-- SEO, canonical URL, OG/Twitter tags and SoftwareApplication schema all come from
     the root +layout.svelte, driven by this slug's entry in the tool registry (tools.ts). A
     per-page JSON-LD block here would emit a second, competing SoftwareApplication. -->

<!-- SEO handled by /tools/+layout.svelte -->

<div class="mx-auto">
	<PageHeader
		title="Cron Expression Generator & Explainer"
		description="Translate any cron expression into plain English as you type, and preview exactly when it will run next. Unix, Spring and AWS EventBridge dialects, calculated entirely in your browser."
	/>

	<CronExplainer />

	<!--
		The same engine, shipped into the editor. Placed directly under the tool rather than
		further down the page because the moment someone has just pasted an expression in here is
		exactly the moment "you could skip this step" lands. Styled neutral rather than blue so it
		reads as a different kind of offer from the related-tool card below it.
	-->
	<div
		class="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50"
	>
		<div class="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
			<div class="flex-1">
				<h3 class="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
					Stop copying expressions into a browser tab
				</h3>
				<p class="text-sm text-slate-600 dark:text-slate-400">
					The same explainer runs inside your editor, on the cron in GitHub Actions, Kubernetes,
					Spring <code class="rounded bg-slate-200 px-1 py-0.5 text-xs dark:bg-slate-700"
						>@Scheduled</code
					> and Terraform. Hover a schedule to read it in plain English. Free and open source.
				</p>
			</div>
			<div class="flex flex-wrap gap-2">
				<a
					href="https://plugins.jetbrains.com/plugin/34146-cron-expression-explainer"
					target="_blank"
					rel="noopener"
					class="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold whitespace-nowrap text-white shadow-sm transition-colors hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
				>
					JetBrains IDEs
				</a>
				<a
					href="https://marketplace.visualstudio.com/items?itemName=devxhub.cron-expression-explainer"
					target="_blank"
					rel="noopener"
					class="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold whitespace-nowrap text-white shadow-sm transition-colors hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
				>
					VS Code
				</a>
				<!-- Labelled by editor rather than by registry: people on Cursor know their editor, not
				     that it installs from Open VSX because Microsoft's Marketplace is closed to forks. -->
				<a
					href="https://open-vsx.org/extension/devxhub/cron-expression-explainer"
					target="_blank"
					rel="noopener"
					title="Open VSX — for Cursor, Windsurf, VSCodium and Gitpod"
					class="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold whitespace-nowrap text-white shadow-sm transition-colors hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
				>
					Cursor &amp; VSCodium
				</a>
			</div>
		</div>
	</div>

	<!-- Internal Linking - related tool -->
	<div
		class="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20"
	>
		<div class="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
			<div class="flex-1">
				<h3 class="mb-1 text-sm font-semibold text-blue-900 dark:text-blue-300">
					Working with timestamps too?
				</h3>
				<p class="text-sm text-blue-700 dark:text-blue-400">
					Convert Unix timestamps to readable dates and back, with the same client-side privacy.
				</p>
			</div>
			<a
				href="{base}/unix-timestamp-converter"
				class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold whitespace-nowrap text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
			>
				Unix Timestamp Converter
			</a>
		</div>
	</div>

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
			title="Download: The Scheduled Jobs Reliability Checklist"
			description="Stop cron jobs from failing silently in production."
			toolName="Cron Expression Generator"
			hookText="A cron job that stops running is the bug nobody notices for three weeks. This checklist covers overlap protection, timeouts, alerting on missed runs, timezone and DST traps, and how to make failures loud."
			buttonText="Download Free Checklist"
		/>
	</div>

	<div class="mt-10">
		<CTA
			title="Scheduled jobs failing silently?"
			description="Background processing that runs reliably takes more than a crontab entry. We build and monitor job pipelines that tell you when something breaks."
			buttonText="Hire Backend Developers"
			buttonUrl="https://www.devxhub.com/full-stack-development"
		/>
	</div>
</div>
