<script lang="ts">
	import { t } from '../lib/i18n.svelte';
	import { khatmah } from '../lib/khatmah.svelte';

	const room = $derived(khatmah.state!);
</script>

<div class="kh-completed-screen">
	<div class="kh-completed-card">
		<div class="kh-completed-halo" aria-hidden="true"></div>
		<div class="kh-completed-inner">
			<div class="kh-serif kh-completed-glyph kh-anim-glow">۞</div>
			<h1 class="kh-serif kh-completed-title">{t('completed.title')}</h1>
			<p class="kh-completed-sub">{t('completed.subtitle')}</p>
			<div class="kh-stats">
				<div class="kh-stat">
					<div class="kh-serif kh-stat-num" style="color:var(--kh-green-3)">{room.totalParts}</div>
					<div class="kh-stat-lbl">{t('completed.parts')}</div>
				</div>
				<div class="kh-stat-sep"></div>
				<div class="kh-stat">
					<div class="kh-serif kh-stat-num" style="color:var(--kh-gold-2)">{khatmah.joinedCount}</div>
					<div class="kh-stat-lbl">{t('cert.participants')}</div>
				</div>
				<div class="kh-stat-sep"></div>
				<div class="kh-stat">
					<div class="kh-serif kh-stat-num" style="color:var(--kh-green-3)">604</div>
					<div class="kh-stat-lbl">{t('completed.pages')}</div>
				</div>
			</div>
			{#if khatmah.isAdmin}
				<button class="kh-btn kh-btn-gold" onclick={() => khatmah.exportClose()}>📜 {t('admin.export')}</button>
			{/if}
		</div>
	</div>
</div>

<style>
	.kh-completed-screen {
		max-width: 760px;
		margin: 0 auto;
		padding: clamp(40px, 8vw, 90px) clamp(8px, 4vw, 40px);
		text-align: center;
	}
	.kh-completed-card {
		position: relative;
		background: linear-gradient(160deg, #26204a, #1a1638);
		border: 1px solid rgba(227, 192, 136, 0.3);
		border-radius: 28px;
		padding: clamp(36px, 6vw, 64px) clamp(24px, 4vw, 48px);
		overflow: hidden;
	}
	.kh-completed-halo {
		position: absolute;
		inset: 0;
		background: radial-gradient(400px 240px at 50% 0%, rgba(84, 207, 151, 0.18), transparent 70%);
		pointer-events: none;
	}
	.kh-completed-inner {
		position: relative;
	}
	.kh-completed-glyph {
		font-size: clamp(54px, 11vw, 90px);
		color: var(--kh-gold-2);
		line-height: 1;
		margin-bottom: 20px;
		display: inline-block;
		border-radius: 50%;
	}
	.kh-completed-title {
		font-size: clamp(30px, 5vw, 46px);
		margin: 0 0 14px;
		color: #f6f1ff;
		text-wrap: balance;
	}
	.kh-completed-sub {
		font-size: clamp(15px, 2vw, 19px);
		color: var(--kh-muted);
		margin: 0 0 30px;
		line-height: 1.6;
	}
	.kh-stats {
		display: inline-flex;
		gap: 30px;
		flex-wrap: wrap;
		justify-content: center;
		padding: 20px 30px;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(227, 192, 136, 0.18);
		border-radius: 18px;
		margin-bottom: 30px;
	}
	.kh-stat-num {
		font-size: 32px;
	}
	.kh-stat-lbl {
		font-size: 12px;
		color: var(--kh-muted-3);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}
	.kh-stat-sep {
		width: 1px;
		background: rgba(227, 192, 136, 0.2);
	}
</style>
