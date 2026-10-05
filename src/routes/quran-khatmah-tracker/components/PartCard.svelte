<script lang="ts">
	import { t } from '../lib/i18n.svelte';
	import { khatmah } from '../lib/khatmah.svelte';
	import type { AyahRef, PartState } from '../lib/types';

	let { part, variant = 'board' }: { part: PartState; variant?: 'board' | 'mine' } = $props();

	const mine = $derived(khatmah.isMine(part));
	const indopak = $derived(khatmah.script === 'indopak');

	function fmtDuration(ms: number): string {
		if (ms < 0) ms = 0;
		const s = Math.floor(ms / 1000);
		const h = Math.floor(s / 3600);
		const m = Math.floor((s % 3600) / 60);
		const sec = s % 60;
		const pad = (n: number) => String(n).padStart(2, '0');
		return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
	}

	const statusLabel: Record<string, string> = {
		open: 'part.statusOpen',
		in_progress: 'part.statusInProgress',
		done: 'part.statusDone'
	};
	const badgeClass = $derived(
		part.status === 'done' ? 'kh-badge--done' : part.status === 'in_progress' ? 'kh-badge--reading' : 'kh-badge--open'
	);
	const accent = $derived(
		part.status === 'done' ? '#2E9E6E' : part.status === 'in_progress' ? '#E89C3C' : mine ? '#54CF97' : 'rgba(227,192,136,.3)'
	);

	const rangeLabel = $derived(
		(part.juzFrom === part.juzTo ? t('part.juzSingle', { n: part.juzFrom }) : t('part.juz', { from: part.juzFrom, to: part.juzTo })) +
			' · ' +
			t('part.pages', { from: part.pageFrom, to: part.pageTo })
	);

	const timer = $derived.by(() => {
		if (part.status === 'in_progress' && part.startedAt) return { label: fmtDuration(khatmah.now - part.startedAt), color: '#F0A94C' };
		if (part.status === 'done' && part.startedAt && part.endedAt) return { label: fmtDuration(part.endedAt - part.startedAt), color: '#7CE0B2' };
		return { label: '', color: '' };
	});

	const canStart = $derived(mine && part.status !== 'done' && part.status !== 'in_progress');
	const canEnd = $derived(mine && part.status === 'in_progress');
	const canPass = $derived(mine && part.status !== 'done');
	const canClaim = $derived(!part.assignee && part.status === 'open' && !!khatmah.membership?.participantId && !mine && !khatmah.hasActivePart);
	const canRelease = $derived(khatmah.isAdmin && !!part.assignee && part.status !== 'done');

	/** First few words of the boundary ayah text (script-aware), with an ellipsis. */
	function snippet(ref: AyahRef): string {
		const text = (indopak ? ref.text.indopak : ref.text.uthmani) || '';
		const words = text.trim().split(/\s+/).filter(Boolean);
		if (!words.length) return '';
		const few = words.slice(0, 5).join(' ');
		return words.length > 5 ? `${few} …` : few;
	}
</script>

