/**
 * Portal V2 — Journey Builder logic.
 *
 * Everything here is a pure function of the graph. The graph is the only stored
 * thing; layout, validation, readiness and every number are derived, so a
 * verdict can never go stale behind an edit.
 *
 * The mutators take a list and return a NEW list — the prototype pushes into
 * its global `DATA.journeys`, which React state cannot do.
 */

import {
  OUTCOME_FOR_OBJECTIVE,
  segmentById,
  type JourneySegment,
} from '@/lib/portal-v2/journeys/constants';
import type {
  Journey,
  JourneyCheck,
  JourneyDraftInput,
  JourneyFilters,
  JourneyLayoutNode,
  JourneyNode,
  JourneyNodeStats,
  JourneyReadiness,
  JourneyState,
  JourneyStats,
  JourneyWalkStage,
} from '@/lib/portal-v2/journeys/types';

/* ── identity ──────────────────────────────────────────────────────────── */

export const journeyState = (j: Journey): JourneyState =>
  j.template ? 'blueprint' : 'copy';

/** Where the journey lives: the shared library, or one campaign. */
export const journeyHome = (j: Journey): string =>
  j.template ? 'Journey library' : (j.campaignName ?? '—');

export const findJourney = (
  list: Journey[],
  id: string | null
): Journey | null => (id ? (list.find(j => j.id === id) ?? null) : null);

export const copiesOfJourney = (list: Journey[], j: Journey): Journey[] =>
  list.filter(x => !x.template && x.origin === j.id);

export const nodeById = (j: Journey, id: string): JourneyNode | null =>
  j.nodes.find(n => n.id === id) ?? null;

export const countNodesOfKind = (j: Journey, kind: JourneyNode['kind']) =>
  j.nodes.filter(n => n.kind === kind).length;

/* ── layout ────────────────────────────────────────────────────────────── */

/**
 * Layered layout — longest path from the entries decides the column, arrival
 * order decides the row. Deterministic: same graph, same picture.
 *
 * The `guard` is what makes this safe on a graph that has not been validated
 * yet: a cycle would otherwise never drain the queue.
 */
export const orderNodes = (j: Journey): JourneyLayoutNode[] => {
  const depth: Record<string, number> = {};
  const entries = j.nodes.filter(n => n.kind === 'entry');
  const queue = entries.map(n => n.id);
  entries.forEach(n => {
    depth[n.id] = 0;
  });

  let guard = j.nodes.length * j.nodes.length + 8;
  while (queue.length && guard--) {
    const id = queue.shift();
    if (!id) continue;
    const node = nodeById(j, id);
    if (!node) continue;
    for (const target of node.to) {
      const d = (depth[id] ?? 0) + 1;
      if (
        (depth[target] === undefined || d > depth[target]) &&
        d <= j.nodes.length
      ) {
        depth[target] = d;
        queue.push(target);
      }
    }
  }

  const rows: Record<number, number> = {};
  return j.nodes.map(node => {
    const col = depth[node.id] ?? 0;
    rows[col] = rows[col] ?? 0;
    const row = rows[col];
    rows[col] += 1;
    return { node, col, row };
  });
};

/** Layout sorted left-to-right, top-to-bottom — reading order. */
export const orderedLayout = (j: Journey): JourneyLayoutNode[] =>
  orderNodes(j)
    .slice()
    .sort((a, b) => a.col - b.col || a.row - b.row);

/* ── validation ────────────────────────────────────────────────────────── */

/**
 * The journey contract, as checks you can see. Each one is a rule the plan
 * names: entry to outcome, purposeful nodes, connected, acyclic, no dead ends,
 * real links, named systems. A broken journey says so on screen, in the same
 * breath as showing you the break.
 */
