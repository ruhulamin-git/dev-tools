import { describe, expect, it, vi } from 'vitest';
import { generateSEOTags, generateSchemaMarkup, type SEOConfig } from './seo';

describe('SEO utilities', () => {
	describe('generateSEOTags', () => {
		it('should generate all required SEO tags', () => {
			const config: SEOConfig = {
				title: 'Test Title',
				description: 'Test description',
				url: '/test'
			};

			const tags = generateSEOTags(config);

			expect(tags).toHaveProperty('title');
			expect(tags).toHaveProperty('description');
			expect(tags).toHaveProperty('canonical');
			expect(tags).toHaveProperty('og:title');
			expect(tags).toHaveProperty('og:description');
			expect(tags).toHaveProperty('og:url');
			expect(tags).toHaveProperty('og:type');
			expect(tags).toHaveProperty('twitter:card');
			expect(tags).toHaveProperty('twitter:title');
			expect(tags).toHaveProperty('twitter:description');
		});

		it('should use default values for optional fields', () => {
			const config: SEOConfig = {
				title: 'Test',
				description: 'Test description'
			};

			const tags = generateSEOTags(config);

			expect(tags['og:type']).toBe('website');
			expect(tags['og:site_name']).toBe('Devxhub Tools');
			expect(tags['og:locale']).toBe('en_US');
			expect(tags['twitter:card']).toBe('summary_large_image');
		});

		it('should build full URL from base URL and path', () => {
			// `Object.defineProperty(import.meta, 'env', ...)` doesn't work here: Vite statically
			// replaces `import.meta.env.X` reads at transform time, so mutating the object at
			// runtime never reaches code that already compiled to the old literal value.
			// `vi.stubEnv` is Vitest's supported way to do this instead.
			vi.stubEnv('PUBLIC_SITE_URL', 'https://example.com');

			const config: SEOConfig = {
				title: 'Test',
				description: 'Test',
				url: '/test-page'
			};

			const tags = generateSEOTags(config);

			expect(tags['og:url']).toContain('example.com');
			expect(tags['og:url']).toContain('/test-page');

			vi.unstubAllEnvs();
		});

		it('should handle absolute URLs', () => {
			const config: SEOConfig = {
				title: 'Test',
				description: 'Test',
				url: 'https://external.com/page'
			};

			const tags = generateSEOTags(config);

			expect(tags['og:url']).toBe('https://external.com/page');
		});

		it('should include image dimensions', () => {
			const config: SEOConfig = {
				title: 'Test',
				description: 'Test',
				image: '/test.jpg',
				imageWidth: 1200,
				imageHeight: 630
			};

			const tags = generateSEOTags(config);

			expect(tags['og:image:width']).toBe('1200');
			expect(tags['og:image:height']).toBe('630');
		});

		it('should include image alt text if provided', () => {
			const config: SEOConfig = {
				title: 'Test',
				description: 'Test',
				image: '/test.jpg',
				imageAlt: 'Test image'
			};

			const tags = generateSEOTags(config);

			expect(tags['og:image:alt']).toBe('Test image');
		});

		it('should not include image alt if not provided', () => {
			const config: SEOConfig = {
				title: 'Test',
				description: 'Test',
				image: '/test.jpg'
			};

			const tags = generateSEOTags(config);

			expect(tags['og:image:alt']).toBeUndefined();
		});

		it('should include Twitter site and creator if provided', () => {
			const config: SEOConfig = {
				title: 'Test',
				description: 'Test',
				twitterSite: '@test',
				twitterCreator: '@creator'
			};

			const tags = generateSEOTags(config);

			expect(tags['twitter:site']).toBe('@test');
			expect(tags['twitter:creator']).toBe('@creator');
		});

		it('should use canonicalUrl if provided', () => {
			const config: SEOConfig = {
				title: 'Test',
				description: 'Test',
				url: '/test',
				canonicalUrl: 'https://canonical.com/test'
			};

			const tags = generateSEOTags(config);

			expect(tags.canonical).toBe('https://canonical.com/test');
		});
	});

	describe('generateSchemaMarkup', () => {
		it('should generate SoftwareApplication schema', () => {
			const schema = generateSchemaMarkup({
				name: 'Test App',
				description: 'Test description',
				url: 'https://test.com'
			});

			expect(schema['@context']).toBe('https://schema.org');
			expect(schema['@type']).toBe('SoftwareApplication');
			expect(schema.name).toBe('Test App');
			expect(schema.description).toBe('Test description');
			expect(schema.url).toBe('https://test.com');
		});

		it('should use default category and OS', () => {
			const schema = generateSchemaMarkup({
				name: 'Test',
				description: 'Test'
			});

			expect(schema.applicationCategory).toBe('WebApplication');
			expect(schema.operatingSystem).toBe('Any');
		});

		it('should include custom category and OS', () => {
			const schema = generateSchemaMarkup({
				name: 'Test',
				description: 'Test',
				applicationCategory: 'DeveloperApplication',
				operatingSystem: 'Web'
			});

			expect(schema.applicationCategory).toBe('DeveloperApplication');
			expect(schema.operatingSystem).toBe('Web');
		});

		it('should include offers if provided', () => {
			const schema = generateSchemaMarkup({
				name: 'Test',
				description: 'Test',
				offers: {
					price: '9.99',
					priceCurrency: 'USD'
				}
			});

			expect(schema.offers).toBeDefined();
			expect(schema.offers['@type']).toBe('Offer');
			expect(schema.offers.price).toBe('9.99');
			expect(schema.offers.priceCurrency).toBe('USD');
		});

		it('should default offers to a free $0 USD offer when not provided', () => {
			// Every tool in this app is free, so generateSchemaMarkup defaults `offers` rather
			// than omitting it — omitting it would understate what's actually true.
			const schema = generateSchemaMarkup({
				name: 'Test',
				description: 'Test'
			});

			expect(schema.offers).toEqual({
				'@type': 'Offer',
				price: '0',
				priceCurrency: 'USD',
				availability: 'https://schema.org/InStock'
			});
		});

		it('should use base URL from environment for default url', () => {
			// See the equivalent generateSEOTags test above for why vi.stubEnv, not
			// Object.defineProperty(import.meta, 'env', ...), is what actually works here.
			vi.stubEnv('PUBLIC_SITE_URL', 'https://example.com');

			const schema = generateSchemaMarkup({
				name: 'Test',
				description: 'Test'
			});

			expect(schema.url).toBe('https://example.com');

			vi.unstubAllEnvs();
		});
	});
});

