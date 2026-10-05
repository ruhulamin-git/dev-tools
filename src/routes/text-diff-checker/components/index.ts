export { default as DiffInput } from './DiffInput.svelte';
export { default as DiffControls } from './DiffControls.svelte';
export { default as DiffResults } from './DiffResults.svelte';
export { default as DiffLineComponent } from './DiffLine.svelte';
export { default as DiffFeatures } from './DiffFeatures.svelte';
export { default as DiffSeoContent } from './DiffSeoContent.svelte';
export { default as Toast } from './Toast.svelte';

export type { DiffLine, DiffStats, DiffOptions, CharDiff } from './types';
export { computeDiff, formatDiffForCopy, computeLCS, computeCharDiff, syntaxHighlight, escapeHtml } from './diff-utils';
