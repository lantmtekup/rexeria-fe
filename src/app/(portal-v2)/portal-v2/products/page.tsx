import { BrandScopeBar } from '@/components/molecules/portal-v2/BrandScopeBar';
import { ProductWorkspace } from '@/components/organisms/portal-v2/product/ProductWorkspace';
import { fetchProductCatalog } from '@/services/portal-v2/productCatalog';
import { resolvePortalScope } from '@/services/portal-v2/scope';
import { RxApiError } from '@/services/rexer/client';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PortalV2ProductsPage({ searchParams }: Props) {
  const scope = await resolvePortalScope(await searchParams);

  try {
    // `brandId` null = admin chưa chọn ⇒ xem chéo mọi brand, đúng vai của họ.
    // Người dùng thường luôn có brand nên danh sách tự giới hạn.
    const { products, assets, brands, types, total, error, softError } =
      await fetchProductCatalog({ brandId: scope.brandId });

    return (
      <div className='flex min-h-0 flex-col'>
        <BrandScopeBar scope={scope} />
        {/*
          Đổi brand ⇒ REMOUNT. Workspace gieo state bằng `useState(() => prop)`,
          mà initializer chỉ chạy lúc mount — không có key thì server đã nạp
          đúng brand mới nhưng màn hình vẫn giữ danh sách của brand cũ.
        */}
        <ProductWorkspace
          key={scope.brandId ?? 'none'}
          initialProducts={products}
          initialAssets={assets}
          brandId={scope.brandId}
          initialBrands={brands}
          initialTypes={types}
          initialTotal={total}
          initialError={error ?? scope.error}
          softError={softError}
        />
      </div>
    );
  } catch (err) {
    const loadError =
      err instanceof RxApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : 'Failed to load products';
    return (
      <div className='flex min-h-0 flex-col'>
        <BrandScopeBar scope={scope} />
        <ProductWorkspace
          key={scope.brandId ?? 'none'}
          initialProducts={[]}
          brandId={scope.brandId}
          initialError={loadError}
        />
      </div>
    );
  }
}
