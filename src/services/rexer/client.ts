/**
 * Minimal fetch client for the REXER backend.
 *
 * Browser: calls go through the Next.js rewrite `/api/rexer/*` →
 * `{NEXT_PUBLIC_REXER_API}/v1/*` (same-origin, cookies auto-sent).
 *
 * Server (RSC / route handlers): Node `fetch` cannot use relative `/api/rexer`,
 * so we call the BE absolute URL and forward the incoming Cookie header.
 *
 * Use `rx<ResponseType>(path, opts)` for any request.
 */
import type { RxErrorBody } from './types';

const BASE = '/api/rexer';

export class RxApiError extends Error {
  code: string;
  status: number;
  details?: unknown;
  requestId?: string;
  constructor(body: RxErrorBody, status: number) {
    super(body.message || body.code || 'REXER API error');
    this.code = body.code;
    this.status = status;
    this.details = body.details;
    this.requestId = body.request_id;
  }
}

export interface RxFetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** If true, don't parse JSON — return the raw Response */
  raw?: boolean;
  /** Extra query params */
  query?: Record<string, string | number | boolean | undefined | null>;
}

const now = (): number =>
  typeof performance !== 'undefined' ? performance.now() : Date.now();

/**
 * Dev-only timing log for every BE call — helps spot which request is stalling
 * navigation. Logged in the browser console only; no-op in production.
 *   ✓ fast (<600ms) · ⚠️ slow (>600ms) · 🐢 very slow (>1500ms)
 */
function logTiming(
  method: string,
  path: string,
  status: number | 'ERR',
  ms: number
): void {
  if (process.env.NODE_ENV === 'production') return;
  if (typeof window === 'undefined') return;
  const tag = ms > 1500 ? '🐢' : ms > 600 ? '⚠️' : '✓';
  const color = ms > 1500 ? '#dc2626' : ms > 600 ? '#d97706' : '#16a34a';
  // eslint-disable-next-line no-console
  console.log(
    `%c[rx ${tag}] ${method} ${path} → ${status} %c${Math.round(ms)}ms`,
    `color:${color};font-weight:600`,
    `color:${color};font-weight:700`
  );
}

function buildProxyUrl(path: string, query?: RxFetchOptions['query']): string {
  const url = path.startsWith('http')
    ? path
    : `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  if (!query) return url;
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v == null || v === '') continue;
    usp.append(k, String(v));
  }
  const qs = usp.toString();
  return qs ? `${url}?${qs}` : url;
}

/** Absolute BE URL for server-side calls (`/api/rexer/foo` → `{BE}/v1/foo`). */
function toUpstreamUrl(proxyUrl: string): string {
  if (proxyUrl.startsWith('http')) return proxyUrl;
  const be = (
    process.env.NEXT_PUBLIC_REXER_API ??
    process.env.REXER_API ??
    ''
  ).replace(/\/+$/, '');
  if (!be) {
    throw new Error(
      'NEXT_PUBLIC_REXER_API (hoặc REXER_API) chưa cấu hình — server-side rx() cần BE URL'
    );
  }
  const suffix = proxyUrl.replace(/^\/api\/rexer/, '') || '/';
  return `${be}/v1${suffix.startsWith('/') ? suffix : `/${suffix}`}`;
}

async function serverCookieHeader(): Promise<string> {
  try {
    const { cookies } = await import('next/headers');
    const jar = await cookies();
    return jar
      .getAll()
      .map(c => `${c.name}=${c.value}`)
      .join('; ');
  } catch {
    return '';
  }
}

export async function rx<T>(
  path: string,
  opts: RxFetchOptions = {}
): Promise<T> {
  const { body, raw, query, headers, ...rest } = opts;
  const isServer = typeof window === 'undefined';
  const proxyUrl = buildProxyUrl(path, query);
  const url = isServer ? toUpstreamUrl(proxyUrl) : proxyUrl;

  const mergedHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string> | undefined),
  };

  if (isServer) {
    const cookie = await serverCookieHeader();
    if (cookie) mergedHeaders.cookie = cookie;
  }

  const init: RequestInit = {
    credentials: 'include',
    cache: 'no-store',
    ...rest,
    headers: mergedHeaders,
  };
  if (body !== undefined) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const method = (rest.method ?? 'GET').toUpperCase();
  const t0 = now();
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (err) {
    logTiming(method, path, 'ERR', now() - t0);
    throw err;
  }
  logTiming(method, path, res.status, now() - t0);
  if (raw) return res as unknown as T;

  const text = await res.text();
  const parsed = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const eb = (parsed as RxErrorBody) ?? {
      code: `HTTP_${res.status}`,
      message: res.statusText,
    };
    throw new RxApiError(eb, res.status);
  }
  return parsed as T;
}
