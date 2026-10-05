<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/shared/components/ui/card';
	import { generatePassword, type PasswordOptions } from '../utils';
	import { onMount } from 'svelte';
	import AdvancedOptions from './AdvancedOptions.svelte';
	import CharacterTypeOptions from './CharacterTypeOptions.svelte';
	import CustomSymbols from './CustomSymbols.svelte';
	import PasswordDisplay from './PasswordDisplay.svelte';
	import PasswordLengthControl from './PasswordLengthControl.svelte';
	import RequiredCharacterCounts from './RequiredCharacterCounts.svelte';
	import { ErrorIcon } from '../icons';

	interface Props {
		password: string;
		copied: boolean;
		onPasswordChange: (password: string) => void;
		onCopy: () => void;
		onCopiedChange: (copied: boolean) => void;
	}

	let { password, copied, onPasswordChange, onCopy, onCopiedChange }: Props = $props();

	const DEFAULT_PASSWORD_LENGTH = 16;
	const ERROR_DISPLAY_DURATION = 5000;
	const LENGTH_CHANGE_DEBOUNCE_MS = 50;

	const CHAR_COUNTS = {
		LOWERCASE: 26,
		UPPERCASE: 26,
		NUMBERS: 10,
		SYMBOLS: 30
	} as const;

	const EXCLUSION_COUNTS = {
		SIMILAR_LOWERCASE: 3,
		SIMILAR_UPPERCASE: 2,
		SIMILAR_NUMBERS: 2,
		AMBIGUOUS_SYMBOLS: 18
	} as const;

	let passwordLength = $state(DEFAULT_PASSWORD_LENGTH);
	let includeUppercase = $state(true);
	let includeLowercase = $state(true);
	let includeNumbers = $state(true);
	let includeSymbols = $state(true);
	let excludeSimilar = $state(false);
	let excludeAmbiguous = $state(false);
	let noRepeat = $state(true);
	let avoidSequential = $state(false);
	let minUppercase = $state(0);
	let minNumbers = $state(0);
	let minSymbols = $state(0);
	let customSymbols = $state('');
	let isGenerating = $state(false);
	let errorMessage = $state('');

	const clearError = () => {
		errorMessage = '';
	};

	const setError = (message: string) => {
		errorMessage = message;
		setTimeout(() => {
			errorMessage = '';
		}, ERROR_DISPLAY_DURATION);
	};

	const countSelectedCharacterTypes = (): number => {
		let count = 0;
		if (includeUppercase) count++;
		if (includeLowercase) count++;
		if (includeNumbers) count++;
		if (includeSymbols) count++;
		return count;
	};

	const handleGenerate = () => {
		isGenerating = true;
		clearError();
		try {
			const options: PasswordOptions = {
				length: passwordLength,
				includeUppercase,
				includeLowercase,
				includeNumbers,
				includeSymbols,
				excludeSimilar,
				excludeAmbiguous,
				noRepeat,
				minUppercase: minUppercase > 0 ? minUppercase : undefined,
				minNumbers: minNumbers > 0 ? minNumbers : undefined,
				minSymbols: minSymbols > 0 ? minSymbols : undefined,
				customSymbols: customSymbols.trim() || undefined,
				avoidSequential
			};
			const newPassword = generatePassword(options);
			onPasswordChange(newPassword);
			onCopiedChange(false);
		} catch (error) {
			setError(error instanceof Error ? error.message : 'Failed to generate password');
		} finally {
			requestAnimationFrame(() => {
				isGenerating = false;
			});
		}
	};

	let lengthChangeTimeout: ReturnType<typeof setTimeout> | null = null;

	const handleLengthChange = (newLength: number) => {
		clearError();

		if (noRepeat) {
			const selectedTypes = countSelectedCharacterTypes();
			let availableChars = 0;

			if (includeLowercase) availableChars += CHAR_COUNTS.LOWERCASE;
			if (includeUppercase) availableChars += CHAR_COUNTS.UPPERCASE;
			if (includeNumbers) availableChars += CHAR_COUNTS.NUMBERS;
			if (includeSymbols) availableChars += CHAR_COUNTS.SYMBOLS;

			if (excludeSimilar) {
				if (includeLowercase) availableChars -= EXCLUSION_COUNTS.SIMILAR_LOWERCASE;
				if (includeUppercase) availableChars -= EXCLUSION_COUNTS.SIMILAR_UPPERCASE;
				if (includeNumbers) availableChars -= EXCLUSION_COUNTS.SIMILAR_NUMBERS;
			}
			if (excludeAmbiguous) {
				if (includeSymbols) availableChars -= EXCLUSION_COUNTS.AMBIGUOUS_SYMBOLS;
			}

			const maxAvailable = availableChars;

			if (newLength > maxAvailable) {
				setError(
					`Password length cannot exceed ${maxAvailable} characters with current settings (no repeat enabled)`
				);
				return;
			}
		}

		passwordLength = newLength;

		if (lengthChangeTimeout) {
			clearTimeout(lengthChangeTimeout);
		}
		lengthChangeTimeout = setTimeout(() => {
			handleGenerate();
		}, LENGTH_CHANGE_DEBOUNCE_MS);
	};

	const handleCharacterTypeChange = (option: string, value: boolean): boolean => {
		const currentCount = countSelectedCharacterTypes();
		const wouldBeLast = currentCount === 1 && value === false;

		if (wouldBeLast) {
			setError('At least one character type must be selected');
			return false;
		}

		let testUppercase = includeUppercase;
		let testLowercase = includeLowercase;
		let testNumbers = includeNumbers;
		let testSymbols = includeSymbols;

		switch (option) {
			case 'uppercase':
				testUppercase = value;
				break;
			case 'lowercase':
				testLowercase = value;
				break;
			case 'numbers':
				testNumbers = value;
				break;
			case 'symbols':
				testSymbols = value;
				break;
		}

		let hasAvailableChars = false;
		if (testLowercase || testUppercase || testNumbers) {
			hasAvailableChars = true;
		}
		if (testSymbols) {
			if (!excludeAmbiguous || testLowercase || testUppercase || testNumbers) {
				hasAvailableChars = true;
			}
		}

		if (!hasAvailableChars) {
			setError(
				'Current exclusion settings would leave no available characters. Please adjust exclusions or character types.'
			);
			return false;
		}

		switch (option) {
			case 'uppercase':
				includeUppercase = value;
				break;
			case 'lowercase':
				includeLowercase = value;
				break;
			case 'numbers':
				includeNumbers = value;
				break;
			case 'symbols':
				includeSymbols = value;
				break;
		}
		clearError();
		handleGenerate();
		return true;
	};

	const handleAdvancedOptionChange = (option: string, value: boolean) => {
		clearError();

		if ((option === 'excludeSimilar' && value) || (option === 'excludeAmbiguous' && value)) {
			const testExcludeSimilar = option === 'excludeSimilar' ? value : excludeSimilar;
			const testExcludeAmbiguous = option === 'excludeAmbiguous' ? value : excludeAmbiguous;

			let hasAvailableChars = false;
			if (includeLowercase || includeUppercase || includeNumbers) {
				hasAvailableChars = true;
			}
			if (includeSymbols) {
				if (!testExcludeAmbiguous || includeLowercase || includeUppercase || includeNumbers) {
					hasAvailableChars = true;
				}
			}

			if (!hasAvailableChars) {
				setError(
					'These exclusion settings would leave no available characters. Please enable more character types or adjust exclusions.'
				);
				return;
			}
		}

		if (option === 'noRepeat' && value === true) {
			let availableChars = 0;

			if (includeLowercase) {
				let chars = CHAR_COUNTS.LOWERCASE;
				if (excludeSimilar) chars -= EXCLUSION_COUNTS.SIMILAR_LOWERCASE;
				availableChars += chars;
			}
			if (includeUppercase) {
				let chars = CHAR_COUNTS.UPPERCASE;
				if (excludeSimilar) chars -= EXCLUSION_COUNTS.SIMILAR_UPPERCASE;
				availableChars += chars;
			}
			if (includeNumbers) {
				let chars = CHAR_COUNTS.NUMBERS;
				if (excludeSimilar) chars -= EXCLUSION_COUNTS.SIMILAR_NUMBERS;
				availableChars += chars;
			}
			if (includeSymbols) {
				let chars = CHAR_COUNTS.SYMBOLS;
				if (excludeAmbiguous) chars -= EXCLUSION_COUNTS.AMBIGUOUS_SYMBOLS;
				availableChars += chars;
			}

			if (passwordLength > availableChars) {
				setError(
					`Cannot enable "No Repeat" - password length (${passwordLength}) exceeds available unique characters (${availableChars}). Please reduce length or enable more character types.`
				);
				return;
			}
		}

		switch (option) {
			case 'excludeSimilar':
				excludeSimilar = value;
				break;
			case 'excludeAmbiguous':
				excludeAmbiguous = value;
				break;
			case 'noRepeat':
				noRepeat = value;
				break;
			case 'avoidSequential':
				avoidSequential = value;
				break;
		}

		handleGenerate();
	};

	const handleRequiredCountChange = (type: 'uppercase' | 'numbers' | 'symbols', value: number) => {
		clearError();
		switch (type) {
			case 'uppercase':
				minUppercase = value;
				break;
			case 'numbers':
				minNumbers = value;
				break;
			case 'symbols':
				minSymbols = value;
				break;
		}
		handleGenerate();
	};

	const handleCustomSymbolsChange = (symbols: string) => {
		clearError();
		customSymbols = symbols;
		handleGenerate();
	};

	onMount(() => {
		if (!password) {
			handleGenerate();
		}
	});
