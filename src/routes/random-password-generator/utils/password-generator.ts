export interface PasswordOptions {
	length: number;
	includeUppercase: boolean;
	includeLowercase: boolean;
	includeNumbers: boolean;
	includeSymbols: boolean;
	excludeSimilar: boolean;
	excludeAmbiguous: boolean;
	noRepeat: boolean;
	minUppercase?: number;
	minNumbers?: number;
	minSymbols?: number;
	customSymbols?: string;
	avoidSequential?: boolean;
}

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const SIMILAR_CHARS = 'il1Lo0O';
const AMBIGUOUS_CHARS = '{}[]()/\'"~,;.<>';

export function generatePassword(options: PasswordOptions): string {
	const {
		length,
		includeUppercase,
		includeLowercase,
		includeNumbers,
		includeSymbols,
		excludeSimilar,
		excludeAmbiguous,
		noRepeat,
		minUppercase = 0,
		minNumbers = 0,
		minSymbols = 0,
		customSymbols = '',
		avoidSequential = false
	} = options;

	const sanitizedCustomSymbols = customSymbols.replace(/\s+/g, '');
	const symbolsToUse = sanitizedCustomSymbols || SYMBOLS;

	let charset = '';

	if (includeLowercase) charset += LOWERCASE;
	if (includeUppercase) charset += UPPERCASE;
	if (includeNumbers) charset += NUMBERS;
	if (includeSymbols) charset += symbolsToUse;

	if (charset === '') {
		throw new Error('At least one character type must be selected');
	}

	if (excludeSimilar) {
		charset = charset.split('').filter((char) => !SIMILAR_CHARS.includes(char)).join('');
	}

	if (excludeAmbiguous) {
		charset = charset.split('').filter((char) => !AMBIGUOUS_CHARS.includes(char)).join('');
	}

	if (charset === '') {
		throw new Error('No characters available after exclusions');
	}

	const password: string[] = [];
	const crypto = window.crypto || (window as Window & { msCrypto?: Crypto }).msCrypto;

	const getAvailableChars = (baseChars: string): string[] => {
		let available = baseChars.split('');
		if (excludeSimilar) available = available.filter((c) => !SIMILAR_CHARS.includes(c));
		if (excludeAmbiguous) available = available.filter((c) => !AMBIGUOUS_CHARS.includes(c));
		return available;
	};

	const getRandomInt = (max: number): number => {
		if (crypto && crypto.getRandomValues) {
			const array = new Uint32Array(1);
			crypto.getRandomValues(array);
			return array[0] % max;
		}
		return Math.floor(Math.random() * max);
	};

	const totalRequired = minUppercase + minNumbers + minSymbols;
	if (totalRequired > length) {
		throw new Error(`Minimum character requirements (${totalRequired}) exceed password length (${length})`);
	}

	const uppercasePool = includeUppercase ? getAvailableChars(UPPERCASE) : [];
	const numbersPool = includeNumbers ? getAvailableChars(NUMBERS) : [];
	const symbolsPool = includeSymbols
		? excludeAmbiguous
			? symbolsToUse.split('').filter((c) => !AMBIGUOUS_CHARS.includes(c))
			: symbolsToUse.split('')
		: [];

	for (let i = 0; i < minUppercase; i++) {
		if (uppercasePool.length > 0 && password.length < length) {
			password.push(uppercasePool[getRandomInt(uppercasePool.length)]);
		}
	}

	for (let i = 0; i < minNumbers; i++) {
		if (numbersPool.length > 0 && password.length < length) {
			password.push(numbersPool[getRandomInt(numbersPool.length)]);
		}
	}

	for (let i = 0; i < minSymbols; i++) {
		if (symbolsPool.length > 0 && password.length < length) {
			password.push(symbolsPool[getRandomInt(symbolsPool.length)]);
		}
	}

	const typePools: string[][] = [];
	if (includeLowercase) typePools.push(getAvailableChars(LOWERCASE));
	if (includeUppercase && minUppercase === 0) typePools.push(uppercasePool);
	if (includeNumbers && minNumbers === 0) typePools.push(numbersPool);
	if (includeSymbols && minSymbols === 0) typePools.push(symbolsPool);

	for (const pool of typePools) {
		if (pool.length > 0 && password.length < length) {
			password.push(pool[getRandomInt(pool.length)]);
		}
	}

	const availableChars = noRepeat ? charset.split('') : null;
	const usedChars = noRepeat ? new Set(password) : null;

	if (noRepeat) {
		if (usedChars) {
			for (const char of usedChars) {
				const index = availableChars!.indexOf(char);
				if (index > -1) availableChars!.splice(index, 1);
			}
		}

		const totalAvailable = availableChars!.length + password.length;
		if (totalAvailable < length) {
			throw new Error(`Not enough unique characters available. Maximum length with current settings: ${totalAvailable}`);
		}

		while (password.length < length && availableChars!.length > 0) {
			const randomIndex = getRandomInt(availableChars!.length);
			password.push(availableChars![randomIndex]);
			availableChars!.splice(randomIndex, 1);
		}
	} else {
		while (password.length < length) {
			password.push(charset[getRandomInt(charset.length)]);
		}
	}

	for (let i = password.length - 1; i > 0; i--) {
		const j = getRandomInt(i + 1);
		[password[i], password[j]] = [password[j], password[i]];
	}

	let result = password.join('');

	if (avoidSequential) {
		let attempts = 0;
		while (hasSequentialChars(result) && attempts < 10) {
			const shuffled = result.split('');
			for (let i = shuffled.length - 1; i > 0; i--) {
				const j = getRandomInt(i + 1);
				[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
			}
			result = shuffled.join('');
			attempts++;
		}
	}

	return result;
}

function hasSequentialChars(password: string): boolean {
	const sequences = [
		'0123456789', '9876543210',
		'abcdefghijklmnopqrstuvwxyz', 'zyxwvutsrqponmlkjihgfedcba',
		'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'ZYXWVUTSRQPONMLKJIHGFEDCBA'
	];

	for (let i = 0; i <= password.length - 3; i++) {
		const substr = password.substring(i, i + 3);
		for (const seq of sequences) {
			if (seq.includes(substr)) return true;
		}
	}

	for (let i = 0; i <= password.length - 3; i++) {
		const char = password[i];
		if (password[i + 1] === char && password[i + 2] === char && password[i + 3] === char) {
			return true;
		}
	}

	return false;
}

export function calculatePasswordStrength(password: string): { score: number; label: string; color: string } {
	if (!password) return { score: 0, label: 'No password', color: 'bg-slate-300' };

	const length = password.length;
	const categories = [
		/[a-z]/.test(password), /[A-Z]/.test(password),
		/[0-9]/.test(password), /[^a-zA-Z0-9]/.test(password)
	].filter(Boolean).length;

	let score: number;
	if (length < 8 || categories < 2) score = 0;
	else if (length < 10 || categories === 2) score = 1;
	else if (length < 12 || categories === 3) score = 2;
	else if (length < 16) score = 3;
	else score = 4;

	const strengthMap: Record<number, { label: string; color: string }> = {
		0: { label: 'Very Weak', color: 'bg-red-500' },
		1: { label: 'Weak', color: 'bg-orange-500' },
		2: { label: 'Fair', color: 'bg-yellow-500' },
		3: { label: 'Good', color: 'bg-blue-500' },
		4: { label: 'Strong', color: 'bg-green-500' }
	};

	return { score, ...strengthMap[score] };
}
