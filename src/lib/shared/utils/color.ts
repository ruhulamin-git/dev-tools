// Color conversion utilities

export interface RGB {
	r: number;
	g: number;
	b: number;
}

export interface HSL {
	h: number;
	s: number;
	l: number;
}

export interface CMYK {
	c: number;
	m: number;
	y: number;
	k: number;
}

export interface RGBA {
	r: number;
	g: number;
	b: number;
	a: number;
}

export interface HSLA {
	h: number;
	s: number;
	l: number;
	a: number;
}

export function hexToRgb(hex: string): RGB {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			}
		: { r: 0, g: 0, b: 0 };
}

export function rgbToHex(r: number, g: number, b: number): string {
	return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function rgbToHsl(r: number, g: number, b: number): HSL {
	r /= 255;
	g /= 255;
	b /= 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h = 0;
	let s = 0;
	const l = (max + min) / 2;

	if (max !== min) {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
				break;
			case g:
				h = ((b - r) / d + 2) / 6;
				break;
			case b:
				h = ((r - g) / d + 4) / 6;
				break;
		}
	}

	return {
		h: Math.round(h * 360),
		s: Math.round(s * 100),
		l: Math.round(l * 100)
	};
}

export function hslToRgb(h: number, s: number, l: number): RGB {
	h /= 360;
	s /= 100;
	l /= 100;
	let r, g, b;

	if (s === 0) {
		r = g = b = l;
	} else {
		const hue2rgb = (p: number, q: number, t: number) => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};
		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;
		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}

	return {
		r: Math.round(r * 255),
		g: Math.round(g * 255),
		b: Math.round(b * 255)
	};
}

export function rgbToCmyk(r: number, g: number, b: number): CMYK {
	r /= 255;
	g /= 255;
	b /= 255;
	const k = 1 - Math.max(r, g, b);
	if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
	return {
		c: Math.round(((1 - r - k) / (1 - k)) * 100),
		m: Math.round(((1 - g - k) / (1 - k)) * 100),
		y: Math.round(((1 - b - k) / (1 - k)) * 100),
		k: Math.round(k * 100)
	};
}

export function getContrastRatio(hex1: string, hex2: string): number {
	const getLuminance = (hex: string) => {
		const rgb = hexToRgb(hex);
		const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
			v /= 255;
			return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
		});
		return 0.2126 * r + 0.7152 * g + 0.0722 * b;
	};
	const l1 = getLuminance(hex1);
	const l2 = getLuminance(hex2);
	const lighter = Math.max(l1, l2);
	const darker = Math.min(l1, l2);
	return (lighter + 0.05) / (darker + 0.05);
}

export function generateTints(hex: string, steps: number): string[] {
	const rgb = hexToRgb(hex);
	const tints: string[] = [];
	for (let i = steps - 1; i >= 0; i--) {
		const factor = i / steps;
		const r = Math.round(rgb.r + (255 - rgb.r) * factor);
		const g = Math.round(rgb.g + (255 - rgb.g) * factor);
		const b = Math.round(rgb.b + (255 - rgb.b) * factor);
		tints.push(rgbToHex(r, g, b));
	}
	return tints;
}

export function generateShades(hex: string, steps: number): string[] {
	const rgb = hexToRgb(hex);
	const shades: string[] = [];
	for (let i = 1; i <= steps; i++) {
		const factor = i / (steps + 1);
		const r = Math.round(rgb.r * (1 - factor));
		const g = Math.round(rgb.g * (1 - factor));
		const b = Math.round(rgb.b * (1 - factor));
		shades.push(rgbToHex(r, g, b));
	}
	return shades;
}

export function generateAnalogous(hex: string): string[] {
	const rgb = hexToRgb(hex);
	const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
	const colors: string[] = [];
	for (let i = -2; i <= 2; i++) {
		const newH = (hsl.h + i * 30 + 360) % 360;
		const newRgb = hslToRgb(newH, hsl.s, hsl.l);
		colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
	}
	return colors;
}

