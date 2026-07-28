import { NextRequest } from 'next/server';

// Server-side proxy to the ReXeR backend for the authed analytics read APIs.
// Those endpoints need a logged-in cookie session (the publishable tracking key
// is write-only — it can't read), and they have no CORS, so the browser can't
// call them directly. This proxy authenticates server→server with a ReXeR admin
// account (login once, cache the session), removing any browser-login step.
// Falls back to forwarding the visitor's own cookie when no admin creds are set.
const BASE =
  process.env.REXER_API_BASE ||
  process.env.NEXT_PUBLIC_REXER_API_BASE ||
  'https://rexerai.tekupsoftware.com';

// Server-only creds (NOT NEXT_PUBLIC — never shipped to the client).
const ADMIN_EMAIL = process.env.REXER_ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.REXER_ADMIN_PASSWORD || '';

// Cached session across requests (module scope persists per server instance).
let cachedSession = '';

async function login(): Promise<string> {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return '';
  const res = await fetch(`${BASE}/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'user-agent': 'Mozilla/5.0',
    },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    cache: 'no-store',
  });
  if (!res.ok) return '';
  // Session id comes back in the body; cookie is also Set-Cookie but body is
  // simpler to read server-side.
  const data = (await res.json().catch(() => null)) as {
    session?: { id?: string };
  } | null;
  return data?.session?.id || '';
}

function buildCookie(req: NextRequest): string {
  // Prefer the server-side admin session; otherwise forward the visitor's cookie.
  if (cachedSession) return `rexer_session=${cachedSession}`;
  return req.headers.get('cookie') || '';
}

async function callUpstream(path: string, search: string, cookie: string) {
  return fetch(`${BASE}/v1/${path}${search}`, {
    headers: { cookie, 'user-agent': 'Mozilla/5.0' },
    cache: 'no-store',
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> } // Next 15: params là Promise
) {
  const path = (await params).path.join('/');
  const search = req.nextUrl.search;
  try {
    // Ensure we have an admin session if creds are configured.
    if ((ADMIN_EMAIL || ADMIN_PASSWORD) && !cachedSession) {
      cachedSession = await login();
    }

    let upstream = await callUpstream(path, search, buildCookie(req));

    // Session expired/invalid → re-login once and retry.
    if (upstream.status === 401 && (ADMIN_EMAIL || ADMIN_PASSWORD)) {
      cachedSession = await login();
      if (cachedSession) {
        upstream = await callUpstream(
          path,
          search,
          `rexer_session=${cachedSession}`
        );
      }
    }

    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: {
        'content-type':
          upstream.headers.get('content-type') || 'application/json',
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'upstream_unreachable' }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }
}
