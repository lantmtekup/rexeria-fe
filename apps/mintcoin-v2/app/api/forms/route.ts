/* eslint-disable no-console -- proxy server-side: mock/debug logging (xem docs/fe-external-form-integration). */
import { NextRequest } from 'next/server';
import {
  REXER_API_BASE,
  REXER_TRACKING_KEY,
} from '@/app/components/analytics/analytics-data';

// Same-origin proxy for ReXeR external-form capture (POST /v1/forms/submit).
// Contract: docs/fe-external-form-integration-2026-06-15.md.
// Why a proxy: the tracking key only whitelists the prod domain as an allowed
// Origin and the browser can't forge the Origin header, so we set Origin + key
// server-side here, identical to the /api/track proxy. Also forwards a real
// User-Agent (the backend rejects bot-like UAs).
const TRACK_ORIGIN =
  process.env.REXER_TRACK_ORIGIN || 'https://mintcoin-v2.vercel.app';

// FE-only test mode: while the BE /v1/forms/submit is not yet open to the
// publishable key (returns 401), set REXER_FORMS_MOCK=1 to fake a 201 success
// so the whole form UX (validate, loading, "Thank you", error) can be tested
// without the backend. Remove the env flag once the BE is live.
const MOCK = process.env.REXER_FORMS_MOCK === '1';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    if (MOCK) {
      // Validate the same contract the BE enforces (email OR phone) so the test
      // surfaces real validation errors, then return a synthetic lead.
      let fields: Record<string, unknown> = {};
      try {
        fields = (JSON.parse(body)?.fields ?? {}) as Record<string, unknown>;
      } catch {
        /* fall through to 400 below */
      }
      if (!fields.email && !fields.phone) {
        return Response.json(
          { error: 'email or phone required' },
          { status: 400 }
        );
      }
      console.log('[forms:mock] received', body);
      return Response.json(
        { lead_id: `mock-${Date.now().toString(36)}`, deduped: false },
        { status: 201 }
      );
    }

    const upstream = await fetch(`${REXER_API_BASE}/v1/forms/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: TRACK_ORIGIN,
        'user-agent': req.headers.get('user-agent') || 'Mozilla/5.0',
        ...(REXER_TRACKING_KEY ? { 'X-ReXeR-Key': REXER_TRACKING_KEY } : {}),
      },
      body,
      cache: 'no-store',
    });
    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: {
        'content-type':
          upstream.headers.get('content-type') || 'application/json',
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'forms_proxy_failed' }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }
}
