/**
 * Conventional invoice amount-in-words patterns per ISO currency.
 * Whole: `{name} {Words} only`
 * With cents: `{code} {Words} and {nn}/100`
 */
export type CurrencyWordsConfig = {
	/** Phrase for whole amounts, e.g. "US Dollars" */
	wholeName: string;
	/** ISO code used when there are fractional units */
	code: string;
};

export const CURRENCY_WORDS: Record<string, CurrencyWordsConfig> = {
	USD: { wholeName: 'US Dollars', code: 'USD' },
	EUR: { wholeName: 'Euros', code: 'EUR' },
	GBP: { wholeName: 'Pounds Sterling', code: 'GBP' },
	CAD: { wholeName: 'Canadian Dollars', code: 'CAD' },
	AUD: { wholeName: 'Australian Dollars', code: 'AUD' },
	INR: { wholeName: 'Indian Rupees', code: 'INR' },
	BDT: { wholeName: 'Bangladeshi Taka', code: 'BDT' },
	JPY: { wholeName: 'Japanese Yen', code: 'JPY' }
};

const ONES = [
	'',
	'One',
	'Two',
	'Three',
	'Four',
	'Five',
	'Six',
	'Seven',
	'Eight',
	'Nine',
	'Ten',
	'Eleven',
	'Twelve',
	'Thirteen',
	'Fourteen',
	'Fifteen',
	'Sixteen',
	'Seventeen',
	'Eighteen',
	'Nineteen'
];

const TENS = [
	'',
	'',
	'Twenty',
	'Thirty',
	'Forty',
	'Fifty',
	'Sixty',
	'Seventy',
	'Eighty',
	'Ninety'
];

function chunkToWords(n: number): string {
	if (n === 0) return '';
	if (n < 20) return ONES[n];
	if (n < 100) {
		const t = Math.floor(n / 10);
		const o = n % 10;
		return o ? `${TENS[t]}-${ONES[o]}` : TENS[t];
	}
	const h = Math.floor(n / 100);
	const rest = n % 100;
	return rest ? `${ONES[h]} Hundred ${chunkToWords(rest)}` : `${ONES[h]} Hundred`;
}

function integerToWords(n: number): string {
	if (n === 0) return 'Zero';
	const parts: string[] = [];
	const billion = Math.floor(n / 1_000_000_000);
	const million = Math.floor((n % 1_000_000_000) / 1_000_000);
	const thousand = Math.floor((n % 1_000_000) / 1000);
	const rest = n % 1000;

	if (billion) parts.push(`${chunkToWords(billion)} Billion`);
	if (million) parts.push(`${chunkToWords(million)} Million`);
	if (thousand) parts.push(`${chunkToWords(thousand)} Thousand`);
	if (rest) parts.push(chunkToWords(rest));
	return parts.join(' ');
}

/**
 * Conventional invoice phrasing:
 * - whole: `US Dollars Forty only`
 * - cents: `USD Forty and 45/100`
 */
export function amountInWords(amount: number, currencyCode: string): string {
	const code = (currencyCode || 'USD').toUpperCase();
	const cfg = CURRENCY_WORDS[code] ?? { wholeName: code, code };
	const safe = Math.round(Math.abs(amount) * 100) / 100;
	const whole = Math.floor(safe);
	const cents = Math.round((safe - whole) * 100);
	const words = integerToWords(whole);

	if (cents === 0) {
		return `${cfg.wholeName} ${words} only`;
	}
	const frac = String(cents).padStart(2, '0');
	return `${cfg.code} ${words} and ${frac}/100`;
}
