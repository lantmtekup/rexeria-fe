/**
 * Normalizers for V1 → V2 product schema. BE may return either shape during
 * the migration window (per `docs/product-attributes-and-template-spec.md`
 * §2 / §10). All FE code should call `normalizeProduct()` immediately after
 * loading and trust V2 shape downstream. Save path goes through serializers
 * that stay V2.
 */
import type {
  Product,
  ProductCertification,
  ProductColor,
  ProductFeature,
} from './types';

// ── Certifications ─────────────────────────────────────────────────────────

/**
 * V1 wire shape was `string[]`; V2 is `ProductCertification[]`. Wrap legacy
 * strings into `{name: <s>}` so the rest of the FE can rely on V2 shape.
 */
export function normalizeCertifications(
  raw: unknown
): ProductCertification[] | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (!Array.isArray(raw)) return undefined;
  if (raw.length === 0) return [];

  // Heuristic: if first item is a string, treat whole array as legacy V1.
  if (typeof raw[0] === 'string') {
    return (raw as string[])
      .filter(s => typeof s === 'string' && s.trim())
      .map(s => ({ name: s.trim() }));
  }

  // Otherwise assume V2 objects; pick known fields defensively.
  return (raw as Array<Record<string, unknown>>)
    .map(o => {
      const name = typeof o.name === 'string' ? o.name : '';
      if (!name) return null;
      const cert: ProductCertification = { name };
      if (typeof o.media_id === 'string') cert.media_id = o.media_id;
      if (typeof o.url === 'string') cert.url = o.url;
      if (typeof o.description === 'string') cert.description = o.description;
      return cert;
    })
    .filter((c): c is ProductCertification => c !== null);
}

// ── Colors ─────────────────────────────────────────────────────────────────

/**
 * Ensure exactly one color has `is_default=true` (set the first one if none
 * marked). Also fill `sort_order` from array index when missing.
 */
export function normalizeColors(
  raw: ProductColor[] | undefined
): ProductColor[] | undefined {
  if (!raw || raw.length === 0) return raw;
  const hasDefault = raw.some(c => c.is_default);
  return raw.map((c, idx) => ({
    ...c,
    is_default: c.is_default ?? (!hasDefault && idx === 0),
    sort_order: c.sort_order ?? idx,
  }));
}

// ── Features ───────────────────────────────────────────────────────────────

/**
 * Pass-through with defensive cleanup — drop empty labels, ensure `icon_name`
 * and `media_id` aren't both set (latter wins per spec convention).
 */
export function normalizeFeatures(
  raw: ProductFeature[] | undefined
): ProductFeature[] | undefined {
  if (!raw) return undefined;
  return raw
    .filter(f => f.label && f.label.trim())
    .map(f => {
      const out: ProductFeature = {
        label: f.label,
        description: f.description ?? '',
      };
      // media_id wins over icon_name when both present (renderer prefers media)
      if (f.media_id) out.media_id = f.media_id;
      else if (f.icon_name) out.icon_name = f.icon_name;
      return out;
    });
}

// ── Whole product ──────────────────────────────────────────────────────────

/**
 * Normalize a product from BE (any V1/V2 wire mix) into a uniform V2 shape.
 * Idempotent — calling twice is safe.
 */
export function normalizeProduct(p: Product): Product {
  return {
    ...p,
    colors: normalizeColors(p.colors),
    features: normalizeFeatures(p.features),
    // BE may still send `certifications: string[]` until full migration.
    // We accept `unknown` here to gracefully cast.
    certifications: normalizeCertifications(
      p.certifications as unknown as ProductCertification[] | string[]
    ),
  };
}
