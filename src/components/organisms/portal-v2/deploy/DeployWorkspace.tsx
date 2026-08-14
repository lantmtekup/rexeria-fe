'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Tabs } from '@/components/molecules/portal-v2/Tabs';
import { ChannelDetailModal } from '@/components/organisms/portal-v2/deploy/ChannelDetailModal';
import { DeployChannelsPane } from '@/components/organisms/portal-v2/deploy/DeployChannelsPane';
import { DeployKpis } from '@/components/organisms/portal-v2/deploy/DeployKpis';
import { DeployLivePane } from '@/components/organisms/portal-v2/deploy/DeployLivePane';
import { DeployReadyPane } from '@/components/organisms/portal-v2/deploy/DeployReadyPane';
import {
  DEPLOY_DEFAULT_TAB,
  DEPLOY_TABS,
} from '@/lib/portal-v2/deploy/constants';
import {
  canDeployRow,
  deployTotals,
  deploymentsByStatus,
  fakeDomainId,
  fakeVerificationToken,
  findChannel,
  findDomain,
  isValidDomain,
  mapBrandDomain,
  markLive,
  markReady,
  resolveChannels,
  setRowDomainId,
  simulateDomainStatus,
  toggleChannel,
  toggleRowChannel,
} from '@/lib/portal-v2/deploy/helpers';
import {
  MOCK_BRAND_DOMAINS,
  MOCK_DEPLOY_BOARD,
  cloneBrandDomains,
  cloneDeployBoard,
} from '@/lib/portal-v2/deploy/mock';
import type {
  DeployBoard,
  DeployBrandDomain,
  DeployTabId,
  Deployment,
} from '@/lib/portal-v2/deploy/types';
import { rexerApi } from '@/services/rexer/endpoints';
import { cn } from '@/lib/cn';

/** One alias, reused everywhere a timer id is stored — `setTimeout`'s return
 * type resolves differently depending on which lib TS picks at each call
 * site otherwise, and a `Map<string, number>` fighting a `NodeJS.Timeout`
 * from the same `setTimeout` call is not a distinction worth having. */
type TimerId = ReturnType<typeof setTimeout>;

/**
 * Deploy — the publish hub the plan says is missing.
 *
 * §`#mod-deploy` is explicit that LIVE happens in exactly one place: a journey
 * has no deploy button of its own, and a campaign marking work `ready` is a
 * hand-off, not a publish. That rule is the reason this route holds the whole
 * board in one state object — the transition `ready → live` is a single
 * assignment here, and there is nowhere else it could be written from.
 *
 * P0 is mock (`lib/portal-v2/deploy/mock.ts`): deploying and pausing move a
 * row and toast the payload that a `/v1/deployments` call would carry. Nothing
 * is persisted, and nothing pretends to be. The domain a row is served on is
 * the one exception — it reads and writes the real `rexerApi.brands.domains`
 * backend, the same one `/portal/profile/domains` already ships against.
 */