export function generateComplementary(hex: string): string[] {
	const rgb = hexToRgb(hex);
	const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
	const compH = (hsl.h + 180) % 360;
	const compRgb = hslToRgb(compH, hsl.s, hsl.l);
	return [hex, rgbToHex(compRgb.r, compRgb.g, compRgb.b)];
}

export function generateTriadic(hex: string): string[] {
	const rgb = hexToRgb(hex);
	const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
	return [0, 120, 240].map((offset) => {
		const newH = (hsl.h + offset) % 360;
		const newRgb = hslToRgb(newH, hsl.s, hsl.l);
		return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
	});
}

export function generateMonochromatic(hex: string): string[] {
	const rgb = hexToRgb(hex);
	const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
	return [20, 40, 50, 60, 80].map((l) => {
		const newRgb = hslToRgb(hsl.h, hsl.s, l);
		return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
	});
}

export function isValidHex(hex: string): boolean {
	return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

export function normalizeHex(hex: string): string {
	hex = hex.replace('#', '');
	if (hex.length === 3) {
		hex = hex.split('').map((c) => c + c).join('');
	}
	return '#' + hex.toUpperCase();
}

// RGBA conversions
export function hexToRgba(hex: string, alpha: number = 1): RGBA {
	const rgb = hexToRgb(hex);
	return { ...rgb, a: Math.round(alpha * 100) / 100 };
}

export function rgbaToHex(r: number, g: number, b: number, a: number = 1): string {
	if (a < 1) {
		const alpha = Math.round(a * 255)
			.toString(16)
			.padStart(2, '0')
			.toUpperCase();
		return rgbToHex(r, g, b) + alpha;
	}
	return rgbToHex(r, g, b);
}

export function rgbaToString(r: number, g: number, b: number, a: number = 1): string {
	return `rgba(${r}, ${g}, ${b}, ${(Math.round(a * 100) / 100).toFixed(2)})`;
}

export function parseRgbaString(rgba: string): RGBA {
	const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
	if (!match) return { r: 0, g: 0, b: 0, a: 1 };
	return {
		r: parseInt(match[1]),
		g: parseInt(match[2]),
		b: parseInt(match[3]),
		a: match[4] ? parseFloat(match[4]) : 1
	};
}

// HSLA conversions
export function rgbToHsla(r: number, g: number, b: number, a: number = 1): HSLA {
	const hsl = rgbToHsl(r, g, b);
	return { ...hsl, a: Math.round(a * 100) / 100 };
}

export function hslaToRgb(h: number, s: number, l: number, a: number = 1): RGBA {
	const rgb = hslToRgb(h, s, l);
	return { ...rgb, a };
}

export function hslaToString(h: number, s: number, l: number, a: number = 1): string {
	return `hsla(${h}, ${s}%, ${l}%, ${(Math.round(a * 100) / 100).toFixed(2)})`;
}

export function parseHslaString(hsla: string): HSLA {
	const match = hsla.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*([\d.]+))?\)/);
	if (!match) return { h: 0, s: 0, l: 0, a: 1 };
	return {
		h: parseInt(match[1]),
		s: parseInt(match[2]),
		l: parseInt(match[3]),
		a: match[4] ? parseFloat(match[4]) : 1
	};
}

// Color history utilities
export interface ColorHistoryItem {
	hex: string;
	timestamp: number;
}

const STORAGE_KEY = 'color_picker_history';
const MAX_HISTORY = 20;

export function getColorHistory(): string[] {
	if (typeof window === 'undefined') return [];
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return [];
		const items: ColorHistoryItem[] = JSON.parse(stored);
		return items.map((item) => item.hex);
	} catch {
		return [];
	}
}

export function addToColorHistory(hex: string): void {
	if (typeof window === 'undefined') return;
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		let items: ColorHistoryItem[] = stored ? JSON.parse(stored) : [];

		// Remove if already exists (to move to front)
		items = items.filter((item) => item.hex !== hex);

		// Add to front
		items.unshift({ hex, timestamp: Date.now() });

		// Keep only recent items
		items = items.slice(0, MAX_HISTORY);

		localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
	} catch {
		// Silently fail if localStorage is unavailable
	}
}

export function clearColorHistory(): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch {
		// Silently fail if localStorage is unavailable
	}
}
