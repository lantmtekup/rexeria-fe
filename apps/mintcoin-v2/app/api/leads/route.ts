import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Lead capture endpoint for the Jack Pine coin landing.
// Stores submissions so sales can follow up. Default sink = a JSON file
// under /data + server log. NOTE: on serverless (Vercel) the filesystem
// is ephemeral/read-only — for production delivery wire one of:
//   • Supabase `leads` table insert (anon key + RLS insert policy)
//   • Email / CRM webhook (Resend, HubSpot, etc.)
// The console.log below always fires, so leads are visible in server logs.

export const runtime = 'nodejs';

interface LeadPayload {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s().-]{6,}$/;

export async function POST(req: Request) {
  let body: LeadPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const name = body.name?.trim() ?? '';
  const email = body.email?.trim() ?? '';
  const phone = body.phone?.trim() ?? '';
  const message = body.message?.trim() ?? '';

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: 'A valid email is required.' },
      { status: 400 }
    );
  }
  if (!PHONE_RE.test(phone)) {
    return NextResponse.json(
      { error: 'A valid phone number is required.' },
      { status: 400 }
    );
  }

  const lead = {
    name,
    email,
    phone,
    message,
    source: 'jack-pine-coin-landing',
    createdAt: new Date().toISOString(),
  };

  // Always log — visible in dev console + Vercel runtime logs.
  // eslint-disable-next-line no-console -- lead được lưu qua log trên serverless
  console.log('[lead]', JSON.stringify(lead));

  // Best-effort file persistence (works locally; no-op-safe on serverless).
  try {
    const dir = path.join(process.cwd(), 'data');
    const file = path.join(dir, 'leads.json');
    await fs.mkdir(dir, { recursive: true });
    let existing: unknown[] = [];
    try {
      existing = JSON.parse(await fs.readFile(file, 'utf8'));
    } catch {
      existing = [];
    }
    existing.push(lead);
    await fs.writeFile(file, JSON.stringify(existing, null, 2), 'utf8');
  } catch (err) {
    // Filesystem unavailable (serverless) — lead still captured in logs.
    // eslint-disable-next-line no-console -- cảnh báo chủ đích khi FS không ghi được
    console.warn('[lead] file persistence skipped:', (err as Error).message);
  }

  return NextResponse.json({ ok: true });
}
