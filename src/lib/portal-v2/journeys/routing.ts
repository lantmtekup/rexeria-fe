/**
 * Portal V2 — Journey editor edge routing.
 *
 * WHY A MODULE AND NOT THREE LINES IN THE CANVAS. The first cut drew every
 * route as `right port → halfway → left port`. Two routes leaving the same node
 * left the same pixel, ran down the same halfway column and arrived under the
 * same arrowhead: the picture said "these nodes are wired" without ever saying
 * WHICH to WHICH. Everything in here exists to keep routes apart.
 *
 *   1. FAN OUT. A node's outgoing routes leave at their own y, ordered by where
 *      they are going, and its incoming ones arrive the same way. Sorting each
 *      fan by the OTHER end is what stops sibling routes crossing on the way
 *      out of a node they share.
 *   2. LANES. The vertical leg of a route is nudged off its neighbours' by a
 *      fixed clearance whenever the two overlap — parallel routes get parallel
 *      columns instead of one column drawn n times. The nudge alternates around
 *      the ideal halfway point rather than always pushing one way, so a fan
 *      stays centred between the two columns it spans.
 *   3. AROUND, NOT THROUGH. No route may cross a card. A backwards route clears
 *      every box between its ends, above or below, whichever is nearer; a route
 *      down a column that would pass over a card in between takes the band's
 *      left gutter instead. `shapeOf` is where that choice is made, and there
 *      are exactly four answers.
 *
 * The corners are rounded because a rounded corner belongs to ONE line: where
 * two square corners meet, the eye cannot tell which arm continues into which.
 *
 * Everything here is pure and takes plain nodes, so the read-only graph can
 * adopt it later without dragging the editor's state along.
 */

import { BAND_W, NODE_H, NODE_W } from '@/lib/portal-v2/journeys/stages';
import type { JourneyNode } from '@/lib/portal-v2/journeys/types';

export type Point = { x: number; y: number };

export type JourneyEdgeRef = { from: string; to: string };

export type RoutedEdge = JourneyEdgeRef & {
  key: string;
  /** Where the route leaves its source, in floor units. */
  start: Point;
  /** The arrowhead — where it meets its target. */
  end: Point;
  /** Halfway ALONG THE DRAWN LINE, which is where the controls belong. */
  mid: Point;
  /** Which way the line runs there, so the controls can step off it. */
  midAxis: 'h' | 'v';
  d: string;
  /** Which of the four routes this is — see `shapeOf`. */
  shape: EdgeShape;
  /** The target sits in an earlier band, so the route has to detour. */
  back: boolean;
};

export const edgeKey = (from: string, to: string): string => `${from}→${to}`;

export const sameEdge = (a: JourneyEdgeRef, b: JourneyEdgeRef): boolean =>
  a.from === b.from && a.to === b.to;

/* ── geometry constants ────────────────────────────────────────────────── */

/** Straight run out of a port before the first bend. Keeps the arrow readable. */
const STUB = 24;
/** Clearance between two parallel legs. Slightly wider than the stroke halo. */
const LANE = 20;
/** Spacing between the fanned anchors on one node's edge, at most. */
const PORT_GAP = 13;
/** How much of the node's height the fan may use. */
const PORT_SPAN = NODE_H - 24;
/** Corner radius. Clamped to half the shorter arm, so short legs stay legible. */
const CORNER = 10;
/** Clearance a backwards route keeps from the boxes it goes around. */
const DETOUR = 30;
/** How far a within-band lane sits outside the cards it runs past. */
const GUTTER = 28;

const clamp = (value: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, value));

const left = (node: JourneyNode): number => node.px ?? 0;
const right = (node: JourneyNode): number => (node.px ?? 0) + NODE_W;
const top = (node: JourneyNode): number => node.py ?? 0;
const bottom = (node: JourneyNode): number => (node.py ?? 0) + NODE_H;
const centreY = (node: JourneyNode): number => (node.py ?? 0) + NODE_H / 2;
const centreX = (node: JourneyNode): number => (node.px ?? 0) + NODE_W / 2;

