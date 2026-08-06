import type {
  AutomationExperience,
  AutomationProduct,
  FunnelRole,
  Readiness,
  ReadinessSlot,
} from '@/lib/portal-v2/automation/types';

/**
 * Chấm điểm sẵn sàng — port `AUTO_SLOTS` + `autoReadiness` của demo.
 *
 * Mỗi vai phễu hỏi record sản phẩm đúng MỘT câu, và câu đó phải trả lời được
 * từ dữ liệu sản phẩm chứ không phải từ suy đoán. Thiếu là gap, và gap được
 * nói thẳng chứ không lấp bằng nội dung bịa — đó là điều kiện plan đặt ra
 * ("Báo gap trung thực").
 */
const SLOT_CHECKS: Record<
  FunnelRole,
  { needKey: string; ok: (p: AutomationProduct) => boolean }
> = {
  ATT: { needKey: 'needCover', ok: p => p.hasCover },
  EXP: { needKey: 'needImagery', ok: p => p.imageCount > 1 },
  EDU: {
    needKey: 'needCopy',
    ok: p => p.body.trim().length > 0 && p.benefits.length > 0,
  },
  TRU: { needKey: 'needClaim', ok: p => p.provenClaims > 0 },
  CON: {
    needKey: 'needSku',
    ok: p => p.status === 'active' && p.variantCount > 0,
  },
};

/** Thứ tự phễu — giữ cố định để hàng chip không nhảy giữa các thẻ. */
const ROLE_ORDER: FunnelRole[] = ['ATT', 'EXP', 'EDU', 'TRU', 'CON'];

/** Lớp sản phẩm = đoạn cuối đường phân loại; cha = đoạn kế cuối. */
export const categoryLeaf = (category: string): string =>
  category.split('>').pop()?.trim() || category.trim();

export const categoryParent = (category: string): string => {
  const parts = category.split('>').map(s => s.trim());
  return parts[parts.length - 2] || categoryLeaf(category);
};

export type EligibleResult = {
  items: AutomationProduct[];
  /**
   * Sản phẩm gốc chưa được phân loại nên KHÔNG lọc theo lớp được — danh sách
   * đang là "mọi sản phẩm khác".
   *
   * Phải nói ra: `categoryLeaf('')` trả chuỗi rỗng, và chuỗi rỗng khớp chuỗi
   * rỗng, nên khi cả catalogue đều trống category thì bộ lọc tự suy biến thành
   * "lấy tất" mà nhìn vào tưởng nó đang lọc đúng. Đây là trạng thái thật của
   * dữ liệu hiện tại: 13/13 sản phẩm chưa có `category_id`.
   */
  unclassified: boolean;
};

/**
 * Sản phẩm nào đủ điều kiện nhận bản nhân: cùng lớp với sản phẩm gốc, và
 * không phải chính nó. `widen` nới từ lớp lá lên lớp cha.
 */
export const eligibleProducts = (
  all: AutomationProduct[],
  master: AutomationProduct | undefined,
  widen: boolean
): EligibleResult => {
  if (!master) return { items: [], unclassified: false };

  const others = all.filter(p => p.id !== master.id);
  if (!master.category.trim()) {
    return { items: others, unclassified: true };
  }

  const key = widen ? categoryParent : categoryLeaf;
  const target = key(master.category);
  return {
    items: others.filter(p => key(p.category) === target),
    unclassified: false,
  };
};

/**
 * Thiết kế này lấp được mấy ô từ chính record sản phẩm?
 *
 * Chỉ chấm những vai mà thiết kế THẬT SỰ dùng — một thiết kế không có tầng TRU
 * thì việc sản phẩm thiếu claim không phải là gap của nó.
 */
export const readinessOf = (
  design: AutomationExperience | undefined,
  product: AutomationProduct | undefined
): Readiness => {
  if (!design || !product) {
    return { slots: [], filled: 0, total: 0, gaps: [] };
  }
  const used = new Set(design.layers.map(l => l.role));
  const slots: ReadinessSlot[] = ROLE_ORDER.filter(r => used.has(r)).map(
    role => ({
      role,
      needKey: SLOT_CHECKS[role].needKey,
      ok: SLOT_CHECKS[role].ok(product),
    })
  );
  const gaps = slots.filter(s => !s.ok);
  return {
    slots,
    filled: slots.length - gaps.length,
    total: slots.length,
    gaps,
  };
};
