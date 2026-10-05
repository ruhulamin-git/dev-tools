// Session controller — ported from quran-khatmah/public/app.js. Holds all
// reactive session state and the Socket.IO flows; child components read its
// fields and call its methods (no prop drilling). Single shared instance.
import { base } from '$app/paths';
import { buildCertificate } from './certificate';
import { t } from './i18n.svelte';
import { getSocket, emit } from './socket';
import { clearMembership, loadMembership, loadScript, saveMembership, saveScript } from './storage';
import type { Ack, ExportData, Membership, PartState, RoomState, Script } from './types';

function errText(code: string | undefined): string {
	const k = 'errors.' + (code || 'generic');
	const v = t(k);
	return v === k ? t('errors.generic') : v;
}

class Khatmah {
	state = $state<RoomState | null>(null);
	code = $state<string | null>(null);
	membership = $state<Membership | null>(null);
	subscribed = $state(false);
	script = $state<Script>('uthmani');
	view = $state<'home' | 'room'>('home');
	homeErrorKey = $state<string | null>(null);
	toastMsg = $state<string | null>(null);
	now = $state(0);
	/** Prefilled join code when arriving via an invite link without membership. */
	joinCodePrefill = $state('');

	#toastTimer: ReturnType<typeof setTimeout> | null = null;
	#wired = false;

	get homeErrorText(): string {
		if (!this.homeErrorKey) return '';
		const v = t('errors.' + this.homeErrorKey);
		return v === 'errors.' + this.homeErrorKey ? t('errors.generic') : v;
	}

	get isAdmin(): boolean {
		return !!(this.membership && this.membership.adminToken);
	}

	isMine(p: PartState): boolean {
		return !!(p.assignee && this.membership?.participantId && p.assignee.id === this.membership.participantId);
	}

	get myParts(): PartState[] {
		if (!this.state) return [];
		return this.state.parts.filter((p) => this.isMine(p));
	}

	get hasActivePart(): boolean {
		return this.myParts.some((p) => p.status !== 'done');
	}

	// ---- lobby ----
	get isLobby(): boolean {
		return this.state?.status === 'lobby';
	}

	get joinedCount(): number {
		return this.state?.participants?.length ?? 0;
	}

	/** Has this client registered an identity (joined the lobby / claimed)? */
	get hasJoined(): boolean {
		return !!this.membership?.participantId;
	}

