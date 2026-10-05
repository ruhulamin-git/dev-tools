import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { copyToClipboard, isClipboardSupported, readFromClipboard } from './clipboard';

describe('clipboard utilities', () => {
	beforeEach(() => {
		// Reset mocks
		vi.clearAllMocks();
		window.dataLayer = [];
		// track() (called on a successful copy) defaults to denied with no consent decision
		// recorded — grant it so these tests are about copy behavior, not consent gating.
		localStorage.setItem('dxh_consent', JSON.stringify({ analytics: true }));
	});

	afterEach(() => {
		vi.restoreAllMocks();
		localStorage.clear();
	});

	describe('copyToClipboard', () => {
		it('should copy text using modern Clipboard API when available', async () => {
			const mockWriteText = vi.fn().mockResolvedValue(undefined);
			Object.assign(navigator, {
				clipboard: {
					writeText: mockWriteText
				}
			});
			Object.defineProperty(window, 'isSecureContext', {
				value: true,
				writable: true
			});

			const result = await copyToClipboard('test text');

			expect(result).toBe(true);
			expect(mockWriteText).toHaveBeenCalledWith('test text');
		});

		it('tracks a tool_success event on a successful copy', async () => {
			Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
			Object.defineProperty(window, 'isSecureContext', { value: true, writable: true });

			await copyToClipboard('test text');

			expect(window.dataLayer).toEqual([
				expect.objectContaining({ event: 'tool_success', label: 'copy' })
			]);
		});

		it('does not track anything when the copy fails entirely', async () => {
			Object.assign(navigator, { clipboard: undefined });
			document.execCommand = vi.fn().mockReturnValue(false);

			const result = await copyToClipboard('fail text');

			expect(result).toBe(false);
			expect(window.dataLayer).toEqual([]);
		});

		it('should return false for empty text', async () => {
			const result = await copyToClipboard('');
			expect(result).toBe(false);
		});

		it('should use fallback method when Clipboard API is not available', async () => {
			// Mock navigator without clipboard
			Object.assign(navigator, {
				clipboard: undefined
			});

			// Mock document.execCommand
			const mockExecCommand = vi.fn().mockReturnValue(true);
			document.execCommand = mockExecCommand;

			// Mock selection API
			const mockSelection = {
				removeAllRanges: vi.fn(),
				addRange: vi.fn()
			};
			Object.defineProperty(window, 'getSelection', {
				value: () => mockSelection,
				writable: true
			});

			const result = await copyToClipboard('fallback text');

			expect(result).toBe(true);
			expect(mockExecCommand).toHaveBeenCalledWith('copy');
		});

		it('should handle iOS devices with special selection handling', async () => {
			Object.assign(navigator, {
				clipboard: undefined
			});

			// Mock userAgent using Object.defineProperty since it's read-only
			Object.defineProperty(navigator, 'userAgent', {
				value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
				writable: false,
				configurable: true
			});

			const mockExecCommand = vi.fn().mockReturnValue(true);
			document.execCommand = mockExecCommand;

			const mockRange = {
				selectNodeContents: vi.fn()
			};
			const mockCreateRange = vi.fn().mockReturnValue(mockRange);
			document.createRange = mockCreateRange;

			const mockSelection = {
				removeAllRanges: vi.fn(),
				addRange: vi.fn()
			};
			Object.defineProperty(window, 'getSelection', {
				value: () => mockSelection,
				writable: true
			});

			const result = await copyToClipboard('ios text');

			expect(result).toBe(true);
			expect(mockCreateRange).toHaveBeenCalled();
		});

		it('should return false when fallback method fails', async () => {
			Object.assign(navigator, {
				clipboard: undefined
			});

			const mockExecCommand = vi.fn().mockReturnValue(false);
			document.execCommand = mockExecCommand;

			const result = await copyToClipboard('fail text');

			expect(result).toBe(false);
		});

		it('should handle errors gracefully', async () => {
			const mockWriteText = vi.fn().mockRejectedValue(new Error('Clipboard error'));
			Object.assign(navigator, {
				clipboard: {
					writeText: mockWriteText
				}
			});
			Object.defineProperty(window, 'isSecureContext', {
				value: true,
				writable: true
			});

			// Mock console.error to avoid noise in tests
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			const mockExecCommand = vi.fn().mockReturnValue(true);
			document.execCommand = mockExecCommand;

			const result = await copyToClipboard('error text');

			// Should try fallback after error
			expect(result).toBe(true);
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});

	describe('isClipboardSupported', () => {
		it('should return true when Clipboard API is available and secure context', () => {
			Object.assign(navigator, {
				clipboard: {
					writeText: vi.fn()
				}
			});
			Object.defineProperty(window, 'isSecureContext', {
				value: true,
				writable: true
			});

			expect(isClipboardSupported()).toBe(true);
		});

		it('should return false when not in secure context', () => {
			Object.assign(navigator, {
				clipboard: {
					writeText: vi.fn()
				}
			});
			Object.defineProperty(window, 'isSecureContext', {
				value: false,
				writable: true
			});

			expect(isClipboardSupported()).toBe(false);
		});

		it('should return false when Clipboard API is not available', () => {
			Object.assign(navigator, {
				clipboard: undefined
			});

			expect(isClipboardSupported()).toBe(false);
		});
	});

	describe('readFromClipboard', () => {
		it('should read text from clipboard when available', async () => {
			const mockReadText = vi.fn().mockResolvedValue('clipboard text');
			Object.assign(navigator, {
				clipboard: {
					readText: mockReadText
				}
			});
			Object.defineProperty(window, 'isSecureContext', {
				value: true,
				writable: true
			});

			const result = await readFromClipboard();

			expect(result).toBe('clipboard text');
			expect(mockReadText).toHaveBeenCalled();
		});

		it('should return null when Clipboard API is not available', async () => {
			Object.assign(navigator, {
				clipboard: undefined
			});

			const result = await readFromClipboard();

			expect(result).toBeNull();
		});

		it('should return null and log error when read fails', async () => {
			const mockReadText = vi.fn().mockRejectedValue(new Error('Read error'));
			Object.assign(navigator, {
				clipboard: {
					readText: mockReadText
				}
			});
			Object.defineProperty(window, 'isSecureContext', {
				value: true,
				writable: true
			});

			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			const result = await readFromClipboard();

			expect(result).toBeNull();
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});
});

