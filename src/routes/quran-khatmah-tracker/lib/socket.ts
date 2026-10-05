// Socket.IO connection to the quran-khatmah backend. Created lazily in the
// browser only, so prerendering/SSR never touches it.
import * as publicEnv from '$env/static/public';
import { io, type Socket } from 'socket.io-client';
import type { Ack } from './types';

// Use $env/static/public so PUBLIC_KHATMAH_BACKEND_URL is INLINED into the
// content-hashed JS bundle at build time. This matters for adapter-static: the
// alternative ($env/dynamic/public) reads the value at runtime from a separate
// /_app/env.js with a stable filename — which CDNs/browsers (notably Safari)
// happily cache as immutable, so a stale empty copy makes io() fall back to the
// page origin (www.devxhub.com/socket.io → 404). Inlined values cache-bust with
// the bundle hash every deploy. We use a namespace import (not a named one) so a
// build with the var unset yields `undefined` instead of failing with
// "not exported". Set PUBLIC_KHATMAH_BACKEND_URL at build time (CI/Docker/.env).
const BACKEND_URL = publicEnv.PUBLIC_KHATMAH_BACKEND_URL || undefined;

let socket: Socket | null = null;

/** Get (or lazily create) the shared socket. Returns null outside the browser. */
export function getSocket(): Socket | null {
	if (typeof window === 'undefined') return null;
	if (!socket) {
		// Empty/undefined URL → connect to same origin (will fail gracefully if
		// no backend is reachable; create/join then surface the error path).
		socket = BACKEND_URL ? io(BACKEND_URL) : io();
	}
	return socket;
}

/** Promise wrapper around socket.emit with an ack — mirrors app.js `emit`. */
export function emit<T extends Ack = Ack>(event: string, payload: unknown): Promise<T> {
	return new Promise((resolve) => {
		const s = getSocket();
		if (!s) {
			resolve({ ok: false, error: 'generic' } as T);
			return;
		}
		s.emit(event, payload, (res: T) => resolve(res || ({ ok: false, error: 'generic' } as T)));
	});
}

export const backendConfigured = !!BACKEND_URL;
