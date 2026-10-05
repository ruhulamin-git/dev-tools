<script lang="ts">
	import { base } from '$app/paths';
	
	const quickLinks = [
		{
			href: `${base}/online-color-picker/palette`,
			emoji: '🎨',
			title: 'Palette Generator',
			description: 'Create color combinations'
		},
		{
			href: `${base}/online-color-picker/shades`,
			emoji: '🌓',
			title: 'Shades & Tints',
			description: 'Generate color variations'
		},
		{
			href: `${base}/online-color-picker/gradient`,
			emoji: '🌈',
			title: 'Gradient Generator',
			description: 'Design custom gradients'
		},
		{
			href: `${base}/online-color-picker/named-colors`,
			emoji: '📚',
			title: 'Named Colors',
			description: 'Browse CSS color names'
		}
	];
</script>

<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 my-5">
	{#each quickLinks as link}
		<a
			href={link.href}
			class="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
		>
			<div class="mb-2 text-2xl">{link.emoji}</div>
			<h2 class="font-semibold text-slate-900 dark:text-white">{link.title}</h2>
			<p class="text-sm text-slate-600 dark:text-slate-400">{link.description}</p>
		</a>
	{/each}
</div>
