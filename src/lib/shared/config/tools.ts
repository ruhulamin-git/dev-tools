/**
 * Tool Registry
 *
 * The single source of truth for every tool in this app: navigation, home-page cards, SEO tags,
 * JSON-LD, the sitemap, related-tool cross-linking, and the lead-magnet PDF each tool offers.
 *
 * This used to be two separate files — `tools.ts` (nav-focused: name, short description, icon,
 * priority) and `tools-metadata.ts` (SEO-focused: title, meta description, OG image) — kept in
 * sync by hand. They drifted: a few tools (cron-expression-generator, quran-khatmah-tracker) had
 * no lead-magnet guide but still rendered the lead-magnet form, silently falling back to the
 * JSON guide; the four online-color-picker sub-pages only existed in the SEO file, each with
 * their own slug, title and keywords, but no shared type describing them. One registry now
 * carries both concerns per tool, at route granularity — a sub-page like
 * `online-color-picker/palette` is its own entry with `showInNav: false`, rather than being a
 * special case bolted onto its parent.
 */

export type ToolCategory = 'developer' | 'text' | 'image' | 'productivity';
export type ToolStatus = 'live';

export interface Tool {
	/** Route slug. May contain a `/` for a sub-route, e.g. `online-color-picker/palette`. */
	slug: string;
	/** Display name — nav links, home-page cards, the lead-magnet API's `tool` field. */
	name: string;
	/** Short, card-length description for navigation and the home-page tool grid. */
	shortDescription: string;
	/**
	 * `<title>` / `og:title` — longer and keyword-rich, distinct from `shortDescription`.
	 * Optional only for an `external` tool, which has no local route or `<svelte:head>` of its
	 * own for this app to set.
	 */
	seoTitle?: string;
	/** Meta description / `og:description`. Falls back to `shortDescription` when not set. */
	seoDescription: string;
	category: ToolCategory;
	status: ToolStatus;
	/** Sort order within a category, for nav and the home-page grid. Irrelevant when `showInNav` is false. */
	priority: number;
	icon?: string;
	/** Social share image, e.g. `/social-share-images/Devxhub-_QR Code.png`. */
	ogImage?: string;
	/** Filename under `/tool-pdf/`, offered by this tool's `<LeadMagnetInline>`. */
	guidePdf?: string;
	keywords: string[];
	/** Other tool slugs to surface as "related tools" cross-links. */
	related?: string[];
	/** Set when this tool is hosted outside this app (its own URL, not a local route). */
	external?: string;
	/**
	 * False hides this entry from navigation and the home-page grid — for a sub-route (like the
	 * online-color-picker pages) that needs its own SEO/lead-magnet entry but not its own nav
	 * card. Defaults to true.
	 */
	showInNav?: boolean;
}

