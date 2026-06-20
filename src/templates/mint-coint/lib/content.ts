/**
 * Content model tập trung cho template mint-coint.
 *
 * Trước đây mọi chuỗi brand-identity ("The Jack Pine", "Tom Thomson"…) bị
 * hard-code rải rác trong từng component → không customize per-page được và
 * khó tách section thành block. Gom hết về đây + resolver merge `page
 * .type_metadata` (content) lên trên DEFAULT_CONTENT.
 *
 * Quy tắc: DEFAULT_CONTENT = ĐÚNG chuỗi đang render hiện tại, nên khi
 * `content` rỗng (chưa fill ở admin) thì output không đổi một ký tự.
 */

export interface MintContent {
  /** Hero overlay — 3 dòng xếp chồng bên trái. */
  heroLine1: string;
  heroLine2: string;
  heroLine3: string;
  /** Details section. */
  detailsTitle: string;
  detailsParagraph1: string;
  detailsParagraph2: string;
  /** SKU ghost title (cuối trang). */
  skuTitle: string;
  /** Variants — editorial title (2 dòng, cách nhau bằng <br>). */
  variantTitleLine1: string;
  variantTitleLine2: string;
  /** Discover drawer — tiêu đề. */
  panelTitle: string;
}

export const DEFAULT_CONTENT: MintContent = {
  heroLine1: 'The Jack Pine',
  heroLine2: 'by Tom Thomson',
  heroLine3: '1 kilo Pure Gold Coin',
  detailsTitle: 'The Jack Pine',
  detailsParagraph1:
    "A 1006.1 g, 99.99% pure gold proof coin from the Royal Canadian Mint — a monumental tribute to Tom Thomson's iconic 1916–17 landscape, struck in a mintage of just 75 worldwide. The reverse captures the lone, windswept pine rising against a sunset over an Ontario lake; the obverse bears Steven Rosati's effigy of His Majesty King Charles III.",
  detailsParagraph2:
    "101.6 mm in diameter with a serrated edge and $2,500 face value. Encapsulated in a Royal Canadian Mint wooden case with black beauty box and serialised certificate — a piece of Canada's cultural heritage rendered in pure gold.",
  skuTitle: 'The Jack Pine 1 kilo',
  variantTitleLine1: '99.99%',
  variantTitleLine2: 'Pure Gold',
  panelTitle: 'The Jack Pine by Tom Thomson — 1 Kilo Pure Gold Coin',
};

/**
 * Merge `content` (từ page.type_metadata) lên DEFAULT_CONTENT. Chỉ nhận giá
 * trị string không rỗng để 1 field bỏ trống không xoá mất default.
 */
export function resolveContent(
  raw?: Record<string, unknown> | null
): MintContent {
  const out = { ...DEFAULT_CONTENT };
  if (!raw) return out;
  for (const key of Object.keys(DEFAULT_CONTENT) as (keyof MintContent)[]) {
    const v = raw[key];
    if (typeof v === 'string' && v.trim() !== '') out[key] = v;
  }
  return out;
}