export const DeployWorkspace = () => {
  const t = useTranslations('portalV2.deploy');

  const [board, setBoard] = useState<DeployBoard>(() =>
    cloneDeployBoard(MOCK_DEPLOY_BOARD)
  );
  const [tab, setTab] = useState<DeployTabId>(DEPLOY_DEFAULT_TAB);
  /** The channel whose detail is open, by id. */
  const [openChannel, setOpenChannel] = useState<string | null>(null);

  /* ── the brand's domains — real BE, mock fallback ─────────────────────── */
  const [brandId, setBrandId] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [domains, setDomains] = useState<DeployBrandDomain[]>([]);
  const [domainsLoading, setDomainsLoading] = useState(true);
  /** `'fake'` once `auth.me()` or `domains.list` failed — see `mock.ts`. */
  const [domainSource, setDomainSource] = useState<'live' | 'fake'>('live');
  const [creatingDomainForRow, setCreatingDomainForRow] = useState<
    string | null
  >(null);
  const [verifyingDomainId, setVerifyingDomainId] = useState<string | null>(
    null
  );

  // Load real data: /auth/me → brand_id + workspace_id → the brand's domains.
  // Falls back to MOCK_BRAND_DOMAINS on any failure, same as
  // `/portal/profile/domains` — a demo without a reachable BE still demos.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await rexerApi.auth.me();
        const bid = me.brand?.id;
        if (!bid) throw new Error('cannot resolve brand id');
        const ws = me.user.active_workspace_id;
        if (cancelled) return;
        setBrandId(bid);
        setWorkspaceId(ws ?? null);

        const res = await rexerApi.brands.domains.list(bid);
        if (cancelled) return;
        setDomains((res.items ?? []).map(mapBrandDomain));
        setDomainSource('live');
      } catch {
        if (!cancelled) {
          setDomains(cloneBrandDomains(MOCK_BRAND_DOMAINS));
          setDomainSource('fake');
        }
      } finally {
        if (!cancelled) setDomainsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const live = useMemo(() => deploymentsByStatus(board, 'live'), [board]);
  const ready = useMemo(() => deploymentsByStatus(board, 'ready'), [board]);
  const totals = useMemo(() => deployTotals(board), [board]);

  /**
   * The badge counts what its label names. The prototype put the ISSUE count
   * on the Live tab, which works there because it is styled as a warning —
   * in this neutral chip "Live now · 1" would read as one live row when eight
   * are out. Issues have their own KPI, and it is a button.
   */
  const tabs = useMemo(
    () =>
      DEPLOY_TABS.map(item => ({
        id: item.id,
        label: t(item.labelKey),
        count:
          item.id === 'live'
            ? totals.live || undefined
            : item.id === 'ready'
              ? totals.ready || undefined
              : undefined,
      })),
    [t, totals.live, totals.ready]
  );

  const activeTab =
    DEPLOY_TABS.find(item => item.id === tab) ?? DEPLOY_TABS[0]!;

  const handleToggleRowChannel = useCallback(
    (rowId: string, channelId: string) => {
      setBoard(prev => ({
        ...prev,
        deployments: toggleRowChannel(prev.deployments, rowId, channelId),
      }));
    },
    []
  );

  const handleSelectDomain = useCallback(
    (rowId: string, domainId: string | null) => {
      setBoard(prev => ({
        ...prev,
        deployments: setRowDomainId(prev.deployments, rowId, domainId),
      }));
    },
    []
  );

  /**
   * Add a domain to the brand and point this row at it. Real path calls
   * `rexerApi.brands.domains.create`; the fallback (no `brandId`, or the
   * live load already failed) fabricates one locally so the flow still
   * demos, the same shape `/portal/profile/domains` falls back to.
   */
  const handleCreateDomain = useCallback(
    async (rowId: string, value: string) => {
      const domain = value.trim().toLowerCase();
      if (!isValidDomain(domain)) return;

      setCreatingDomainForRow(rowId);

      if (domainSource === 'fake' || !brandId || !workspaceId) {
        const created: DeployBrandDomain = {
          id: fakeDomainId(domain),
          domain,
          status: 'pending',
          verificationToken: fakeVerificationToken(domain),
          failureReason: null,
        };
        setDomains(prev => [created, ...prev]);
        setBoard(prev => ({
          ...prev,
          deployments: setRowDomainId(prev.deployments, rowId, created.id),
        }));
        setCreatingDomainForRow(null);
        toast.success(t('domainAddedFakeToast', { domain }));
        return;
      }

      try {
        const res = await rexerApi.brands.domains.create(brandId, {
          domain,
          workspace_id: workspaceId,
          target_type: 'landing',
          page_id: null,
        });
        const created = mapBrandDomain(res.domain);
        setDomains(prev => [created, ...prev]);
        setBoard(prev => ({
          ...prev,
          deployments: setRowDomainId(prev.deployments, rowId, created.id),
        }));
        toast.success(t('domainAddedToast', { domain: created.domain }));
      } catch (err) {
        toast.error(t('domainAddFailedToast'), {
          description: err instanceof Error ? err.message : String(err),
        });
      } finally {
        setCreatingDomainForRow(null);
      }
    },
    [brandId, workspaceId, domainSource, t]
  );

  /**
   * "Verify now". Real path calls `rexerApi.brands.domains.verify` and
   * writes back whatever the BE found. The fallback has no BE to ask, so a
   * ~1.1s `setTimeout` stands in for the round trip — the pending timers
   * live in a ref, bookkeeping for the effect cleanup, never something a
   * render reads.
   */
  const verifyTimers = useRef(new Map<string, TimerId>());

  useEffect(() => {
    const timers = verifyTimers.current;
    return () => {
      timers.forEach(id => clearTimeout(id));
    };
  }, []);

  const handleVerifyDomain = useCallback(
    async (domainId: string) => {
      setVerifyingDomainId(domainId);

      if (domainSource === 'fake' || !brandId) {
        const pending = verifyTimers.current.get(domainId);
        if (pending) clearTimeout(pending);

        const timer: TimerId = setTimeout(() => {
          verifyTimers.current.delete(domainId);
          setDomains(prev =>
            prev.map(d => {
              if (d.id !== domainId) return d;
              const outcome = simulateDomainStatus(d.domain);
              return {
                ...d,
                status: outcome,
                failureReason:
                  outcome === 'error' ? 'CNAME record not found.' : null,
              };
            })
          );
          setVerifyingDomainId(null);
        }, 1100);
        verifyTimers.current.set(domainId, timer);
        return;
      }

      try {
        const res = await rexerApi.brands.domains.verify(brandId, domainId);
        const updated = mapBrandDomain(res.domain);
        setDomains(prev => prev.map(d => (d.id === domainId ? updated : d)));
      } catch (err) {
        toast.error(t('domainVerifyFailedToast'), {
          description: err instanceof Error ? err.message : String(err),
        });
      } finally {
        setVerifyingDomainId(null);
      }
    },
    [brandId, domainSource, t]
  );

  const handleDeploy = useCallback(
    (row: Deployment) => {
      if (!canDeployRow(row, domains)) return;

      /* Clock only inside a handler — a render on this route is pure. */
      const since = new Date().toISOString().slice(0, 10);
      const names = resolveChannels(board.channels, row.channels).map(
        c => c.name
      );
      const body = t('deployedToastBody', {
        channels: names.join(', '),
        campaign: row.campaign.name,
      });
      /* `canDeployRow` already required `connected` to get here — the toast
         only ever names a domain that passed verification. */
      const rowDomain = row.domainId ? findDomain(domains, row.domainId) : null;
      const domainNote =
        rowDomain?.status === 'connected'
          ? t('deployedToastDomain', { domain: rowDomain.domain })
          : null;

      setBoard(prev => ({
        ...prev,
        deployments: markLive(prev.deployments, row.id, since),
      }));
      setTab('live');

      toast.success(t('deployedToast', { name: row.experience.name }), {
        description: domainNote ? `${body} ${domainNote}` : body,
      });
    },
    [board.channels, domains, t]
  );

  const handlePause = useCallback(
    (row: Deployment) => {
      setBoard(prev => ({
        ...prev,
        deployments: markReady(prev.deployments, row.id),
      }));
      toast(t('pausedToast', { name: row.experience.name }), {
        description: t('pausedToastBody'),
      });
    },
    [t]
  );

  /**
   * The toast is raised here, not inside the updater — a `setState` callback
   * runs twice under StrictMode, and a side effect in it would double-fire.
   */
  const handleToggleChannel = useCallback(
    (channelId: string) => {
      const target = findChannel(board.channels, channelId);
      if (!target) return;

      setBoard(prev => toggleChannel(prev, channelId));

      toast(
        target.connected
          ? t('channelDisconnectedToast', { name: target.name })
          : t('channelConnectedToast', { name: target.name })
      );
    },
    [board.channels, t]
  );

  const channel = openChannel ? findChannel(board.channels, openChannel) : null;

  return (
    <div className='flex min-h-0 flex-col'>
      <div className='pv2-page-header'>
        <div className='mx-auto flex w-full flex-wrap items-end justify-between gap-4 px-5 pt-6 pb-4 md:px-8'>
          <div className='min-w-0'>
            <h1 className='font-[family-name:var(--pv2-disp)] text-[1.625rem] font-bold tracking-[-0.03em] text-[var(--pv2-ink)] md:text-[1.75rem]'>
              {t('title')}
            </h1>
            {/* The subtitle is the question the open tab answers. */}
            <p className='mt-1 max-w-[80ch] text-[13.5px] leading-relaxed text-[var(--pv2-mut)]'>
              {t(activeTab.questionKey)}
            </p>
          </div>

          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--pv2-hair)]',
              'bg-[var(--pv2-canvas)] px-3 py-1.5 text-[12px] font-semibold text-[var(--pv2-slate-500)]'
            )}
          >
            <span
              className='size-1.5 rounded-full bg-[var(--pv2-success)]'
              aria-hidden
            />
            {t('liveChip', {
              live: totals.live,
              channels: totals.channels,
            })}
          </span>
        </div>
      </div>

      <div className='mx-auto w-full px-5 py-6 md:px-8'>
        <div className='sticky top-0 z-10 -mx-5 mb-4 bg-[var(--pv2-canvas)] px-5 md:-mx-8 md:px-8'>
          <Tabs
            items={tabs}
            value={tab}
            onChange={id => setTab(id as DeployTabId)}
            aria-label={t('tabsAria')}
          />
        </div>

        <DeployKpis totals={totals} onOpenIssues={() => setTab('live')} />

        <div className='mt-4'>
          {tab === 'live' ? (
            <DeployLivePane
              rows={live}
              channels={board.channels}
              domains={domains}
              onPause={handlePause}
            />
          ) : null}

          {tab === 'ready' ? (
            <DeployReadyPane
              rows={ready}
              channels={board.channels}
              domains={domains}
              domainsLoading={domainsLoading}
              domainSource={domainSource}
              onToggleChannel={handleToggleRowChannel}
              onSelectDomain={handleSelectDomain}
              onCreateDomain={handleCreateDomain}
              creatingDomainForRow={creatingDomainForRow}
              onVerifyDomain={handleVerifyDomain}
              verifyingDomainId={verifyingDomainId}
              onDeploy={handleDeploy}
            />
          ) : null}

          {tab === 'channels' ? (
            <DeployChannelsPane
              channels={board.channels}
              live={live}
              onToggle={handleToggleChannel}
              onOpen={setOpenChannel}
            />
          ) : null}
        </div>
      </div>

      {channel ? (
        <ChannelDetailModal
          key={channel.id}
          channel={channel}
          live={live}
          onClose={() => setOpenChannel(null)}
          onConnect={id => {
            handleToggleChannel(id);
            setOpenChannel(null);
          }}
        />
      ) : null}
    </div>
  );
};
