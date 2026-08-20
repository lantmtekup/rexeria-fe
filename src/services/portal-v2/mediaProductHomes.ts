import { fetchProductCatalog } from '@/services/portal-v2/productCatalog';
import { fetchProductMedia } from '@/services/portal-v2/productMediaUpload';

/**
 * `media asset id → sản phẩm đang gắn nó` — dựng bằng cách quét `GET
 * /products/{id}` (binding thật) cho từng sản phẩm trong catalogue, vì
 * `GET /media` không trả chiều ngược "asset này đang gắn ở đâu".
 *
 * Trước đây `mapRexerMediaAssetToUi` hardcode `home: {scope:'unfiled'}` cho
 * MỌI asset — nhóm "Products" trên bộ lọc thư mục vẽ ra nhưng luôn rỗng, dù
 * asset đã gắn thật vào sản phẩm. N+1 (một lượt gọi cho mỗi sản phẩm) chấp
 * nhận được ở quy mô catalogue hiện tại (chục tới trăm sản phẩm); hỏng một
 * sản phẩm không chặn các sản phẩm còn lại.
 */
export type MediaProductHome = {
  productId: string;
  productTitle: string;
};

export const fetchMediaProductHomes = async (
  brandId?: string | null
): Promise<Map<string, MediaProductHome>> => {
  const { products } = await fetchProductCatalog({ brandId });
  const perProduct = await Promise.all(
    products.map(p =>
      fetchProductMedia(p.id)
        .then(assets =>
          assets.map(a => ({
            mediaId: a.id,
            home: { productId: p.id, productTitle: p.title },
          }))
        )
        .catch(() => [])
    )
  );

  const map = new Map<string, MediaProductHome>();
  for (const rows of perProduct) {
    for (const row of rows) map.set(row.mediaId, row.home);
  }
  return map;
};
