<script lang="ts">
	import { i18n, t, type Lang } from '../lib/i18n.svelte';
	import { khatmah } from '../lib/khatmah.svelte';
</script>

<header class="kh-appbar">
	<div class="kh-appbar-inner">
		<a class="kh-brand" href="#" aria-label={t('app.title')}>
			<span class="kh-glyph-tile">۞</span>
			<span class="kh-brand-text">
				<span class="kh-serif kh-brand-name">{t('app.title')}</span>
				<span class="kh-brand-tag">{t('app.subtitle')}</span>
			</span>
		</a>
		<div class="kh-appbar-controls">
			<div class="kh-select-wrap">
				<svg
					width="15"
					height="15"
					viewBox="0 0 24 24"
					fill="none"
					stroke="#A99ECB"
					stroke-width="2"
					stroke-linecap="round"
					style="flex:none"
				>
					<circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path
						d="M12 3c2.6 2.9 2.6 15.1 0 18"
					/><path d="M12 3c-2.6 2.9-2.6 15.1 0 18" />
				</svg>
				<select
					class="kh-select"
					aria-label={t('lang.label')}
					value={i18n.lang}
					onchange={(e) => i18n.set((e.target as HTMLSelectElement).value as Lang)}
				>
					<option value="en">English</option>
					<option value="bn">বাংলা</option>
				</select>
			</div>
			<div class="kh-select-wrap">
				<span
					class="kh-arabic"
					style="font-size:17px;color:#C9A86A;width:15px;text-align:center;line-height:1">ﻉ</span
				>
				<select
					class="kh-select"
					aria-label={t('script.label')}
					value={khatmah.script}
					onchange={(e) =>
						khatmah.setScript((e.target as HTMLSelectElement).value as 'uthmani' | 'indopak')}
				>
					<option value="uthmani">{t('script.uthmani')}</option>
					<option value="indopak">{t('script.indopak')}</option>
				</select>
			</div>
		</div>
	</div>
</header>

<style>
	.kh-appbar {
		display: flex;
		justify-content: center;
	}
	.kh-appbar-inner {
		width: 100%;
		max-width: 560px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 15px;
	}
	.kh-brand {
		display: flex;
		align-items: center;
		gap: 12px;
		text-decoration: none;
		color: inherit;
	}
	.kh-brand-text {
		display: flex;
		flex-direction: column;
		line-height: 1.15;
	}
	.kh-brand-name {
		font-size: clamp(17px, 4.6vw, 20px);
		letter-spacing: 0.01em;
		color: #f4eeff;
	}
	.kh-brand-tag {
		font-size: 11px;
		color: #9a8fc0;
		letter-spacing: 0.05em;
	}
	.kh-appbar-controls {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}
</style>
