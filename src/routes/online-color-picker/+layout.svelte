<script lang="ts">
	import { page } from '$app/state';
	import { base } from '$app/paths';

	let { children } = $props();

	const navItems = [
		{ href: `${base}/online-color-picker`, label: 'Picker', exact: true },
		{ href: `${base}/online-color-picker/palette`, label: 'Palette' },
		{ href: `${base}/online-color-picker/shades`, label: 'Shades' },
		{ href: `${base}/online-color-picker/gradient`, label: 'Gradient' },
		{ href: `${base}/online-color-picker/named-colors`, label: 'Colors' }
	];

	function isActive(href: string, exact = false) {
		if (exact) {
			return page.url.pathname === href;
		}
		return page.url.pathname.startsWith(href);
	}
</script>

<div class="flex flex-col gap-6">
	<!-- Secondary Navigation -->
	<nav
		class="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 p-1 dark:border-slate-800"
	>
		{#each navItems as item}
			<a
				href={item.href}
				class="flex-1 rounded-md px-4 py-2 text-center text-sm font-medium transition-all {isActive(
					item.href,
					item.exact
				)
					? 'bg-slate-100 text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100'
					: 'text-slate-700 hover:bg-slate-100/50 hover:text-slate-900 dark:text-slate-100 dark:hover:bg-slate-800/50 dark:hover:text-white'}"
				aria-current={isActive(item.href, item.exact) ? 'page' : undefined}
			>
				{item.label}
			</a>
		{/each}
	</nav>

	<!-- Tool Content -->
	{@render children()}
</div>
