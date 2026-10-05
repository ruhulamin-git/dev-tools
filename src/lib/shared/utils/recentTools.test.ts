import { describe, expect, it, beforeEach } from 'vitest';
import { recordToolVisit, getRecentToolSlugs } from './recentTools';

describe('recentTools', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it('returns an empty list when nothing has been recorded', () => {
		expect(getRecentToolSlugs()).toEqual([]);
	});

	it('records a visit and returns it', () => {
		recordToolVisit('hash-generator');
		expect(getRecentToolSlugs()).toEqual(['hash-generator']);
	});

	it('puts the most recently visited tool first', () => {
		recordToolVisit('hash-generator');
		recordToolVisit('qr-code-generator');
		expect(getRecentToolSlugs()).toEqual(['qr-code-generator', 'hash-generator']);
	});

	it('moves a re-visited tool back to the front instead of duplicating it', () => {
		recordToolVisit('hash-generator');
		recordToolVisit('qr-code-generator');
		recordToolVisit('hash-generator');
		expect(getRecentToolSlugs()).toEqual(['hash-generator', 'qr-code-generator']);
	});

	it('caps the list at 6 entries', () => {
		for (const slug of ['a', 'b', 'c', 'd', 'e', 'f', 'g']) {
			recordToolVisit(slug);
		}
		const recent = getRecentToolSlugs();
		expect(recent).toHaveLength(6);
		expect(recent).toEqual(['g', 'f', 'e', 'd', 'c', 'b']);
	});

	it('recovers from a malformed stored value', () => {
		localStorage.setItem('dxh_recent_tools', 'not valid json{');
		expect(getRecentToolSlugs()).toEqual([]);
	});

	it('ignores a non-array stored value', () => {
		localStorage.setItem('dxh_recent_tools', JSON.stringify({ not: 'an array' }));
		expect(getRecentToolSlugs()).toEqual([]);
	});
});
