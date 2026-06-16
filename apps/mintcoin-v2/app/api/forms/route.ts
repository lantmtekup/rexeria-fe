/* eslint-disable no-console -- proxy server-side: log curl repro + status để BE verify tracking key (xem docs/fe-external-form-integration). */
import { NextRequest } from 'next/server';
import {
  REXER_API_BASE,
  REXER_TRACKING_KEY,
} from '@/app/components/analytics/analytics-data';

// Same-origin proxy for ReXeR external-form capture (POST /v1/forms/submit).
// Contract: docs/fe-external-form-integration-2026-06-15.md.
// Why a proxy: the tracking key only whitelists the prod domain as an allowed
// Origin and the browser can't forge the Origin header — so we set Origin + key
// server-side here, identical to the /api/track proxy. Also forwards a real
// User-Agent (the backend rejects bot-like UAs).
const TRACK_ORIGIN =
  process.env.REXER_TRACK_ORIGIN || 'https://mintcoin-v2.vercel.app';

// Mask the key so logs show enough to identify it without leaking the secret.
const maskKey = (k: string) =>
  k ? `${k.slice(0, 12)}…${k.slice(-4)} (len ${k.length})` : '(none)';

// Shell-quote a value safely (handles single quotes in user input).
const shq = (s: string) => `'${String(s).replace(/'/g, "'\\''")}'`;

export async function POST(req: NextRequest) {
  const url = `${REXER_API_BASE}/v1/forms/submit`;
  try {
    const body = await req.text();
    const sentHeaders = {
      'Content-Type': 'application/json',
      Origin: TRACK_ORIGIN,
      'user-agent': req.headers.get('user-agent') || 'Mozilla/5.0',
      ...(REXER_TRACKING_KEY ? { 'X-ReXeR-Key': REXER_TRACKING_KEY } : {}),
    };

    // ── outgoing ──────────────────────────────────────────────────────────
    console.log('[forms] → POST', url);
    console.log('[forms]   headers', {
      Origin: sentHeaders.Origin,
      'X-ReXeR-Key': maskKey(REXER_TRACKING_KEY),
      'user-agent': sentHeaders['user-agent'],
    });
    console.log('[forms]   body', body);

    // Reproduce the EXACT upstream request as a runnable cURL (real key/Origin/
    // UA the BE actually saw) so the key can be verified with the backend team.
    const curl = [
      `curl -i -X POST ${shq(url)}`,
      `-H ${shq('Content-Type: application/json')}`,
      `-H ${shq(`Origin: ${sentHeaders.Origin}`)}`,
      `-H ${shq(`User-Agent: ${sentHeaders['user-agent']}`)}`,
      ...(REXER_TRACKING_KEY
        ? [`-H ${shq(`X-ReXeR-Key: ${REXER_TRACKING_KEY}`)}`]
        : []),
      `--data ${shq(body)}`,
    ].join(' \\\n  ');

    const upstream = await fetch(url, {
      method: 'POST',
      headers: sentHeaders,
      body,
      cache: 'no-store',
    });

    const text = await upstream.text();
    // ── response ──────────────────────────────────────────────────────────
    console.log(
      `[forms] ← ${upstream.status} ${upstream.statusText} from ${url}`
    );
    console.log('[forms]   resp body', text);

    return new Response(text, {
      status: upstream.status,
      headers: {
        'content-type':
          upstream.headers.get('content-type') || 'application/json',
        // URL-encoded (header-safe: no newlines/non-ASCII). FE decodes for copy.
        'x-debug-curl': encodeURIComponent(curl),
      },
    });
  } catch (err) {
    console.error('[forms] ✖ proxy error hitting', url, err);
    return new Response(JSON.stringify({ error: 'forms_proxy_failed' }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }
}
