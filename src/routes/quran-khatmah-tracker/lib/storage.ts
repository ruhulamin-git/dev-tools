// localStorage helpers — script preference + per-room membership.
// Ported from quran-khatmah/public/app.js.
import type { Membership, Script } from './types';

const PREF_SCRIPT = 'khatmah:script';
const memKey = (code: string) => `khatmah:room:${code}`;

export function loadScript(): Script {
	if (typeof localStorage === 'undefined') return 'uthmani';
	return (localStorage.getItem(PREF_SCRIPT) as Script) || 'uthmani';
}

export function saveScript(script: Script) {
	if (typeof localStorage !== 'undefined') localStorage.setItem(PREF_SCRIPT, script);
}

export function loadMembership(code: string): Membership {
	if (typeof localStorage === 'undefined') return {};
	try {
		return JSON.parse(localStorage.getItem(memKey(code)) || 'null') || {};
	} catch {
		return {};
	}
}

export function saveMembership(code: string, membership: Membership | null) {
	if (typeof localStorage !== 'undefined') localStorage.setItem(memKey(code), JSON.stringify(membership || {}));
}

export function clearMembership(code: string) {
	if (typeof localStorage !== 'undefined') localStorage.removeItem(memKey(code));
}
