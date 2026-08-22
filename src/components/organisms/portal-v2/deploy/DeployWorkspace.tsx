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
import type { CampaignTeamMember } from '@/lib/portal-v2/campaigns/types';
import {
  DEPLOY_DEFAULT_TAB,
  DEPLOY_REASON_KEY,
  DEPLOY_TABS,
} from '@/lib/portal-v2/deploy/constants';
import {
  deployTotals,
  fakeDomainId,
  fakeVerificationToken,
  findChannel,
  groupByCampaign,
  isValidDomain,
  mapBrandDomain,
  simulateDomainStatus,
} from '@/lib/portal-v2/deploy/helpers';
import type {
  DeployBrandDomain,
  DeployChannel,
  DeployTabId,
  LiveDeployRow,
  ReadyDeployRow,
} from '@/lib/portal-v2/deploy/types';
import {
  connectChannel,
  deployCampaignItem,
  disconnectChannel,
  fetchDeployChannels,
  fetchDeployKpis,
  fetchDeployLive,
  fetchDeployReady,
  pauseCampaignItem,
} from '@/services/portal-v2/deployBoard';
import { rexerApi } from '@/services/rexer/endpoints';
import type { RxDeployKPIsResponse } from '@/services/rexer-v2/types/deploy';
import { cn } from '@/lib/cn';

/** One alias, reused everywhere a timer id is stored — `setTimeout`'s return
 * type resolves differently depending on which lib TS picks at each call
 * site otherwise. */
type TimerId = ReturnType<typeof setTimeout>;

type DeployWorkspaceProps = {
  brandId: string | null;
  workspaceId: string | null;
  team: CampaignTeamMember[];
  initialChannels: DeployChannel[];
  initialLive: LiveDeployRow[];
  initialReady: ReadyDeployRow[];
  initialKpis: RxDeployKPIsResponse | null;
  initialDomains: DeployBrandDomain[];
  /** `'fake'` once `brandId` could not be resolved or `domains.list` failed —
   *  the only mock-fallback exception on this route (see `mock.ts`). */
  initialDomainSource: 'live' | 'fake';
  initialError: string | null;
  /** `?tab=` — lets a deep link (e.g. an unconnected channel chip elsewhere
   *  in the portal) land straight on Channels instead of the Live default. */
  initialTab?: DeployTabId;
};

/**
 * Deploy — the publish hub the plan says is missing.
 *
 * §`#mod-deploy` is explicit that LIVE happens in exactly one place: a journey
 * has no deploy button of its own, and a campaign marking work `ready` is a
 * hand-off, not a publish. `POST /campaigns/{id}/items/{itemId}/deploy` is the
 * only path an item reaches `live` — the BE itself refuses the item-status
 * PATCH from setting it (409). The Campaign screen's own Deploy button (in
 * `CampaignItemModal`) calls that exact same endpoint; this route is not the
 * only place that CAN trigger it, but every trigger ends up here.
 *
 * REAL BE, NO MOCK FALLBACK on this route's own data — channels, live, ready
 * and KPIs all read `/v1/channels` and `/v1/deploy/*` (spec §11); a failed
 * read shows an empty state with the real error, never a fake board. The one
 * exception is the brand's DOMAIN list (`rexerApi.brands.domains.*`, the same
 * BE `/portal/profile/domains` already ships against) — see `mock.ts`.
 */