export const validateJourney = (j: Journey): JourneyCheck[] => {
  const ids = new Set(j.nodes.map(n => n.id));
  const entries = j.nodes.filter(n => n.kind === 'entry');
  const outcomes = j.nodes.filter(n => n.kind === 'outcome');
  const checks: JourneyCheck[] = [];

  checks.push({
    ok: entries.length >= 1,
    msg: 'Starts from a defined entry source',
  });
  checks.push({ ok: outcomes.length >= 1, msg: 'Ends in a business outcome' });
  checks.push({
    ok: j.nodes.every(n => n.to.every(t => ids.has(t))),
    msg: 'Every route points at a real node',
  });

  const seen = new Set<string>();
  const queue = entries.map(n => n.id);
  while (queue.length) {
    const id = queue.shift();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    nodeById(j, id)?.to.forEach(t => queue.push(t));
  }
  checks.push({
    ok: j.nodes.every(n => seen.has(n.id)),
    msg: 'No node is unreachable from the entry',
  });

  const reachesOutcome = (start: string): boolean => {
    const visited = new Set<string>();
    const q = [start];
    while (q.length) {
      const id = q.shift();
      if (!id || visited.has(id)) continue;
      visited.add(id);
      nodeById(j, id)?.to.forEach(t => q.push(t));
    }
    return [...visited].some(id => nodeById(j, id)?.kind === 'outcome');
  };
  checks.push({
    ok: j.nodes.every(n => n.kind === 'outcome' || reachesOutcome(n.id)),
    msg: 'Every path reaches an outcome — no dead ends',
  });

  /* Three-colour DFS: grey (1) means we met a node still on the stack. */
  const colour: Record<string, number> = {};
  let cyclic = false;
  const dfs = (id: string) => {
    if (colour[id] === 1) {
      cyclic = true;
      return;
    }
    if (colour[id] === 2) return;
    colour[id] = 1;
    nodeById(j, id)?.to.forEach(dfs);
    colour[id] = 2;
  };
  j.nodes.forEach(n => dfs(n.id));
  checks.push({ ok: !cyclic, msg: 'No circular routing' });

  checks.push({
    ok: j.nodes.every(n => n.kind !== 'experience' || Boolean(n.xName)),
    msg: 'Every experience node links a real experience',
  });
  checks.push({
    ok: j.nodes.every(n => Boolean(n.d)),
    msg: 'Every node states its customer purpose',
  });
  checks.push({
    ok: j.nodes.every(
      n => !['entry', 'action', 'outcome'].includes(n.kind) || Boolean(n.via)
    ),
    msg: 'Entries, actions and outcomes name their system',
  });

  return checks;
};

/**
 * Readiness = the validation contract plus what execution needs — tracking on
 * every linked experience. A score that cannot go stale, and a missing list
 * that is always the truth.
 */
export const journeyReadiness = (j: Journey): JourneyReadiness => {
  const checks: JourneyCheck[] = [
    ...validateJourney(j),
    {
      ok: j.nodes
        .filter(n => n.kind === 'experience')
        .every(n => Boolean(n.xName) && (n.xCoverage ?? 0) > 0),
      msg: 'Every linked experience has tracking points',
    },
  ];

  const passed = checks.filter(c => c.ok).length;
  return {
    score: Math.round((passed / checks.length) * 100),
    checks,
    missing: checks.filter(c => !c.ok).map(c => c.msg),
  };
};

/** What each node still needs before the journey can run — the work list. */
export const journeyGaps = (
  j: Journey
): { node: JourneyNode; need: string }[] =>
  j.nodes.flatMap(node => {
    if (!node.d)
      return [{ node, need: 'State what this does for the shopper' }];
    if (node.kind === 'experience' && !node.xName)
      return [{ node, need: 'Link an experience' }];
    if (node.kind === 'experience' && (node.xCoverage ?? 0) === 0)
      return [{ node, need: 'The linked experience measures nothing yet' }];
    if (['entry', 'action', 'outcome'].includes(node.kind) && !node.via)
      return [{ node, need: 'Name the system it hands to' }];
    if (node.kind === 'decision' && node.to.length < 2)
      return [{ node, need: 'A decision needs at least two branches' }];
    if (node.kind !== 'outcome' && node.to.length === 0)
      return [{ node, need: 'Route it onward — this path ends nowhere' }];
    return [];
  });

/* ── numbers ───────────────────────────────────────────────────────────── */

