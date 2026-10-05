import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const DEFAULT_MARKDOWN = ``;

export type SaveStatus = 'saved' | 'saving' | 'unsaved';

// Stores
export const markdown = writable(DEFAULT_MARKDOWN);
export const showPreview = writable(true);
export const showCheatsheet = writable(false);
export const saveStatus = writable<SaveStatus>('saved');
export const lastSaved = writable<Date | null>(null);

// Layout store
export const splitPercent = writable(50);

if (browser) {
    // Layout Persistence
    const savedSplit = localStorage.getItem('md-split');
    if (savedSplit) {
        splitPercent.set(JSON.parse(savedSplit));
    }
    splitPercent.subscribe(value => {
        localStorage.setItem('md-split', JSON.stringify(value));
    });

    // Content Persistence & Autosave Logic
    const savedMarkdown = localStorage.getItem('markdown-editor-content');
    if (savedMarkdown !== null) {
        markdown.set(savedMarkdown);
        lastSaved.set(new Date()); // Assume saved on load
    }

    let saveTimeout: ReturnType<typeof setTimeout>;

    // Subscribe to markdown changes
    markdown.subscribe(value => {
        saveStatus.set('saving');

        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            localStorage.setItem('markdown-editor-content', value);
            saveStatus.set('saved');
            lastSaved.set(new Date());
        }, 1500); // 1500ms debounce as requested
    });
}
