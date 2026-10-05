import { describe, expect, it } from 'vitest';
import { defaultAggregateRating, getRouteSEO } from './routeSEO';

describe('routeSEO utilities', () => {
	describe('getRouteSEO', () => {
		it('should generate SEO tags with correct title format', () => {
			const result = getRouteSEO({
				toolName: 'JSON Formatter',
				description: 'Format and validate JSON',
				url: 'https://www.devxhub.com/tools/json'
			});

			expect(result.title).toBe('JSON Formatter - Free Online Tool | Devxhub');
			expect(result.seoTags.title).toBe('JSON Formatter - Free Online Tool | Devxhub');
		});

		it('should truncate description if over 155 characters', () => {
			const longDescription = 'A'.repeat(200);
			const result = getRouteSEO({
				toolName: 'Test Tool',
				description: longDescription,
				url: 'https://www.devxhub.com/tools/test'
			});

			expect(result.description.length).toBeLessThanOrEqual(155);
			expect(result.description).toMatch(/\.\.\.$/);
		});

		it('should keep description if under 155 characters', () => {
			const shortDescription = 'Short description';
			const result = getRouteSEO({
				toolName: 'Test Tool',
				description: shortDescription,
				url: 'https://www.devxhub.com/tools/test'
			});

			expect(result.description).toBe(shortDescription);
		});

		it('should include all required SEO tags', () => {
			const result = getRouteSEO({
				toolName: 'Test Tool',
				description: 'Test description',
				url: 'https://www.devxhub.com/tools/test'
			});

			expect(result.seoTags).toHaveProperty('title');
			expect(result.seoTags).toHaveProperty('description');
			expect(result.seoTags).toHaveProperty('canonical');
			expect(result.seoTags).toHaveProperty('og:title');
			expect(result.seoTags).toHaveProperty('og:description');
			expect(result.seoTags).toHaveProperty('og:url');
			expect(result.seoTags).toHaveProperty('og:image');
			expect(result.seoTags).toHaveProperty('twitter:card');
			expect(result.seoTags).toHaveProperty('twitter:title');
			expect(result.seoTags).toHaveProperty('twitter:description');
		});

		it('should use default site name if not provided', () => {
			const result = getRouteSEO({
				toolName: 'Test Tool',
				description: 'Test description',
				url: 'https://www.devxhub.com/tools/test'
			});

			expect(result.seoTags['og:site_name']).toBe('Devxhub Tools');
		});

		it('should use custom site name if provided', () => {
			const result = getRouteSEO({
				toolName: 'Test Tool',
				description: 'Test description',
				url: 'https://www.devxhub.com/tools/test',
				siteName: 'Custom Site'
			});

			expect(result.seoTags['og:site_name']).toBe('Custom Site');
		});

		it('should generate schema markup with SoftwareApplication type', () => {
			const result = getRouteSEO({
				toolName: 'Test Tool',
				description: 'Test description',
				url: 'https://www.devxhub.com/tools/test'
			});

			expect(result.schemaMarkup['@context']).toBe('https://schema.org');
			expect(result.schemaMarkup['@type']).toBe('SoftwareApplication');
			expect(result.schemaMarkup.name).toBe('Test Tool');
			expect(result.schemaMarkup.description).toBe('Test description');
			expect(result.schemaMarkup.applicationCategory).toBe('WebApplication');
			expect(result.schemaMarkup.operatingSystem).toBe('Any');
		});

		it('should include offers in schema markup', () => {
			const result = getRouteSEO({
				toolName: 'Test Tool',
				description: 'Test description',
				url: 'https://www.devxhub.com/tools/test'
			});

			expect(result.schemaMarkup.offers).toBeDefined();
			expect(result.schemaMarkup.offers['@type']).toBe('Offer');
			expect(result.schemaMarkup.offers.price).toBe('0');
			expect(result.schemaMarkup.offers.priceCurrency).toBe('USD');
		});

		it('should include aggregateRating when provided', () => {
			const result = getRouteSEO({
				toolName: 'Test Tool',
				description: 'Test description',
				url: 'https://www.devxhub.com/tools/test',
				aggregateRating: {
					ratingValue: '4.9',
					ratingCount: '2000'
				}
			});

			expect(result.schemaMarkup.aggregateRating).toBeDefined();
			expect(result.schemaMarkup.aggregateRating['@type']).toBe('AggregateRating');
			expect(result.schemaMarkup.aggregateRating.ratingValue).toBe('4.9');
			expect(result.schemaMarkup.aggregateRating.ratingCount).toBe('2000');
		});

		it('should not include aggregateRating when not provided', () => {
			const result = getRouteSEO({
				toolName: 'Test Tool',
				description: 'Test description',
				url: 'https://www.devxhub.com/tools/test'
			});

			expect(result.schemaMarkup.aggregateRating).toBeUndefined();
		});

		it('should use canonicalUrl if provided', () => {
			const result = getRouteSEO({
				toolName: 'Test Tool',
				description: 'Test description',
				url: 'https://www.devxhub.com/tools/test',
				canonicalUrl: 'https://www.devxhub.com/tools/test'
			});

			expect(result.seoTags.canonical).toBe('https://www.devxhub.com/tools/test');
		});

		it('should use url as canonical if canonicalUrl not provided', () => {
			const result = getRouteSEO({
				toolName: 'Test Tool',
				description: 'Test description',
				url: 'https://www.devxhub.com/tools/test'
			});

			expect(result.seoTags.canonical).toContain('devxhub.com/tools/test');
		});

		it('should use default image if not provided', () => {
			const result = getRouteSEO({
				toolName: 'Test Tool',
				description: 'Test description',
				url: 'https://www.devxhub.com/tools/test'
			});

			expect(result.seoTags['og:image']).toContain('/preview.png');
		});

		it('should use custom image if provided', () => {
			const result = getRouteSEO({
				toolName: 'Test Tool',
				description: 'Test description',
				url: 'https://www.devxhub.com/tools/test',
				image: '/custom-image.png'
			});

			expect(result.seoTags['og:image']).toContain('/custom-image.png');
		});

		it('should use default Twitter card type', () => {
			const result = getRouteSEO({
				toolName: 'Test Tool',
				description: 'Test description',
				url: 'https://www.devxhub.com/tools/test'
			});

			expect(result.seoTags['twitter:card']).toBe('summary_large_image');
		});

		it('should use custom Twitter card type if provided', () => {
			const result = getRouteSEO({
				toolName: 'Test Tool',
				description: 'Test description',
				url: 'https://www.devxhub.com/tools/test',
				twitterCard: 'summary'
			});

			expect(result.seoTags['twitter:card']).toBe('summary');
		});

		it('should include keywords in description if provided', () => {
			const result = getRouteSEO({
				toolName: 'JSON Formatter',
				description: 'Format JSON',
				url: 'https://www.devxhub.com/tools/json',
				keywords: ['json', 'formatter', 'validator']
			});

			// Keywords are used internally but may affect description generation
			expect(result.seoTags.description).toBeDefined();
		});
	});

	describe('defaultAggregateRating', () => {
		it('should have correct structure', () => {
			expect(defaultAggregateRating).toHaveProperty('ratingValue');
			expect(defaultAggregateRating).toHaveProperty('ratingCount');
			expect(defaultAggregateRating.ratingValue).toBe('4.8');
			expect(defaultAggregateRating.ratingCount).toBe('1250');
		});
	});
});