/** Session-weighted, so a tiny stage cannot swing the headline. */
const rollup = (measured: JourneyNodeStats[]): JourneyStats | null => {
  if (!measured.length) return null;
  const sessions = measured.reduce((sum, s) => sum + s.sessions, 0);
  if (!sessions) return null;
  return {
    sessions,
    lift: measured.reduce((sum, s) => sum + s.lift * s.sessions, 0) / sessions,
  };
};

/**
 * THE LINK RESOLVES, IT IS NEVER STORED TWICE. A copy's numbers are its own.
 * A blueprint has never run — so it borrows the rows of every copy forked from
 * it, matched through the experience each node links. That is the same lineage
 * the prototype walks, and it is why the headline figure and the walk-through
 * can never disagree: both read this one map.
 */
export const resolveNodeStats = (
  list: Journey[],
  j: Journey
): Map<string, JourneyNodeStats | null> => {
  const resolved = new Map<string, JourneyNodeStats | null>();

  if (!j.template) {
    j.nodes.forEach(n => resolved.set(n.id, n.stats ?? null));
    return resolved;
  }

  const copies = copiesOfJourney(list, j);
  j.nodes.forEach(node => {
    if (node.kind !== 'experience' || !node.x) {
      resolved.set(node.id, null);
      return;
    }
    const measured = copies.flatMap(c =>
      c.nodes.flatMap(n => (n.x === node.x && n.stats ? [n.stats] : []))
    );
    resolved.set(node.id, rollup(measured));
  });

  return resolved;
};

/**
 * The journey's headline. Never run ⇒ no rows ⇒ no numbers at all — `null`,
 * never a zero.
 */
export const journeyStats = (
  list: Journey[],
  j: Journey
): JourneyStats | null =>
  rollup([...resolveNodeStats(list, j).values()].flatMap(s => (s ? [s] : [])));

/**
 * The walk-through. Each experience stage shows what it measured in this
 * campaign; the reach is min-chained so a downstream stage can never claim
 * more shoppers than arrived. Sibling branches SPLIT the arriving flow in
 * proportion to what each measured — two branches cannot both claim the whole
 * river. A segment perspective scales by that segment's behavioural share.
 *
 * Modelled and assisted: the journey did not cause these numbers.
 */
export const walkJourney = (
  list: Journey[],
  j: Journey,
  segId: string,
  segments: JourneySegment[]
): JourneyWalkStage[] => {
  // `all` = không thu hẹp ⇒ hệ số 1. Một phân khúc cụ thể thì dùng share ĐO
  // ĐƯỢC; bản trước lấy hằng số viết tay rồi nhân vào số phiên có thật.
  const share =
    segId === 'all' ? 1 : (segmentById(segments, segId)?.share ?? 0);
  const layout = orderedLayout(j);
  const nodeStats = resolveNodeStats(list, j);

  const columns = new Map<number, JourneyLayoutNode[]>();
  layout.forEach(item => {
    const bucket = columns.get(item.col) ?? [];
    bucket.push(item);
    columns.set(item.col, bucket);
  });

  const reachOf = new Map<
    string,
    { stats: JourneyWalkStage['stats']; reached: number | null }
  >();
  let flow = Infinity;

  for (const col of [...columns.keys()].sort((a, b) => a - b)) {
    const raws = (columns.get(col) ?? [])
      .filter(item => item.node.kind === 'experience')
      .map(item => {
        const s = nodeStats.get(item.node.id) ?? null;
        return {
          id: item.node.id,
          stats: s
            ? { sessions: Math.round(s.sessions * share), lift: s.lift }
            : null,
          raw: s ? Math.round(s.sessions * share) : null,
        };
      });

    const known = raws.filter(r => r.raw !== null);
    const sum = known.reduce((n, r) => n + (r.raw ?? 0), 0);
    let colFlow = 0;
    let any = false;

    for (const r of raws) {
      if (r.raw === null) {
        reachOf.set(r.id, { stats: r.stats, reached: null });
        continue;
      }
      const reached =
        flow === Infinity
          ? r.raw
          : Math.min(r.raw, Math.round(flow * (sum ? r.raw / sum : 0)));
      reachOf.set(r.id, { stats: r.stats, reached });
      colFlow += reached;
      any = true;
    }

    if (any) flow = colFlow;
  }

  return layout.map(item => {
    const hit = reachOf.get(item.node.id);
    return {
      node: item.node,
      col: item.col,
      stats: hit?.stats ?? null,
      reached: hit ? hit.reached : null,
    };
  });
};