/** Where the i-th of n routes meets a node's edge, fanned around its middle. */
const fanY = (node: JourneyNode, index: number, count: number): number => {
  if (count <= 1) return centreY(node);
  const span = Math.min(PORT_GAP * (count - 1), PORT_SPAN);
  return centreY(node) - span / 2 + (span / (count - 1)) * index;
};

/** The point a route leaves from — the source's right edge. */
export const outAnchor = (node: JourneyNode): Point => ({
  x: right(node),
  y: centreY(node),
});

/** The point a route arrives at — the target's left edge. */
export const inAnchor = (node: JourneyNode): Point => ({
  x: left(node),
  y: centreY(node),
});

/* ── path building ─────────────────────────────────────────────────────── */

const dist = (a: Point, b: Point): number => Math.hypot(b.x - a.x, b.y - a.y);

/** Drop the points that add nothing: repeats, and corners on a straight run. */
const simplify = (points: Point[]): Point[] => {
  const out: Point[] = [];
  for (const point of points) {
    const last = out[out.length - 1];
    if (last && dist(last, point) < 0.5) continue;
    out.push(point);
  }
  return out.filter((point, i) => {
    if (i === 0 || i === out.length - 1) return true;
    const prev = out[i - 1];
    const next = out[i + 1];
    const cross =
      (point.x - prev.x) * (next.y - prev.y) -
      (point.y - prev.y) * (next.x - prev.x);
    return Math.abs(cross) > 0.5;
  });
};

/** `r` units from `at`, in the direction of `toward`. */
const stepToward = (at: Point, toward: Point, r: number): Point => {
  const len = dist(at, toward) || 1;
  return {
    x: at.x + ((toward.x - at.x) / len) * r,
    y: at.y + ((toward.y - at.y) / len) * r,
  };
};

const round = (value: number): number => Math.round(value * 100) / 100;

/** An orthogonal polyline drawn with rounded corners. */
const roundedPath = (points: Point[]): string => {
  if (points.length < 2) return '';
  const first = points[0];
  let d = `M ${round(first.x)} ${round(first.y)}`;

  for (let i = 1; i < points.length - 1; i += 1) {
    const prev = points[i - 1];
    const at = points[i];
    const next = points[i + 1];
    const r = Math.min(CORNER, dist(prev, at) / 2, dist(at, next) / 2);
    if (r < 1) {
      d += ` L ${round(at.x)} ${round(at.y)}`;
      continue;
    }
    const enter = stepToward(at, prev, r);
    const exit = stepToward(at, next, r);
    d += ` L ${round(enter.x)} ${round(enter.y)}`;
    d += ` Q ${round(at.x)} ${round(at.y)} ${round(exit.x)} ${round(exit.y)}`;
  }

  const last = points[points.length - 1];
  return `${d} L ${round(last.x)} ${round(last.y)}`;
};

/**
 * Halfway along the polyline — not the midpoint of the bounding box.
 *
 * The axis of the leg it lands on comes back with it: the controls that sit
 * here have to be pushed OFF the line, and which way is off depends on which
 * way the line runs.
 */
const polylineMid = (points: Point[]): { at: Point; axis: 'h' | 'v' } => {
  const spans = points.slice(1).map((point, i) => dist(points[i], point));
  const total = spans.reduce((sum, span) => sum + span, 0);
  let want = total / 2;

  for (let i = 0; i < spans.length; i += 1) {
    const span = spans[i];
    if (want <= span || i === spans.length - 1) {
      const t = span ? clamp(want / span, 0, 1) : 0;
      const a = points[i];
      const b = points[i + 1];
      return {
        at: { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t },
        axis: Math.abs(b.x - a.x) >= Math.abs(b.y - a.y) ? 'h' : 'v',
      };
    }
    want -= span;
  }
  return { at: points[0], axis: 'h' };
};

/* ── lanes ─────────────────────────────────────────────────────────────── */

