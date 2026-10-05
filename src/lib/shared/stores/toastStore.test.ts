import { describe, expect, it, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { toast } from './toastStore';
import type { ToastType } from './toastStore';

describe('toast store', () => {
	beforeEach(() => {
		// Clear all toasts before each test
		toast.clear();
	});

	describe('add', () => {
		it('should add a toast with default type', () => {
			const id = toast.add({ message: 'Test message' });

			const toasts = get(toast);
			expect(toasts).toHaveLength(1);
			expect(toasts[0].id).toBe(id);
			expect(toasts[0].message).toBe('Test message');
			expect(toasts[0].type).toBe('info');
			expect(toasts[0].duration).toBe(3000);
		});

		it('should add a toast with custom type', () => {
			const id = toast.add({
				message: 'Error message',
				type: 'error',
				duration: 5000
			});

			const toasts = get(toast);
			expect(toasts[0].type).toBe('error');
			expect(toasts[0].duration).toBe(5000);
		});

		it('should generate unique IDs for each toast', () => {
			const id1 = toast.add({ message: 'Message 1' });
			const id2 = toast.add({ message: 'Message 2' });

			expect(id1).not.toBe(id2);

			const toasts = get(toast);
			expect(toasts).toHaveLength(2);
		});

		it('should support persistent toasts (duration 0)', () => {
			const id = toast.add({
				message: 'Persistent message',
				duration: 0
			});

			const toasts = get(toast);
			expect(toasts[0].duration).toBe(0);
		});
	});

	describe('remove', () => {
		it('should remove a toast by ID', () => {
			const id1 = toast.add({ message: 'Message 1' });
			const id2 = toast.add({ message: 'Message 2' });

			toast.remove(id1);

			const toasts = get(toast);
			expect(toasts).toHaveLength(1);
			expect(toasts[0].id).toBe(id2);
		});

		it('should handle removing non-existent toast gracefully', () => {
			toast.add({ message: 'Message 1' });

			toast.remove('non-existent-id');

			const toasts = get(toast);
			expect(toasts).toHaveLength(1);
		});
	});

	describe('clear', () => {
		it('should remove all toasts', () => {
			toast.add({ message: 'Message 1' });
			toast.add({ message: 'Message 2' });
			toast.add({ message: 'Message 3' });

			toast.clear();

			const toasts = get(toast);
			expect(toasts).toHaveLength(0);
		});
	});

	describe('convenience methods', () => {
		it('should create success toast', () => {
			const id = toast.success('Success message');

			const toasts = get(toast);
			expect(toasts[0].type).toBe('success');
			expect(toasts[0].message).toBe('Success message');
		});

		it('should create error toast with longer default duration', () => {
			const id = toast.error('Error message');

			const toasts = get(toast);
			expect(toasts[0].type).toBe('error');
			expect(toasts[0].duration).toBe(5000);
		});

		it('should create warning toast', () => {
			const id = toast.warning('Warning message');

			const toasts = get(toast);
			expect(toasts[0].type).toBe('warning');
		});

		it('should create info toast', () => {
			const id = toast.info('Info message');

			const toasts = get(toast);
			expect(toasts[0].type).toBe('info');
		});

		it('should allow custom duration for convenience methods', () => {
			toast.success('Success', 10000);
			toast.error('Error', 7000);

			const toasts = get(toast);
			expect(toasts[0].duration).toBe(10000);
			expect(toasts[1].duration).toBe(7000);
		});
	});

	describe('auto-dismiss', () => {
		it('should auto-dismiss toast after duration', async () => {
			vi.useFakeTimers();

			const id = toast.add({
				message: 'Auto dismiss',
				duration: 1000
			});

			expect(get(toast)).toHaveLength(1);

			// Fast-forward time
			await vi.advanceTimersByTimeAsync(1000);

			expect(get(toast)).toHaveLength(0);

			vi.useRealTimers();
		});

		it('should not auto-dismiss persistent toasts', async () => {
			vi.useFakeTimers();

			const id = toast.add({
				message: 'Persistent',
				duration: 0
			});

			await vi.advanceTimersByTimeAsync(10000);

			expect(get(toast)).toHaveLength(1);

			vi.useRealTimers();
		});
	});
});

