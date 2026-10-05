export type ContactLink = {
	kind: 'email' | 'phone';
	raw: string;
	href: string;
};

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_RE = /(?:\+?\d[\d\s().-]{6,}\d)/g;

/** Extract mailto: / tel: targets from free-text address or custom field values. */
export function extractContactLinks(text: string): ContactLink[] {
	if (!text) return [];
	const found: ContactLink[] = [];
	const seen = new Set<string>();

	for (const match of text.matchAll(EMAIL_RE)) {
		const raw = match[0];
		const key = raw.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		found.push({ kind: 'email', raw, href: `mailto:${raw}` });
	}

	for (const match of text.matchAll(PHONE_RE)) {
		const raw = match[0].trim();
		// Skip if this span is mostly an email local-part artifact
		if (raw.includes('@')) continue;
		const digits = raw.replace(/\D/g, '');
		if (digits.length < 7) continue;
		const key = digits;
		if (seen.has(key)) continue;
		seen.add(key);
		found.push({ kind: 'phone', raw, href: `tel:${digits}` });
	}

	return found;
}