type Lane = {
  /** Where the leg would sit if it had the channel to itself. */
  want: number;
  /** How far it may be pushed before it would run inside a node. */
  lo: number;
  hi: number;
  /** The leg's extent along the OTHER axis — two legs only clash if these meet. */
  a: number;
  b: number;
};

/**
 * Give every leg a position far enough from the ones it overlaps.
 *
 * Offsets are tried outward in both directions (`0, +gap, −gap, +2gap …`) so a
 * fan stays centred on where it wanted to be. A leg that cannot be placed inside
 * its range keeps the clamped ideal: a slightly doubled line beats a route that
 * leaves the channel and crosses a node.
 */
const packLanes = (lanes: Lane[], gap: number): number[] => {
  const order = lanes
    .map((_, index) => index)
    .sort((i, j) => lanes[i].want - lanes[j].want);

  const taken: { at: number; a: number; b: number }[] = [];
  const placed = new Array<number>(lanes.length).fill(0);

  for (const index of order) {
    const lane = lanes[index];
    let at = clamp(lane.want, Math.min(lane.lo, lane.hi), lane.hi);

    for (let step = 0; step <= 16; step += 1) {
      const tries = step === 0 ? [0] : [step * gap, -step * gap];
      const free = tries.find(delta => {
        const trial = lane.want + delta;
        if (trial < lane.lo - 0.01 || trial > lane.hi + 0.01) return false;
        return !taken.some(
          other =>
            Math.abs(other.at - trial) < gap - 0.01 &&
            other.a <= lane.b + 2 &&
            lane.a <= other.b + 2
        );
      });
      if (free === undefined) continue;
      at = lane.want + free;
      break;
    }

    placed[index] = at;
    taken.push({ at, a: lane.a, b: lane.b });
  }

  return placed;
};

/* ── one route ─────────────────────────────────────────────────────────── */

/**
 * FOUR SHAPES, BECAUSE THE FLOOR HAS COLUMNS.
 *
 * `forward` — the ordinary case: out of the right port, into the next band's
 *   left one, bending in the gutter between them.
 * `down` — both cards in the same band, target below. A column reads downward,
 *   so the route leaves the floor of one card and lands on the ceiling of the
 *   next. If a card stands BETWEEN the two, it goes down the band's left gutter
 *   instead: a line through a card is a line nobody can follow.
 * `up` — same band, target above. Round the band's right gutter and back into
 *   the target's right edge, so a loop inside a phase visibly loops.
 * `back` — the target sits in an earlier band. Clear every box in the way,
 *   above or below, and come back into the left port.
 */
export type EdgeShape = 'forward' | 'down' | 'up' | 'back';

/** True when there is room to bend between the two boxes rather than around. */
const hasRoom = (from: JourneyNode, to: JourneyNode): boolean =>
  left(to) - right(from) >= STUB * 2 + LANE;

/** The band a card belongs to. Stored; inferred from x only for stray data. */
const bandOf = (node: JourneyNode): number =>
  node.stage ?? Math.max(0, Math.floor(((node.px ?? 0) + NODE_W / 2) / BAND_W));

const bandLeft = (index: number): number => index * BAND_W;

/** Lanes inside a band, clear of the cards on either side. */
const gutterIn = (band: number): number =>
  bandLeft(band) + (BAND_W - NODE_W) / 2 - GUTTER;
const gutterOut = (band: number): number =>
  bandLeft(band) + (BAND_W - NODE_W) / 2 + NODE_W + GUTTER;

/** Is another card of the same band standing in the vertical gap? */
const cardBetween = (
  floor: JourneyNode[],
  band: number,
  yTop: number,
  yBottom: number,
  ignore: string[]
): boolean =>
  floor.some(
    node =>
      !ignore.includes(node.id) &&
      bandOf(node) === band &&
      bottom(node) > yTop + 1 &&
      top(node) < yBottom - 1
  );

const shapeOf = (from: JourneyNode, to: JourneyNode): EdgeShape => {
  if (bandOf(from) === bandOf(to)) {
    return centreY(to) > centreY(from) ? 'down' : 'up';
  }
  return hasRoom(from, to) ? 'forward' : 'back';
};

