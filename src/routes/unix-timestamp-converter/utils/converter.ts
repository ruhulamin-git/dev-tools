export function unixToDate(timestamp: number): Date {
	return new Date(timestamp * 1000);
}

export function dateToUnix(date: Date): number {
	return Math.floor(date.getTime() / 1000);
}

export function formatDate(date: Date): string {
	return date.toLocaleString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		timeZoneName: 'short'
	});
}

export function isValidUnixTimestamp(timestamp: number): boolean {
	return Number.isInteger(timestamp) && timestamp >= 0;
}

export function isValidDate(dateString: string): boolean {
	const date = new Date(dateString);
	return !isNaN(date.getTime());
}