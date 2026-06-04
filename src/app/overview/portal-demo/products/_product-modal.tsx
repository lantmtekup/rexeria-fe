'use client';

import { Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  ProductInformationEditor,
  emptyProductInformation,
  type ProductInformationValue,
} from '@/components/modules/Product/ProductInformationEditor';

import {
  CATEGORY_LABEL,
  type PortalProduct,
  type ProductCategory,
} from '../_data';
import {
  createProductRemote,
  portalProductToBE,
  updateProductRemote,
} from '../_remote';

const RANDOM_GRADIENTS = [
  'from-red-500 to-rose-700',
  'from-zinc-800 to-black',
  'from-orange-400 to-amber-500',
  'from-pink-400 to-rose-500',
  'from-emerald-400 to-lime-500',
  'from-amber-400 to-orange-500',
  'from-sky-400 to-blue-500',
  'from-blue-500 to-violet-600',
];

/* ---------- adapters PortalProduct ↔ ProductInformationValue ---------- */

const CATEGORY_TO_LABEL: Record<ProductCategory, string> = {
  carbonated: 'Đồ uống có ga',
  juice: 'Nước ép trái cây',
  water: 'Nước khoáng',
  energy: 'Đồ uống tăng lực',
};

const LABEL_TO_CATEGORY: Record<string, ProductCategory> = {
  'Đồ uống có ga': 'carbonated',
  'Nước ép trái cây': 'juice',
  'Nước khoáng': 'water',
  'Đồ uống tăng lực': 'energy',
};

function portalToEditor(p: PortalProduct): ProductInformationValue {
  return {
    name: p.name,
    category: CATEGORY_TO_LABEL[p.category] ?? p.category,
    description: p.description,
    sku: p.sku,
    sizes: p.sizes.map(s => `${s.volume_ml}ml (${s.label})`),
    colors:
      p.colors?.map((c, i) => ({
        name: c.name,
        hex: c.hex,
        is_default: i === 0,
        sort_order: i,
      })) ?? [],
    variants: [],
    ingredients: p.ingredients,
    certifications: p.certifications.map(c => ({ name: c })),
  };
}

function editorToPortal(
  v: ProductInformationValue,
  base: PortalProduct | null
): PortalProduct {
  const inferredCategory: ProductCategory =
    LABEL_TO_CATEGORY[v.category] ??
    (Object.keys(CATEGORY_LABEL) as ProductCategory[]).find(k =>
      v.category.toLowerCase().includes(CATEGORY_LABEL[k].label.toLowerCase())
    ) ??
    'carbonated';

  // Try to parse size strings back to {label, volume_ml, price_vnd}
  // Format: "330ml (Lon)" → volume_ml=330, label="Lon", price=base.price or default
  const parsedSizes = v.sizes.map((s, idx) => {
    const m = s.match(/^(\d+)\s*ml\s*(?:\(([^)]*)\))?$/i);
    if (m) {
      const ml = parseInt(m[1], 10);
      const label = m[2] || `Size ${idx + 1}`;
      const existing = base?.sizes.find(bs => bs.volume_ml === ml);
      return {
        label,
        volume_ml: ml,
        price_vnd: existing?.price_vnd ?? 10_000 + idx * 5_000,
      };
    }
    return {
      label: s || `Size ${idx + 1}`,
      volume_ml: 330,
      price_vnd: base?.sizes[idx]?.price_vnd ?? 10_000,
    };
  });

  return {
    id: base?.id ?? `p_${Date.now()}`,
    name: v.name.trim() || 'Untitled product',
    sku:
      v.sku.trim() || `SKU-${Date.now().toString(36).slice(-6).toUpperCase()}`,
    category: inferredCategory,
    status: base?.status ?? 'active',
    cover_gradient:
      base?.cover_gradient ??
      RANDOM_GRADIENTS[Math.floor(Math.random() * RANDOM_GRADIENTS.length)],
    description: v.description.trim(),
    sizes:
      parsedSizes.length > 0
        ? parsedSizes
        : [{ label: 'Default', volume_ml: 330, price_vnd: 10_000 }],
    colors:
      v.colors.length > 0
        ? v.colors.map(c => ({ name: c.name, hex: c.hex }))
        : undefined,
    ingredients: v.ingredients,
    certifications: v.certifications.map(c => c.name),
    features: base?.features ?? [],
    related_template_ids: base?.related_template_ids ?? [],
    created_at: base?.created_at ?? new Date().toISOString(),
  };
}

/* ---------- modal ---------- */

