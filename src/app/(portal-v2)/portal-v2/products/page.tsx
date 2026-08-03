import { ProductWorkspace } from '@/components/organisms/portal-v2/product/ProductWorkspace';
import { fetchProductCatalog } from '@/services/portal-v2/productCatalog';
import { RxApiError } from '@/services/rexer/client';

export default async function PortalV2ProductsPage() {
  try {
    const { products, assets, brands, types, total, error, softError } =
      await fetchProductCatalog();
    return (
      <ProductWorkspace
        initialProducts={products}
        initialAssets={assets}
        initialBrands={brands}
        initialTypes={types}
        initialTotal={total}
        initialError={error}
        softError={softError}
      />
    );
  } catch (err) {
    const loadError =
      err instanceof RxApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : 'Failed to load products';
    return <ProductWorkspace initialProducts={[]} initialError={loadError} />;
  }
}
