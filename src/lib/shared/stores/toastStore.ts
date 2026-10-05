import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
	id: string;
	message: string;
	type: ToastType;
	duration?: number; // in milliseconds, 0 = persistent
}

interface ToastOptions {
	message: string;
	type?: ToastType;
	duration?: number;
}

// Store for managing toasts
const createToastStore = () => {
	const { subscribe, update } = writable<Toast[]>([]);

	return {
		subscribe,

		/**
		 * Add a new toast
		 */
		add: (options: ToastOptions) => {
			const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
			const toast: Toast = {
				id,
				message: options.message,
				type: options.type || 'info',
				duration: options.duration ?? 3000 // Default 3 seconds
			};

			update((toasts) => [...toasts, toast]);

			// Auto-remove if duration is set
			if (toast.duration && toast.duration > 0) {
				setTimeout(() => {
					remove(id);
				}, toast.duration);
			}

			return id;
		},

		/**
		 * Remove a toast by ID
		 */
		remove: (id: string) => {
			update((toasts) => toasts.filter((t) => t.id !== id));
		},

		/**
		 * Clear all toasts
		 */
		clear: () => {
			update(() => []);
		},

		/**
		 * Convenience methods for different toast types
		 */
		success: (message: string, duration?: number) => {
			return add({ message, type: 'success', duration });
		},

		error: (message: string, duration?: number) => {
			return add({ message, type: 'error', duration: duration ?? 5000 }); // Errors stay longer
		},

		warning: (message: string, duration?: number) => {
			return add({ message, type: 'warning', duration });
		},

		info: (message: string, duration?: number) => {
			return add({ message, type: 'info', duration });
		}
	};
};

export const toast = createToastStore();

// Helper function for the remove method
function remove(id: string) {
	toast.remove(id);
}

// Helper function for the add method
function add(options: ToastOptions) {
	return toast.add(options);
}