export function ProductFormModal({
  open,
  product,
  onClose,
  onSave,
  liveBE = false,
}: {
  open: boolean;
  product: PortalProduct | null; // null = create mode
  onClose: () => void;
  onSave: (p: PortalProduct) => void;
  liveBE?: boolean;
}) {
  const [value, setValue] = useState<ProductInformationValue>(
    emptyProductInformation()
  );
  const [saving, setSaving] = useState(false);

  // Reset value when product / open changes
  useEffect(() => {
    if (!open) return;
    setValue(product ? portalToEditor(product) : emptyProductInformation());
  }, [open, product]);

  if (!open) return null;

  const isEdit = !!product;

  const handleSave = async () => {
    if (!value.name.trim()) {
      toast.error('Tên sản phẩm không được rỗng');
      return;
    }
    setSaving(true);
    let next: PortalProduct;

    if (liveBE) {
      // Real BE call
      const payload = portalProductToBE(value);
      const result = isEdit
        ? await updateProductRemote(product!.id, payload)
        : await createProductRemote(payload);
      if (result) {
        // Merge with local extras (cover_gradient, features, etc.) for nicer UI
        next = {
          ...editorToPortal(value, product),
          ...result,
        };
        toast.success(
          isEdit
            ? `Đã lưu "${result.name}" (BE)`
            : `Đã tạo "${result.name}" (BE)`
        );
      } else {
        // API failed — fallback to local
        next = editorToPortal(value, product);
        toast.error('BE lỗi — đã lưu local', {
          description: 'Dữ liệu chỉ tồn tại trong session này.',
        });
      }
    } else {
      // Pure fake mode
      next = editorToPortal(value, product);
      toast.success(
        isEdit
          ? `Đã lưu "${next.name}" (local)`
          : `Đã tạo "${next.name}" (local)`
      );
    }

    onSave(next);
    setSaving(false);
    onClose();
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='my-8 flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl'
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className='border-border flex items-center justify-between gap-3 border-b px-5 py-3'>
          <div className='flex items-center gap-2.5'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-sm'>
              <Save className='size-4' />
            </div>
            <div>
              <h3 className='text-base leading-tight font-semibold'>
                {isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </h3>
              <p className='text-3xs text-content-muted mt-0.5 flex items-center gap-1.5'>
                {product ? (
                  <span className='font-mono'>
                    {product.sku} · {product.id}
                  </span>
                ) : (
                  <span>Reuse component từ codebase</span>
                )}
                <span className='text-3xs rounded bg-orange-100 px-1 py-0.5 font-mono font-bold text-orange-700'>
                  ProductInformationEditor
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='text-muted-foreground hover:bg-muted hover:text-content-muted rounded-lg p-1.5'
            aria-label='Close'
          >
            <X className='size-4' />
          </button>
        </div>

        {/* Form body */}
        <div className='space-y-4 px-5 py-4'>
          {/* Name */}
          <div>
            <label className='text-3xs text-content-muted block font-semibold tracking-wider uppercase'>
              Tên sản phẩm <span className='text-rose-500'>*</span>
            </label>
            <input
              type='text'
              value={value.name}
              onChange={e => setValue(v => ({ ...v, name: e.target.value }))}
              placeholder='vd: Coca-Cola Original 330ml'
              className='border-border mt-1.5 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
              maxLength={128}
              autoFocus
            />
          </div>

          {/* Reused editor — no wrapper, lives inline */}
          <ProductInformationEditor value={value} onChange={setValue} />
        </div>

        {/* Footer */}
        <div className='border-border bg-muted/50 flex items-center justify-between gap-3 border-t px-5 py-3'>
          <p className='text-2xs text-content-muted'>
            {liveBE ? (
              <>
                <span className='inline-flex items-center gap-1 rounded-full bg-emerald-100 px-1.5 py-0.5 font-bold text-emerald-700'>
                  <span className='size-1 animate-pulse rounded-full bg-emerald-500' />
                  LIVE
                </span>{' '}
                <span className='ml-1'>
                  Lưu vào BE qua{' '}
                  <code>products.{isEdit ? 'update' : 'create'}</code>
                </span>
              </>
            ) : (
              <>
                <span className='text-content-muted font-semibold'>Demo:</span>{' '}
                chỉ update local state
              </>
            )}
          </p>
          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={onClose}
              disabled={saving}
              className='border-border text-content-muted hover:bg-muted rounded-lg border bg-white px-3 py-1.5 text-xs font-medium disabled:opacity-50'
            >
              Hủy
            </button>
            <button
              type='button'
              onClick={handleSave}
              disabled={saving}
              className='flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-60'
            >
              <Save className={`size-3.5 ${saving ? 'animate-pulse' : ''}`} />
              {saving ? 'Đang lưu…' : isEdit ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
