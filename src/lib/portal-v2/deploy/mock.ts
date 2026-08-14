/**
 * Portal V2 — Deploy fallback seed.
 *
 * Everything about deployments, channels and KPIs now reads the real BE
 * (spec §11) — see `services/portal-v2/deployBoard.ts`. What is left here is
 * ONLY the brand-domains fallback: `DeployWorkspace` falls back to this list
 * when `brandId` cannot be resolved or `rexerApi.brands.domains.list` is
 * unreachable, the same shape `/portal/profile/domains` falls back to. That
 * fallback is a deliberate exception (see `helpers.ts`'s domain-fallback
 * section) — the rest of this route follows the opposite rule and shows an
 * empty state with the real error instead of a fake board.
 */

import type { DeployBrandDomain } from '@/lib/portal-v2/deploy/types';

export const MOCK_BRAND_DOMAINS: DeployBrandDomain[] = [
  {
    id: 'bd1',
    domain: 'superserum.rexer.link',
    status: 'connected',
    verificationToken: 'rxr_verify_4a1f',
    failureReason: null,
  },
  {
    id: 'bd2',
    domain: 'shadefinder.rexer.link',
    status: 'connected',
    verificationToken: 'rxr_verify_7c2e',
    failureReason: null,
  },
  {
    /* somebody edited the domain after launch and never re-verified it —
       editing always drops a domain back to `pending`. */
    id: 'bd4',
    domain: 'founders-note.rexer.link',
    status: 'pending',
    verificationToken: 'rxr_verify_1e6a',
    failureReason: null,
  },
  {
    id: 'bd8',
    domain: 'clean-edit.rexer.link',
    status: 'error',
    verificationToken: 'rxr_verify_0c7f',
    failureReason: 'CNAME record not found.',
  },
];

/** A fresh copy of the fallback domain list — the seed is module-level, so
 *  state must never alias it. */
export const cloneBrandDomains = (
  domains: DeployBrandDomain[]
): DeployBrandDomain[] => domains.map(d => ({ ...d }));
