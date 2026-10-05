const safeRandomBytes = (len: number): Uint8Array => {
	const bytes = new Uint8Array(len);
	if (globalThis.crypto?.getRandomValues) {
		globalThis.crypto.getRandomValues(bytes);
	} else {
		for (let i = 0; i < len; i++) {
			bytes[i] = Math.floor(Math.random() * 256);
		}
	}
	return bytes;
};

const hex = Array.from({ length: 256 }, (_, i) => (i + 256).toString(16).slice(1));

const randomBytesV4 = () => {
	const bytes = new Uint8Array(16);
	if (globalThis.crypto?.getRandomValues) {
		globalThis.crypto.getRandomValues(bytes);
	} else {
		for (let i = 0; i < 16; i += 1) {
			bytes[i] = Math.floor(Math.random() * 256);
		}
	}
	return bytes;
};

const toUuidString = (bytes: Uint8Array) => [
	hex[bytes[0]], hex[bytes[1]], hex[bytes[2]], hex[bytes[3]],
	hex[bytes[4]], hex[bytes[5]], hex[bytes[6]], hex[bytes[7]],
	hex[bytes[8]], hex[bytes[9]], hex[bytes[10]], hex[bytes[11]],
	hex[bytes[12]], hex[bytes[13]], hex[bytes[14]], hex[bytes[15]]
];

const bytesToUuid = (bytes: Uint8Array) => {
	const b = toUuidString(bytes);
	return `${b[0]}${b[1]}${b[2]}${b[3]}-${b[4]}${b[5]}-${b[6]}${b[7]}-${b[8]}${b[9]}-${b[10]}${b[11]}${b[12]}${b[13]}${b[14]}${b[15]}`;
};

let _v1Node: Uint8Array | null = null;
let _v1ClockSeq: number | null = null;
let _lastV1MSecs = 0;
let _lastV1NSecs = 0;

export const uuidV1 = () => {
	if (typeof window === 'undefined') return '00000000-0000-1000-8000-000000000000';
	const rnds = safeRandomBytes(16);
	if (_v1Node == null) { _v1Node = rnds.slice(10, 16); _v1Node[0] |= 0x01; }
	if (_v1ClockSeq == null) { _v1ClockSeq = ((rnds[8] << 8) | rnds[9]) & 0x3fff; }
	let msecs = Date.now();
	let nsecs = _lastV1NSecs + 1;
	const dt = msecs - _lastV1MSecs + (nsecs - _lastV1NSecs) / 10000;
	if (dt < 0) { _v1ClockSeq = ((_v1ClockSeq || 0) + 1) & 0x3fff; }
	if (dt < 0 || msecs > _lastV1MSecs) { nsecs = 0; }
	if (nsecs >= 10000) { throw new Error('uuidV1: Too many UUIDs generated in a single ms'); }
	_lastV1MSecs = msecs; _lastV1NSecs = nsecs;
	const GREGORIAN_OFFSET = 12219292800000;
	msecs += GREGORIAN_OFFSET;
	const t = BigInt(msecs) * 10000n + BigInt(nsecs);
	const timeLow = Number(t & 0xffffffffn);
	const timeMid = Number((t >> 32n) & 0xffffn);
	const timeHi = Number((t >> 48n) & 0x0fffn);
	const clockSeq = _v1ClockSeq ?? 0;
	const bytes = new Uint8Array(16);
	bytes[0] = (timeLow >>> 24) & 0xff; bytes[1] = (timeLow >>> 16) & 0xff;
	bytes[2] = (timeLow >>> 8) & 0xff; bytes[3] = timeLow & 0xff;
	bytes[4] = (timeMid >>> 8) & 0xff; bytes[5] = timeMid & 0xff;
	bytes[6] = ((timeHi & 0x0f) | 0x10) & 0xff; bytes[7] = (timeHi >>> 8) & 0xff;
	bytes[8] = ((clockSeq >>> 8) & 0x3f) | 0x80; bytes[9] = clockSeq & 0xff;
	bytes.set(_v1Node, 10);
	return bytesToUuid(bytes);
};

export const uuidV4 = () => {
	const bytes = randomBytesV4();
	bytes[6] = (bytes[6] & 0x0f) | 0x40;
	bytes[8] = (bytes[8] & 0x3f) | 0x80;
	return bytesToUuid(bytes);
};

export const uuidV7 = () => {
	if (typeof window === 'undefined') return '00000000-0000-7000-8000-000000000000';
	const bytes = safeRandomBytes(16);
	const unixTsMs = BigInt(Date.now()) & 0xffffffffffffn;
	bytes[0] = Number((unixTsMs >> 40n) & 0xffn); bytes[1] = Number((unixTsMs >> 32n) & 0xffn);
	bytes[2] = Number((unixTsMs >> 24n) & 0xffn); bytes[3] = Number((unixTsMs >> 16n) & 0xffn);
	bytes[4] = Number((unixTsMs >> 8n) & 0xffn); bytes[5] = Number(unixTsMs & 0xffn);
	bytes[6] = (bytes[6] & 0x0f) | 0x70; bytes[8] = (bytes[8] & 0x3f) | 0x80;
	return bytesToUuid(bytes);
};