{#if variant === 'mine'}
	<div class="kh-mine-row" style="border-color:{accent}">
		<div class="kh-mine-left">
			<span class="kh-serif kh-mine-idx">#{part.index}</span>
			<div>
				<div class="kh-mine-range">{rangeLabel}</div>
				<div class="kh-mine-surah">{part.start.surahTranslit} → {part.end.surahTranslit}</div>
			</div>
			<span class="kh-badge {badgeClass}">{t(statusLabel[part.status])}</span>
			{#if timer.label}<span class="kh-serif" style="font-size:15px;color:{timer.color};letter-spacing:.04em">⏱ {timer.label}</span>{/if}
		</div>
		<div class="kh-mine-actions">
			{#if canStart}<button class="kh-btn kh-btn-amber kh-btn-sm" onclick={() => khatmah.onAction('start', part.index)}>{t('part.start')}</button>{/if}
			{#if canEnd}<button class="kh-btn kh-btn-green kh-btn-sm" onclick={() => khatmah.onAction('end', part.index)}>✓ {t('part.end')}</button>{/if}
			{#if canPass}<button class="kh-btn kh-btn-ghost kh-btn-sm" onclick={() => khatmah.onAction('pass', part.index)}>{t('part.pass')}</button>{/if}
		</div>
	</div>
{:else}
	<div class="kh-part" style="border-left-color:{accent}">
		<div class="kh-part-top">
			<div class="kh-part-id">
				<span class="kh-serif kh-part-idx">#{part.index}</span>
				<span class="kh-badge {badgeClass}">{t(statusLabel[part.status])}</span>
			</div>
			{#if timer.label}<span class="kh-serif" style="font-size:14px;color:{timer.color};letter-spacing:.03em">{timer.label}</span>{/if}
		</div>
		<div class="kh-part-range">{rangeLabel}</div>
		<div class="kh-part-refs">
			{#each [{ which: 'from', ref: part.start }, { which: 'to', ref: part.end }] as r (r.which)}
				<div class="kh-ref">
					<div class="kh-ref-lbl">{t('part.' + r.which)}</div>
					<div class="kh-arabic {indopak ? 'indopak' : ''}" dir="rtl">{r.ref.surahName}</div>
					<div class="kh-ref-en">{r.ref.surahTranslit} · {t('part.ayah', { n: r.ref.ayah })}</div>
					{#if snippet(r.ref)}
						<div class="kh-arabic {indopak ? 'indopak' : ''} kh-ref-snip" dir="rtl">{snippet(r.ref)}</div>
					{/if}
				</div>
			{/each}
		</div>
		<div class="kh-part-foot">
			<div class="kh-reader">
				<span style="color:var(--kh-muted-3)">{t('part.assignedTo')}:</span>
				{#if part.assignee}
					<span style="color:var(--kh-gold-2);font-weight:600">{part.assignee.name}</span>
				{:else}
					<span style="color:#897faf;font-style:italic">{t('part.unassigned')}</span>
				{/if}
			</div>
			<div class="kh-part-actions">
				{#if canClaim}<button class="kh-btn kh-btn-gold-soft kh-btn-sm" onclick={() => khatmah.onAction('claim', part.index)}>{t('part.take')}</button>{/if}
				{#if canStart}<button class="kh-btn kh-btn-amber kh-btn-sm" onclick={() => khatmah.onAction('start', part.index)}>{t('part.start')}</button>{/if}
				{#if canEnd}<button class="kh-btn kh-btn-green kh-btn-sm" onclick={() => khatmah.onAction('end', part.index)}>✓ {t('part.end')}</button>{/if}
				{#if canPass}<button class="kh-btn kh-btn-ghost kh-btn-sm" onclick={() => khatmah.onAction('pass', part.index)}>{t('part.pass')}</button>{/if}
				{#if canRelease}<button class="kh-btn kh-btn-danger kh-btn-sm" onclick={() => khatmah.onAction('release', part.index)}>{t('admin.release')}</button>{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	/* board card */
	.kh-part {
		position: relative;
		background: linear-gradient(180deg, #221a41, #1a1535);
		border: 1px solid rgba(227, 192, 136, 0.13);
		border-left: 4px solid;
		border-radius: 16px;
		padding: 18px 18px 16px;
	}
	.kh-part-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 14px;
	}
	.kh-part-id {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.kh-part-idx {
		font-size: 22px;
		color: var(--kh-gold-2);
	}
	.kh-part-range {
		font-size: 13px;
		color: var(--kh-muted);
		margin-bottom: 14px;
		font-weight: 600;
	}
	.kh-part-refs {
		display: flex;
		gap: 10px;
		margin-bottom: 14px;
	}
	.kh-ref {
		flex: 1;
		min-width: 0;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(227, 192, 136, 0.1);
		border-radius: 11px;
		padding: 11px 12px;
	}
	.kh-ref-lbl {
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--kh-muted-3);
		margin-bottom: 7px;
	}
	.kh-ref .kh-arabic {
		font-size: 21px;
		color: #f2edff;
		line-height: 1.3;
		margin-bottom: 3px;
	}
	.kh-ref-en {
		font-size: 11.5px;
		color: var(--kh-muted-2);
	}
	.kh-ref-snip {
		margin-top: 8px;
		padding-top: 8px;
		border-top: 1px solid rgba(227, 192, 136, 0.08);
		font-size: 16px;
		line-height: 1.5;
		color: #cabfe6;
	}
	.kh-part-foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		flex-wrap: wrap;
	}
	.kh-reader {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
	}
	.kh-part-actions,
	.kh-mine-actions {
		display: flex;
		gap: 7px;
		flex-wrap: wrap;
	}

	/* mine row */
	.kh-mine-row {
		display: flex;
		flex-wrap: wrap;
		gap: 14px;
		align-items: center;
		justify-content: space-between;
		background: rgba(21, 16, 43, 0.5);
		border: 1px solid;
		border-radius: 15px;
		padding: 16px 18px;
	}
	.kh-mine-left {
		display: flex;
		align-items: center;
		gap: 14px;
		flex-wrap: wrap;
	}
	.kh-mine-idx {
		font-size: 24px;
		color: var(--kh-gold-2);
	}
	.kh-mine-range {
		font-size: 14px;
		font-weight: 600;
		color: #f1ecff;
	}
	.kh-mine-surah {
		font-size: 12.5px;
		color: var(--kh-muted-2);
	}
</style>