/* ── list ──────────────────────────────────────────────────────────────── */

export const countByState = (
  list: Journey[],
  state: JourneyFilters['state']
): number =>
  state === 'all'
    ? list.length
    : list.filter(j => journeyState(j) === state).length;

export const filterJourneys = (
  list: Journey[],
  filters: JourneyFilters
): Journey[] => {
  const q = filters.q.trim().toLowerCase();
  return list.filter(j => {
    if (filters.state !== 'all' && journeyState(j) !== filters.state)
      return false;
    if (!q) return true;
    return (
      j.name.toLowerCase().includes(q) ||
      j.tagline.toLowerCase().includes(q) ||
      journeyHome(j).toLowerCase().includes(q)
    );
  });
};

/* ── mutations (mock, local state) ─────────────────────────────────────── */

export type ForkResult = {
  list: Journey[];
  journey: Journey;
  /** True ⇒ that campaign already had this journey; nothing was created. */
  existed: boolean;
};

/**
 * Copy-on-use. The id is deterministic from the triple that IS the copy's
 * identity — origin × campaign — so forking the same blueprint into the same
 * campaign twice can only ever find the first one.
 */
export const forkJourney = (
  list: Journey[],
  journeyId: string,
  campaignId: string,
  campaignName: string
): ForkResult | null => {
  const source = findJourney(list, journeyId);
  if (!source) return null;

  const origin = source.template ? source.id : (source.origin ?? source.id);
  const existing = list.find(
    x => x.origin === origin && x.campaign === campaignId
  );
  if (existing) return { list, journey: existing, existed: true };

  const copy: Journey = {
    ...structuredClone(source),
    id: `j-${origin}-${campaignId}`,
    template: false,
    origin,
    campaign: campaignId,
    campaignName,
    updated: 'just now',
  };

  return { list: [copy, ...list], journey: copy, existed: false };
};

export const duplicateJourney = (
  list: Journey[],
  journeyId: string
): ForkResult | null => {
  const source = findJourney(list, journeyId);
  if (!source) return null;

  const copy: Journey = {
    ...structuredClone(source),
    id: `${source.id}-copy-${Date.now().toString(36)}`,
    name: `${source.name} (copy)`,
    updated: 'just now',
  };

  return { list: [copy, ...list], journey: copy, existed: false };
};

export const deleteJourney = (list: Journey[], journeyId: string): Journey[] =>
  list.filter(j => j.id !== journeyId);

/**
 * A new journey is never an empty canvas: it opens with the front door and the
 * business result already stated, so the first thing the author does is design
 * the middle — which is the only part that is actually theirs to decide.
 */
export const createJourney = (input: JourneyDraftInput): Journey => {
  const outcome = OUTCOME_FOR_OBJECTIVE[input.obj];
  const id = `j-new-${Date.now().toString(36)}`;

  return {
    id,
    name: input.name.trim() || 'Untitled journey',
    template: true,
    campaign: null,
    campaignName: null,
    origin: null,
    obj: input.obj,
    personaId: input.personaId,
    updated: 'just now',
    tagline: 'A route from a front door to a result.',
    summary:
      'Drafted from the objective. Add the experiences the shopper moves through, then the decision that splits them.',
    nodes: [
      {
        id: 'n1',
        kind: 'entry',
        name: 'Paid advertising',
        d: 'Where this journey’s traffic comes from.',
        src: 'paid',
        via: 'Meta · Google',
        to: ['n2'],
      },
      {
        id: 'n2',
        kind: 'outcome',
        name: outcome.name,
        d: outcome.d,
        via: outcome.via,
        to: [],
      },
    ],
  };
};
