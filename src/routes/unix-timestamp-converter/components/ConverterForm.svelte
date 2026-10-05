<script lang="ts">
	import { unixToDate, dateToUnix, formatDate, isValidUnixTimestamp } from '../utils/converter';
	import { onMount } from 'svelte';
	import {
		Button,
		Card,
		CardHeader,
		CardTitle,
		CardContent,
		Input,
		Label,
		Select
	} from '$lib/shared/components/ui';
	import { TIMEZONES, convertToTimezone } from '../utils/timezone';
	import { getRelativeTime } from '../utils/relativeTime';
	import DateTimePicker from './DateTimePicker.svelte';

	let unixInput = $state('');
	let dateInput = $state('');
	let unixResult = $state('');
	let unixError = $state('');
	let dateResult = $state('');
	let dateError = $state('');
	let currentTime = $state('');
	let currentTimeWithMs = $state('');
	let currentUnix = $state('');
	let selectedTimezone = $state('UTC');
	let timezoneResult = $state('');
	let useIsoFormat = $state(false);

	let intervalId: number;

	onMount(() => {
		updateCurrentTime();
		intervalId = window.setInterval(updateCurrentTime, 100);
		return () => clearInterval(intervalId);
	});

	function updateCurrentTime() {
		const now = new Date();
		currentTime = now.toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: true
		});
		currentUnix = now.getTime().toString();
		currentTimeWithMs =
			now.toISOString().replace('T', ' ').replace('Z', '') +
			`.${now.getUTCMilliseconds().toString().padStart(3, '0')}Z`;
		timezoneResult = convertToTimezone(now, selectedTimezone);
	}

	function convertFromUnix() {
		unixError = '';
		unixResult = '';

		if (!unixInput.trim()) {
			unixError = 'Please enter a Unix timestamp';
			return;
		}

		const timestamp = parseInt(unixInput, 10);

		if (!isValidUnixTimestamp(timestamp)) {
			unixError = 'Invalid Unix timestamp. Must be a non-negative integer.';
			return;
		}

		try {
			const date = unixToDate(timestamp);
			unixResult = useIsoFormat ? date.toISOString() : formatDate(date);
		} catch (e) {
			unixError = 'Error converting timestamp';
		}
	}

	function convertFromDate() {
		dateError = '';
		dateResult = '';

		if (!dateInput.trim()) {
			dateError = 'Please enter a date';
			return;
		}

		try {
			const date = new Date(dateInput);
			if (isNaN(date.getTime())) {
				dateError = 'Invalid date format';
				return;
			}
			const unix = dateToUnix(date);
			dateResult = unix.toString();
		} catch (e) {
			dateError = 'Error converting date';
		}
	}

	function handleUnixKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			convertFromUnix();
		}
	}
</script>

