import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type ThemeMode = 'light' | 'dark' | 'system';

function getSystemTheme(): 'light' | 'dark' {
	if (!browser) return 'light';
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(mode: ThemeMode) {
	if (!browser) return;
	
	const html = document.documentElement;
	const actualTheme = mode === 'system' ? getSystemTheme() : mode;
	
	if (actualTheme === 'dark') {
		html.classList.add('dark');
	} else {
		html.classList.remove('dark');
	}
}

const getInitialMode = (): ThemeMode => {
	if (browser) {
		const savedTheme = localStorage.getItem('color-theme') as ThemeMode | null;
		if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
			return savedTheme;
		}
	}
	return 'system';
};

export const theme = writable<ThemeMode>(getInitialMode());

if (browser) {
	const initialMode = getInitialMode();
	applyTheme(initialMode);
}

if (browser) {
	theme.subscribe((value) => {
		applyTheme(value);
		if (value === 'system') {
			localStorage.removeItem('color-theme');
		} else {
			localStorage.setItem('color-theme', value);
		}
	});
}

if (browser) {
	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	const handleSystemChange = () => {
		theme.update((current) => {
			if (current === 'system') {
				applyTheme('system');
			}
			return current;
		});
	};
	mediaQuery.addEventListener('change', handleSystemChange);
}
