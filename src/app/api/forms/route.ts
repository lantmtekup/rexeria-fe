import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'nodejs';

/**
 * Nhận lead từ form của một block trên trang public rồi đẩy sang BE
 * `POST /v1/forms/submit`.
 *
 * VÌ SAO ĐI QUA SERVER CHỨ KHÔNG GỌI THẲNG BE:
 *
 *  1. `/v1/forms/submit` và `/v1/track` đều nằm sau `TrackingKeyAuth` — đo thật
 *     trên prod 2026-09-08: cả hai trả 401 `missing tracking key` khi gọi trần,
 *     trong khi `/v1/analytics/events` (đường tracker đang dùng) thì 204. Tức
 *     là tracker chạy được KHÔNG có nghĩa là lead gửi được.
 *  2. Tracking key là bí mật của brand. Nhúng vào HTML trang public thì ai cũng
 *     đọc được và ghi được event giả cho brand đó. Giữ ở server, trình duyệt
 *     chỉ thấy `/api/forms`.
 *  3. Lead cần một câu trả lời THẬT (thành công / trùng / thiếu đồng ý), khác
 *     hẳn analytics fire-and-forget. `tracker.emit()` gom lô rồi bắn đi và
 *     không ai đọc kết quả — dùng nó cho lead là mất lead trong im lặng.
 *
 * ĐIỀU KIỆN VẬN HÀNH: prod chạy với `app.allow_anonymous_ingest: true`
 * (`config/prod.yaml` ở repo BE) — submit không kèm khoá vẫn được nhận, nhưng
 * CHỈ cho trang ĐÃ XUẤT BẢN (`assertIngestPageAllowed`). Đây là cách duy nhất
 * chạy được đa brand: một tracking key gắn với MỘT brand, page khác brand của
 * khoá bị 403, nên không khoá nào phục vụ được mọi trang hosted.
 *
 * `REXER_TRACKING_KEY` vẫn được hỗ trợ và là đường TỐT HƠN khi dùng được: có
 * khoá thì submit đi đường xác thực, không phụ thuộc cờ ẩn danh. Chỉ đặt được
 * cho triển khai một brand. Khi BE trả khoá publishable theo từng trang trong
 * `/v1/public/pages/{slug}` thì bỏ cờ ẩn danh và gắn khoá theo trang.
 *
 * Route này CỐ Ý không ghi nội dung form ra log: đó là PII của khách.
 */

/** Đường BE — cùng nguồn env với `rx()`, không tự đoán URL prod. */
const beBase = (): string | null =>
  process.env.NEXT_PUBLIC_REXER_API ?? process.env.REXER_API ?? null;

/** BE `core.ContactFromForm`: email trước, không có thì phone. */
const contactFromFields = (fields: Record<string, string>): string => {
  const email = fields.email?.trim();
  if (email) return email;
  return fields.phone?.trim() ?? '';
};

/** `/p/abc/lien-he` → `abc`. Chỉ dùng khi client không gửi được `page_id`. */
const slugFromPath = (path: string): string | null =>
  path.match(/\/p\/([^/?#]+)/)?.[1] ?? null;

type FormsRequestBody = {
  page_id?: unknown;
  page_slug?: unknown;
  fields?: unknown;
  consent?: unknown;
  session_id?: unknown;
  visitor_id?: unknown;
  utm_source?: unknown;
  utm_medium?: unknown;
  utm_campaign?: unknown;
};

/** Giữ lại đúng các cặp chuỗi không rỗng — form có thể gửi kèm rác. */
const readFields = (raw: unknown): Record<string, string> => {
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v !== 'string') continue;
    const trimmed = v.trim();
    if (trimmed) out[k] = trimmed;
  }
  return out;
};

const str = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() ? v.trim() : undefined;

const fail = (code: string, message: string, status: number) =>
  NextResponse.json({ ok: false, code, message }, { status });

export async function POST(req: NextRequest): Promise<NextResponse> {
  const base = beBase();
  if (!base) {
    return fail('BE_NOT_CONFIGURED', 'Backend URL chưa cấu hình', 500);
  }

  let body: FormsRequestBody;
  try {
    body = (await req.json()) as FormsRequestBody;
  } catch {
    return fail('BAD_JSON', 'Body không phải JSON hợp lệ', 400);
  }

  const fields = readFields(body.fields);
  if (Object.keys(fields).length === 0) {
    return fail('EMPTY_FORM', 'Chưa có thông tin nào được điền', 400);
  }

  // Chặn ngay ở đây thay vì để BE trả 400: cùng một luật (`ContactFromForm`),
  // nhưng người điền form nhận được câu tiếng Việt thay vì thông báo của API.
  if (!contactFromFields(fields)) {
    return fail('NO_CONTACT', 'Cần ít nhất email hoặc số điện thoại', 400);
  }

  const pageSlug = str(body.page_slug);
  const target =
    str(body.page_id) ??
    (pageSlug ? (slugFromPath(pageSlug) ?? pageSlug) : null);
  if (!target) {
    return fail('NO_PAGE', 'Không xác định được trang gửi form', 400);
  }

  const key = process.env.REXER_TRACKING_KEY?.trim();
  let res: Response;
  try {
    res = await fetch(`${base.replace(/\/$/, '')}/v1/forms/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Anti-spam của BE đọc User-Agent; fetch phía server không tự gắn.
        'User-Agent': req.headers.get('user-agent') ?? 'rexer-forms-proxy',
        ...(key ? { 'X-ReXeR-Key': key } : {}),
      },
      body: JSON.stringify({
        page_id: target,
        fields,
        // BE chỉ ghi `consent_at` khi cờ này true; trang nào có điểm đo
        // `identified` mà thiếu nó sẽ bị từ chối 400 — đúng ý đồ.
        consent: body.consent === true,
        session_id: str(body.session_id) ?? '',
        visitor_id: str(body.visitor_id) ?? '',
        utm_source: str(body.utm_source) ?? '',
        utm_medium: str(body.utm_medium) ?? '',
        utm_campaign: str(body.utm_campaign) ?? '',
      }),
    });
  } catch {
    return fail(
      'UPSTREAM_UNREACHABLE',
      'Không gửi được, thử lại giúp mình',
      502
    );
  }

  const payload = (await res.json().catch(() => null)) as {
    lead_id?: string;
    deduped?: boolean;
    code?: string;
    message?: string;
  } | null;

  if (!res.ok) {
    // Nói đúng cái đã xảy ra thay vì "gửi thất bại" chung chung: thiếu đồng ý
    // và trang chưa publish là hai lỗi người vận hành sửa được, nhưng chỉ khi
    // nhìn thấy chúng.
    return NextResponse.json(
      {
        ok: false,
        code: payload?.code ?? 'UPSTREAM_ERROR',
        message: payload?.message ?? 'Gửi không thành công',
      },
      { status: res.status }
    );
  }

  return NextResponse.json({
    ok: true,
    lead_id: payload?.lead_id ?? null,
    deduped: payload?.deduped === true,
  });
}
