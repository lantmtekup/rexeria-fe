import { NextRequest } from 'next/server';

// Same-origin proxy for ReXeR event tracking (POST /v1/track).
// The publishable tracking key only whitelists the prod domain as an allowed
// Origin, and a browser can't forge the Origin header — so direct calls from
// localhost dev are rejected (403 "origin not allowed"). This server route
// forwards the event with the allowed Origin set explicitly, so tracking works
// identically in local dev and on the deployed domain.
const BASE =
  process.env.REXER_API_BASE ||
  process.env.NEXT_PUBLIC_REXER_API_BASE ||
  'https://rexerai.tekupsoftware.com';

// The Origin the ReXeR tracking key is registered against (its prod domain).
const TRACK_ORIGIN =
  process.env.REXER_TRACK_ORIGIN || 'https://mintcoin.vercel.app';

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    const key =
      req.headers.get('x-rexer-key') ||
      (() => {
        try {
          return (JSON.parse(bodyText) as { key?: string }).key || '';
        } catch {
          return '';
        }
      })();

    const upstream = await fetch(`${BASE}/v1/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: TRACK_ORIGIN,
        ...(key ? { 'X-ReXeR-Key': key } : {}),
      },
      body: bodyText,
      cache: 'no-store',
    });

    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: {
        'content-type':
          upstream.headers.get('content-type') || 'application/json',
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'track_proxy_failed' }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }
}