export const DeployWorkspace = ({
  brandId,
  workspaceId,
  team,
  initialChannels,
  initialLive,
  initialReady,
  initialKpis,
  initialDomains,
  initialDomainSource,
  initialError,
  initialTab,
}: DeployWorkspaceProps) => {
  const t = useTranslations('portalV2.deploy');

  const [channels, setChannels] = useState<DeployChannel[]>(initialChannels);
  const [live, setLive] = useState<LiveDeployRow[]>(initialLive);
  const [ready, setReady] = useState<ReadyDeployRow[]>(initialReady);
  const [kpis, setKpis] = useState<RxDeployKPIsResponse | null>(initialKpis);
  const [loadError, setLoadError] = useState<string | null>(initialError);

  const [tab, setTab] = useState<DeployTabId>(initialTab ?? DEPLOY_DEFAULT_TAB);
  /** The channel whose detail is open, by id. */
  const [openChannel, setOpenChannel] = useState<string | null>(null);
  /** Which channels a Ready row would publish to, staged client-side until
   *  Deploy is clicked — the BE keeps no selection for a not-yet-live item. */
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [deployingRow, setDeployingRow] = useState<string | null>(null);
  const [pausingRow, setPausingRow] = useState<string | null>(null);
  const [connectingChannel, setConnectingChannel] = useState<string | null>(
    null
  );

  /* ── the brand's domains — real BE, mock fallback (see `mock.ts`) ─────── */
  const [domains, setDomains] = useState<DeployBrandDomain[]>(initialDomains);
  const [domainSource] = useState<'live' | 'fake'>(initialDomainSource);
  const [creatingDomain, setCreatingDomain] = useState(false);
  const [verifyingDomainId, setVerifyingDomainId] = useState<string | null>(
    null
  );

  const refresh = useCallback(async () => {
    const [ch, lv, rd, kp] = await Promise.all([
      fetchDeployChannels(),
      fetchDeployLive(),
      fetchDeployReady(),
      fetchDeployKpis(),
    ]);
    setChannels(ch.items);
    setLive(lv.items);
    setReady(rd.items);
    setKpis(kp.kpis);
    setLoadError(ch.error ?? lv.error ?? rd.error ?? kp.error);
  }, []);

  const totals = useMemo(
    () => deployTotals(live, ready, channels, kpis),
    [live, ready, channels, kpis]
  );

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
      setSelections(prev => {
        const current = prev[rowId] ?? [];
        const on = current.includes(channelId);
        return {
          ...prev,
          [rowId]: on
            ? current.filter(id => id !== channelId)
            : [...current, channelId],
        };
      });
    },
    []
  );

  const handleDeploy = useCallback(
    async (row: ReadyDeployRow) => {
      const channelIds = selections[row.id] ?? [];
      /**
       * No client gate — attempt every deploy and let the BE
       * (`core.CheckDeployPreconditions`) decide. A failed precondition
       * comes back as a 409 with the real reason, caught and toasted below.
       */
      setDeployingRow(row.id);
      try {
        const res = await deployCampaignItem(
          row.campaignId,
          row.id,
          channelIds
        );
        const names = channelIds
          .map(id => findChannel(channels, id)?.name)
          .filter(Boolean)
          .join(', ');
        toast.success(t('deployedToast', { name: row.subjectName ?? row.id }), {
          description: res.public_url
            ? t('deployedToastBody', { channels: names, url: res.public_url })
            : t('deployedToastBodyNoUrl', { channels: names }),
        });
        setTab('live');
        setSelections(prev => {
          const next = { ...prev };
          delete next[row.id];
          return next;
        });
        await refresh();
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        const key = DEPLOY_REASON_KEY[reason];
        toast.error(t('deployFailedToast'), {
          description: key ? t(key) : reason,
        });
      } finally {
        setDeployingRow(null);
      }
    },
    [selections, channels, refresh, t]
  );

  const handlePause = useCallback(
    async (row: LiveDeployRow) => {
      setPausingRow(row.id);
      try {
        await pauseCampaignItem(row.campaignId, row.id);
        toast(t('pausedToast', { name: row.subjectName ?? row.id }), {
          description: t('pausedToastBody'),
        });
        await refresh();
      } catch (err) {
        toast.error(t('pauseFailedToast'), {
          description: err instanceof Error ? err.message : String(err),
        });
      } finally {
        setPausingRow(null);
      }
    },
    [refresh, t]
  );

  /* ── channels tab ──────────────────────────────────────────────────────── */

  const handleConnect = useCallback(
    async (
      channelId: string,
      body: { domainId?: string; shopDomain?: string; token?: string }
    ) => {
      setConnectingChannel(channelId);
      try {
        await connectChannel(channelId, {
          domain_id: body.domainId,
          shop_domain: body.shopDomain,
          token: body.token,
        });
        const target = findChannel(channels, channelId);
        toast.success(t('channelConnectedToast', { name: target?.name ?? '' }));
        setOpenChannel(null);
        await refresh();
      } catch (err) {
        toast.error(t('channelConnectFailedToast'), {
          description: err instanceof Error ? err.message : String(err),
        });
      } finally {
        setConnectingChannel(null);
      }
    },
    [channels, refresh, t]
  );

  const handleDisconnect = useCallback(
    async (channelId: string) => {
      const target = findChannel(channels, channelId);
      setConnectingChannel(channelId);
      try {
        const res = await disconnectChannel(channelId);
        toast(t('channelDisconnectedToast', { name: target?.name ?? '' }), {
          description: res.paused_items.length
            ? t('channelDisconnectedPausedBody', {
                count: res.paused_items.length,
              })
            : undefined,
        });
        setOpenChannel(null);
        await refresh();
      } catch (err) {
        toast.error(t('channelDisconnectFailedToast'), {
          description: err instanceof Error ? err.message : String(err),
        });
      } finally {
        setConnectingChannel(null);
      }
    },
    [channels, refresh, t]
  );

  /* ── domain CRUD — real BE, mock fallback ─────────────────────────────── */

  const handleCreateDomain = useCallback(
    async (value: string): Promise<DeployBrandDomain | null> => {
      const domain = value.trim().toLowerCase();
      if (!isValidDomain(domain)) return null;

      setCreatingDomain(true);
      try {
        if (domainSource === 'fake' || !brandId || !workspaceId) {
          const created: DeployBrandDomain = {
            id: fakeDomainId(domain),
            domain,
            status: 'pending',
            verificationToken: fakeVerificationToken(domain),
            failureReason: null,
          };
          setDomains(prev => [created, ...prev]);
          toast.success(t('domainAddedFakeToast', { domain }));
          return created;
        }

        const res = await rexerApi.brands.domains.create(brandId, {
          domain,
          workspace_id: workspaceId,
          target_type: 'landing',
          page_id: null,
        });
        const created = mapBrandDomain(res.domain);
        setDomains(prev => [created, ...prev]);
        toast.success(t('domainAddedToast', { domain: created.domain }));
        return created;
      } catch (err) {
        toast.error(t('domainAddFailedToast'), {
          description: err instanceof Error ? err.message : String(err),
        });
        return null;
      } finally {
        setCreatingDomain(false);
      }
    },
    [brandId, workspaceId, domainSource, t]
  );

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

  const channel = openChannel ? findChannel(channels, openChannel) : null;

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

      {loadError ? (
        <div className='mx-auto mb-2 w-full px-5 md:px-8'>
          <div className='rounded-[var(--pv2-r)] border border-[var(--pv2-error)]/30 bg-[color-mix(in_srgb,var(--pv2-error)_8%,transparent)] px-4 py-2.5 text-[12.5px] text-[var(--pv2-error)]'>
            {loadError}
          </div>
        </div>
      ) : null}

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
              groups={groupByCampaign(live)}
              team={team}
              onPause={handlePause}
              pausingRow={pausingRow}
            />
          ) : null}

          {tab === 'ready' ? (
            <DeployReadyPane
              rows={ready}
              channels={channels}
              team={team}
              selections={selections}
              onToggleChannel={handleToggleRowChannel}
              onOpenChannel={setOpenChannel}
              onDeploy={handleDeploy}
              deployingRow={deployingRow}
            />
          ) : null}

          {tab === 'channels' ? (
            <DeployChannelsPane
              channels={channels}
              live={live}
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
          domains={domains}
          domainSource={domainSource}
          onClose={() => setOpenChannel(null)}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          connecting={connectingChannel === channel.id}
          onCreateDomain={handleCreateDomain}
          creatingDomain={creatingDomain}
          onVerifyDomain={handleVerifyDomain}
          verifyingDomainId={verifyingDomainId}
        />
      ) : null}
    </div>
  );
};
