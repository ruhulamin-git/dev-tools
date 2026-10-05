/**
 * Per-Route SEO Helper
 *
 * Generates route-specific SEO metadata for each tool page.
 * Aligns with Devxhub Tools Development Specification requirements.
 */

import { generateSEOTags, generateSchemaMarkup, type SEOConfig } from './seo';

export interface RouteSEOOptions {
	toolName: string;
	description: string;
	url: string;
	keywords?: string[];
	image?: string;
	imageWidth?: number;
	imageHeight?: number;
	imageAlt?: string;
	siteName?: string;
	locale?: string;
	canonicalUrl?: string;
	twitterCard?: 'summary' | 'summary_large_image';
	twitterSite?: string;
	twitterCreator?: string;
	aggregateRating?: {
		ratingValue: string;
		ratingCount: string;
	};
}

/**
 * Generate SEO tags and schema for a tool route
 *
 * @param options - SEO configuration options
 * @returns Object containing seoTags and schema markup
 */
export function getRouteSEO(options: RouteSEOOptions) {
	const {
		toolName,
		description,
		url,
		keywords = [],
		image = '/preview.png',
		imageWidth = 1200,
		imageHeight = 630,
		imageAlt = `${toolName} - Free Online Tool`,
		siteName = 'Devxhub Tools',
		locale = 'en_US',
		canonicalUrl,
		twitterCard = 'summary_large_image',
		twitterSite = '@devxhub',
		twitterCreator = '@devxhub',
		aggregateRating
	} = options;

	// Build title with keywords
	const title = `${toolName} - Free Online Tool | Devxhub`;

	// Build description (ensure it's under 155 characters for optimal SEO)
	const metaDescription =
		description.length > 155 ? `${description.substring(0, 152)}...` : description;

	// SEO config
	const seoConfig: SEOConfig = {
		title,
		description: metaDescription,
		url,
		image,
		imageWidth,
		imageHeight,
		imageAlt,
		siteName,
		locale,
		canonicalUrl,
		twitterCard,
		twitterSite,
		twitterCreator
	};

	// Generate SEO tags
	const seoTags = generateSEOTags(seoConfig);

	// Schema markup with aggregateRating (spec requirement)
	const schemaData: Parameters<typeof generateSchemaMarkup>[0] = {
		name: toolName,
		description: metaDescription,
		url: canonicalUrl || url,
		applicationCategory: 'WebApplication',
		operatingSystem: 'Any',
		offers: {
			price: '0',
			priceCurrency: 'USD'
		}
	};

	// Add aggregateRating if provided (spec requirement)
	const schemaMarkup = generateSchemaMarkup(schemaData);

	if (aggregateRating) {
		schemaMarkup.aggregateRating = {
			'@type': 'AggregateRating',
			ratingValue: aggregateRating.ratingValue,
			ratingCount: aggregateRating.ratingCount
		};
	}

	return {
		seoTags,
		schemaMarkup,
		title,
		description: metaDescription
	};
}

/**
 * Default aggregate rating for tools (from spec)
 */
export const defaultAggregateRating = {
	ratingValue: '4.8',
	ratingCount: '1250'
};

/**
 * Breadcrumb Schema Interface
 */
export interface BreadcrumbItem {
	name: string;
	url: string;
	position: number;
}

/**
 * Generate Breadcrumb Schema Markup
 *
 * According to Devxhub Tools Development Specification v2.0,
 * breadcrumb schema should be included on each tool page.
 *
 * @param items - Array of breadcrumb items (name, url, position)
 * @returns BreadcrumbList schema object
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item) => ({
			'@type': 'ListItem',
			position: item.position,
			name: item.name,
			item: item.url
		}))
	};
}

/**
 * Generate standard breadcrumb schema for tool pages
 *
 * Standard format: Home > Tools > [Tool Name]
 *
 * @param toolName - Name of the tool
 * @param toolUrl - Full URL to the tool page
 * @param baseUrl - Base URL (defaults to https://www.devxhub.com)
 * @returns BreadcrumbList schema object
 */
export function generateToolBreadcrumbSchema(
	toolName: string,
	toolUrl: string,
	baseUrl: string = 'https://www.devxhub.com'
) {
	return generateBreadcrumbSchema([
		{
			name: 'Home',
			url: baseUrl,
			position: 1
		},
		{
			name: 'Tools',
			url: `${baseUrl}/tools`,
			position: 2
		},
		{
			name: toolName,
			url: toolUrl,
			position: 3
		}
	]);
}
