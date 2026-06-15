# FE integration — External landing form capture

2026-06-15 · ráp với BE `POST /v1/forms/submit` (be-ReXeR.ai PR #12,
`docs/be-fe-handoff-external-form-2026-06-15.md`).

> Mục tiêu: landing **ngoài** (mintcoin…) có form → submit về ReXeR → tạo
> **lead** (hiện ở tab Sales). **Mỗi landing 1 form khác nhau** — FE tự định
> nghĩa field, BE lưu nguyên payload (`form_data` jsonb).
>
> BE chưa deploy lên staging → FE **ráp theo contract này trước**, test khi BE
> lên (probe `POST /v1/forms/submit` hết 404).

---

## 1. Contract

```
POST {REXER_API}/v1/forms/submit          (public, KHÔNG cookie)
Headers: Content-Type: application/json
         X-ReXeR-Key: pk_live_…            (tracking key của brand)
         (Origin phải nằm trong allowed_origins của key)
```

Request:
```jsonc
{
  "page_id": "<uuid | slug>",     // landing nào (page trong ReXeR)
  "session_id": "sess-…",          // optional — lấy từ tracker nếu có
  "visitor_id": "vis-…",           // optional (mặc định = session_id)
  "fields": {                       // BẮT BUỘC — form tùy landing, field tự do
    "email": "an@example.com",      // PHẢI có email HOẶC phone
    "phone": "0901234567",
    "name": "Nguyễn An",
    "company": "ACME", "budget": "10k", "message": "..."
  },
  "utm_source": "google", "utm_medium": "cpc", "utm_campaign": "launch"
}
```

Response `201`:
```json
{ "lead_id": "uuid", "deduped": false }
```
`deduped=true` → đã có lead cùng `(page_id, contact)` trong 24h, BE refresh lead
cũ (không tạo trùng). FE coi cả 2 là "gửi thành công".

Lỗi: `400` thiếu email/phone (hoặc body sai) · `403` page không thuộc brand của
key · `404` page_id/slug sai · `429` quá rate-limit/bot.

**Quy ước field:** BE suy `contact` = `fields.email` → fallback `fields.phone`;
`name` = `fields.name`. Field khác lưu nguyên trong `form_data`. → Form FE nên
đặt key `email` / `phone` / `name` đúng tên; phần còn lại tùy ý.

---

## 2. Gọi từ landing ngoài (proxy same-origin)

Tracking key chỉ cho phép `Origin` đã đăng ký (browser không giả Origin được),
nên gọi thẳng từ localhost/dev sẽ bị 403. Dùng **proxy same-origin** giống
`/api/track` (xem `apps/mintcoin-v2/app/api/track/route.ts`).

`app/api/forms/route.ts` (Next route handler — đặt Origin hợp lệ + key server-side):
```ts
import { NextRequest } from 'next/server';

const BASE =
  process.env.REXER_API_BASE || 'https://rexerai.tekupsoftware.com';
const ORIGIN = process.env.REXER_TRACK_ORIGIN || 'https://mintcoin-v2.vercel.app';
const KEY = process.env.REXER_TRACKING_KEY || ''; // pk_live_…

export async function POST(req: NextRequest) {
  const body = await req.text();
  const r = await fetch(`${BASE}/v1/forms/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: ORIGIN,
      ...(KEY ? { 'X-ReXeR-Key': KEY } : {}),
    },
    body,
    cache: 'no-store',
  });
  return new Response(await r.text(), {
    status: r.status,
    headers: { 'content-type': r.headers.get('content-type') || 'application/json' },
  });
}
```

Client (component form trên landing):
```ts
async function submitLeadForm(fields: Record<string, unknown>) {
  // validate trước (BE cũng chặn nhưng FE nên check sớm)
  if (!fields.email && !fields.phone) {
    throw new Error('Cần email hoặc số điện thoại');
  }
  const res = await fetch('/api/forms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      page_id: REXER_PAGE_ID,            // gắn lúc publish landing
      session_id: getSessionId(),        // từ tracker hiện có
      fields,
      ...readUTM(),                       // utm_source/medium/campaign
    }),
  });
  if (!res.ok) throw new Error(`form submit failed: ${res.status}`);
  return res.json() as Promise<{ lead_id: string; deduped: boolean }>;
}
```

---

## 3. Portal Sales — hiển thị form khách để lại

`GET /v1/leads?page_id=…` nay trả thêm **`form_data`** mỗi lead. Type:

```ts
// src/services/rexer/types.ts — thêm vào interface Lead
export interface Lead {
  // ...các field cũ...
  form_data?: Record<string, unknown> | null; // payload form gốc (mỗi landing khác nhau)
}
```

Render ở lead detail (key/value động, vì mỗi form khác nhau):
```tsx
{lead.form_data && (
  <dl className='grid grid-cols-[auto_1fr] gap-x-4 gap-y-1'>
    {Object.entries(lead.form_data).map(([k, v]) => (
      <React.Fragment key={k}>
        <dt className='text-content-muted'>{k}</dt>
        <dd>{String(v)}</dd>
      </React.Fragment>
    ))}
  </dl>
)}
```
(Cột bảng Sales vẫn dùng `name/contact/score/...`; `form_data` là chi tiết mở rộng.)

---

## 4. Checklist ráp
- [ ] Route proxy `app/api/forms/route.ts` (đặt Origin + tracking key).
- [ ] Component form gọi `/api/forms`, validate email|phone, gắn `page_id`.
- [ ] `Lead.form_data` thêm vào types + render ở Sales lead detail.
- [ ] Khi BE deploy: probe `POST /v1/forms/submit` → 201; submit thử → lead hiện ở Sales kèm `form_data`.

## Ngoài scope
BE chưa có "định nghĩa form/schema per-landing" — FE tự define field + validate.
Nếu sau cần BE validate/label thì làm phase 2.
