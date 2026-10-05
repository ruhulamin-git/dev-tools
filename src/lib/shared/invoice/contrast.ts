import { PDF_CONFIG } from './pdf-config';

export type Rgb = { r: number; g: number; b: number };

export function hexToRgb(hex: string): Rgb {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
		: { r: 107, g: 33, b: 168 };
}

export function rgbToHex({ r, g, b }: Rgb): string {
	return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

function srgbChannelToLinear(c: number): number {
	const s = c / 255;
	return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function relativeLuminance({ r, g, b }: Rgb): number {
	const R = srgbChannelToLinear(r);
	const G = srgbChannelToLinear(g);
	const B = srgbChannelToLinear(b);
	return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/** WCAG contrast ratio between two colours (1–21). */
export function contrastRatio(a: Rgb, b: Rgb): number {
	const L1 = relativeLuminance(a);
	const L2 = relativeLuminance(b);
	const lighter = Math.max(L1, L2);
	const darker = Math.min(L1, L2);
	return (lighter + 0.05) / (darker + 0.05);
}

const WHITE: Rgb = { r: 255, g: 255, b: 255 };
const NEAR_BLACK: Rgb = { r: 17, g: 17, b: 17 };
/** Footer grey — must stay ≥ 4.5:1 on white. */
export const FOOTER_TEXT: Rgb = { r: 100, g: 100, b: 100 };
/** Body text on payment panel. */
export const PANEL_BODY_TEXT: Rgb = { r: 34, g: 34, b: 34 };

function darken(rgb: Rgb, factor: number): Rgb {
	return {
		r: Math.max(0, Math.round(rgb.r * factor)),
		g: Math.max(0, Math.round(rgb.g * factor)),
		b: Math.max(0, Math.round(rgb.b * factor))
	};
}

function lightenTowardWhite(rgb: Rgb, amount: number): Rgb {
	return {
		r: Math.min(255, Math.round(rgb.r + (255 - rgb.r) * amount)),
		g: Math.min(255, Math.round(rgb.g + (255 - rgb.g) * amount)),
		b: Math.min(255, Math.round(rgb.b + (255 - rgb.b) * amount))
	};
}

function round2(n: number): number {
	return Math.round(n * 100) / 100;
}

/**
 * True when white text on this fill would fail AA — e.g. yellow / cream.
 * Those accents must never back text; use brand purple instead.
 */
export function isLightAccent(hex: string): boolean {
	return contrastRatio(WHITE, hexToRgb(hex)) < 4.5;
}

export interface AccentPalette {
	/** Colour used for text-bearing accents (always purple-safe). */
	textAccentHex: string;
	base: Rgb;
	/** Section labels on white */
	label: Rgb;
	labelContrastOnWhite: number;
	/** Table header / total pill fill */
	headerBg: Rgb;
	/** Text on header / pill fill */
	headerFg: Rgb;
	headerFgContrast: number;
	/** Total pill uses same fill/fg as header — reported separately for clarity */
	pillFgContrast: number;
	/** Soft payment panel from purple */
	panelBg: Rgb;
	/** Body text (#222) on payment panel */
	panelBodyContrast: number;
	/** Footer text on white */
	footerContrastOnWhite: number;
}

/**
 * Resolve accessible palette. Light accents (yellow etc.) are never used behind
 * or as text — brand purple is substituted for all text-bearing surfaces.
 */
export function resolveAccentPalette(accentHex: string): AccentPalette {
	const requested = accentHex || PDF_CONFIG.defaultAccent;
	// Yellow / pastel → force purple for every text-bearing surface
	const textAccentHex = isLightAccent(requested) ? PDF_CONFIG.defaultAccent : requested;
	const base = hexToRgb(textAccentHex);

	let label = { ...base };
	let labelContrast = contrastRatio(label, WHITE);
	let guard = 0;
	while (labelContrast < 4.5 && guard < 24) {
		label = darken(label, 0.88);
		labelContrast = contrastRatio(label, WHITE);
		guard++;
	}
	if (labelContrast < 4.5) {
		label = NEAR_BLACK;
		labelContrast = contrastRatio(label, WHITE);
	}

	// Header / pill: always white text on a fill that passes AA (darken if needed)
	let headerBg = { ...base };
	guard = 0;
	while (contrastRatio(WHITE, headerBg) < 4.5 && guard < 24) {
		headerBg = darken(headerBg, 0.88);
		guard++;
	}
	const headerFg = WHITE;
	const headerFgContrast = contrastRatio(headerFg, headerBg);

	const panelBg = lightenTowardWhite(hexToRgb(PDF_CONFIG.defaultAccent), 0.92);
	const panelBodyContrast = contrastRatio(PANEL_BODY_TEXT, panelBg);
	const footerContrastOnWhite = contrastRatio(FOOTER_TEXT, WHITE);

	return {
		textAccentHex,
		base,
		label,
		labelContrastOnWhite: round2(labelContrast),
		headerBg,
		headerFg,
		headerFgContrast: round2(headerFgContrast),
		pillFgContrast: round2(headerFgContrast),
		panelBg,
		panelBodyContrast: round2(panelBodyContrast),
		footerContrastOnWhite: round2(footerContrastOnWhite)
	};
}

/** Snapshot of the five ratios required by the Group A audit. */
export function measurePdfContrastReport(accentHex: string) {
	const p = resolveAccentPalette(accentHex);
	return {
		sectionLabelOnWhite: p.labelContrastOnWhite,
		tableHeaderTextOnFill: p.headerFgContrast,
		totalPillTextOnFill: p.pillFgContrast,
		bodyOnPaymentPanel: p.panelBodyContrast,
		footerOnWhite: p.footerContrastOnWhite
	};
}