const forwardPoints = (start: Point, end: Point, mid: number): Point[] =>
  simplify([start, { x: mid, y: start.y }, { x: mid, y: end.y }, end]);

/** Straight down the column, floor to ceiling. */
const downPoints = (start: Point, end: Point): Point[] =>
  simplify([
    start,
    { x: start.x, y: (start.y + end.y) / 2 },
    { x: end.x, y: (start.y + end.y) / 2 },
    end,
  ]);

/** Down the band's left gutter, around whatever is standing in the way. */
const skipPoints = (start: Point, end: Point, lane: number): Point[] =>
  simplify([
    start,
    { x: lane, y: start.y },
    { x: lane, y: end.y - STUB },
    { x: end.x, y: end.y - STUB },
    end,
  ]);

/** Up and around the band's right gutter, back into the target's right edge. */
const upPoints = (start: Point, end: Point, lane: number): Point[] =>
  simplify([start, { x: lane, y: start.y }, { x: lane, y: end.y }, end]);

const backPoints = (start: Point, end: Point, detour: number): Point[] =>
  simplify([
    start,
    { x: start.x + STUB, y: start.y },
    { x: start.x + STUB, y: detour },
    { x: end.x - STUB, y: detour },
    { x: end.x - STUB, y: end.y },
    end,
  ]);

/**
 * Where the long horizontal leg of a backwards route should sit.
 *
 * It has to clear EVERY box it passes over, not just its own two ends: a route
 * that dives under its source and then straight through the node next door has
 * not gone around anything. So the obstacles are all the nodes standing in the
 * horizontal span the leg has to cross, and the leg goes above or below the lot
 * — whichever side is the shorter trip from the route's own middle.
 */
const detourWant = (
  from: JourneyNode,
  to: JourneyNode,
  floor: JourneyNode[]
): number => {
  const middle = (centreY(from) + centreY(to)) / 2;
  const lo = Math.min(left(to) - STUB, right(from) + STUB);
  const hi = Math.max(left(to) - STUB, right(from) + STUB);

  const blocking = floor.filter(
    node => right(node) >= lo - 1 && left(node) <= hi + 1
  );
  const boxes = blocking.length ? blocking : [from, to];

  const below = Math.max(...boxes.map(bottom)) + DETOUR;
  const above = Math.min(...boxes.map(top)) - DETOUR;
  return below - middle <= middle - above ? below : above;
};

/** Where a route of each shape leaves and lands, before any fan is applied. */
const anchorsFor = (
  from: JourneyNode,
  to: JourneyNode,
  shape: EdgeShape,
  skipping: boolean
): { start: Point; end: Point } => {
  if (shape === 'down') {
    return skipping
      ? {
          start: { x: left(from), y: centreY(from) },
          end: { x: centreX(to), y: top(to) },
        }
      : {
          start: { x: centreX(from), y: bottom(from) },
          end: { x: centreX(to), y: top(to) },
        };
  }
  if (shape === 'up') {
    return {
      start: { x: right(from), y: centreY(from) },
      end: { x: right(to), y: centreY(to) },
    };
  }
  return { start: outAnchor(from), end: inAnchor(to) };
};

const pointsFor = (
  shape: EdgeShape,
  start: Point,
  end: Point,
  lane: number,
  skipping: boolean
): Point[] => {
  if (shape === 'down')
    return skipping ? skipPoints(start, end, lane) : downPoints(start, end);
  if (shape === 'up') return upPoints(start, end, lane);
  if (shape === 'back') return backPoints(start, end, lane);
  return forwardPoints(start, end, lane);
};

const build = (
  from: string,
  to: string,
  start: Point,
  end: Point,
  points: Point[],
  shape: EdgeShape
): RoutedEdge => {
  const middle = polylineMid(points);
  return {
    from,
    to,
    key: edgeKey(from, to),
    start,
    end,
    mid: middle.at,
    midAxis: middle.axis,
    d: roundedPath(points),
    shape,
    back: shape === 'back',
  };
};

