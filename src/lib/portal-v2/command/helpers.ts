import {
  BLOCKER_STYLE,
  COMMAND_LINKS,
  ITEM_STATUS_STEP,
} from '@/lib/portal-v2/command/constants';
import type {
  CommandCampaign,
  CommandKpi,
  CommandSnapshot,
  CommandTask,
  KpiDelta,
  UpcomingLaunch,
} from '@/lib/portal-v2/command/types';

export const formatDate = (iso: string, locale = 'en-US'): string => {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatRange = (
  start: string | null,
  end: string | null,
  locale = 'en-US'
): string => {
  if (!start && !end) return 'No dates';
  if (start && !end) return `From ${formatDate(start, locale)}`;
  if (!start && end) return `Until ${formatDate(end, locale)}`;
  return `${formatDate(start!, locale)} - ${formatDate(end!, locale)}`;
};

/** `Maya Okonjo` becomes `MO`; a single-word owner keeps its first letter. */
export const initialsOf = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return `${first}${last}`.toUpperCase();
};

export const campProgress = (campaign: CommandCampaign) => {
  const total = campaign.items.length;
  const done = campaign.items.filter(
    i => ITEM_STATUS_STEP[i.status] >= 3
  ).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  return { done, total, pct };
};

/**
 * A percentage move reduced to a direction. `higherIsBetter` is separate from
 * the direction because "blocked work up 40%" is a fall, not a rise.
 */
export const deltaOf = (
  current: number,
  previous: number,
  higherIsBetter = true
): KpiDelta | undefined => {
  if (!previous) return undefined;
  const pct = Math.round(((current - previous) / Math.abs(previous)) * 100);
  const dir = pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat';
  return {
    pct: Math.abs(pct),
    dir,
    good: dir === 'flat' ? true : (dir === 'up') === higherIsBetter,
  };
};

export const deriveTasks = (
  snapshot: CommandSnapshot,
  now = new Date()
): CommandTask[] => {
  const me = snapshot.user.name;
  const out: CommandTask[] = [];

  /**
   * A blocked experience is not also "ready to deploy", "waiting on review" or
   * "unhealthy": it is stuck, and saying two of those in the same queue reads
   * as a contradiction. Blocked wins, and the other rows for it are dropped.
   */
  const blockedNames = new Set(snapshot.blockers.map(b => b.experienceName));

  for (const c of snapshot.campaigns) {
    for (const item of c.items) {
      const step = ITEM_STATUS_STEP[item.status];
      const overdue =
        item.due && step < 3 && new Date(`${item.due}T00:00:00`) < now;
      const ownerInitials =
        item.owner === 'Unassigned' ? null : initialsOf(item.owner);

      if (item.owner === 'Unassigned' && step < 4) {
        out.push({
          id: `${c.id}-${item.id}-unassigned`,
          kind: 'unassigned',
          severity: 'high',
          mine: false,
          what: `"${item.subjectName}" has no owner`,
          why: `${c.name} · due ${item.due ? formatDate(item.due) : 'no date'}`,
          cta: 'Assign it',
          campaignId: c.id,
          campaignName: c.name,
          ownerInitials: null,
          href: COMMAND_LINKS.campaigns,
        });
      } else if (overdue) {
        out.push({
          id: `${c.id}-${item.id}-late`,
          kind: 'late',
          severity: 'high',
          mine: item.owner === me,
          what: `"${item.subjectName}" is overdue`,
          why: `${c.name} · was due ${formatDate(item.due!)} · ${item.owner}`,
          cta: 'Open it',
          campaignId: c.id,
          campaignName: c.name,
          ownerInitials,
          href: COMMAND_LINKS.campaigns,
        });
      } else if (
        item.status === 'ready' &&
        !blockedNames.has(item.subjectName)
      ) {
        out.push({
          id: `${c.id}-${item.id}-deploy`,
          kind: 'deploy',
          severity: 'medium',
          mine: item.owner === me,
          what: `"${item.subjectName}" is ready to deploy`,
          why: `${c.name} · ${item.expCount} experience${item.expCount === 1 ? '' : 's'} · nobody has pushed it`,
          cta: 'Deploy it',
          campaignId: c.id,
          campaignName: c.name,
          ownerInitials,
          href: COMMAND_LINKS.deploy,
        });
      } else if (item.owner === me && step > 0 && step < 3 && item.due) {
        out.push({
          id: `${c.id}-${item.id}-inflight`,
          kind: 'inflight',
          severity: 'low',
          mine: true,
          what: `"${item.subjectName}" is in build`,
          why: `${c.name} · due ${formatDate(item.due)}`,
          cta: 'Continue',
          campaignId: c.id,
          campaignName: c.name,
          ownerInitials,
          href: COMMAND_LINKS.campaigns,
        });
      }
    }
  }

  /**
   * Blockers are the plan's headline requirement: the work is finished and only
   * an operational detail keeps it off the shop, so it reads as urgent.
   */
  for (const blocker of snapshot.blockers) {
    const days = blocker.waitingDays;
    out.push({
      id: `blocked-${blocker.id}`,
      kind: 'blocked',
      severity:
        BLOCKER_STYLE[blocker.reason].tone === 'error' ? 'high' : 'medium',
      mine: blocker.owner === me,
      what: `"${blocker.experienceName}" cannot go out`,
      why: `${blocker.campaignName} · ${blocker.detail} · stuck ${days} day${days === 1 ? '' : 's'}`,
      cta: 'Unblock it',
      campaignId: '',
      campaignName: blocker.campaignName,
      ownerInitials: blocker.owner ? initialsOf(blocker.owner) : null,
      href: blocker.href,
    });
  }

  for (const review of snapshot.reviews) {
    if (blockedNames.has(review.experienceName)) continue;
    const days = review.waitingDays;
    out.push({
      id: `review-${review.id}`,
      kind: 'review',
      severity: 'medium',
      mine: review.reviewer === me,
      what: `"${review.experienceName}" is waiting on review`,
      why: `${review.campaignName} · ${review.requestedBy} asked ${review.reviewer} · waiting ${days} day${days === 1 ? '' : 's'}`,
      cta: 'Review it',
      campaignId: '',
      campaignName: review.campaignName,
      ownerInitials: initialsOf(review.reviewer),
      href: review.href,
    });
  }

  for (const live of snapshot.liveExperiences) {
    if (live.health === 'ok') continue;
    if (blockedNames.has(live.name)) continue;
    out.push({
      id: `health-${live.id}`,
      kind: 'health',
      severity: live.health === 'broken' ? 'high' : 'medium',
      mine: false,
      what: `"${live.name}" is ${live.health}`,
      why: `${live.campaignName} · check deploy health`,
      cta: 'Open Deploy',
      campaignId: '',
      campaignName: live.campaignName,
      ownerInitials: null,
      href: COMMAND_LINKS.deploy,
    });
  }

  const order = { high: 0, medium: 1, low: 2 };
  return out.sort((a, b) => order[a.severity] - order[b.severity]);
};