export const tools: Tool[] = [
	{
		slug: 'qr-code-generator',
		name: 'QR Code Generator',
		shortDescription:
			'Generate free, permanent QR codes for URLs, WiFi, and vCards. High-resolution download with no scan limits. Customizable colors and logos. Privacy-focused',
		seoTitle: 'Free QR Code Generator (No Sign-up) | Custom Logo & High Quality - Devxhub',
		seoDescription:
			'Generate free, permanent QR codes for URLs, WiFi, and vCards. High-resolution download with no scan limits. Customizable colors and logos. Privacy-focused',
		category: 'text',
		status: 'live',
		priority: 1,
		icon: '/tool-icons/qr.png',
		ogImage: '/social-share-images/Devxhub-_QR Code.png',
		guidePdf: 'qr-guide.pdf',
		keywords: ['qr code generator', 'create qr code', 'qr code maker', 'free qr code'],
		related: ['random-password-generator', 'online-markdown-editor', 'html-encoder-decoder']
	},
	{
		slug: 'random-password-generator',
		name: 'Password Generator',
		shortDescription:
			'Generate secure, uncrackable passwords instantly in your browser. Customizable length, symbols, and numbers. No data is sent to our servers. Free & Privacy-first.',
		seoTitle: 'Strong Random Password Generator (100% Client-Side) - Devxhub',
		seoDescription:
			'Generate secure, uncrackable passwords instantly in your browser. Customizable length, symbols, and numbers. No data is sent to our servers. Free & Privacy-first.',
		category: 'text',
		status: 'live',
		priority: 1,
		icon: '/tool-icons/password.png',
		ogImage: '/social-share-images/Devxhub-_Password.png',
		guidePdf: 'password-guide.pdf',
		keywords: [
			'password generator',
			'strong password',
			'random password',
			'secure password',
			'client-side password generator'
		],
		related: ['qr-code-generator', 'online-markdown-editor', 'html-encoder-decoder']
	},
	{
		slug: 'json-formatter-validator',
		name: 'JSON Formatter & Validator',
		shortDescription:
			'Format, validate, and beautify JSON. Minify, convert, and visualize JSON data.',
		seoTitle: 'Free JSON Formatter & Validator | Beautify, Minify & Fix JSON - Devxhub',
		seoDescription:
			'Validate, format, and beautify your JSON data instantly. Detect syntax errors online. Features tree view, minification, and privacy-focused local processing.',
		category: 'developer',
		status: 'live',
		priority: 1,
		icon: '/tool-icons/json.png',
		ogImage: '/social-share-images/Devxhub-_JSON Formatter.png',
		guidePdf: 'json-guide.pdf',
		keywords: [
			'json formatter',
			'json validator',
			'beautify json',
			'minify json',
			'format json',
			'json beautifier',
			'json syntax error',
			'json to csv',
			'json to xml',
			'json to yaml',
			'json tree view',
			'validate json online'
		],
		related: ['uuid-guid-generator', 'base64-encoder-decoder', 'hash-generator']
	},
	{
		slug: 'uuid-guid-generator',
		name: 'UUID/GUID Generator',
		shortDescription:
			'Generate random UUIDs (v4) and time-based UUIDs (v1) instantly. Bulk generation supported. Validate existing GUIDs. Free, client-side, and privacy-focused.',
		seoTitle: 'Online UUID/GUID Generator (v1, v4, v5) | Bulk & Random - Devxhub',
		seoDescription:
			'Generate random UUIDs (v4) and time-based UUIDs (v1) instantly. Bulk generation supported. Validate existing GUIDs. Free, client-side, and privacy-focused.',
		category: 'developer',
		status: 'live',
		priority: 1,
		icon: '/tool-icons/uuid.png',
		ogImage: '/social-share-images/Devxhub-_UUID & GUID.png',
		guidePdf: 'uuid-guide.pdf',
		keywords: [
			'uuid generator',
			'guid generator',
			'uuid v4',
			'uuid v1',
			'bulk uuid',
			'random uuid',
			'validate guid',
			'unique identifier',
			'uuid v7',
			'distributed systems'
		],
		related: ['json-formatter-validator', 'base64-encoder-decoder', 'hash-generator']
	},
	{
		slug: 'base64-encoder-decoder',
		name: 'Base64 Encoder/Decoder',
		shortDescription:
			'Encode and decode Base64 strings instantly. Convert images to Base64 for HTML/CSS embedding. Secure client-side processing—your data never leaves your browser.',
		seoTitle: 'Base64 Encoder & Decoder Online | Image & Text Support - Devxhub',
		seoDescription:
			'Encode and decode Base64 strings instantly. Convert images to Base64 for HTML/CSS embedding. Secure client-side processing—your data never leaves your browser.',
		category: 'developer',
		status: 'live',
		priority: 2,
		icon: '/tool-icons/base64.png',
		ogImage: '/social-share-images/Devxhub-_Base64.png',
		guidePdf: 'base64-guide.pdf',
		keywords: [
			'base64',
			'encoder',
			'decoder',
			'base64 encode',
			'base64 decode',
			'image to base64',
			'data url',
			'base64 image',
			'online tool'
		],
		related: ['json-formatter-validator', 'uuid-guid-generator', 'hash-generator']
	},
	{
		slug: 'hash-generator',
		name: 'Hash Generator',
		shortDescription:
			'Generate cryptographic hashes instantly. Supports MD5, SHA-1, SHA-256, SHA-512, and RIPEMD. Verify file integrity and secure passwords. 100% Client-side privacy.',
		seoTitle: 'Online Hash Generator (MD5, SHA256, SHA512) | Secure & Fast - Devxhub',
		seoDescription:
			'Generate cryptographic hashes instantly. Supports MD5, SHA-1, SHA-256, SHA-512, and RIPEMD. Verify file integrity and secure passwords. 100% Client-side privacy.',
		category: 'developer',
		status: 'live',
		priority: 2,
		icon: '/tool-icons/hash.png',
		ogImage: '/social-share-images/Devxhub-_Hash Generator.png',
		guidePdf: 'hash-guide.pdf',
		keywords: [
			'hash generator',
			'md5',
			'sha256',
			'sha1',
			'sha512',
			'checksum',
			'hash calculator',
			'file integrity',
			'cryptographic hash'
		],
		related: ['json-formatter-validator', 'uuid-guid-generator', 'base64-encoder-decoder']
	},
	{
		slug: 'jwt-decoder',
		name: 'JWT Decoder',
		shortDescription:
			'Decode and debug JWTs (JSON Web Tokens) instantly. View Header, Payload, and Signature. Check expiration dates (exp) and claims. 100% Client-side privacy.',
		seoTitle: 'JWT Decoder | Debug & Verify JSON Web Tokens Online - Devxhub',
		seoDescription:
			'Decode and debug JWTs (JSON Web Tokens) instantly. View Header, Payload, and Signature. Check expiration dates (exp) and claims. 100% Client-side privacy.',
		category: 'developer',
		status: 'live',
		priority: 2,
		icon: '/tool-icons/jwt.png',
		ogImage: '/social-share-images/Devxhub-_JWT.png',
		guidePdf: 'jwt-guide.pdf',
		keywords: [
			'jwt decoder',
			'jwt token',
			'decode jwt',
			'json web token',
			'jwt debugger',
			'jwt verify',
			'debug jwt',
			'jwt claims',
			'jwt expiration'
		],
		related: ['json-formatter-validator', 'uuid-guid-generator', 'base64-encoder-decoder']
	},
	{
		slug: 'unix-timestamp-converter',
		name: 'Unix Timestamp Converter',
		shortDescription:
			'Convert Unix timestamps to human-readable dates and vice versa. Supports seconds, milliseconds, and microseconds. Handle UTC and local timezones instantly.',
		seoTitle: 'Unix Timestamp & Epoch Converter | Seconds & Milliseconds - Devxhub',
		seoDescription:
			'Convert Unix timestamps to human-readable dates and vice versa. Supports seconds, milliseconds, and microseconds. Handle UTC and local timezones instantly.',
		category: 'developer',
		status: 'live',
		priority: 2,
		icon: '/tool-icons/unix.png',
		ogImage: '/social-share-images/Devxhub-_Timestamp Converter.png',
		guidePdf: 'timestamp-guide.pdf',
		keywords: [
			'unix timestamp',
			'epoch converter',
			'unix time',
			'timestamp converter',
			'seconds',
			'milliseconds',
			'utc',
			'timezone'
		],
		related: ['json-formatter-validator', 'uuid-guid-generator', 'base64-encoder-decoder']
	},
	{
		slug: 'url-encoder-decoder',
		name: 'URL Encoder/Decoder',
		shortDescription:
			'Encode and decode URLs instantly. Convert special characters to UTF-8 percent-encoded format. Fix broken query parameters and clean up messy links.',
		seoTitle: 'URL Encoder & Decoder | Percent-Encoding for Query Strings - Devxhub',
		seoDescription:
			'Encode and decode URLs instantly. Convert special characters to UTF-8 percent-encoded format. Fix broken query parameters and clean up messy links.',
		category: 'developer',
		status: 'live',
		priority: 2,
		icon: '/tool-icons/url.png',
		ogImage: '/social-share-images/Devxhub-_URL.png',
		guidePdf: 'url-guide.pdf',
		keywords: [
			'url encoder',
			'url decoder',
			'encode url',
			'decode url',
			'url escape',
			'percent encoding',
			'query strings',
			'uri encode'
		],
		related: ['json-formatter-validator', 'uuid-guid-generator', 'base64-encoder-decoder']
	},
	{
		slug: 'what-is-my-ip-address',
		name: 'What Is My IP Address?',
		shortDescription:
			'Find your IP address instantly. Get detailed geolocation data including country, city, ISP, and coordinates. Supports both IPv4 and IPv6 lookups. 100% Free.',
		seoTitle: 'What Is My IP Address? | IPv4 & IPv6 Location Lookup - Devxhub',
		seoDescription:
			'Check your public IP address instantly. See your location, ISP, city, and coordinates. distinct detection for IPv4 and IPv6. Free & Privacy-focused.',
		category: 'developer',
		status: 'live',
		priority: 2,
		icon: '/tool-icons/ip.png',
		ogImage: '/social-share-images/Devxhub-_IP Address.png',
		guidePdf: 'ip-guide.pdf',
		keywords: [
			'what is my ip',
			'my ip address',
			'ip lookup',
			'ip location',
			'ipv4',
			'ipv6',
			'geolocation',
			'ip finder',
			'ip address lookup',
			'find my ip'
		],
		related: ['json-formatter-validator', 'uuid-guid-generator', 'base64-encoder-decoder']
	},
	{
		slug: 'online-markdown-editor',
		name: 'Markdown Editor & Preview',
		shortDescription:
			'Write and preview Markdown in real-time. Convert Markdown to HTML or PDF instantly. Supports tables, code blocks, and images. Free, private, and no sign-up required.',
		seoTitle: 'Online Markdown Editor & Viewer | Live Preview to HTML/PDF - Devxhub',
		seoDescription:
			'Write and preview Markdown in real-time. Convert Markdown to HTML or PDF instantly. Supports tables, code blocks, and images. Free, private, and no sign-up required.',
		category: 'text',
		status: 'live',
		priority: 3,
		icon: '/tool-icons/markdown.png',
		ogImage: '/social-share-images/Devxhub-_Markdown.png',
		guidePdf: 'markdown-guide.pdf',
		keywords: [
			'markdown editor',
			'online markdown editor',
			'markdown preview',
			'markdown to html',
			'markdown to pdf',
			'live preview',
			'markdown viewer',
			'markdown converter',
			'md editor',
			'markdown syntax',
			'markdown cheat sheet',
			'readme editor',
			'markdown online',
			'free markdown editor'
		],
		related: ['qr-code-generator', 'random-password-generator', 'html-encoder-decoder']
	},
	{
		slug: 'html-encoder-decoder',
		name: 'HTML Encoder Decoder',
		shortDescription:
			'Convert special characters to HTML entities (e.g., < to &lt;) to prevent XSS attacks. Decode HTML entities back to text. Secure client-side processing.',
		seoTitle: 'HTML Entity Encoder & Decoder | Escape Special Characters - Devxhub',
		seoDescription:
			'Convert special characters to HTML entities (e.g., < to &lt;) to prevent XSS attacks. Decode HTML entities back to text. Secure client-side processing.',
		category: 'text',
		status: 'live',
		priority: 3,
		icon: '/tool-icons/html.png',
		ogImage: '/social-share-images/Devxhub-_HTML.png',
		guidePdf: 'html-guide.pdf',
		keywords: [
			'html encoder',
			'html decoder',
			'html entity encoder',
			'escape html',
			'html special characters',
			'xss prevention',
			'html entities',
			'encode html',
			'decode html',
			'html escape',
			'sanitize html',
			'html security',
			'prevent xss'
		],
		related: ['qr-code-generator', 'random-password-generator', 'online-markdown-editor']
	},
	{
		slug: 'text-diff-checker',
		name: 'Text Diff Checker',
		shortDescription:
			'Compare two text files or code snippets side-by-side. Highlight differences, additions, and deletions instantly. Great for code reviews and document versioning.',
		seoTitle: 'Online Text Diff Checker | Compare Two Files & Highlight Changes - Devxhub',
		seoDescription:
			'Compare two text files or code snippets side-by-side. Highlight differences, additions, and deletions instantly. Great for code reviews and document versioning.',
		category: 'text',
		status: 'live',
		priority: 3,
		icon: '/tool-icons/diff.png',
		ogImage: '/social-share-images/Devxhub-_Text Difference.png',
		guidePdf: 'diif-guide.pdf',
		keywords: [
			'text diff',
			'diff checker',
			'compare text',
			'compare two files',
			'highlight changes',
			'text comparison',
			'find differences',
			'code diff',
			'document comparison',
			'code review',
			'version control',
			'text compare online',
			'file comparison'
		],
		related: ['qr-code-generator', 'random-password-generator', 'online-markdown-editor']
	},
	{
		slug: 'free-invoice-generator',
		name: 'Invoice Generator',
		shortDescription:
			'Build and download a PDF invoice in minutes. One clean template — your logo, your colour. Tax ID, currency codes, and full bank details. Free, no sign-up, nothing stored.',
		seoTitle: 'Free Invoice Generator | Tax-Ready PDF Invoices – Devxhub',
		seoDescription:
			'Build and download a PDF invoice in minutes. Tax ID, currency codes, and full bank details for domestic or overseas clients. Free, no sign-up, nothing stored.',
		category: 'productivity',
		status: 'live',
		priority: 3,
		icon: '/tool-icons/invoice.png',
		ogImage: '/social-share-images/Devxhub-_Invoice Generator.png',
		guidePdf: 'invoice-guide.pdf',
		keywords: [
			'free invoice generator',
			'invoice generator',
			'create invoice',
			'invoice maker',
			'pdf invoice',
			'invoice template',
			'online invoice',
			'invoice creator',
			'business invoice',
			'professional invoice',
			'invoice download',
			'invoice pdf',
			'free invoice maker',
			'invoice tool'
		],
		related: ['daily-islamic-messages', 'quran-khatmah-tracker']
	},
	{
		slug: 'online-color-picker',
		name: 'Online Color Picker',
		shortDescription:
			'Pick colors, generate palettes, and create CSS gradients instantly. Convert between HEX, RGB, HSL, and CMYK. Test contrast ratios for accessibility.',
		seoTitle: 'Advanced Color Picker | HEX, RGB, HSL & Gradient Generator - Devxhub',
		seoDescription:
			'Pick colors, generate palettes, and create CSS gradients instantly. Convert between HEX, RGB, HSL, and CMYK. Test contrast ratios for accessibility.',
		category: 'image',
		status: 'live',
		priority: 2,
		icon: '/tool-icons/color.png',
		ogImage: '/social-share-images/Devxhub-_ColorPicker.png',
		guidePdf: 'color-guide.pdf',
		keywords: [
			'color picker',
			'hex color',
			'rgb color',
			'hsl color',
			'cmyk',
			'gradient generator',
			'color converter',
			'palette generator',
			'contrast checker',
			'wcag',
			'accessibility'
		],
		related: ['image-compressor', 'image-resizer']
	},
	{
		slug: 'lorem-ipsum-generator',
		name: 'Lorem Ipsum Generator',
		shortDescription:
			'Generate random Lorem Ipsum placeholder text for your designs. Choose paragraphs, sentences, or words. Copy to clipboard instantly.',
		seoTitle: 'Lorem Ipsum Generator | Placeholder Text for Designers - Devxhub',
		seoDescription:
			'Generate random Lorem Ipsum placeholder text for your designs. Choose paragraphs, sentences, or words. Copy to clipboard instantly.',
		category: 'text',
		status: 'live',
		priority: 3,
		icon: '/tool-icons/lorem.png',
		ogImage: '/social-share-images/Devxhub-_Lorem Ipsum.png',
		guidePdf: 'lorem-guide.pdf',
		keywords: [
			'lorem ipsum',
			'lorem ipsum generator',
			'placeholder text',
			'dummy text',
			'filler text',
			'text generator',
			'design placeholder',
			'lorem generator',
			'random text',
			'mockup text'
		],
		related: ['qr-code-generator', 'random-password-generator', 'online-markdown-editor']
	},
	{
		slug: 'image-compressor',
		name: 'Image Compressor',
		shortDescription:
			'Compress images by up to 80% without losing quality. Supports JPG, PNG, GIF, and WebP. Improve website speed and SEO instantly. Private client-side compression.',
		seoTitle: 'Online Image Compressor | Reduce JPG, PNG, WebP Size - Devxhub',
		seoDescription:
			'Compress images by up to 80% without losing quality. Supports JPG, PNG, GIF, and WebP. Improve website speed and SEO instantly. Private client-side compression.',
		category: 'image',
		status: 'live',
		priority: 4,
		icon: '/tool-icons/compressor.png',
		ogImage: '/social-share-images/Devxhub-_Image Compressor.png',
		guidePdf: 'compress-guide.pdf',
		keywords: [
			'image compressor',
			'compress image',
			'reduce image size',
			'optimize images',
			'compress jpeg',
			'compress jpg',
			'compress png',
			'compress webp',
			'image optimization',
			'reduce jpg size',
			'image size reducer',
			'online image compressor',
			'free image compressor',
			'lossy compression',
			'lossless compression'
		],
		related: ['online-color-picker', 'image-resizer']
	},
	{
		slug: 'image-resizer',
		name: 'Image Resizer',
		shortDescription:
			'Resize images to specific pixel dimensions or percentages. Crop and rotate photos for social media headers, profile pictures, and web banners.',
		seoTitle: 'Online Image Resizer | Crop, Rotate & Resize Pixels - Devxhub',
		seoDescription:
			'Resize images to specific pixel dimensions or percentages. Crop and rotate photos for social media headers, profile pictures, and web banners.',
		category: 'image',
		status: 'live',
		priority: 4,
		icon: '/tool-icons/resize.png',
		ogImage: '/social-share-images/Devxhub-_Image Resizer.png',
		guidePdf: 'resize-guide.pdf',
		keywords: [
			'image resizer',
			'resize image',
			'resize photo',
			'crop image',
			'rotate image',
			'image dimensions',
			'resize pixels',
			'scale image',
			'aspect ratio',
			'social media image sizes',
			'facebook cover size',
			'instagram post size',
			'linkedin banner size',
			'resize for web',
			'online image resizer'
		],
		related: ['online-color-picker', 'image-compressor']
	},
	{
		slug: 'fake-data-generator',
		name: 'Fake Data Generator',
		shortDescription:
			'Generate random test data for databases, APIs, and applications. Export as JSON, CSV, or SQL.',
		seoDescription:
			'Generate random test data for databases, APIs, and applications. Export as JSON, CSV, or SQL.',
		category: 'developer',
		status: 'live',
		priority: 4,
		icon: '/tool-icons/fake-data.svg',
		keywords: ['fake data generator', 'fake data', 'mock data', 'random data', 'sample data'],
		external: 'https://fake.devxhub.com/'
	},
	{
		slug: 'daily-islamic-messages',
		name: 'Daily Islamic Messages',
		shortDescription:
			'Read and share daily Islamic quotes, Hadith, and Quranic verses. Available in Arabic, English, and Bangla. Download images for social media sharing.',
		seoTitle: 'Daily Islamic Messages & Hadith | English, Arabic & Bangla - Devxhub',
		seoDescription:
			'Read and share daily Islamic quotes, Hadith, and Quranic verses. Available in multiple languages. Download images for social media sharing.',
		category: 'productivity',
		status: 'live',
		priority: 4,
		icon: '/tool-icons/messages.png',
		ogImage: '/social-share-images/Devxhub-_Daily Islamic Messages.png',
		guidePdf: 'message-guide.pdf',
		keywords: [
			'islamic messages',
			'daily hadith',
			'hadith in english',
			'hadith in arabic',
			'hadith in bangla',
			'islamic quotes',
			'quranic verses',
			'daily dua',
			'islamic greetings',
			'assalamu alaikum',
			'arabic greetings',
			'bangla islamic messages',
			'islamic social media',
			'dawah messages'
		],
		related: ['free-invoice-generator', 'quran-khatmah-tracker']
	},
	{
		slug: 'json-to-typescript',
		name: 'JSON to TypeScript',
		shortDescription:
			'Convert JSON objects to TypeScript interfaces or types with customizable options.',
		seoTitle: 'JSON to TypeScript Interface Converter | Auto-Generate Types - Devxhub',
		seoDescription:
			'Convert JSON objects into TypeScript Interfaces or Types instantly. Handles nested objects, arrays, and optional properties. Save time writing manual type definitions.',
		category: 'developer',
		status: 'live',
		priority: 2,
		icon: '/tool-icons/json-to-ts.png',
		ogImage: '/social-share-images/Devxhub-_Typscript.png',
		guidePdf: 'typescript-guide.pdf',
		keywords: [
			'json to typescript',
			'json to ts',
			'typescript interfaces',
			'typescript types',
			'json converter',
			'type generator'
		],
		related: ['json-formatter-validator', 'uuid-guid-generator', 'base64-encoder-decoder']
	},
	{
		slug: 'cron-expression-generator',
		name: 'Cron Expression Generator',
		shortDescription:
			'Explain any cron expression in plain English as you type, and preview its next run times. Live validation, per-field breakdown, and common examples. Free & client-side.',
		seoTitle: 'Cron Expression Generator & Explainer | Crontab Guru Alternative - Devxhub',
		seoDescription:
			'Translate any cron expression into plain English as you type and preview its next run times. Live validation and per-field breakdown. Free, private, client-side.',
		category: 'developer',
		status: 'live',
		priority: 4,
		icon: '/tool-icons/cron.png',
		ogImage: '/social-share-images/Devxhub-_Cron.png',
		keywords: [
			'cron expression generator',
			'cron expression explainer',
			'crontab guru',
			'crontab generator',
			'cron parser',
			'cron schedule',
			'cron syntax',
			'cron job',
			'next run time',
			'unix cron'
		],
		related: ['json-formatter-validator', 'uuid-guid-generator', 'base64-encoder-decoder']
	},
	{
		slug: 'quran-khatmah-tracker',
		name: 'Quran Khatmah Tracker',
		shortDescription:
			'Complete the Quran together in real time. Split the 30 juz across family, friends, or your masjid, claim your part, and watch the khatmah finish live. Free, no signup.',
		seoTitle: 'Quran Khatmah Tracker | Complete the Quran Together in Real Time - Devxhub',
		seoDescription:
			'Split the 30 juz across family, friends, or your masjid, claim your part, and watch the whole Quran finish live. Free, instant, no signup. English & Bangla, Uthmani & Indo-Pak.',
		category: 'productivity',
		status: 'live',
		priority: 4,
		icon: '/tool-icons/quran-khatmah.png',
		ogImage: '/social-share-images/quran-khatmah-tracker.png',
		keywords: [
			'quran khatmah',
			'quran khatm',
			'quran completion tracker',
			'group quran reading',
			'juz divider',
			'ramadan khatmah',
			'masjid quran',
			'sadaqah jariyah',
			'quran tracker'
		],
		related: ['free-invoice-generator', 'daily-islamic-messages']
	},
	{
		slug: 'online-color-picker/palette',
		name: 'Palette Generator',
		shortDescription:
			'Generate perfect color palettes based on color theory. Create complementary, analogous, triadic, and monochromatic color schemes for your designs.',
		seoTitle: 'Color Palette Generator | Create Perfect Color Combinations - Devxhub',
		seoDescription:
			'Generate perfect color palettes based on color theory. Create complementary, analogous, triadic, and monochromatic color schemes for your designs.',
		category: 'image',
		status: 'live',
		priority: 2,
		icon: '/tool-icons/color.png',
		ogImage: '/social-share-images/Devxhub-_ColorPicker.png',
		guidePdf: 'color-guide.pdf',
		keywords: [
			'color palette generator',
			'color harmony',
			'complementary colors',
			'analogous colors',
			'triadic colors',
			'monochromatic palette',
			'color theory',
			'design colors',
			'color combinations',
			'palette export'
		],
		related: ['online-color-picker', 'image-compressor', 'image-resizer'],
		showInNav: false
	},
	{
		slug: 'online-color-picker/shades',
		name: 'Shades & Tints Generator',
		shortDescription:
			'Generate beautiful color shades and tints from any base color. Create lighter and darker variations for your design system and color schemes.',
		seoTitle: 'Color Shades Generator | Create Tints & Shades - Devxhub',
		seoDescription:
			'Generate beautiful color shades and tints from any base color. Create lighter and darker variations for your design system and color schemes.',
		category: 'image',
		status: 'live',
		priority: 2,
		icon: '/tool-icons/color.png',
		ogImage: '/social-share-images/Devxhub-_ColorPicker.png',
		guidePdf: 'color-guide.pdf',
		keywords: [
			'color shades generator',
			'color tints',
			'color variations',
			'lighter colors',
			'darker colors',
			'shade generator',
			'tint generator',
			'color gradations',
			'design system colors',
			'color palette'
		],
		related: ['online-color-picker', 'image-compressor', 'image-resizer'],
		showInNav: false
	},
	{
		slug: 'online-color-picker/gradient',
		name: 'Gradient Generator',
		shortDescription:
			'Create stunning CSS gradients with live preview. Generate linear, radial, and conic gradients. Copy CSS code instantly for your web projects.',
		seoTitle: 'CSS Gradient Generator | Linear & Radial Gradients - Devxhub',
		seoDescription:
			'Create stunning CSS gradients with live preview. Generate linear, radial, and conic gradients. Copy CSS code instantly for your web projects.',
		category: 'image',
		status: 'live',
		priority: 2,
		icon: '/tool-icons/color.png',
		ogImage: '/social-share-images/Devxhub-_ColorPicker.png',
		guidePdf: 'color-guide.pdf',
		keywords: [
			'css gradient generator',
			'linear gradient',
			'radial gradient',
			'conic gradient',
			'gradient css',
			'background gradient',
			'gradient maker',
			'css gradient code',
			'web gradients',
			'gradient colors'
		],
		related: ['online-color-picker', 'image-compressor', 'image-resizer'],
		showInNav: false
	},
	{
		slug: 'online-color-picker/named-colors',
		name: 'Named Colors Reference',
		shortDescription:
			'Browse all HTML and CSS named colors with HEX, RGB values. Search through 140+ standard web colors like red, blue, crimson, and more.',
		seoTitle: 'Named Colors Reference | HTML & CSS Color Names - Devxhub',
		seoDescription:
			'Browse all HTML and CSS named colors with HEX, RGB values. Search through 140+ standard web colors like red, blue, crimson, and more.',
		category: 'image',
		status: 'live',
		priority: 2,
		icon: '/tool-icons/color.png',
		ogImage: '/social-share-images/Devxhub-_ColorPicker.png',
		guidePdf: 'color-guide.pdf',
		keywords: [
			'named colors',
			'html colors',
			'css colors',
			'web colors',
			'color names',
			'standard colors',
			'html color names',
			'css color names',
			'web safe colors',
			'color reference'
		],
		related: ['online-color-picker', 'image-compressor', 'image-resizer'],
		showInNav: false
	}
];

