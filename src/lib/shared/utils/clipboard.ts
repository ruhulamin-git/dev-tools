/**
 * Clipboard Utilities
 *
 * Provides copy-to-clipboard functionality with browser compatibility
 * and error handling. Used across all dev tools.
 */

import { track } from '$lib/shared/analytics/track';

/**
 * Copy text to clipboard
 *
 * @param text - The text to copy
 * @returns Promise that resolves to true if successful, false otherwise
 */
export async function copyToClipboard(text: string): Promise<boolean> {
	if (!text) {
		console.warn('Attempted to copy empty text');
		return false;
	}

	const ok = await doCopy(text);
	// One choke point used by every tool on the site, rather than instrumenting each one's own
	// copy button separately — a real, uniform `tool_success` signal (the "did a visitor
	// actually get value out of this" moment the peak-end-rule lead-capture work reads) for the
	// price of one function.
	if (ok) {
		track('tool_success', {
			label: 'copy',
			tool: typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : undefined
		});
	}
	return ok;
}

async function doCopy(text: string): Promise<boolean> {
	try {
		// Modern Clipboard API (preferred method)
		if (navigator.clipboard && window.isSecureContext) {
			await navigator.clipboard.writeText(text);
			return true;
		}

		// Fallback for older browsers or non-secure contexts
		return fallbackCopyToClipboard(text);
	} catch (error) {
		console.error('Failed to copy to clipboard:', error);
		// Try fallback if modern API fails
		return fallbackCopyToClipboard(text);
	}
}

/**
 * Fallback copy method for older browsers
 * Uses the deprecated but widely supported execCommand
 */
function fallbackCopyToClipboard(text: string): boolean {
	try {
		const textArea = document.createElement('textarea');
		textArea.value = text;

		// Make it invisible but still selectable
		textArea.style.position = 'fixed';
		textArea.style.top = '0';
		textArea.style.left = '0';
		textArea.style.width = '2em';
		textArea.style.height = '2em';
		textArea.style.padding = '0';
		textArea.style.border = 'none';
		textArea.style.outline = 'none';
		textArea.style.boxShadow = 'none';
		textArea.style.background = 'transparent';
		textArea.style.opacity = '0';
		textArea.style.zIndex = '-1';

		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();

		// For iOS
		if (navigator.userAgent.match(/ipad|iphone/i)) {
			const range = document.createRange();
			range.selectNodeContents(textArea);
			const selection = window.getSelection();
			if (selection) {
				selection.removeAllRanges();
				selection.addRange(range);
			}
			textArea.setSelectionRange(0, 999999);
		}

		const successful = document.execCommand('copy');
		document.body.removeChild(textArea);

		return successful;
	} catch (error) {
		console.error('Fallback copy failed:', error);
		return false;
	}
}

/**
 * Check if clipboard API is available
 */
export function isClipboardSupported(): boolean {
	return !!(navigator.clipboard && window.isSecureContext);
}

/**
 * Read text from clipboard
 *
 * @returns Promise that resolves to the clipboard text or null if failed
 */
export async function readFromClipboard(): Promise<string | null> {
	try {
		if (navigator.clipboard && window.isSecureContext) {
			const text = await navigator.clipboard.readText();
			return text;
		}
		return null;
	} catch (error) {
		console.error('Failed to read from clipboard:', error);
		return null;
	}
}

