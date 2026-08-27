import { ExchangeWorkspace } from '@/components/organisms/portal-v2/exchange/ExchangeWorkspace';
import { readExchangePreviewParam } from '@/lib/portal-v2/exchange/previewParam';
import { readExchangeTabParam } from '@/lib/portal-v2/exchange/tabParam';
import { fetchExchangeCatalog } from '@/services/portal-v2/exchangeCatalog';
import {
  buildAddedMap,
  fetchExchangeOwnedIndex,
} from '@/services/portal-v2/exchangeOwned';
import { RxApiError } from '@/services/rexer/client';

type PortalV2ExchangePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PortalV2ExchangePage({
  searchParams,
}: PortalV2ExchangePageProps) {
  const params = await searchParams;
  const initialPreviewId = readExchangePreviewParam(params);
  const initialKind = readExchangeTabParam(params);

  try {
    /*
     * Song song, không nối đuôi: tra thư viện KHÔNG phụ thuộc catalog, nên nối
     * tiếp nhau chỉ cộng dồn thời gian chờ vào lần mở trang.
     *
     * Tra ở SERVER chứ không phải sau khi trang hiện: nhãn "Đã có trong thư
     * viện" phải đúng ngay từ lần vẽ đầu. Tính sau thì thẻ hiện nút Thêm trước
     * rồi mới đổi — và trong khoảnh khắc đó người dùng đã kịp bấm.
     */
    const [catalogResult, ownedIndex] = await Promise.all([
      fetchExchangeCatalog(),
      fetchExchangeOwnedIndex(),
    ]);
    const { catalog, error, softError } = catalogResult;

    return (
      <ExchangeWorkspace
        initialCatalog={catalog}
        initialError={error}
        softError={softError}
        initialPreviewId={initialPreviewId}
        initialKind={initialKind}
        initialAdded={buildAddedMap(catalog, ownedIndex)}
      />
    );
  } catch (err) {
    const loadError =
      err instanceof RxApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : 'Failed to load catalog';
    return <ExchangeWorkspace initialCatalog={[]} initialError={loadError} />;
  }
}
