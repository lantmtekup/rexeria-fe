import { ExchangeWorkspace } from '@/components/organisms/portal-v2/exchange/ExchangeWorkspace';
import { readExchangePreviewParam } from '@/lib/portal-v2/exchange/previewParam';
import { readExchangeTabParam } from '@/lib/portal-v2/exchange/tabParam';
import { fetchExchangeCatalog } from '@/services/portal-v2/exchangeCatalog';
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
    const { catalog, error, softError } = await fetchExchangeCatalog();
    return (
      <ExchangeWorkspace
        initialCatalog={catalog}
        initialError={error}
        softError={softError}
        initialPreviewId={initialPreviewId}
        initialKind={initialKind}
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
