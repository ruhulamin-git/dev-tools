<script lang="ts">
	import { i18n, t } from '../lib/i18n.svelte';
	import { khatmah } from '../lib/khatmah.svelte';
	import Completed from './Completed.svelte';
	import Lobby from './Lobby.svelte';
	import PartCard from './PartCard.svelte';

	const room = $derived(khatmah.state!);
	const pct = $derived(room.totalParts ? Math.round((room.doneCount / room.totalParts) * 100) : 0);
	const openAvailable = $derived(room.parts.some((p) => p.status === 'open' && !p.assignee));
	const full = $derived(room.assignedCount >= room.totalParts);
	const canExport = $derived(khatmah.isAdmin && room.status === 'completed');

	const hasMyParts = $derived(khatmah.myParts.length > 0);
	const showClaim = $derived(!khatmah.hasJoined && !full);
	const showNoActive = $derived(khatmah.hasJoined && !hasMyParts);

	let claimName = $state('');
	let claimId = $state('');

	function fmtTime(ts: number): string {
		return new Date(ts).toLocaleTimeString(i18n.lang === 'bn' ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit' });
	}

	// per-event icon + color for the activity feed
	const feedMeta: Record<string, { i: string; c: string }> = {
		room_created: { i: '✦', c: '#E9CF9B' },
		lobby_joined: { i: '＋', c: '#7CE0B2' },
		khatmah_started: { i: '۞', c: '#E9CF9B' },
		joined: { i: '✋', c: '#E9CF9B' },
		started: { i: '▶', c: '#F0A94C' },
		ended: { i: '✓', c: '#7CE0B2' },
		claimed: { i: '✋', c: '#E9CF9B' },
		passed: { i: '↩', c: '#A99ECB' },
		released: { i: '★', c: '#F08A80' },
		reset: { i: '↺', c: '#F08A80' },
		completed: { i: '۞', c: '#E9CF9B' }
	};
	const meta = (k: string) => feedMeta[k] ?? { i: '·', c: '#A99ECB' };
</script>

{#if khatmah.isLobby}
	<Lobby />
{:else if room.status === 'completed'}
	<Completed />
{:else}
	<div class="kh-screen kh-screen--active">
		<!-- room header -->
		<div class="kh-card kh-room-head">
			<div class="kh-room-top">
				<div class="kh-room-meta">
					<div>
						<div class="kh-eyebrow" style="letter-spacing:.14em">{t('room.code')}</div>
						<div class="kh-serif kh-room-code">{room.code}</div>
					</div>
					{#if room.dedication}
						<div class="kh-dedication">
							<div class="kh-eyebrow" style="letter-spacing:.14em">{t('room.dedication')}</div>
							<div class="kh-serif kh-dedication-text" dir="auto">{room.dedication}</div>
						</div>
					{/if}
				</div>
				<button class="kh-btn kh-btn-ghost kh-btn-sm" onclick={() => khatmah.share()}>🔗 {t('room.share')}</button>
			</div>
			<div class="kh-room-progress">
				<div class="kh-progress kh-progress--lg" style="flex:1">
					<div class="kh-progress-fill kh-progress-fill--green" style="width:{pct}%"></div>
				</div>
				<span class="kh-progress-text">{t('progress.text', { done: room.doneCount, total: room.totalParts })}</span>
			</div>
		</div>

		<div class="kh-active-grid">
			<!-- LEFT -->
			<div class="kh-active-left">
				<div class="kh-yourpart">
					{#if hasMyParts}
						<div class="kh-eyebrow" style="color:var(--kh-gold-2);margin-bottom:14px">{t('part.yourPartsTitle')}</div>
						<div class="kh-mine-list">
							{#each khatmah.myParts as p (p.index)}
								<PartCard part={p} variant="mine" />
							{/each}
						</div>
					{:else if showClaim}
						<div class="kh-claim">
							<div class="kh-claim-text">
								<h3 class="kh-claim-title">{t('part.claimTitle')}</h3>
								<p class="kh-claim-hint">{t('part.claimHint')}</p>
								<div class="kh-claim-inputs">
									<input class="kh-input" type="text" bind:value={claimName} placeholder={t('home.join.namePlaceholder')} />
									<input class="kh-input" type="text" bind:value={claimId} placeholder={t('home.join.idPlaceholder')} />
								</div>
							</div>
							<button class="kh-btn kh-btn-gold" onclick={() => khatmah.claimWithIdentity(claimName.trim(), claimId.trim())}>{t('part.claimButton')}</button>
						</div>
					{:else if showNoActive}
						<div class="kh-noactive">
							<span style="font-size:26px">✦</span>
							<div>
								<h3 class="kh-noactive-title">{t('part.noActiveTitle')}</h3>
								<p class="kh-noactive-hint">{openAvailable ? t('part.takeHint') : t('errors.FULL')}</p>
							</div>
						</div>
					{/if}
				</div>

				<div class="kh-eyebrow" style="margin-bottom:14px">{t('board.title')}</div>
				<div class="kh-board">
					{#each room.parts as p (p.index)}
						<PartCard part={p} variant="board" />
					{/each}
				</div>
			</div>

			<!-- RIGHT aside -->
			<div class="kh-active-right">
				{#if khatmah.isAdmin}
					<div class="kh-card kh-admin">
						<div class="kh-admin-head"><span style="color:var(--kh-gold-2);font-size:15px">★</span><h3 class="kh-admin-title">{t('admin.title')}</h3></div>
						<p class="kh-admin-body">{t('admin.youAreAdmin')}</p>
						{#if canExport}
							<button class="kh-btn kh-btn-gold kh-btn-block" onclick={() => khatmah.exportClose()}>📜 {t('admin.export')}</button>
						{:else}
							<button class="kh-btn kh-btn-block" disabled style="background:rgba(255,255,255,.04);color:#897faf;border:1px solid rgba(227,192,136,.14)">{t('admin.export')}</button>
							<p class="kh-admin-hint2">{t('admin.exportHint')}</p>
						{/if}
						<button class="kh-btn kh-btn-danger kh-btn-block kh-btn-sm" style="margin-top:14px" onclick={() => khatmah.reset()}>{t('admin.reset')}</button>
					</div>
				{/if}
				<div class="kh-panel kh-feed">
					<div class="kh-feed-head">
						<span class="kh-feed-dot kh-anim-pulse"></span>
						<h3 class="kh-feed-title">{t('feed.title')}</h3>
					</div>
					<div class="kh-feed-list">
						{#each room.feed as e, i (i)}
							<div class="kh-feed-row">
								<span class="kh-feed-icon" style="color:{meta(e.key).c}">{meta(e.key).i}</span>
								<div class="kh-feed-body">
									<div class="kh-feed-text">{t('feed.' + e.key, e.params)}</div>
									<div class="kh-feed-time">{fmtTime(e.at)}</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.kh-room-head {
		padding: clamp(20px, 3vw, 28px);
		margin-bottom: 22px;
	}
	.kh-room-top {
		display: flex;
		flex-wrap: wrap;
		gap: 20px;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 18px;
	}
	.kh-room-meta {
		display: flex;
		gap: 26px;
		flex-wrap: wrap;
		align-items: center;
	}
	.kh-room-code {
		font-size: 30px;
		letter-spacing: 0.16em;
		color: var(--kh-green-3);
	}
	.kh-dedication {
		border-left: 1px solid rgba(227, 192, 136, 0.2);
		padding-left: 24px;
		max-width: 340px;
	}
	.kh-dedication-text {
		font-size: 17px;
		color: #e2d6f2;
		font-style: italic;
		line-height: 1.4;
	}
	.kh-room-progress {
		display: flex;
		align-items: center;
		gap: 14px;
	}
	.kh-progress-text {
		font-size: 13.5px;
		font-weight: 600;
		color: var(--kh-muted);
		white-space: nowrap;
	}
	.kh-active-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 22px;
		align-items: flex-start;
	}
	.kh-active-left {
		flex: 2 1 460px;
		min-width: 0;
	}
	.kh-active-right {
		flex: 1 1 300px;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 18px;
	}
	.kh-yourpart {
		background: linear-gradient(135deg, rgba(227, 192, 136, 0.1), rgba(65, 185, 133, 0.06));
		border: 1px solid rgba(227, 192, 136, 0.26);
		border-radius: 20px;
		padding: 22px;
		margin-bottom: 24px;
	}
	.kh-mine-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.kh-claim {
		display: flex;
		flex-wrap: wrap;
		gap: 18px;
		align-items: flex-end;
		justify-content: space-between;
	}
	.kh-claim-text {
		flex: 1;
		min-width: 240px;
	}
	.kh-claim-title {
		font-size: 18px;
		font-weight: 700;
		margin: 0 0 6px;
		color: #f3eeff;
	}
	.kh-claim-hint {
		margin: 0 0 14px;
		font-size: 13.5px;
		color: var(--kh-muted);
		line-height: 1.5;
	}
	.kh-claim-inputs {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
	}
	.kh-claim-inputs .kh-input {
		flex: 1;
		min-width: 130px;
	}
	.kh-noactive {
		display: flex;
		align-items: center;
		gap: 14px;
	}
	.kh-noactive-title {
		font-size: 16px;
		font-weight: 700;
		margin: 0 0 4px;
		color: #f3eeff;
	}
	.kh-noactive-hint {
		margin: 0;
		font-size: 13px;
		color: var(--kh-muted-2);
	}
	.kh-board {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(290px, 100%), 1fr));
		gap: 14px;
	}
	.kh-admin {
		padding: 20px;
		border-radius: 18px;
	}
	.kh-admin-head {
		display: flex;
		align-items: center;
		gap: 9px;
		margin-bottom: 8px;
	}
	.kh-admin-title {
		font-size: 15px;
		font-weight: 700;
		margin: 0;
		color: #f1ecff;
	}
	.kh-admin-body {
		font-size: 12.5px;
		color: var(--kh-muted-2);
		margin: 0 0 16px;
		line-height: 1.5;
	}
	.kh-admin-hint2 {
		font-size: 11.5px;
		color: #897faf;
		margin: 8px 0 0;
		line-height: 1.4;
	}
	.kh-feed {
		padding: 20px;
		border-radius: 18px;
		max-height: 560px;
		display: flex;
		flex-direction: column;
	}
	.kh-feed-head {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 16px;
	}
	.kh-feed-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #41b985;
		box-shadow: 0 0 10px #41b985;
	}
	.kh-feed-title {
		font-size: 14px;
		font-weight: 700;
		margin: 0;
		color: #f1ecff;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
	.kh-feed-list {
		display: flex;
		flex-direction: column;
		gap: 2px;
		overflow-y: auto;
	}
	.kh-feed-row {
		display: flex;
		gap: 11px;
		padding: 10px 4px;
		border-bottom: 1px solid rgba(227, 192, 136, 0.07);
	}
	.kh-feed-icon {
		font-size: 14px;
		flex: none;
		width: 20px;
		text-align: center;
	}
	.kh-feed-body {
		flex: 1;
		min-width: 0;
	}
	.kh-feed-text {
		font-size: 13px;
		line-height: 1.45;
		color: #d6cdec;
	}
	.kh-feed-time {
		font-size: 11px;
		color: #7e7499;
		margin-top: 3px;
	}
</style>
