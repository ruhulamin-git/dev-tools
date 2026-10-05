const STORAGE_KEY = 'devxhub-invoice-number-counters';

type CounterMap = Record<string, number>;

function canUseStorage(): boolean {
	return typeof localStorage !== 'undefined';
}

function readCounters(): CounterMap {
	if (!canUseStorage()) return {};
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw) as CounterMap;
		return parsed && typeof parsed === 'object' ? parsed : {};
	} catch {
		return {};
	}
}

function writeCounters(map: CounterMap): void {
	if (!canUseStorage()) return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
	} catch {
		// ignore quota / private mode
	}
}

function counterKey(prefix: string, year: number): string {
	return `${prefix.toUpperCase()}-${year}`;
}

/** Format `PREFIX-YYYY-NNNN` */
export function formatSequentialNumber(prefix: string, year: number, seq: number): string {
	const p = (prefix.trim() || 'INV').toUpperCase().replace(/[^A-Z0-9]/g, '');
	return `${p}-${year}-${String(seq).padStart(4, '0')}`;
}

/** Peek next number without incrementing. */
export function peekNextInvoiceNumber(prefix: string, year = new Date().getFullYear()): string {
	const map = readCounters();
	const key = counterKey(prefix, year);
	const next = (map[key] ?? 0) + 1;
	return formatSequentialNumber(prefix, year, next);
}

/** Allocate and persist the next sequential number. */
export function allocateNextInvoiceNumber(prefix: string, year = new Date().getFullYear()): string {
	const map = readCounters();
	const key = counterKey(prefix, year);
	const next = (map[key] ?? 0) + 1;
	map[key] = next;
	writeCounters(map);
	return formatSequentialNumber(prefix, year, next);
}

/**
 * Non-blocking warning when a manual invoice number contains YYYYMMDD
 * that does not match the issue date.
 */
export function invoiceNumberDateMismatchWarning(
	invoiceNumber: string,
	issuedDate: string
): string | null {
	const match = invoiceNumber.match(/(20\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])/);
	if (!match || !issuedDate) return null;
	const token = `${match[1]}-${match[2]}-${match[3]}`;
	if (token !== issuedDate) {
		return `Invoice number contains date ${match[1]}${match[2]}${match[3]}, which does not match the issue date (${issuedDate}).`;
	}
	return null;
}