/**
 * Get tools by category
 */
export function getToolsByCategory(category: ToolCategory): Tool[] {
	return tools.filter((tool) => tool.category === category);
}

/**
 * Get live tools that belong in navigation and the home-page grid (excludes sub-routes marked
 * `showInNav: false`, e.g. the color picker's palette/shades/gradient/named-colors pages).
 */
export function getLiveTools(): Tool[] {
	return tools.filter((tool) => tool.status === 'live' && tool.showInNav !== false);
}

/**
 * Get tools by status
 */
export function getToolsByStatus(status: ToolStatus): Tool[] {
	return tools.filter((tool) => tool.status === status);
}

/**
 * Find a tool by its slug.
 *
 * Falls back to matching a bare last-path-segment against the end of a compound slug (so
 * `getToolBySlug('palette')` finds `online-color-picker/palette`), because `+layout.svelte`
 * derives the current tool from the URL's last path segment alone.
 */
export function getToolBySlug(slug: string): Tool | undefined {
	const exact = tools.find((tool) => tool.slug === slug);
	if (exact) return exact;

	if (!slug.includes('/')) {
		return tools.find((tool) => tool.slug.endsWith('/' + slug));
	}
	return undefined;
}

/**
 * Get every slug that has a real route in this app (i.e. excluding `external` tools), for
 * sitemap generation.
 */
export function getAllToolSlugs(): string[] {
	return tools.filter((tool) => !tool.external).map((tool) => tool.slug);
}

/**
 * Resolve a tool's related-tool entries into their full Tool records, skipping any slug that
 * no longer resolves (e.g. a tool renamed or removed without its `related` references updated).
 */
export function getRelatedTools(tool: Tool): Tool[] {
	return (tool.related ?? [])
		.map((slug) => getToolBySlug(slug))
		.filter((t): t is Tool => t !== undefined);
}

/**
 * Get tool URL. External tools (currently just the Fake Data Generator, hosted at
 * fake.devxhub.com) resolve to their own absolute URL instead of a local path.
 */
export function getToolUrl(tool: Tool, basePath: string = ''): string {
	if (tool.external) return tool.external;
	return `${basePath}/${tool.slug}`;
}

/**
 * Get tool categories in a specific order
 */
export function getCategories(): ToolCategory[] {
	const categoryOrder: ToolCategory[] = ['developer', 'text', 'image', 'productivity'];
	const existingCategories = Array.from(new Set(getLiveTools().map((tool) => tool.category)));
	return categoryOrder.filter((cat) => existingCategories.includes(cat));
}
