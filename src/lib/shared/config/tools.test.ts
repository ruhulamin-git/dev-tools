import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
	tools,
	getLiveTools,
	getToolsByCategory,
	getToolsByStatus,
	getToolBySlug,
	getToolUrl,
	getRelatedTools,
	getAllToolSlugs,
	getCategories,
	type ToolCategory,
	type ToolStatus
} from './tools';

// vitest.config.ts runs with the project root as the working directory.
const projectRoot = process.cwd();

describe('tools configuration', () => {
	describe('tools array', () => {
		it('should contain all defined tools', () => {
			expect(tools.length).toBeGreaterThan(0);
		});

		it('should have tools with required properties', () => {
			tools.forEach((tool) => {
				expect(tool).toHaveProperty('name');
				expect(tool).toHaveProperty('slug');
				expect(tool).toHaveProperty('shortDescription');
				expect(tool).toHaveProperty('category');
				expect(tool).toHaveProperty('status');
				expect(tool).toHaveProperty('priority');

				expect(typeof tool.name).toBe('string');
				expect(typeof tool.slug).toBe('string');
				expect(typeof tool.shortDescription).toBe('string');
				expect(typeof tool.priority).toBe('number');
			});
		});

		it('should have unique slugs', () => {
			const slugs = tools.map((tool) => tool.slug);
			const uniqueSlugs = new Set(slugs);
			expect(slugs.length).toBe(uniqueSlugs.size);
		});

		it('should have valid categories', () => {
			const validCategories: ToolCategory[] = ['developer', 'text', 'image', 'productivity'];
			tools.forEach((tool) => {
				expect(validCategories).toContain(tool.category);
			});
		});

		it('should have valid statuses', () => {
			const validStatuses: ToolStatus[] = ['live'];
			tools.forEach((tool) => {
				expect(validStatuses).toContain(tool.status);
			});
		});
	});

	describe('getLiveTools', () => {
		it('should return only tools with status "live"', () => {
			const liveTools = getLiveTools();
			liveTools.forEach((tool) => {
				expect(tool.status).toBe('live');
			});
		});

		it('should return at least one live tool (QR Code Generator)', () => {
			const liveTools = getLiveTools();
			expect(liveTools.length).toBeGreaterThan(0);
			expect(liveTools.some((tool) => tool.slug === 'qr-code-generator')).toBe(true);
		});

		it('should exclude sub-route entries marked showInNav: false', () => {
			const liveTools = getLiveTools();
			expect(liveTools.some((tool) => tool.slug === 'online-color-picker/palette')).toBe(false);
			// but the sub-route entry itself still exists in the full registry
			expect(tools.some((tool) => tool.slug === 'online-color-picker/palette')).toBe(true);
		});
	});

	describe('getToolsByCategory', () => {
		it('should return tools for developer category', () => {
			const devTools = getToolsByCategory('developer');
			devTools.forEach((tool) => {
				expect(tool.category).toBe('developer');
			});
		});

		it('should return tools for text category', () => {
			const textTools = getToolsByCategory('text');
			textTools.forEach((tool) => {
				expect(tool.category).toBe('text');
			});
		});

		it('should return tools for image category', () => {
			const imageTools = getToolsByCategory('image');
			imageTools.forEach((tool) => {
				expect(tool.category).toBe('image');
			});
		});
	});

	describe('getToolsByStatus', () => {
		it('should return live tools', () => {
			const liveTools = getToolsByStatus('live');
			liveTools.forEach((tool) => {
				expect(tool.status).toBe('live');
			});
		});
	});

	describe('getToolBySlug', () => {
		it('should find a tool by its exact slug', () => {
			const qrTool = getToolBySlug('qr-code-generator');
			expect(qrTool).toBeDefined();
			expect(qrTool?.name).toBe('QR Code Generator');
		});

		it('should find the password tool', () => {
			const passwordTool = getToolBySlug('random-password-generator');
			expect(passwordTool).toBeDefined();
			expect(passwordTool?.name).toBe('Password Generator');
		});

		it('should find a sub-route by its last path segment', () => {
			// +layout.svelte derives the current tool from the URL's last segment alone, so
			// `getToolBySlug('palette')` has to resolve to `online-color-picker/palette`.
			const paletteTool = getToolBySlug('palette');
			expect(paletteTool).toBeDefined();
			expect(paletteTool?.slug).toBe('online-color-picker/palette');
		});

		it('should return undefined for a non-existent slug', () => {
			const tool = getToolBySlug('non-existent-tool');
			expect(tool).toBeUndefined();
		});

		it('should be case-sensitive', () => {
			const tool = getToolBySlug('QR-CODE-GENERATOR');
			expect(tool).toBeUndefined();
		});
	});

	describe('getToolUrl', () => {
		it('should return a path-based URL for a normal tool', () => {
			const qrTool = getToolBySlug('qr-code-generator');
			expect(qrTool).toBeDefined();
			if (qrTool) {
				expect(getToolUrl(qrTool)).toBe('/qr-code-generator');
			}
		});

		it('should return the base-path-prefixed URL when a base path is given', () => {
			const base64Tool = getToolBySlug('base64-encoder-decoder');
			expect(base64Tool).toBeDefined();
			if (base64Tool) {
				expect(getToolUrl(base64Tool, '/tools')).toBe('/tools/base64-encoder-decoder');
			}
		});

		it('should return the external URL for an external tool, ignoring basePath', () => {
			const fakeData = getToolBySlug('fake-data-generator');
			expect(fakeData).toBeDefined();
			if (fakeData) {
				expect(getToolUrl(fakeData, '/tools')).toBe('https://fake.devxhub.com/');
			}
		});

		it('should handle a hyphenated slug', () => {
			const tool = {
				name: 'Test Tool',
				slug: 'test-tool',
				shortDescription: 'Test tool',
				seoDescription: 'Test tool',
				category: 'developer' as ToolCategory,
				status: 'live' as ToolStatus,
				priority: 1,
				keywords: ['test']
			};
			expect(getToolUrl(tool)).toBe('/test-tool');
		});
	});

	describe('getRelatedTools', () => {
		it('resolves related slugs into full Tool records', () => {
			const hashTool = getToolBySlug('hash-generator');
			expect(hashTool).toBeDefined();
			if (hashTool) {
				const related = getRelatedTools(hashTool);
				expect(related.length).toBeGreaterThan(0);
				related.forEach((tool) => {
					expect(tool.slug).not.toBe(hashTool.slug);
				});
			}
		});

		it('silently drops a related slug that no longer resolves', () => {
			const tool = {
				name: 'Test',
				slug: 'test',
				shortDescription: 'x',
				seoDescription: 'x',
				category: 'developer' as ToolCategory,
				status: 'live' as ToolStatus,
				priority: 1,
				keywords: [],
				related: ['does-not-exist']
			};
			expect(getRelatedTools(tool)).toEqual([]);
		});
	});

	describe('getCategories', () => {
		it('should return unique categories', () => {
			const categories = getCategories();
			const uniqueCategories = new Set(categories);
			expect(categories.length).toBe(uniqueCategories.size);
		});

		it('should return valid categories', () => {
			const validCategories: ToolCategory[] = ['developer', 'text', 'image', 'productivity'];
			const categories = getCategories();
			categories.forEach((category) => {
				expect(validCategories).toContain(category);
			});
		});

		it('should include every category present among navigable tools', () => {
			const categories = getCategories();
			const navCategories = new Set(getLiveTools().map((tool) => tool.category));
			expect(categories.length).toBe(navCategories.size);
		});
	});

	describe('tool data integrity', () => {
		it('should have slugs in a valid route format (lowercase, alphanumeric, hyphens, optional sub-route)', () => {
			tools.forEach((tool) => {
				expect(tool.slug).toMatch(/^[a-z0-9-]+(\/[a-z0-9-]+)*$/);
				expect(tool.slug.length).toBeGreaterThan(0);
			});
		});

		it('should have non-empty descriptions', () => {
			tools.forEach((tool) => {
				expect(tool.shortDescription.length).toBeGreaterThan(0);
				expect(tool.seoDescription.length).toBeGreaterThan(0);
			});
		});

		it('should have priority values', () => {
			tools.forEach((tool) => {
				expect(tool.priority).toBeGreaterThan(0);
				expect(Number.isInteger(tool.priority)).toBe(true);
			});
		});

		it('should have an seoTitle for every local (non-external) tool', () => {
			tools.forEach((tool) => {
				if (!tool.external) {
					expect(tool.seoTitle, `${tool.slug} is missing seoTitle`).toBeTruthy();
				}
			});
		});

		it('should have a keywords list for every tool', () => {
			tools.forEach((tool) => {
				expect(Array.isArray(tool.keywords)).toBe(true);
			});
		});

		it("every related slug should resolve to a real tool in the registry", () => {
			tools.forEach((tool) => {
				(tool.related ?? []).forEach((relatedSlug) => {
					expect(
						tools.some((t) => t.slug === relatedSlug),
						`${tool.slug} lists related slug "${relatedSlug}", which doesn't exist`
					).toBe(true);
				});
			});
		});

		// Registry-integrity checks: every asset a tool's entry points at actually exists on
		// disk, and every non-external slug has a route to render. Catches the class of drift
		// that caused the two-file version of this registry to disagree — a tool renamed, or a
		// guide/OG image moved, without every reference to it being updated.
		it('should have a route directory for every non-external slug', () => {
			tools.forEach((tool) => {
				if (tool.external) return;
				const routeSlug = tool.slug.split('/')[0];
				const routeDir = join(projectRoot, 'src/routes', routeSlug);
				expect(existsSync(routeDir), `${tool.slug}: missing route dir ${routeDir}`).toBe(true);
			});
		});

		it('should have an existing file for every ogImage', () => {
			tools.forEach((tool) => {
				if (!tool.ogImage) return;
				const file = join(projectRoot, 'static', tool.ogImage);
				expect(existsSync(file), `${tool.slug}: missing ogImage file ${file}`).toBe(true);
			});
		});

		it('should have an existing file for every icon', () => {
			tools.forEach((tool) => {
				if (!tool.icon) return;
				const file = join(projectRoot, 'static', tool.icon);
				expect(existsSync(file), `${tool.slug}: missing icon file ${file}`).toBe(true);
			});
		});

		it('should have an existing file for every guidePdf', () => {
			tools.forEach((tool) => {
				if (!tool.guidePdf) return;
				const file = join(projectRoot, 'static/tool-pdf', tool.guidePdf);
				expect(existsSync(file), `${tool.slug}: missing guidePdf file ${file}`).toBe(true);
			});
		});
	});

	describe('getAllToolSlugs', () => {
		it('should return every non-external slug, for the sitemap', () => {
			const slugs = getAllToolSlugs();
			expect(slugs.length).toBe(tools.filter((t) => !t.external).length);
			expect(slugs).toContain('online-color-picker/palette');
			expect(slugs).not.toContain('fake-data-generator');
		});
	});
});
