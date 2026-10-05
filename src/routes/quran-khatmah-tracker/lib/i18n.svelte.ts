// Tiny reactive i18n for the khatmah route — ported from quran-khatmah's
// public/i18n.js. Locales are imported statically (no fetch), and the current
// language is a Svelte rune so every `t(...)` read re-renders on change.
import en from '../locales/en.json';
import bn from '../locales/bn.json';

export type Lang = 'en' | 'bn';

const RTL = ['ar', 'ur'];
const DICTS: Record<Lang, unknown> = { en, bn };
const PREF_LANG = 'khatmah:lang';

let current = $state<Lang>('en');

function resolve(obj: unknown, path: string): unknown {
	return path.split('.').reduce<unknown>((o, k) => (o == null ? undefined : (o as Record<string, unknown>)[k]), obj);
}

function format(str: unknown, params?: Record<string, string | number>): string {
	if (typeof str !== 'string') return String(str);
	return str.replace(/\{(\w+)\}/g, (_, k) => (params && k in params ? String(params[k]) : `{${k}}`));
}

/** Translate a dotted key, filling {placeholders}. Returns the key if missing. */
export function t(key: string, params?: Record<string, string | number>): string {
	const val = resolve(DICTS[current], key);
	if (val == null) return key;
	return format(val, params);
}

function applyDocument() {
	if (typeof document === 'undefined') return;
	document.documentElement.lang = current;
	document.documentElement.dir = RTL.includes(current) ? 'rtl' : 'ltr';
}

export const i18n = {
	get lang(): Lang {
		return current;
	},
	get isRTL(): boolean {
		return RTL.includes(current);
	},
	set(lang: Lang) {
		current = lang;
		if (typeof localStorage !== 'undefined') localStorage.setItem(PREF_LANG, lang);
		applyDocument();
	},
	/** Restore the persisted language (call once on mount, in the browser). */
	init() {
		if (typeof localStorage !== 'undefined') {
			const saved = localStorage.getItem(PREF_LANG) as Lang | null;
			if (saved === 'en' || saved === 'bn') current = saved;
		}
		applyDocument();
	}
};
