// Shared domain types for the khatmah app — mirrored from the quran-khatmah
// backend (src/types.ts). The server is the source of truth and broadcasts a
// full RoomState on every change.

export type Script = 'uthmani' | 'indopak';

export interface AyahText {
	uthmani: string;
	indopak: string;
}

export interface AyahRef {
	surahNo: number;
	surahName: string; // Arabic
	surahTranslit: string; // Latin transliteration
	ayah: number;
	page: number; // Madani 604-page mushaf
	text: AyahText; // start/end ayah text in both scripts
}

export interface SurahRef {
	number: number;
	name: string; // Arabic
	translit: string;
}

export type PartStatus = 'open' | 'in_progress' | 'done';

export interface PartDescriptor {
	index: number;
	juzFrom: number;
	juzTo: number;
	startAyahId: number;
	endAyahId: number;
	start: AyahRef;
	end: AyahRef;
	pageFrom: number;
	pageTo: number;
	surahsCovered: SurahRef[];
}

export interface Assignee {
	id: string; // internal unique key (auto-generated, never shown)
	name: string;
	displayId?: string; // human-entered identifier (NID/mobile) shown in UI + certificate
}

export interface PartState extends PartDescriptor {
	status: PartStatus;
	startedAt: number | null;
	endedAt: number | null;
	assignee: Assignee | null;
}

export interface FeedEntry {
	key: string;
	params: Record<string, string | number>;
	at: number;
}

export type RoomStatus = 'lobby' | 'active' | 'completed';

export interface RoomState {
	code: string;
	status: RoomStatus;
	participantCount: number; // admin's expected target (display only)
	dedication: string | null;
	createdAt: number;
	completedAt: number | null;
	assignedCount: number;
	doneCount: number;
	totalParts: number;
	parts: PartState[];
	participants: Assignee[]; // people who joined the lobby (id + name)
	feed: FeedEntry[];
}

export interface ExportData {
	code: string;
	status: RoomStatus;
	participantCount: number;
	dedication: string | null;
	createdAt: number;
	completedAt: number | null;
	parts: PartState[];
	events: FeedEntry[];
}

// Client-side membership stored per room in localStorage.
export interface Membership {
	participantId?: string; // internal unique key (auto-generated per browser/room)
	displayId?: string; // human-entered identifier (NID/mobile)
	name?: string;
	adminToken?: string;
	partIndex?: number;
}

// Generic ack shape returned by socket emits.
export interface Ack<T = unknown> {
	ok: boolean;
	error?: string;
	[key: string]: unknown;
}