export const deriveUpcoming = (
  campaigns: CommandCampaign[],
  now = new Date()
): UpcomingLaunch[] => {
  const soon: UpcomingLaunch[] = [];

  for (const c of campaigns) {
    if (c.status === 'done') continue;
    if (!c.start) continue;
    const start = new Date(`${c.start}T00:00:00`);
    if (start <= now) continue;
    const days = Math.ceil((start.getTime() - now.getTime()) / 86400000);
    const p = campProgress(c);
    soon.push({
      campaignId: c.id,
      campaignName: c.name,
      start: c.start,
      days,
      ready: p.done,
      total: p.total,
      isReady: p.done === p.total && p.total > 0,
    });
  }

  return soon.sort((a, b) => a.days - b.days);
};

export const deriveKpis = (
  snapshot: CommandSnapshot,
  tasks: CommandTask[],
  upcoming: UpcomingLaunch[]
): CommandKpi[] => {
  const liveCount = snapshot.campaigns.filter(c => c.status === 'live').length;
  const activeCount = snapshot.campaigns.filter(
    c => c.status === 'live' || c.status === 'building'
  ).length;
  const planningCount = snapshot.campaigns.filter(
    c => c.status === 'planning'
  ).length;
  const issues = tasks.filter(t => t.severity === 'high').length;
  const inMarket = snapshot.journeys.filter(j => !j.template).length;
  const blueprints = snapshot.journeys.length - inMarket;
  const prev = snapshot.previousTotals;

  return [
    {
      id: 'campaigns',
      group: 'running',
      labelKey: 'kpiCampaigns',
      value: activeCount,
      subKey: 'kpiCampaignsSub',
      subValues: { live: liveCount, planning: planningCount },
      accent: 'violet',
      href: COMMAND_LINKS.campaigns,
    },
    {
      id: 'live-exp',
      group: 'running',
      labelKey: 'kpiLiveExp',
      value: snapshot.liveExperiences.length,
      subKey: 'kpiLiveExpSub',
      subValues: { ready: snapshot.readyCount },
      accent: 'mint',
      href: COMMAND_LINKS.deploy,
    },
    {
      id: 'journeys',
      group: 'running',
      labelKey: 'kpiJourneys',
      value: inMarket,
      subKey: 'kpiJourneysSub',
      subValues: { blueprints },
      accent: 'violet',
      href: COMMAND_LINKS.journeys,
    },
    {
      id: 'upcoming',
      group: 'running',
      labelKey: 'kpiUpcoming',
      value: upcoming.length,
      subKey: upcoming.length ? 'kpiUpcomingSub' : 'kpiUpcomingEmpty',
      subValues: upcoming.length ? { days: upcoming[0]!.days } : undefined,
      accent: 'amber',
      href: COMMAND_LINKS.campaigns,
    },
    {
      id: 'sessions',
      group: 'producing',
      labelKey: 'kpiSessions',
      value: snapshot.totals.sessions.toLocaleString(),
      subKey: 'kpiSessionsSub',
      accent: 'blue',
      delta: deltaOf(snapshot.totals.sessions, prev.sessions),
      href: COMMAND_LINKS.intel,
    },
    {
      id: 'lift',
      group: 'producing',
      labelKey: 'kpiLift',
      value: `${snapshot.totals.lift >= 0 ? '+' : ''}${Math.round(snapshot.totals.lift * 100)}%`,
      subKey: 'kpiLiftSub',
      accent: 'mint',
      delta: deltaOf(snapshot.totals.lift, prev.lift),
      href: COMMAND_LINKS.intel,
    },
    {
      id: 'revenue',
      group: 'producing',
      labelKey: 'kpiRevenue',
      value: `$${Math.round(snapshot.totals.revenue / 1000)}k`,
      subKey: 'kpiRevenueSub',
      subValues: { leads: snapshot.totals.leads.toLocaleString() },
      accent: 'violet',
      delta: deltaOf(snapshot.totals.revenue, prev.revenue),
      href: COMMAND_LINKS.intel,
    },
    {
      id: 'attention',
      group: 'attention',
      labelKey: 'kpiAttention',
      value: issues,
      subKey: issues ? 'kpiAttentionBlocked' : 'kpiAttentionClear',
      accent: issues ? 'rose' : 'mint',
      tabId: 'mywork',
    },
  ];
};

export const countMyWork = (tasks: CommandTask[]): number =>
  tasks.filter(t => t.mine || t.kind === 'unassigned').length;
