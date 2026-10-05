<script lang="ts">
	import { Card, CardContent } from '$lib/shared/components/ui';
	import {
		DIALECTS,
		expandField,
		fieldIndexAtCursor,
		fieldSyntax,
		parseCron,
		type Dialect
	} from '../utils/cron';
	import { examplesFor, nextExample } from '../utils/examples';
	import { lintSchedule } from '../utils/lint';
	import CronInput from './CronInput.svelte';
	import DialectSelector from './DialectSelector.svelte';
	import ExampleList from './ExampleList.svelte';
	import FieldBreakdown from './FieldBreakdown.svelte';
	import NextRuns from './NextRuns.svelte';
	import ScheduleWarnings from './ScheduleWarnings.svelte';

	let dialect = $state<Dialect>('unix');
	let expression = $state(DIALECTS.unix.sample);
	let cursor = $state(0);
	let focused = $state(false);
	let cronInput: ReturnType<typeof CronInput>;

	// Parsing is cheap, so there is no debounce — the explanation updates on every
	// keystroke, the way crontab.guru does.
	const result = $derived(parseCron(expression, dialect));

	// Valid schedules that will not do what they look like they do.
	const warnings = $derived(lintSchedule(expression, result, dialect));

	/**
	 * The field whose legend is on show.
	 *
	 * Deliberately sticky rather than derived straight from focus. Clicking a breakdown card
	 * moves focus off the input for a moment, and a purely focus-driven value would drop to -1
	 * and back on every switch — tearing the panel down and rebuilding it, which reads as a
	 * flicker. It still starts at -1, so nothing is selected until the visitor picks something.
	 */
	let selected = $state(-1);
	$effect(() => {
		const caretField = focused ? fieldIndexAtCursor(expression, cursor, dialect) : -1;
		if (caretField >= 0) selected = caretField;
	});

	/** The input and the breakdown cards, treated as one unit for focus purposes. */
	let editor = $state<HTMLDivElement | null>(null);

	/**
	 * Put the legend away once attention leaves the editor entirely.
	 *
	 * The check on `relatedTarget` is what makes this safe: clicking a breakdown card blurs the
	 * input, so collapsing on plain blur would tear the panel down and rebuild it on every
	 * switch. Focus moving to another control *inside* the editor is not leaving.
	 */
	function handleFocusOut(event: FocusEvent) {
		const next = event.relatedTarget as Node | null;
		if (next && editor?.contains(next)) return;
		// Switching window or tab is not a decision to dismiss anything; keep it for the return.
		if (!document.hasFocus()) return;
		selected = -1;
	}

	// A dialect with fewer fields can strand the selection past the end of the breakdown.
	const activeIndex = $derived(selected < DIALECTS[dialect].fields.length ? selected : -1);

	/**
	 * Rows in the longest legend this dialect has, so the panel can hold that height whatever
	 * field is selected. Without it the panel grows and shrinks as you move between fields —
	 * minute has five rows, EventBridge day-of-week has eight — and the page jumps under you.
	 */
	const legendRows = $derived(
		Math.max(...DIALECTS[dialect].fields.map((_, index) => fieldSyntax(index, dialect).length))
	);

	// The legend for the selected field, plus what its current value resolves to. The legend
	// is shown even when the expression does not parse — that is when it is most useful.
	const detail = $derived.by(() => {
		if (activeIndex < 0) return null;

		const field = result.fields[activeIndex];
		return {
			label: field.label,
			value: field.value,
			range: field.range,
			syntax: fieldSyntax(activeIndex, dialect),
			rows: legendRows,
			matches: result.valid ? expandField(expression, activeIndex, dialect) : null
		};
	});

	/**
	 * Switching dialect keeps the expression when the field count still fits, which is the
	 * point of the control: the same six fields read as seconds-first and then as EventBridge
	 * are two different schedules, and seeing that happen is the lesson. It only falls back to
	 * the dialect's sample when the current text could not parse there at all.
	 */
	function changeDialect(next: Dialect) {
		const fits = expression.trim().split(/\s+/).length === DIALECTS[next].fields.length;
		if (!fits) {
			expression = DIALECTS[next].sample;
			cursor = expression.length;
		}
		dialect = next;
	}

	function pickExample(value: string) {
		expression = value;
		cursor = value.length;
	}

	function randomExample() {
		pickExample(nextExample(expression, dialect).expression);
	}

	/** Clicking a field card selects that field's text in the input. */
	function selectField(index: number) {
		cronInput?.selectField(index);
	}
</script>

<div class="space-y-6">
	<Card class="border-slate-200 shadow-lg dark:border-slate-800">
		<CardContent class="space-y-6 p-4 sm:p-6">
			<DialectSelector value={dialect} onchange={changeDialect} />

			<!-- The input and the breakdown share one focus scope: moving between them keeps the
			     legend open, and only leaving the pair altogether puts it away. focusout bubbles,
			     so one handler here covers every control inside. -->
			<div bind:this={editor} class="space-y-6" onfocusout={handleFocusOut}>
				<CronInput
					bind:this={cronInput}
					bind:value={expression}
					bind:cursor
					bind:focused
					{result}
					{dialect}
					onrandom={randomExample}
				/>
				<ScheduleWarnings {warnings} />
				<FieldBreakdown
					fields={result.fields}
					{activeIndex}
					selectable={!result.expandedFrom}
					{detail}
					onselect={selectField}
				/>
			</div>
		</CardContent>
	</Card>

	<div class="grid gap-6 lg:grid-cols-2">
		<Card class="border-slate-200 dark:border-slate-800">
			<CardContent class="p-4 sm:p-6">
				<NextRuns {expression} valid={result.valid} {dialect} />
			</CardContent>
		</Card>

		<Card class="border-slate-200 dark:border-slate-800">
			<CardContent class="p-4 sm:p-6">
				<ExampleList
					current={expression}
					examples={examplesFor(dialect)}
					dialectLabel={DIALECTS[dialect].label.split(' — ')[0]}
					onselect={pickExample}
				/>
			</CardContent>
		</Card>
	</div>
</div>