<div class="space-y-6">
	<!-- Current Timestamp Display -->
	<Card class="border-slate-200 shadow-lg dark:border-slate-800">
		<CardHeader>
			<CardTitle>Current Timestamp</CardTitle>
		</CardHeader>
		<CardContent class="space-y-6">
			<!-- Format Toggle -->
			<div class="flex items-center justify-center space-x-2">
				<span class="text-sm font-medium text-slate-700 dark:text-slate-300">Format:</span>
				<div class="flex rounded-lg border border-slate-200 p-1 dark:border-slate-800">
					<Button
						variant={!useIsoFormat ? 'secondary' : 'ghost'}
						size="sm"
						onclick={() => (useIsoFormat = false)}
						class={!useIsoFormat ? 'bg-slate-100 dark:bg-slate-800' : ''}
					>
						Default
					</Button>
					<Button
						variant={useIsoFormat ? 'secondary' : 'ghost'}
						size="sm"
						onclick={() => (useIsoFormat = true)}
						class={useIsoFormat ? 'bg-slate-100 dark:bg-slate-800' : ''}
					>
						ISO 8601
					</Button>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<!-- Local Time -->
				<div
					class="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50"
				>
					<div class="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">Local Time</div>
					<div class="text-sm font-medium text-slate-900 dark:text-slate-100">
						{useIsoFormat
							? new Date().toLocaleString('en-US', { timeZone: 'UTC' }).replace(',', '') + 'Z'
							: currentTime}
					</div>
				</div>

				<!-- UTC with ms -->
				<div
					class="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50"
				>
					<div class="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">UTC with ms</div>
					<div class="overflow-x-auto text-sm font-medium text-slate-900 dark:text-slate-100">
						{useIsoFormat ? new Date().toISOString() : currentTimeWithMs}
					</div>
				</div>

				<!-- Unix (ms) -->
				<div
					class="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50"
				>
					<div class="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">Unix (ms)</div>
					<div
						class="overflow-x-auto font-mono text-sm font-medium text-slate-900 dark:text-slate-100"
					>
						{currentUnix}
					</div>
				</div>

				<!-- Timezone -->
				<div
					class="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50"
				>
					<div class="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">Timezone</div>
					<div class="overflow-x-auto text-sm font-medium text-slate-900 dark:text-slate-100">
						{useIsoFormat ? new Date(timezoneResult).toISOString() : timezoneResult}
					</div>
				</div>
			</div>

			<div class="space-y-2">
				<Label>Select Timezone</Label>
				<Select
					bind:value={selectedTimezone}
					onchange={(val) => {
						selectedTimezone = val as string;
						updateCurrentTime();
					}}
					options={TIMEZONES.map((t) => ({ value: t.value, label: t.label }))}
					class="w-full"
				/>
			</div>
		</CardContent>
	</Card>

	<!-- Conversion Grid -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Unix to Date Input -->
		<Card class="h-full border-slate-200 shadow-lg dark:border-slate-800">
			<CardHeader>
				<CardTitle>Unix Timestamp to Date</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<Input
					type="text"
					placeholder="Enter Unix timestamp (e.g., 1703088000)"
					bind:value={unixInput}
					onkeydown={handleUnixKeydown}
				/>
				<Button
					onclick={convertFromUnix}
					class="w-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
				>
					Convert to Date
				</Button>
			</CardContent>
		</Card>

		<!-- Unix to Date Result -->
		<Card
			class="h-full border-slate-200 bg-slate-50 shadow-lg dark:border-slate-700 dark:bg-slate-900/50"
		>
			<CardContent class="flex h-full items-center justify-center p-6">
				{#if unixResult || unixError}
					<div class="w-full space-y-2">
						{#if unixError}
							<div class="font-medium text-red-500">Error</div>
							<div class="text-lg text-red-600 dark:text-red-400">{unixError}</div>
						{:else}
							<div class="text-sm font-medium text-slate-500">Result</div>
							<div class="font-mono text-lg break-all text-slate-900 dark:text-slate-100">
								{useIsoFormat ? new Date(parseInt(unixInput) * 1000).toISOString() : unixResult}
							</div>
							{#if unixInput}
								<div class="space-y-1 pt-4 text-sm text-slate-500">
									<div>
										{useIsoFormat
											? ''
											: convertToTimezone(new Date(parseInt(unixInput) * 1000), selectedTimezone)}
									</div>
									<div>{getRelativeTime(new Date(parseInt(unixInput) * 1000))}</div>
								</div>
							{/if}
						{/if}
					</div>
				{:else}
					<p class="text-slate-500 italic">Result will appear here</p>
				{/if}
			</CardContent>
		</Card>

		<!-- Date to Unix Input -->
		<Card class="h-full border-slate-200 shadow-lg dark:border-slate-800">
			<CardHeader>
				<CardTitle>Date to Unix Timestamp</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<DateTimePicker bind:value={dateInput} onchange={(val) => (dateInput = val)} />
				<Button
					onclick={convertFromDate}
					class="w-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
				>
					Convert to Unix
				</Button>
			</CardContent>
		</Card>

		<!-- Date to Unix Result -->
		<Card
			class="h-full border-slate-200 bg-slate-50 shadow-lg dark:border-slate-700 dark:bg-slate-900/50"
		>
			<CardContent class="flex h-full items-center justify-center p-6">
				{#if dateResult || dateError}
					<div class="w-full space-y-2">
						{#if dateError}
							<div class="font-medium text-red-500">Error</div>
							<div class="text-lg text-red-600 dark:text-red-400">{dateError}</div>
						{:else}
							<div class="text-sm font-medium text-slate-500">Result</div>
							<div class="font-mono text-lg break-all text-slate-900 dark:text-slate-100">
								{dateResult}
							</div>
							{#if dateInput}
								<div class="space-y-1 pt-4 text-sm text-slate-500">
									<div>
										{useIsoFormat
											? new Date(dateInput).toISOString()
											: convertToTimezone(new Date(dateInput), selectedTimezone)}
									</div>
									<div>{getRelativeTime(new Date(dateInput))}</div>
								</div>
							{/if}
						{/if}
					</div>
				{:else}
					<p class="text-slate-500 italic">Result will appear here</p>
				{/if}
			</CardContent>
		</Card>
	</div>
</div>
