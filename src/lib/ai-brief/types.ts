/**
 * "Brief cho AI" dùng chung giữa Portal V2 Automation và AiAutomation
 * (client-portal) — gói brand + product + ảnh trước khi gọi các endpoint
 * apply-product/automate, cùng tinh thần với `InsightBrief`
 * (`src/services/rexer/types.ts`): field nào không có dữ liệu thì bỏ qua,
 * không tự bịa mặc định.
 */

export type AiBrandBrief = {
  name?: string;
  /** `identity.value_prop`. */
  tagline?: string;
  /** `identity.tones`. */
  tone?: string[];
  /** "category vs against because" — gộp từ `identity.positioning`. */
  positioning?: string;
  colors?: { name: string; hex: string; role: string }[];
  fonts?: { display?: string; body?: string };
  /** Resolved từ `visual.logos[0].media_id` — không phải id thô. */
  logo_url?: string;
};

export type AiProductBrief = {
  title: string;
  body?: string;
  benefits?: string[];
  features?: string[];
  claims?: { text: string; proof: string }[];
  price_text?: string | null;
};

export type AiBrief = {
  brand?: AiBrandBrief;
  product?: AiProductBrief;
  /** URL https — logo brand rồi đến ảnh sản phẩm. */
  assets?: { items: string[] };
  /** Định hướng tự do user gõ thêm. */
  note?: string;
};