	// ---- lifecycle ----
	init() {
		if (this.#wired) return;
		this.script = loadScript();
		this.now = Date.now();
		const socket = getSocket();
		if (socket) {
			socket.on('state', (s: RoomState) => {
				if (s && s.code === this.code) this.state = s;
			});
			socket.on('connect', () => {
				if (this.code && this.subscribed) {
					if (this.membership?.participantId) {
						const ev = this.state?.status === 'lobby' ? 'joinLobby' : 'joinRoom';
						emit(ev, {
							code: this.code,
							name: this.membership.name,
							participantId: this.membership.participantId,
							displayId: this.membership.displayId
						});
					} else emit('watchRoom', { code: this.code });
				}
			});
			socket.on('closed', (m: { code?: string }) => {
				if (m && m.code === this.code) {
					this.toast(t('toast.closed'));
					this.leaveRoom();
				}
			});
		}
		this.#wired = true;
	}

	tick() {
		this.now = Date.now();
	}

	// ---- helpers ----
	homeError(key: string | null) {
		this.homeErrorKey = key;
	}

	toast(msg: string) {
		this.toastMsg = msg;
		if (this.#toastTimer) clearTimeout(this.#toastTimer);
		this.#toastTimer = setTimeout(() => (this.toastMsg = null), 2500);
	}

	setScript(s: Script) {
		this.script = s;
		saveScript(s);
	}

	// ---- flows ----
	async createRoom(participantCount: number, dedication: string) {
		this.homeError(null);
		const res = await emit('createRoom', { participantCount, dedication });
		if (!res.ok) return this.homeError(res.error || 'generic');
		this.code = res.code as string;
		this.membership = { adminToken: res.adminToken as string };
		saveMembership(this.code, this.membership);
		history.replaceState(null, '', `?code=${this.code}`);
		await this.watch();
	}

	/**
	 * The unique key for this client in a room. Auto-generated once and persisted
	 * in per-room membership so reconnects re-register as the same person. This is
	 * never the human-typed "ID" (displayId) — that one can collide between people.
	 */
	#participantKey(code: string): string {
		const m = loadMembership(code);
		if (m.participantId) return m.participantId;
		const id =
			typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `p-${Date.now()}-${Math.random().toString(36).slice(2)}`;
		saveMembership(code, Object.assign(m, { participantId: id }));
		return id;
	}

	async joinRoom(name: string, displayId: string) {
		this.homeError(null);
		if (!this.code) return this.homeError('NO_ROOM');
		const participantId = this.#participantKey(this.code);
		const res = await emit('joinRoom', { code: this.code, name, participantId, displayId });
		if (!res.ok) return this.homeError(res.error || 'generic');
		this.membership = Object.assign(loadMembership(this.code), { participantId, displayId, name, partIndex: res.partIndex as number });
		saveMembership(this.code, this.membership);
		this.subscribed = true;
		this.state = res.state as RoomState;
		this.view = 'room';
	}

	async watch() {
		if (!this.code) return;
		const res = await emit('watchRoom', { code: this.code });
		if (!res.ok) {
			this.view = 'home';
			return this.homeError(res.error || 'generic');
		}
		this.subscribed = true;
		this.state = res.state as RoomState;
		this.view = 'room';
	}

	/** Register in the lobby (before the khatmah is divided). */
	async joinLobby(name: string, displayId: string) {
		this.homeError(null);
		if (!this.code) return this.homeError('NO_ROOM');
		if (!name) return this.homeError('NO_NAME');
		if (!displayId) return this.homeError('NO_ID');
		const participantId = this.#participantKey(this.code);
		const res = await emit('joinLobby', { code: this.code, name, participantId, displayId });
		if (!res.ok) return this.homeError(res.error || 'generic');
		this.membership = Object.assign(loadMembership(this.code), { participantId, displayId, name });
		saveMembership(this.code, this.membership);
		this.subscribed = true;
		this.state = res.state as RoomState;
		this.view = 'room';
	}

	/** Admin: divide the Quran by the confirmed count and start the khatmah. */
	async startKhatmah(count: number) {
		const res = await emit('startKhatmah', { code: this.code, adminToken: this.membership?.adminToken, count });
		if (!res.ok) this.toast(errText(res.error));
	}

	/** Submit the home join form — routes to the lobby or the board by status. */
	async submitJoin(rawCode: string, name: string, displayId: string) {
		this.code = (rawCode || '').trim().toUpperCase();
		if (!this.code) return this.homeError('NO_ROOM');
		const res = await emit('watchRoom', { code: this.code });
		if (!res.ok) return this.homeError(res.error || 'generic');
		this.state = res.state as RoomState;
		if (this.state.status === 'lobby') return this.joinLobby(name.trim(), displayId.trim());
		return this.joinRoom(name.trim(), displayId.trim());
	}

	async onAction(action: string, index: number) {
		const m = this.membership;
		const base = { code: this.code, index, participantId: m?.participantId, adminToken: m?.adminToken };
		let res: Ack | undefined;
		if (action === 'start') res = await emit('startPart', base);
		else if (action === 'end') res = await emit('endPart', base);
		else if (action === 'release') res = await emit('releasePart', { code: this.code, index, adminToken: m?.adminToken });
		else if (action === 'claim') res = await emit('claimPart', { code: this.code, index, name: m?.name, participantId: m?.participantId, displayId: m?.displayId });
		else if (action === 'pass') {
			if (!confirm(t('part.confirmPass'))) return;
			res = await emit('passPart', base);
		}
		if (res && !res.ok) this.toast(errText(res.error));
	}

	/** Claim from the empty "your part" form (captures identity once). */
	claimWithIdentity(name: string, displayId: string) {
		if (!name) return this.toast(errText('NO_NAME'));
		if (!displayId) return this.toast(errText('NO_ID'));
		this.joinRoom(name, displayId);
	}

	shareLink(): string {
		return `${location.origin}${base}/quran-khatmah-tracker?code=${this.code}`;
	}

	share() {
		navigator.clipboard.writeText(this.shareLink()).then(() => this.toast(t('toast.linkCopied')));
	}

	shareAdmin() {
		const link = `${this.shareLink()}&admin=${this.membership?.adminToken}`;
		navigator.clipboard.writeText(link).then(() => this.toast(t('toast.adminCopied')));
	}

	async reset() {
		if (!confirm(t('admin.confirmReset'))) return;
		const res = await emit('resetRoom', { code: this.code, adminToken: this.membership?.adminToken });
		if (!res.ok) this.toast(errText(res.error));
	}

	async exportClose() {
		if (!confirm(t('admin.confirmExport'))) return;
		const res = await emit('closeKhatmah', { code: this.code, adminToken: this.membership?.adminToken });
		if (!res.ok) return this.toast(errText(res.error));
		const ok = buildCertificate(res.export as ExportData, t, localeFromT());
		if (!ok) this.toast(t('cert.popupBlocked'));
		this.toast(t('toast.closed'));
		this.leaveRoom();
	}

	leaveRoom() {
		if (this.code) clearMembership(this.code);
		this.subscribed = false;
		this.membership = null;
		this.state = null;
		this.code = null;
		history.replaceState(null, '', location.pathname);
		this.view = 'home';
	}

	/** Mirror app.js boot(): resolve ?code=/?admin= deep links. */
	async boot(params: URLSearchParams) {
		const qsCode = (params.get('code') || '').trim().toUpperCase();
		const qsAdmin = params.get('admin');
		if (!qsCode) {
			this.view = 'home';
			return;
		}
		this.code = qsCode;
		this.membership = loadMembership(qsCode);
		if (qsAdmin) {
			this.membership.adminToken = qsAdmin;
			saveMembership(qsCode, this.membership);
			history.replaceState(null, '', `?code=${qsCode}`); // keep token out of the visible URL
		}
		// Watch first to learn the room's status (works for admin + visitor); the
		// Room/Lobby UI then renders by status. A returning participant re-registers
		// (lobby) or re-claims (active).
		const res = await emit('watchRoom', { code: qsCode });
		if (!res.ok) {
			this.view = 'home';
			this.joinCodePrefill = qsCode;
			return;
		}
		this.state = res.state as RoomState;
		this.subscribed = true;
		this.view = 'room';
		if (this.membership.participantId) {
			if (this.state.status === 'lobby') await this.joinLobby(this.membership.name || '', this.membership.displayId || '');
			else await this.joinRoom(this.membership.name || '', this.membership.displayId || '');
		}
	}
}

// Resolve the active locale without importing the reactive store here (avoids a
// cycle); certificate just needs 'en' | 'bn' for date formatting.
function localeFromT(): string {
	return document?.documentElement?.lang === 'bn' ? 'bn' : 'en';
}

export const khatmah = new Khatmah();
