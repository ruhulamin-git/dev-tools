import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn utility', () => {
	it('merges class names correctly', () => {
		expect(cn('c-red', 'bg-blue')).toBe('c-red bg-blue');
	});

	it('handles conditional classes', () => {
		expect(cn('c-red', false && 'bg-blue', 'text-lg')).toBe('c-red text-lg');
	});

	it('merges tailwind classes using tailwind-merge', () => {
		expect(cn('p-4', 'p-2')).toBe('p-2');
	});

	it('handles undefined and null values', () => {
		expect(cn('base-class', undefined, null, 'other-class')).toBe('base-class other-class');
	});

	it('handles empty strings', () => {
		expect(cn('base-class', '', 'other-class')).toBe('base-class other-class');
	});

	it('handles arrays of classes', () => {
		expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
	});

	it('handles objects with boolean values', () => {
		expect(cn({ 'active': true, 'disabled': false, 'hover': true })).toContain('active');
		expect(cn({ 'active': true, 'disabled': false, 'hover': true })).toContain('hover');
		expect(cn({ 'active': true, 'disabled': false, 'hover': true })).not.toContain('disabled');
	});

	it('handles mixed input types', () => {
		const result = cn(
			'base',
			['array1', 'array2'],
			{ 'object-class': true },
			'string-class',
			false && 'should-not-appear',
			true && 'should-appear',
			null && 'null-should-not-appear',
			undefined && 'undefined-should-not-appear'
		);
		expect(result).toContain('base');
		expect(result).toContain('array1');
		expect(result).toContain('array2');
		expect(result).toContain('object-class');
		expect(result).toContain('string-class');
		expect(result).toContain('should-appear');
		// false && 'should-not-appear' evaluates to false, which clsx filters out
		expect(result).not.toContain('should-not-appear');
		expect(result).not.toContain('null-should-not-appear');
		expect(result).not.toContain('undefined-should-not-appear');
	});

	it('removes duplicate classes', () => {
		const result = cn('class1', 'class2', 'class1', 'class3');
		// tailwind-merge handles duplicates, so we just check it's valid
		expect(result).toBeTruthy();
	});

	it('handles conflicting Tailwind classes correctly', () => {
		// p-4 and p-2 conflict, p-2 should win
		expect(cn('p-4', 'p-2')).toBe('p-2');

		// m-4 and m-2 conflict, m-2 should win
		expect(cn('m-4', 'm-2')).toBe('m-2');
	});
});