export const nanoid = (len = 21): string => {
	const bytes = safeRandomBytes(len);
	return Array.from(bytes, (b) => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'[b & 63]).join('');
};

const _ulidTime = (ts: number): string => {
	const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
	let str = '';
	for (let i = 0; i < 10; i++) { str = ENCODING[ts % 32] + str; ts = Math.floor(ts / 32); }
	return str;
};

const _ulidRand = (len: number): string => {
	const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
	const bytes = safeRandomBytes(len);
	return Array.from(bytes, (b) => ENCODING[b % 32]).join('');
};

export const ulid = (): string => _ulidTime(Date.now()) + _ulidRand(10);

export const shortHex = (len = 12): string => {
	const bytes = safeRandomBytes(Math.ceil(len / 2));
	return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('').substring(0, len);
};

export const sortableId = (): string => {
	const now = new Date();
	const ts = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'),
		String(now.getDate()).padStart(2, '0'), String(now.getHours()).padStart(2, '0'),
		String(now.getMinutes()).padStart(2, '0'), String(now.getSeconds()).padStart(2, '0'),
		String(now.getMilliseconds()).padStart(3, '0')].join('');
	return ts + shortHex(6);
};

export type GeneratorKey = 'uuidV1' | 'uuidV4' | 'uuidV7' | 'uuidCompact' | 'uuidUpper' | 'guidBraced' | 'uuidUrn' | 'nanoid' | 'ulid' | 'shortHex' | 'sortableId';

export type Generator = { key: GeneratorKey; label: string; description: string; run: () => string };

export const generators: Generator[] = [
	{ key: 'uuidV1', label: 'UUID v1 (RFC 4122)', description: 'Time-based UUID: timestamp + clock sequence + node identifier.', run: () => uuidV1() },
	{ key: 'uuidV4', label: 'UUID v4 (RFC 4122)', description: 'Random UUID with hyphens.', run: () => uuidV4() },
	{ key: 'uuidV7', label: 'UUID v7 (time-ordered)', description: 'Time-ordered UUID suitable for sorting.', run: () => uuidV7() },
	{ key: 'uuidCompact', label: 'UUID v4 (Compact)', description: 'v4 UUID without hyphens, lowercase.', run: () => uuidV4().replace(/-/g, '') },
	{ key: 'uuidUpper', label: 'UUID v4 (Uppercase)', description: 'v4 UUID in uppercase with hyphens.', run: () => uuidV4().toUpperCase() },
	{ key: 'guidBraced', label: 'GUID (Braced, v4)', description: 'Windows-style: {xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx}', run: () => `{${uuidV4()}}` },
	{ key: 'uuidUrn', label: 'UUID URN (v4)', description: 'URN format: urn:uuid:xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx', run: () => `urn:uuid:${uuidV4()}` },
	{ key: 'nanoid', label: 'Nano ID', description: '21-char URL-safe ID (e.g., V1StGXR8_Z5jdHi6B-myT)', run: () => nanoid() },
	{ key: 'ulid', label: 'ULID', description: '26-char sortable ID: 01H9ZK4WJ3ABCDEFGHJKMNPQRSTV', run: ulid },
	{ key: 'shortHex', label: 'Short Hex ID', description: '12-char lowercase hex (e.g., a1b2c3d4e5f6)', run: () => shortHex() },
	{ key: 'sortableId', label: 'Sortable Time ID', description: 'Timestamp + random: 20251117143022123a1b2c3', run: sortableId }
];

export const versionFormatInfo: Record<'v1' | 'v4' | 'v7', string> = {
	v1: 'UUID v1: xxxxxxxx-xxxx-1xxx-yxxx-xxxxxxxxxxxx (time-based, includes timestamp and node).',
	v4: 'UUID v4: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx (random-based, RFC 4122).',
	v7: 'UUID v7: xxxxxxxx-xxxx-7xxx-yxxx-xxxxxxxxxxxx (time-ordered, millisecond timestamp + randomness).'
};

export const getSelectedVersionInfo = (key: GeneratorKey): string | null => {
	if (key === 'uuidV1') return versionFormatInfo.v1;
	if (key === 'uuidV4' || key === 'uuidCompact' || key === 'uuidUpper' || key === 'guidBraced' || key === 'uuidUrn') return versionFormatInfo.v4;
	if (key === 'uuidV7') return versionFormatInfo.v7;
	return null;
};

export const validateUuid = (input: string): { valid: boolean; version: string | null } => {
	const raw = input.trim();
	if (!raw) return { valid: false, version: null };
	
	let value = raw;
	const compact = /^[0-9a-f]{32}$/i;
	if (compact.test(value)) {
		value = value.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
	}
	
	const rfc4122 = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5,7][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	if (!rfc4122.test(value)) return { valid: false, version: null };
	
	const v = value[14];
	const version = v === '1' || v === '4' || v === '7' ? `v${v}` : null;
	return { valid: true, version };
};
