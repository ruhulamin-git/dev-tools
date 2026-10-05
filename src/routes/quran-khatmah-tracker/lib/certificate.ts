// Printable "proof" certificate — ported verbatim from quran-khatmah/public/app.js
// (buildCertificate). Opens a self-contained printable window.
import type { ExportData } from './types';

type T = (key: string, params?: Record<string, string | number>) => string;

function escapeHtml(s: unknown): string {
	return String(s == null ? '' : s).replace(
		/[&<>"']/g,
		(c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string
	);
}

function fmtDateTime(ts: number | null, lang: string): string {
	if (!ts) return '—';
	return new Date(ts).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US');
}

/** Returns true if the certificate window opened, false if blocked. */
export function buildCertificate(data: ExportData, t: T, lang: string): boolean {
	const dir = ['ar', 'ur'].includes(lang) ? 'rtl' : 'ltr';
	const partsRows = data.parts
		.map((p) => {
			const range = `${p.juzFrom === p.juzTo ? 'Juz ' + p.juzFrom : 'Juz ' + p.juzFrom + '–' + p.juzTo} · ${t('part.pages', {
				from: p.pageFrom,
				to: p.pageTo
			})}`;
			const reader = p.assignee ? `${escapeHtml(p.assignee.name)} (${escapeHtml(p.assignee.displayId || '')})` : '—';
			return `<tr>
				<td>#${p.index}</td>
				<td>${escapeHtml(range)}</td>
				<td dir="rtl">${escapeHtml(p.start.surahName)} → ${escapeHtml(p.end.surahName)}</td>
				<td>${escapeHtml(reader)}</td>
				<td>${escapeHtml(t('cert.status_' + p.status))}</td>
				<td>${escapeHtml(fmtDateTime(p.endedAt, lang))}</td>
			</tr>`;
		})
		.join('');
	const feedRows = data.events
		.map((e) => `<li>${escapeHtml(t('feed.' + e.key, e.params))} <span class="when">${escapeHtml(fmtDateTime(e.at, lang))}</span></li>`)
		.join('');
	const html = `<!doctype html><html lang="${lang}" dir="${dir}"><head><meta charset="utf-8" />
		<title>${escapeHtml(t('cert.title'))} · ${escapeHtml(data.code)}</title>
		<style>
			:root { --green:#0f5132; --gold:#c8a24a; --ink:#1f2a24; --muted:#6b7d72; --line:#e3e0d4; }
			* { box-sizing: border-box; }
			body { font-family: -apple-system, Segoe UI, Roboto, 'Noto Sans Bengali', sans-serif; color: var(--ink); margin: 40px; }
			.sheet { max-width: 900px; margin: 0 auto; border: 3px double var(--gold); border-radius: 14px; padding: 32px 40px; }
			h1 { color: var(--green); text-align: center; margin: 0 0 4px; }
			.proof { text-align: center; color: var(--muted); margin: 0 0 24px; }
			.meta { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; margin: 0 0 24px; }
			.meta div { padding: 6px 0; border-bottom: 1px solid var(--line); }
			.meta b { color: var(--green); }
			table { width: 100%; border-collapse: collapse; margin: 12px 0 24px; font-size: 13px; }
			th, td { border: 1px solid var(--line); padding: 6px 8px; text-align: start; }
			th { background: #f6f4ec; color: var(--green); }
			h2 { color: var(--green); border-bottom: 2px solid var(--gold); padding-bottom: 4px; }
			ul.activity { font-size: 12px; color: var(--ink); padding-inline-start: 18px; }
			ul.activity .when { color: var(--muted); }
			.credit { text-align: center; color: var(--muted); font-size: 12px; margin-top: 28px; border-top: 1px solid var(--line); padding-top: 12px; }
			.credit a { color: var(--green); }
			@media print { body { margin: 0; } .sheet { border: none; } }
		</style></head><body>
		<div class="sheet">
			<h1>${escapeHtml(t('app.title'))}</h1>
			<p class="proof">${escapeHtml(t('cert.proof'))}</p>
			<div class="meta">
				<div><b>${escapeHtml(t('room.code'))}:</b> ${escapeHtml(data.code)}</div>
				<div><b>${escapeHtml(t('cert.participants'))}:</b> ${data.participantCount}</div>
				<div><b>${escapeHtml(t('cert.createdOn'))}:</b> ${escapeHtml(fmtDateTime(data.createdAt, lang))}</div>
				<div><b>${escapeHtml(t('cert.completedOn'))}:</b> ${escapeHtml(fmtDateTime(data.completedAt, lang))}</div>
				${data.dedication ? `<div style="grid-column:1/-1"><b>${escapeHtml(t('room.dedication'))}:</b> ${escapeHtml(data.dedication)}</div>` : ''}
			</div>
			<h2>${escapeHtml(t('board.title'))}</h2>
			<table>
				<thead><tr>
					<th>#</th><th>${escapeHtml(t('cert.range'))}</th><th>${escapeHtml(t('cert.surahs'))}</th>
					<th>${escapeHtml(t('cert.reader'))}</th><th>${escapeHtml(t('cert.status'))}</th><th>${escapeHtml(t('cert.completedOn'))}</th>
				</tr></thead>
				<tbody>${partsRows}</tbody>
			</table>
			<h2>${escapeHtml(t('feed.title'))}</h2>
			<ul class="activity">${feedRows}</ul>
			<p class="credit">${escapeHtml(t('cert.generatedOn'))}: ${escapeHtml(fmtDateTime(Date.now(), lang))}<br />
				© ${new Date().getFullYear()} <a href="https://www.devxhub.com">Devxhub Limited</a> · ${escapeHtml(t('footer.rights'))}</p>
		</div>
		<script>window.onload = function () { window.print(); };<\/script>
	</body></html>`;
	const w = window.open('', '_blank');
	if (!w) return false;
	w.document.open();
	w.document.write(html);
	w.document.close();
	return true;
}
