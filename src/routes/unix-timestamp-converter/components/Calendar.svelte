<script lang="ts">
	import { cn } from '$lib/shared/utils';

	interface Props {
		value?: Date;
		onchange?: (date: Date) => void;
		class?: string;
	}

	let { value, onchange, class: className }: Props = $props();

	// Use current date ONLY for navigation if no value exists
	// Don't pass current date as the selected value
	let currentMonth = $state(new Date());

	// Update current view when value changes
	$effect(() => {
		if (value && !isNaN(value.getTime())) {
			// Only update if the month is different? No, maybe just keep it in sync or let user navigate.
			// Let's not auto-jump if user is navigating.
			// But for initial load, yes.
		}
	});

	function getDaysInMonth(year: number, month: number) {
		return new Date(year, month + 1, 0).getDate();
	}

	function getFirstDayOfMonth(year: number, month: number) {
		return new Date(year, month, 1).getDay();
	}

	function prevMonth() {
		currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
	}

	function nextMonth() {
		currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
	}

	function selectDate(day: number) {
		const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
		// Set time to 00:00 by default
		newDate.setHours(0, 0, 0, 0);
		onchange?.(newDate);
	}

	const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
	const monthNames = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	let calendarDays = $derived.by(() => {
		const year = currentMonth.getFullYear();
		const month = currentMonth.getMonth();
		const daysInMonth = getDaysInMonth(year, month);
		const firstDay = getFirstDayOfMonth(year, month);
		const days: (number | null)[] = [];

		for (let i = 0; i < firstDay; i++) {
			days.push(null);
		}
		for (let i = 1; i <= daysInMonth; i++) {
			days.push(i);
		}
		return days;
	});
</script>

<div class={cn('p-3', className)}>
	<div class="mb-4 flex items-center justify-between">
		<button
			type="button"
			onclick={prevMonth}
			aria-label="Previous month"
			class="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
		>
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
		</button>
		<div class="font-semibold text-slate-900 dark:text-slate-100">
			{monthNames[currentMonth.getMonth()]}
			{currentMonth.getFullYear()}
		</div>
		<button
			type="button"
			onclick={nextMonth}
			aria-label="Next month"
			class="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
		>
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
			</svg>
		</button>
	</div>

	<div class="mb-2 grid grid-cols-7 gap-1">
		{#each weekDays as day}
			<div class="py-1 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
				{day}
			</div>
		{/each}
	</div>

	<div class="grid grid-cols-7 gap-1">
		{#each calendarDays as day}
			{#if day === null}
				<div></div>
			{:else}
				<button
					type="button"
					onclick={() => selectDate(day)}
					class={cn(
						'flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors',
						'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
						value &&
							!isNaN(value.getTime()) &&
							value.getDate() === day &&
							value.getMonth() === currentMonth.getMonth() &&
							value.getFullYear() === currentMonth.getFullYear()
							? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800'
							: 'bg-transparent'
					)}
				>
					{day}
				</button>
			{/if}
		{/each}
	</div>
</div>
