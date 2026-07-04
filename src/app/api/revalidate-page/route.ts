import { revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';

import { verifyJwtFromRequest } from '@/server/auth/session';

export const runtime = 'nodejs';

/**
 * Purge cache SSR của trang public `/p/[slug]` sau publish/unpublish
 * (audit FE 2026-07-04 P2). `fetchPublicPage` tag mỗi fetch với
 * `['public-page', 'page:{slug}']` — body có `slug` thì purge đúng trang,
 * không có thì purge toàn bộ public pages (đủ rẻ: chỉ là refetch lần xem
 * kế tiếp). Yêu cầu session hợp lệ vì `/api/*` nằm ngoài middleware.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const payload = await verifyJwtFromRequest(req);
  if (!payload?.sub) {
    return NextResponse.json({ success: false }, { status: 401 });
  }
  let slug: string | undefined;
  try {
    const body = (await req.json()) as { slug?: unknown };
    if (typeof body?.slug === 'string' && body.slug) slug = body.slug;
  } catch {
    // Không có body — purge tag chung.
  }
  revalidateTag(slug ? `page:${slug}` : 'public-page');
  return NextResponse.json({ success: true });
}