</script>

<div class="grid gap-8 lg:grid-cols-2">
	<div class="space-y-6">
		<Card>
			<CardHeader>
				<h2 class="text-2xl leading-none font-semibold tracking-tight text-slate-900 dark:text-white">Configuration</h2>
			</CardHeader>
			<CardContent>
				<PasswordLengthControl bind:length={passwordLength} onChange={handleLengthChange} />

				<CharacterTypeOptions
					{includeUppercase}
					{includeLowercase}
					{includeNumbers}
					{includeSymbols}
					onChange={handleCharacterTypeChange}
				/>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<h2 class="text-2xl leading-none font-semibold tracking-tight text-slate-900 dark:text-white">Advanced Options</h2>
			</CardHeader>
			<CardContent>
				<RequiredCharacterCounts
					{minUppercase}
					{minNumbers}
					{minSymbols}
					onChange={handleRequiredCountChange}
				/>

				<CustomSymbols {customSymbols} onChange={handleCustomSymbolsChange} />

				<AdvancedOptions
					{excludeSimilar}
					{excludeAmbiguous}
					{noRepeat}
					{avoidSequential}
					onChange={handleAdvancedOptionChange}
				/>
			</CardContent>
		</Card>
	</div>

	<div class="space-y-6">
		<Card class="lg:sticky lg:top-24">
			<CardHeader>
				<h2 class="text-2xl leading-none font-semibold tracking-tight text-slate-900 dark:text-white">Result</h2>
			</CardHeader>
			<CardContent>
				{#if errorMessage}
					<div
						class="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"
						role="alert"
					>
						<div class="flex items-center gap-2">
							<ErrorIcon />
							<span>{errorMessage}</span>
						</div>
					</div>
				{/if}

				<PasswordDisplay {password} {copied} {onCopy} onGenerate={handleGenerate} {isGenerating} />
			</CardContent>
		</Card>
	</div>
</div>
