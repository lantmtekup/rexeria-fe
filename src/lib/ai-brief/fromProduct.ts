import type { AutomationProduct } from '@/lib/portal-v2/automation/types';
import type { ProductAsset } from '@/lib/portal-v2/product/types';
import type { AiProductBrief } from './types';

/**
 * `AutomationProduct` → `AiProductBrief` — mapping thuần, field rỗng thì bỏ
 * qua thay vì gửi mảng/chuỗi rỗng lên AI.
 */
export const buildProductBrief = (p: AutomationProduct): AiProductBrief => ({
  title: p.title,
  ...(p.body ? { body: p.body } : {}),
  ...(p.benefits.length ? { benefits: p.benefits } : {}),
  ...(p.features.length ? { features: p.features } : {}),
  ...(p.claims.length ? { claims: p.claims } : {}),
  ...(p.priceText ? { price_text: p.priceText } : {}),
});

/**
 * Ảnh của một sản phẩm = asset kiểu IMG đã "home" về đúng sản phẩm đó, đã có
 * sẵn URL CDN public — không cần gọi lại `media.list` như logo brand.
 */
export const productImageUrls = (
  assets: ProductAsset[],
  productId: string
): string[] =>
  assets
    .filter(
      a =>
        a.kind === 'IMG' &&
        a.home.scope === 'product' &&
        a.home.ref === productId &&
        a.url
    )
    .map(a => a.url as string);
