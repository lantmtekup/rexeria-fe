import { ExchangeWorkspace } from '@/components/organisms/portal-v2/exchange/ExchangeWorkspace';
import { fetchExchangeCatalog } from '@/services/portal-v2/exchangeCatalog';
import { RxApiError } from '@/services/rexer/client';

export default async function PortalV2ExchangePage() {
  try {
    const { catalog, error, softError } = await fetchExchangeCatalog();
    return (
      <ExchangeWorkspace
        initialCatalog={catalog}
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
          : 'Failed to load catalog';
    return <ExchangeWorkspace initialCatalog={[]} initialError={loadError} />;
  }
}
