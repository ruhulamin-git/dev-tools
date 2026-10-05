<script lang="ts">
	import { t } from '../lib/i18n.svelte';
	import { khatmah } from '../lib/khatmah.svelte';

	const room = $derived(khatmah.state!);
	const target = $derived(room.participantCount || 1);
	const lobbyPct = $derived(Math.min(100, Math.round((khatmah.joinedCount / target) * 100)) + '%');

	// divide-into stepper (defaults to joined count until the admin edits it)
	let divideN = $state(1);
	let touched = $state(false);
	$effect(() => {
		if (!touched) divideN = Math.max(khatmah.joinedCount, 1);
	});
	const clamp = (n: number) => Math.min(604, Math.max(1, Math.floor(n) || 1));
	function step(d: number) {
		touched = true;
		divideN = clamp(divideN + d);
	}

	let joinName = $state('');
	let joinId = $state('');

	function initials(name: string): string {
		return name
			.trim()
			.split(/\s+/)
			.slice(0, 2)
			.map((w) => w[0] || '')
			.join('')
			.toUpperCase();
	}
</script>

<div class="kh-screen kh-screen--lobby">
	<div class="kh-phase">
		<span class="kh-phase-dot kh-anim-pulse"></span>{t('lobby.title')}
	</div>

	<!-- header card -->
	<div class="kh-card kh-lobby-head">
		<div>
			<div class="kh-eyebrow" style="letter-spacing:.14em">{t('room.code')}</div>
			<div class="kh-serif kh-roomcode">{room.code}</div>
		</div>
		<div class="kh-share">
			<button class="kh-btn kh-btn-ghost kh-btn-sm" onclick={() => khatmah.share()}>🔗 {t('room.share')}</button>
			{#if khatmah.isAdmin}
				<button class="kh-btn kh-btn-gold-soft kh-btn-sm" onclick={() => khatmah.shareAdmin()}>★ {t('admin.shareAdmin')}</button>
			{/if}
		</div>
	</div>

	<div class="kh-lobby-grid">
		<!-- waiting room + chips -->
		<div class="kh-panel kh-lobby-waitingroom">
			<h2 class="kh-serif kh-lobby-title">{t('lobby.title')}</h2>
			<p class="kh-lobby-sub">{t('lobby.subtitle')}</p>
			<div class="kh-lobby-count">
				<span class="kh-serif kh-lobby-num">{khatmah.joinedCount}</span>
				<span class="kh-lobby-headline">/ {target} {t('lobby.joinedWord')}</span>
			</div>
			<div class="kh-progress" style="margin-bottom:24px">
				<div class="kh-progress-fill kh-progress-fill--gold" style="width:{lobbyPct}"></div>
			</div>
			<div class="kh-eyebrow" style="margin-bottom:14px">{t('lobby.participantsTitle')}</div>
			{#if room.participants.length}
				<div class="kh-chips">
					{#each room.participants as p (p.id)}
						<div class="kh-chip">
							<span class="kh-chip-avatar">{initials(p.name)}</span>
							<span class="kh-chip-text">
								<span class="kh-chip-name">{p.name}</span>
								<span class="kh-chip-id">{p.displayId}</span>
							</span>
						</div>
					{/each}
				</div>
			{:else}
				<p class="kh-lobby-empty">{t('lobby.empty')}</p>
			{/if}
		</div>

		<!-- action card -->
		<div class="kh-card kh-lobby-action">
			{#if !khatmah.hasJoined}
				<h3 class="kh-action-title">{t('lobby.joinTitle')}</h3>
				{#if khatmah.isAdmin}
					<div class="kh-admin-hint"><span style="font-size:15px">★</span><p>{t('lobby.adminJoinHint')}</p></div>
				{/if}
				<input class="kh-input" type="text" bind:value={joinName} placeholder={t('home.join.namePlaceholder')} style="margin-bottom:12px" />
				<input class="kh-input" type="text" bind:value={joinId} placeholder={t('home.join.idPlaceholder')} />
				<button class="kh-btn kh-btn-gold kh-btn-block" style="margin-top:16px" onclick={() => khatmah.joinLobby(joinName.trim(), joinId.trim())}>{t('lobby.joinButton')}</button>
				{#if khatmah.homeErrorText}
					<p class="kh-error">{khatmah.homeErrorText}</p>
				{/if}
			{:else if khatmah.isAdmin}
				<div class="kh-youjoined">✓ {t('lobby.youJoinedShort')}</div>
				<label class="kh-label" for="divideN" style="color:var(--kh-gold-2);font-size:14px;margin-bottom:10px">{t('lobby.partsCount')}</label>
				<div class="kh-stepper">
					<button class="kh-step-btn" aria-label="decrease" onclick={() => step(-1)}>−</button>
					<input id="divideN" class="kh-input kh-step-input kh-serif" type="number" min="1" max="604" bind:value={divideN} oninput={() => (touched = true)} />
					<button class="kh-step-btn" aria-label="increase" onclick={() => step(1)}>+</button>
					<span class="kh-step-unit">{t('lobby.partsUnit')}</span>
				</div>
				<p class="kh-hint" style="margin-bottom:20px">{t('lobby.startHint')}</p>
				<button class="kh-btn kh-btn-green kh-btn-block" onclick={() => khatmah.startKhatmah(clamp(divideN))}>{t('lobby.start')}</button>
			{:else}
				<div class="kh-waiting">
					<div class="kh-serif kh-waiting-glyph kh-anim-spin">۞</div>
					<h3 class="kh-waiting-title">{t('lobby.youJoinedShort')}</h3>
					<p class="kh-waiting-body">{t('lobby.waiting')}</p>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.kh-phase {
		display: inline-flex;
		align-items: center;
		gap: 9px;
		padding: 6px 14px;
		border-radius: 999px;
		background: rgba(227, 192, 136, 0.1);
		border: 1px solid rgba(227, 192, 136, 0.28);
		color: var(--kh-gold-2);
		font-size: 12.5px;
		font-weight: 600;
		letter-spacing: 0.04em;
		margin-bottom: 18px;
	}
	.kh-phase-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--kh-gold-2);
	}
	.kh-lobby-head {
		display: flex;
		flex-wrap: wrap;
		gap: 24px;
		align-items: center;
		justify-content: space-between;
		padding: clamp(22px, 3vw, 32px);
		margin-bottom: 20px;
	}
	.kh-roomcode {
		font-size: clamp(30px, 5vw, 44px);
		letter-spacing: 0.18em;
		color: var(--kh-green-3);
		text-shadow: 0 0 24px rgba(65, 185, 133, 0.3);
	}
	.kh-share {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
	}
	.kh-lobby-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 20px;
		align-items: flex-start;
	}
	.kh-lobby-waitingroom {
		flex: 1 1 320px;
		min-width: 0;
		padding: clamp(22px, 3vw, 30px);
	}
	.kh-lobby-title {
		font-size: 26px;
		margin: 0 0 6px;
		color: #f3eeff;
	}
	.kh-lobby-sub {
		color: var(--kh-muted-2);
		font-size: 14px;
		margin: 0 0 22px;
		line-height: 1.55;
	}
	.kh-lobby-count {
		display: flex;
		align-items: baseline;
		gap: 12px;
		margin-bottom: 20px;
	}
	.kh-lobby-num {
		font-size: 46px;
		color: var(--kh-gold-2);
		line-height: 1;
	}
	.kh-lobby-headline {
		font-size: 15px;
		color: var(--kh-muted);
	}
	.kh-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}
	.kh-chip-text {
		display: flex;
		flex-direction: column;
		line-height: 1.2;
		min-width: 0; /* allow the text column to shrink so long values can wrap */
	}
	.kh-chip-name {
		font-size: 14px;
		font-weight: 600;
		color: #efe9fd;
		overflow-wrap: anywhere; /* break long unbroken names/emails/IDs */
	}
	.kh-chip-id {
		font-size: 11px;
		color: #9a8fc0;
		overflow-wrap: anywhere;
	}
	.kh-lobby-empty {
		font-size: 14px;
		color: #897faf;
		font-style: italic;
		margin: 0;
		padding: 14px 0;
	}
	.kh-lobby-action {
		flex: 1 1 300px;
		min-width: 0;
		padding: clamp(22px, 3vw, 28px);
	}
	.kh-action-title {
		font-size: 19px;
		font-weight: 700;
		margin: 0 0 8px;
		color: #f1ecff;
	}
	.kh-admin-hint {
		display: flex;
		gap: 9px;
		align-items: flex-start;
		background: rgba(227, 192, 136, 0.1);
		border: 1px solid rgba(227, 192, 136, 0.26);
		border-radius: 13px;
		padding: 13px;
		margin-bottom: 18px;
	}
	.kh-admin-hint p {
		margin: 0;
		font-size: 13px;
		line-height: 1.5;
		color: #d8cba0;
	}
	.kh-youjoined {
		display: flex;
		align-items: center;
		gap: 8px;
		color: var(--kh-green-3);
		font-size: 13px;
		font-weight: 600;
		margin-bottom: 16px;
	}
	.kh-stepper {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 8px;
	}
	.kh-step-btn {
		width: 42px;
		height: 46px;
		flex: none;
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(227, 192, 136, 0.24);
		color: var(--kh-gold-2);
		font-size: 22px;
		cursor: pointer;
	}
	.kh-step-btn:hover {
		background: rgba(255, 255, 255, 0.09);
	}
	.kh-step-input {
		flex: 1;
		min-width: 0;
		text-align: center;
		border-color: rgba(227, 192, 136, 0.3);
		font-size: 22px !important;
		font-weight: 700;
		padding: 12px;
	}
	.kh-step-unit {
		font-size: 14px;
		color: var(--kh-muted);
		white-space: nowrap;
	}
	.kh-waiting {
		text-align: center;
		padding: 14px 0;
	}
	.kh-waiting-glyph {
		font-size: 46px;
		margin-bottom: 14px;
		display: inline-block;
		color: var(--kh-gold-2);
	}
	.kh-waiting-title {
		font-size: 18px;
		font-weight: 700;
		margin: 0 0 10px;
		color: var(--kh-green-3);
	}
	.kh-waiting-body {
		margin: 0;
		font-size: 14px;
		line-height: 1.6;
		color: #aba0cb;
	}
</style>
