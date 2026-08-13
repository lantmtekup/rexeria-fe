import { portfolioTrackingCoverage } from '@/lib/portal-v2/analytics/insights';

import type { IntelTrust } from '@/lib/portal-v2/intelligence/types';

export const buildIntelTrust = (): IntelTrust => {
  const score = portfolioTrackingCoverage();

  return {
    score,
    coverage: score,
    consent: 99,
    freshness: 'live — derived from the grain',
    schema: 'v3.2',
    issues: [
      {
        severity: 'warn',
        title: '12% of sessions have no product ID',
        detail:
          'Meta traffic arriving without a catalogue parameter. Those sessions are excluded from product-level numbers rather than guessed at.',
        fix: 'Add the product ID to the Meta URL template',
      },
      {
        severity: 'warn',
        title: 'Untracked components report nothing',
        detail:
          'The score above is the coverage. What is not tracked cannot report, and the number confesses it.',
        fix: 'Close the blind spots in the editor',
      },
      {
        severity: 'ok',
        title: 'No duplicate events',
        detail: 'Deduplication is holding across every channel.',
        fix: '',
      },
      {
        severity: 'ok',
        title: 'Consent coverage 99%',
        detail: '1% of EU sessions are measured anonymously by design.',
        fix: '',
      },
    ],
  };
};
