import { NativeModules, Platform, Linking } from 'react-native';

type JSONValue = string | number | boolean | null | JSONValue[] | { [k: string]: JSONValue };
export type LinkData = Record<string, JSONValue>;
export type OnSuccess = (data: LinkData) => void;
export type OnError = (msg: string) => void;

const { SddlNative } = NativeModules as any;

const BASE = 'https://sddl.me/api';
const UA   = 'SDDLSDK-ReactNative/1.0';

let resolving = false;
let ulArrived = false;
let coldTimer: any = null;
let linkSub: { remove(): void } | null = null;

export const Sddl = {
    async init(opts: { onSuccess: OnSuccess; onError?: OnError }) {
        const { onSuccess, onError = () => {} } = opts;

        linkSub?.remove();
        linkSub = Linking.addEventListener('url', ({ url }) => {
            ulArrived = true;
            cancelColdStart();
            if (!beginSingleFlight()) return;
            resolveFromUrl(url, onSuccess, onError);
        });

        try {
            const initial = await Linking.getInitialURL();
            if (initial) {
                ulArrived = true;
                cancelColdStart();
                if (!beginSingleFlight()) return;
                resolveFromUrl(initial, onSuccess, onError);
                return;
            }
        } catch {
        }

        scheduleColdStart(onSuccess, onError);
    },

    dispose() {
        linkSub?.remove();
        linkSub = null;
        cancelColdStart();
        resolving = false;
    },
};

// --- orchestration ----------------------------------------------------------

function scheduleColdStart(onSuccess: OnSuccess, onError: OnError) {
    cancelColdStart();
    coldTimer = setTimeout(async () => {
        if (ulArrived || resolving) return;
        resolving = true;
        try {
            const clip = await safeReadClipboard();
            const key = isValidKey(clip) ? clip! : null;
            if (key) {
                const ok = await getDetails(key, onSuccess, onError);
                if (!ok) await getTryDetails(onSuccess, onError);
            } else {
                await getTryDetails(onSuccess, onError);
            }
        } finally {
            finish();
        }
    }, 300);
}

function cancelColdStart() {
    if (coldTimer) {
        clearTimeout(coldTimer);
        coldTimer = null;
    }
}

function parseKey(url: string): string | null {
    const withoutHash = url.split('#')[0];
    const qIdx = withoutHash.indexOf('?');
    const pathPart = qIdx >= 0 ? withoutHash.slice(0, qIdx) : withoutHash;
    const pathOnly = pathPart.replace(/^[a-zA-Z][a-zA-Z0-9+\-.]*:\/\/[^/]+/, '');
    const first = (pathOnly.split('/').filter(Boolean)[0] || '').trim();
    return isValidKey(first) ? first : null;
}

async function resolveFromUrl(urlStr: string, onSuccess: OnSuccess, onError: OnError) {
    try {
        const key = parseKey(urlStr);
        if (key) {
            const ok = await getDetails(key, onSuccess, onError);
            if (!ok) await getTryDetails(onSuccess, onError);
        } else {
            await getTryDetails(onSuccess, onError);
        }
    } catch {
        await getTryDetails(onSuccess, onError);
    } finally {
        finish();
    }
}

// --- networking -------------------------------------------------------------

async function getDetails(
    key: string,
    onSuccess: OnSuccess,
    onError: OnError
): Promise<boolean> {
    const url = `${BASE}/${encodeURIComponent(key)}/details`;
    try {
        const resp = await fetch(url, { method: 'GET', headers: await commonHeaders() });
        if (resp.status === 200) { onSuccess(await safeJson(resp)); return true; }
        if (resp.status === 404 || resp.status === 410) return false;
        onError(`HTTP ${resp.status}`); return false;
    } catch (e: any) {
        onError(`Network error: ${String(e?.message || e)}`);
        return false;
    }
}

async function getTryDetails(onSuccess: OnSuccess, onError: OnError) {
    try {
        const resp = await fetch(`${BASE}/try/details`, { method: 'GET', headers: await commonHeaders() });
        if (resp.status === 200) onSuccess(await safeJson(resp));
        else onError(`TRY ${resp.status}`);
    } catch (e: any) {
        onError(`try/details error: ${String(e?.message || e)}`);
    }
}

// --- headers & helpers ------------------------------------------------------

async function commonHeaders(): Promise<Record<string, string>> {
    const h: Record<string, string> = {
        'User-Agent': UA,
        'X-Device-Platform': Platform.OS === 'ios' ? 'iOS' : 'Android',
    };
    try {
        const id: string | null = await SddlNative?.getAppIdentifier?.();
        if (id && id.length) h['X-App-Identifier'] = id;
    } catch {}
    return h;
}

function isValidKey(s?: string | null): s is string {
    return !!s && /^[A-Za-z0-9_-]{4,64}$/.test(s);
}

async function safeReadClipboard(): Promise<string | null> {
    try {
        const s: string | null = await SddlNative?.readClipboard?.();
        const t = (s || '').trim();
        return t.length ? t : null;
    } catch { return null; }
}

function beginSingleFlight(): boolean {
    if (resolving) return false;
    resolving = true;
    return true;
}

function finish() {
    resolving = false;
    cancelColdStart();
}

async function safeJson(resp: Response) {
    const t = await resp.text();
    try { return JSON.parse(t); } catch { return {}; }
}

export default Sddl;