/**
 * Route ONE edge with nothing else on the floor — the live drag preview and any
 * caller that only has two nodes. `routeEdges` is what the canvas draws with.
 */
export const routeOne = (from: JourneyNode, to: JourneyNode): RoutedEdge => {
  const shape = shapeOf(from, to);
  const { start, end } = anchorsFor(from, to, shape, false);
  const lane =
    shape === 'back'
      ? detourWant(from, to, [from, to])
      : shape === 'up'
        ? gutterOut(bandOf(from))
        : (start.x + end.x) / 2;

  return build(
    from.id,
    to.id,
    start,
    end,
    pointsFor(shape, start, end, lane, false),
    shape
  );
};

/* ── the whole floor ───────────────────────────────────────────────────── */

const groupBy = <T>(
  items: T[],
  keyOf: (item: T) => string
): Map<string, T[]> => {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    const list = groups.get(key);
    if (list) list.push(item);
    else groups.set(key, [item]);
  }
  return groups;
};

/**
 * Lay out every edge at once.
 *
 * Order matters and is deterministic: fans are sorted by the far end's centre,
 * lanes are packed in ascending ideal position. The same graph therefore draws
 * the same way every render — a route must not jump lanes because React
 * re-rendered, only because a node moved.
 */
export const routeEdges = (
  nodes: JourneyNode[],
  edges: JourneyEdgeRef[]
): RoutedEdge[] => {
  const byId = new Map(nodes.map(node => [node.id, node]));
  const live = edges.filter(edge => byId.has(edge.from) && byId.has(edge.to));
  if (!live.length) return [];

  /* 1 — classify. The shape decides which EDGE of the card a route uses, and
     therefore which fan it belongs to. */
  const shaped = live.map(edge => {
    const from = byId.get(edge.from) as JourneyNode;
    const to = byId.get(edge.to) as JourneyNode;
    const shape = shapeOf(from, to);
    const skipping =
      shape === 'down' &&
      cardBetween(nodes, bandOf(from), bottom(from), top(to), [from.id, to.id]);
    return { edge, from, to, shape, skipping };
  });

  /* 2 — fan the anchors that share a card edge, sorted by where the other end
     sits. Only routes that actually leave through the right port compete for
     the right fan, and only routes that arrive at the left port for the left
     one; a route down the column uses neither. */
  const fanned = (
    uses: (item: (typeof shaped)[number]) => boolean,
    ownerOf: (edge: JourneyEdgeRef) => string,
    farOf: (edge: JourneyEdgeRef) => string
  ): Map<string, number> => {
    const ys = new Map<string, number>();
    const eligible = shaped.filter(uses).map(item => item.edge);

    for (const [ownerId, list] of groupBy(eligible, ownerOf)) {
      const owner = byId.get(ownerId);
      if (!owner) continue;
      const sorted = [...list].sort((a, b) => {
        const fa = byId.get(farOf(a));
        const fb = byId.get(farOf(b));
        if (!fa || !fb) return 0;
        return centreY(fa) - centreY(fb) || left(fa) - left(fb);
      });
      sorted.forEach((edge, index) => {
        ys.set(edgeKey(edge.from, edge.to), fanY(owner, index, sorted.length));
      });
    }
    return ys;
  };

  const startYs = fanned(
    item => item.shape !== 'down',
    edge => edge.from,
    edge => edge.to
  );
  const endYs = fanned(
    item => item.shape === 'forward' || item.shape === 'back',
    edge => edge.to,
    edge => edge.from
  );

  const placed = shaped.map(item => {
    const key = edgeKey(item.edge.from, item.edge.to);
    const base = anchorsFor(item.from, item.to, item.shape, item.skipping);
    const startY = startYs.get(key);
    const endY = endYs.get(key);
    return {
      ...item,
      start:
        item.shape === 'down' || startY === undefined
          ? base.start
          : { ...base.start, y: startY },
      end:
        item.shape === 'forward' || item.shape === 'back'
          ? { ...base.end, y: endY ?? base.end.y }
          : base.end,
    };
  });

  /* 3 — pack each family of legs into its own lanes. A vertical leg between two
     bands and a vertical leg inside one band never share a channel, so they are
     packed apart rather than fighting for the same numbers. */
  const family = (shape: EdgeShape, skipping?: boolean) =>
    placed.filter(
      item =>
        item.shape === shape &&
        (skipping === undefined || item.skipping === skipping)
    );

  const forwards = family('forward');
  const backs = family('back');
  const ups = family('up');
  const skips = family('down', true);
  const downs = family('down', false);

  const forwardLanes = packLanes(
    forwards.map(item => ({
      want: (item.start.x + item.end.x) / 2,
      lo: item.start.x + STUB,
      hi: item.end.x - STUB,
      a: Math.min(item.start.y, item.end.y),
      b: Math.max(item.start.y, item.end.y),
    })),
    LANE
  );

  const backLanes = packLanes(
    backs.map(item => ({
      want: detourWant(item.from, item.to, nodes),
      lo: -Infinity,
      hi: Infinity,
      a: Math.min(item.end.x, item.start.x) - STUB,
      b: Math.max(item.end.x, item.start.x) + STUB,
    })),
    LANE
  );

  const upLanes = packLanes(
    ups.map(item => ({
      want: gutterOut(bandOf(item.from)),
      lo: right(item.from) + 8,
      hi: bandLeft(bandOf(item.from)) + BAND_W - 8,
      a: Math.min(item.start.y, item.end.y),
      b: Math.max(item.start.y, item.end.y),
    })),
    LANE
  );

  const skipLanes = packLanes(
    skips.map(item => ({
      want: gutterIn(bandOf(item.from)),
      lo: bandLeft(bandOf(item.from)) + 8,
      hi: left(item.from) - 8,
      a: Math.min(item.start.y, item.end.y),
      b: Math.max(item.start.y, item.end.y),
    })),
    LANE
  );

  /* 4 — draw, keeping the caller's edge order so the picture is stable. */
  const routed = new Map<string, RoutedEdge>();

  const draw = (
    items: typeof placed,
    lanes: number[] | null,
    shape: EdgeShape
  ) => {
    items.forEach((item, index) => {
      const lane = lanes ? lanes[index] : 0;
      const points = pointsFor(
        shape,
        item.start,
        item.end,
        lane,
        item.skipping
      );
      const edge = build(
        item.edge.from,
        item.edge.to,
        item.start,
        item.end,
        points,
        shape
      );
      routed.set(edge.key, edge);
    });
  };

  draw(forwards, forwardLanes, 'forward');
  draw(backs, backLanes, 'back');
  draw(ups, upLanes, 'up');
  draw(skips, skipLanes, 'down');
  draw(downs, null, 'down');

  return live.flatMap(edge => {
    const hit = routed.get(edgeKey(edge.from, edge.to));
    return hit ? [hit] : [];
  });
};

/* ── the live drag ─────────────────────────────────────────────────────── */

/**
 * The dangling half of a link being pulled. A curve rather than the orthogonal
 * route on purpose: nothing is decided yet, and a soft line that follows the
 * cursor says "in progress" where a crisp right angle would say "done".
 *
 * `dir` is +1 pulling out of a source's right port, −1 pulling out of a
 * target's left one.
 */
export const danglingPath = (
  anchor: Point,
  dir: 1 | -1,
  cursor: Point
): string => {
  const reach = clamp(Math.abs(cursor.x - anchor.x) / 2, 24, 96) * dir;
  return [
    `M ${round(anchor.x)} ${round(anchor.y)}`,
    `C ${round(anchor.x + reach)} ${round(anchor.y)}`,
    `${round(cursor.x - reach)} ${round(cursor.y)}`,
    `${round(cursor.x)} ${round(cursor.y)}`,
  ].join(' ');
};
