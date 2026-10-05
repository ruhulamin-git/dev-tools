export interface SEOConfig {
	title: string;
	description: string;
	url?: string;
	image?: string;
	imageWidth?: number;
	imageHeight?: number;
	imageAlt?: string;
	type?: string;
	siteName?: string;
	locale?: string;
	canonicalUrl?: string;
	twitterCard?: 'summary' | 'summary_large_image';
	twitterSite?: string;
	twitterCreator?: string;
	author?: string;
	publishedTime?: string;
	modifiedTime?: string;
	section?: string;
	tags?: string[];
}

export function generateSEOTags(config: SEOConfig) {
	const {
		title,
		description,
		url = '',
		image = '/preview.png',
		imageWidth = 1200,
		imageHeight = 630,
		imageAlt = '',
		type = 'website',
		siteName = 'Devxhub Tools',
		locale = 'en_US',
		canonicalUrl,
		twitterCard = 'summary_large_image',
		twitterSite = '@devxhub',
		twitterCreator = '@devxhub',
		author = 'Devxhub',
		publishedTime,
		modifiedTime,
		section,
		tags = []
	} = config;

	// Get base URL from environment or use default
	// Set PUBLIC_SITE_URL in your .env file or environment
	// Always use env var to avoid hydration mismatches
	const baseUrl = import.meta.env.PUBLIC_SITE_URL || 'https://www.devxhub.com/tools';
	const fullUrl = url ? (url.startsWith('http') ? url : `${baseUrl}${url}`) : baseUrl;
	const canonical = canonicalUrl || fullUrl;
	const fullImage = image.startsWith('http') ? image : `${baseUrl}${image}`;

	return {
		title,
		description,
		canonical: canonical,
		// Basic meta tags
		author,
		// Open Graph tags
		'og:title': title,
		'og:description': description,
		'og:url': fullUrl,
		'og:image': fullImage,
		'og:image:width': imageWidth.toString(),
		'og:image:height': imageHeight.toString(),
		'og:image:type': 'image/png',
		...(imageAlt && { 'og:image:alt': imageAlt }),
		'og:type': type,
		'og:site_name': siteName,
		'og:locale': locale,
		...(publishedTime && { 'og:published_time': publishedTime }),
		...(modifiedTime && { 'og:modified_time': modifiedTime }),
		...(section && { 'og:section': section }),
		// Twitter Card tags
		'twitter:card': twitterCard,
		'twitter:title': title,
		'twitter:description': description,
		'twitter:image': fullImage,
		'twitter:image:alt': imageAlt || title,
		...(twitterSite && { 'twitter:site': twitterSite }),
		...(twitterCreator && { 'twitter:creator': twitterCreator }),
		// Additional meta tags
		...(tags.length > 0 && { 'article:tag': tags })
	};
}

// No `aggregateRating` option: schema.org rating markup asserts a real average of real
// reviews, and this app collects none. Google's structured-data policy treats a rating with
// no visible reviews behind it as spam, and it would also just be false. If real ratings are
// ever collected (e.g. surfaced from Clutch), thread them through here as actual data — never
// as a literal placeholder.
export function generateSchemaMarkup(config: {
	name: string;
	description: string;
	url?: string;
	applicationCategory?: string;
	operatingSystem?: string;
	offers?: {
		price?: string;
		priceCurrency?: string;
	};
	author?: string;
	publisher?: string;
	keywords?: string[];
}) {
	// Get base URL from environment or use default
	// Always use env var to avoid hydration mismatches
	const baseUrl = import.meta.env.PUBLIC_SITE_URL || 'https://www.devxhub.com/tools';

	const {
		name,
		description,
		url = baseUrl,
		applicationCategory = 'WebApplication',
		operatingSystem = 'Any',
		offers,
		author = 'Devxhub',
		publisher = 'Devxhub',
		keywords = []
	} = config;

	const schema: any = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name,
		description,
		url,
		applicationCategory,
		operatingSystem,
		author: {
			'@type': 'Organization',
			name: author,
			url: 'https://www.devxhub.com'
		},
		publisher: {
			'@type': 'Organization',
			name: publisher,
			url: 'https://www.devxhub.com'
		},
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD',
			availability: 'https://schema.org/InStock'
		},
		isAccessibleForFree: true,
		browserRequirements: 'Requires JavaScript. Requires HTML5.',
		...(keywords.length > 0 && { keywords: keywords.join(', ') })
	};

	if (offers) {
		schema.offers = { '@type': 'Offer', ...offers };
	}

	return schema;
}
