'use client';

/**
 * Per-block analytics grid for a single landing page. Renders one card per
 * block with:
 *  - Small live `BlockMiniPreview` thumbnail
 *  - Block label + total views in range
 *  - Smooth (catmull-rom → cubic bezier) sparkline of daily views
 *
 * Data source is `BlockBreakdownRow[]` from the portal breakdown endpoint
 * (or admin equivalent). When the BE doesn't yet ship `views_by_day` (see
 * be-todo.md P1.7) we synthesise a deterministic mock per block_id so the
 * UI still demonstrates shape — banner indicates fake source.
 */

import * as React from 'react';
import {
  ArrowLeft,
  ListTree,
  Loader2,
  MousePointerClick,
  TrendingUp,
} from 'lucide-react';

import { BlockMiniPreview } from '@/components/modules/block-editor/BlockMiniPreview';
import { parseCanvas } from '@/components/modules/block-editor/serialize';
import { BLOCK_TYPE_META } from '@/components/modules/block-editor/types';
import type { Block, BlockType } from '@/components/modules/block-editor/types';
import { rexerApi } from '@/services/rexer/endpoints';
import type { BlockBreakdownRow } from '@/services/rexer/types';
import { getCodeTemplate } from '@/templates/registry';
import type { TemplateSection } from '@/templates/types';
import { cn } from '@/lib/cn';

type Range = 7 | 14 | 30;

const RANGES: { id: Range; label: string }[] = [
  { id: 7, label: '7 ngày' },
  { id: 14, label: '14 ngày' },
  { id: 30, label: '30 ngày' },
];

// Derive từ registry BLOCK_TYPE_META (nguồn duy nhất).
const BLOCK_TYPE_LABEL: Record<BlockType, string> = Object.fromEntries(
  Object.values(BLOCK_TYPE_META).map(m => [m.type, m.adminLabel])
) as Record<BlockType, string>;

interface Props {
  /** Page id (kept name `templateId` for back-compat — historic naming). */
  templateId: string;
  templateName?: string;
  /** Where to send the user via the back button. */
  backHref?: string;
  /** @deprecated Wave 3 — canonical `pages.analytics.blocks` works for both
   *  admin + portal (BE enforces RLS). Prop accepted but ignored. */
  useAdminEndpoint?: boolean;
}

interface LoadedBlock {
  block: Block;
  /** Title harvested from contentVi.desktop for readability. */
  label: string;
}

export function BlockAnalyticsGrid({
  templateId,
  templateName,
  backHref = '/portal/landing-pages',
}: Props) {
  const [blocks, setBlocks] = React.useState<LoadedBlock[] | null>(null);
  const [rows, setRows] = React.useState<BlockBreakdownRow[] | null>(null);
  const [range, setRange] = React.useState<Range>(7);
  const [loading, setLoading] = React.useState(true);
  const [usingMock, setUsingMock] = React.useState(false);
  /** Per-section list khi page dùng code template — declared trong
   *  template meta.tracking.sections. Null = block template, dùng
   *  `blocks` legacy. */
  const [sections, setSections] = React.useState<TemplateSection[] | null>(
    null
  );
  /** Code template name (display only ở banner). */
  const [codeTemplateLabel, setCodeTemplateLabel] = React.useState<
    string | null
  >(null);
  /** Real per-section metrics keyed by section_id, from the GA-style
   *  breakdown endpoint (spec §17). Null until first load for a code
   *  template. */
  const [sectionStats, setSectionStats] = React.useState<Map<
    string,
    { views: number; clicks: number; series: number[] }
  > | null>(null);
  /** Per-CTA click counts keyed by cta_id (declared trong
   *  meta.tracking.ctas). Bổ sung cho sectionStats — user thấy được CTA
   *  nào convert. Null khi block template. */
  const [ctaStats, setCtaStats] = React.useState<Map<
    string,
    { clicks: number; series: number[] }
  > | null>(null);
  /** Declared CTAs từ meta để render label + ensure mọi CTA hiện cards
   *  (cả khi clicks=0). */
  const [ctas, setCtas] = React.useState<
    Array<{ id: string; label: string; section?: string }>
  >([]);

  // Wave 3 migration 2026-05-31: canvasTemplates.get retired → load via
  // canonical page → template → HEAD version chain. `templateId` prop name
  // kept for back-compat — actually the page id from the URL.
  //
  // 2026-05-31 fix: load HEAD (max version_no) instead of the version
  // referenced by page.template_version_id. BE createVersion không
  // auto-promote current_version_id / page.template_version_id, nên
  // page.template_version_id thường trỏ về version cũ rỗng. Áp dụng
  // workaround giống BlockEditor (be-audit §11 + commit 9d13b38).
  React.useEffect(() => {
    let cancelled = false;
    setSections(null);
    setCodeTemplateLabel(null);
    (async () => {
      try {
        const page = await rexerApi.pages.get(templateId);
        if (cancelled) return;

        // PRIMARY structure source — the PUBLISHED blueprint from
        // `/public/pages/{slug}`. This is exactly what renders on /p/{slug}
        // and what analytics events were tracked against, so its block ids
        // line up with the breakdown rows. The template-version HEAD chain
        // below is a fallback: for copied / re-versioned pages the HEAD
        // blueprint is often empty (BE doesn't bump current_version_id),
        // which is why a published page showed "chưa có block" despite having
        // breakdown data.
        if (page.slug) {
          try {
            const pub = await rexerApi.publicPages.get(page.slug);
            if (cancelled) return;
            if (pub) {
              const codeTpl = pub.template_code
                ? getCodeTemplate(pub.template_code)
                : undefined;
              if (codeTpl) {
                setCodeTemplateLabel(codeTpl.meta.name);
                setSections(codeTpl.meta.tracking?.sections ?? []);
                setCtas(codeTpl.meta.tracking?.ctas ?? []);
                setBlocks(null);
                return;
              }
              const pubBlocks = Array.isArray(
                (pub.canvas_blueprint as { blocks?: unknown[] })?.blocks
              )
                ? (pub.canvas_blueprint as { blocks: unknown[] }).blocks
                : [];
              if (pubBlocks.length > 0) {
                const parsed = parseCanvas({
                  schema_version: '2.0',
                  blocks: pubBlocks,
                });
                if (parsed && parsed.blocks.length > 0) {
                  setBlocks(
                    parsed.blocks.map(b => ({
                      block: b,
                      label: extractLabel(b),
                    }))
                  );
                  return;
                }
              }
            }
          } catch {
            // Public fetch failed (unpublished page, etc.) — fall through to
            // the legacy template-version chain below.
          }
        }

        const templates = await rexerApi.templates.list({ limit: 200 });
        const tpl = templates.items?.find(
          t => t.current_version_id === page.template_version_id
        );
        if (!tpl) {
          setBlocks([]);
          return;
        }

        // Code template branch — render section cards declared trong
        // meta.tracking.sections, KHÔNG đọc canvas_blueprint (template
        // không dùng blocks). Block stub có thể còn sót trong canvas_
        // blueprint của template (vd Mint-coint) — bỏ qua.
        const codeTpl = getCodeTemplate(tpl.code);
        if (codeTpl) {
          setCodeTemplateLabel(codeTpl.meta.name);
          setSections(codeTpl.meta.tracking?.sections ?? []);
          setCtas(codeTpl.meta.tracking?.ctas ?? []);
          setBlocks(null);
          return;
        }
        // Pick HEAD version (max version_no) — editor commit Save Version
        // chỉ tạo new version, không bump current_version_id ở BE.
        const versList = await rexerApi.templates.versions(tpl.id);
        if (cancelled) return;
        const headVer = (versList.items ?? []).reduce<
          (typeof versList.items)[number] | null
        >(
          (max, v) =>
            !max || (v.version_no ?? 0) > (max.version_no ?? 0) ? v : max,
          null
        );
        const targetVerId = headVer?.id ?? page.template_version_id;
        // Template chưa có version nào (chưa publish/commit) → đừng gọi
        // version(<null>) gây 500. Hiện trống thay vì vỡ.
        if (!targetVerId) {
          setBlocks([]);
          return;
        }
        const ver = await rexerApi.templates.version(tpl.id, targetVerId);
        if (cancelled) return;
        // canvas_blueprint stores schema_version: "1.0"; coerce to "2.0".
        const adapted = ver.canvas_blueprint
          ? {
              schema_version: '2.0',
              blocks: Array.isArray(
                (ver.canvas_blueprint as { blocks?: unknown }).blocks
              )
                ? (ver.canvas_blueprint as { blocks: unknown[] }).blocks
                : [],
            }
          : undefined;
        const parsed = parseCanvas(adapted);
        if (!parsed) {
          setBlocks([]);
          return;
        }
        const loaded = parsed.blocks.map(b => ({
          block: b,
          label: extractLabel(b),
        }));
        setBlocks(loaded);
      } catch {
        if (cancelled) return;
        // Endpoint internal-only / page lỗi → vẫn hiện full layout với data 0
        // (summary + empty state) thay vì chặn cả trang bằng màn lỗi.
        setBlocks([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [templateId]);

  // Reload breakdown each time range (or template kind) changes.
  //  - Code template → GA-style section breakdown (spec §17, /analytics/
  //    breakdown grouped by dimensions.section_id). section_view = views +
  //    daily series, cta_click = clicks; joined by section_id.
  //  - Block template → canonical pages.analytics.blocks (both admin +
  //    portal use it; BE enforces RLS via session principal).
  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);

    if (sections) {
      if (sections.length === 0 && ctas.length === 0) {
        setSectionStats(new Map());
        setCtaStats(new Map());
        setLoading(false);
        return;
      }
      // 3 breakdown calls parallel: section_view (per section_id),
      // cta_click per section_id (cho aggregate clicks per-section),
      // cta_click per cta_id (cho CTA cards riêng).
      Promise.all([
        rexerApi.pages.analytics
          .breakdown(templateId, {
            group_by: 'dimensions.section_id',
            event_type: 'section_view',
            range: `${range}d`,
          })
          .catch(() => ({ items: [] })),
        rexerApi.pages.analytics
          .breakdown(templateId, {
            group_by: 'dimensions.section_id',
            event_type: 'cta_click',
            range: `${range}d`,
          })
          .catch(() => ({ items: [] })),
        rexerApi.pages.analytics
          .breakdown(templateId, {
            group_by: 'dimensions.cta_id',
            event_type: 'cta_click',
            range: `${range}d`,
          })
          .catch(() => ({ items: [] })),
      ])
        .then(([viewsRes, sectionClicksRes, ctaRes]) => {
          if (cancelled) return;
          const sm = new Map<
            string,
            { views: number; clicks: number; series: number[] }
          >();
          for (const r of viewsRes.items ?? []) {
            sm.set(r.key, {
              views: r.metrics?.count ?? 0,
              clicks: 0,
              series: r.views_by_day ?? [],
            });
          }
          for (const r of sectionClicksRes.items ?? []) {
            const e = sm.get(r.key) ?? { views: 0, clicks: 0, series: [] };
            e.clicks = r.metrics?.count ?? 0;
            sm.set(r.key, e);
          }
          setSectionStats(sm);

          const cm = new Map<string, { clicks: number; series: number[] }>();
          for (const r of ctaRes.items ?? []) {
            cm.set(r.key, {
              clicks: r.metrics?.count ?? 0,
              series: r.views_by_day ?? [],
            });
          }
          setCtaStats(cm);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }

    rexerApi.pages.analytics
      .blocks(templateId, { range: `${range}d` })
      .then(res => {
        if (cancelled) return;
        const arr: BlockBreakdownRow[] = res.items ?? [];
        setRows(arr);
        const hasReal = arr.some(
          r => Array.isArray(r.views_by_day) && r.views_by_day.length > 0
        );
        setUsingMock(!hasReal);
      })
      .catch(() => {
        if (cancelled) return;
        // 404 / no data → empty rows, will mock everything
        setRows([]);
        setUsingMock(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [templateId, range, sections, ctas.length]);

  const rowMap = React.useMemo(() => {
    const m = new Map<string, BlockBreakdownRow>();
    for (const r of rows ?? []) m.set(r.block_id, r);
    return m;
  }, [rows]);

  // Compute total + averages across all blocks
  const aggregate = React.useMemo(() => {
    // Code template branch — sum từ sectionStats (BE breakdown grouped
    // by dimensions.section_id, per §17). "blocks có data" reuse cho
    // section count, label vẫn ổn vì user mental model "thực thể tracked".
    if (sections && sectionStats) {
      let views = 0;
      let clicks = 0;
      let withData = 0;
      sectionStats.forEach(s => {
        views += s.views;
        clicks += s.clicks;
        if (s.views > 0 || s.clicks > 0) withData += 1;
      });
      return { views, clicks, blocks: withData };
    }
    if (!rows) return null;
    let views = 0;
    let clicks = 0;
    for (const r of rows) {
      views += r.views ?? 0;
      clicks += r.clicks ?? 0;
    }
    return { views, clicks, blocks: rows.length };
  }, [rows, sections, sectionStats]);

  return (
    <div className='mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-6 pb-16 sm:px-6'>
      {/* Header */}
      <header className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <BackLink backHref={backHref} />
          <h1 className='text-foreground mt-3 text-2xl font-bold tracking-tight sm:text-3xl'>
            Analytics theo block
          </h1>
          <p className='text-content-muted mt-1 text-xs'>
            {templateName ? (
              <>
                <span className='text-content-muted font-semibold'>
                  {templateName}
                </span>{' '}
                ·{' '}
              </>
            ) : null}
            {blocks?.length ?? '…'} block · so sánh trend từng block trên cùng
            khoảng thời gian
          </p>
        </div>
        <div className='border-border inline-flex items-center gap-1 rounded-full border bg-white p-1 shadow-sm'>
          {RANGES.map(r => (
            <button
              key={r.id}
              type='button'
              onClick={() => setRange(r.id)}
              className={cn(
                'text-2xs rounded-full px-3 py-1 font-medium transition-colors',
                range === r.id
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'text-content-muted hover:bg-muted'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </header>

      {/* Summary strip */}
      {aggregate && (
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
          <SummaryCard
            icon={<TrendingUp className='size-3.5' />}
            label='Tổng lượt xem'
            value={aggregate.views.toLocaleString('vi-VN')}
            accent='emerald'
          />
          <SummaryCard
            icon={<MousePointerClick className='size-3.5' />}
            label='Tổng click'
            value={aggregate.clicks.toLocaleString('vi-VN')}
            accent='violet'
          />
          <SummaryCard
            label={sections ? 'Section có data' : 'Block có data'}
            value={`${aggregate.blocks} / ${sections ? sections.length : (blocks?.length ?? 0)}`}
            accent='zinc'
          />
          <SummaryCard
            label='Khoảng thời gian'
            value={`${range} ngày`}
            accent='zinc'
          />
        </div>
      )}

      {/* Mock banner — chỉ hiện khi có rows từ BE nhưng thiếu views_by_day.
          Empty (rows.length === 0) hiển thị empty state riêng phía dưới,
          không cần banner. */}
      {usingMock && !loading && rows && rows.length > 0 && (
        <div className='text-2xs flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 px-3.5 py-2.5 text-amber-900'>
          <span className='text-3xs mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-amber-100 font-mono font-bold'>
            !
          </span>
          <div>
            <strong className='font-semibold'>
              Sparkline mô phỏng theo block_id
            </strong>{' '}
            — page breakdown chưa có field <code>views_by_day</code> (be-audit
            §11.4). Số views tổng + clicks là số thật, daily series là mock
            deterministic để demo shape.
          </div>
        </div>
      )}

      {/* Code template — section breakdown banner */}
      {sections && (
        <div className='text-2xs flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50/70 px-3.5 py-2.5 text-blue-900'>
          <span className='text-3xs mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-blue-100 font-mono font-bold'>
            i
          </span>
          <div>
            <strong className='font-semibold'>
              Code template — section breakdown
            </strong>{' '}
            ({codeTemplateLabel}). Sections khai báo trong{' '}
            <code className='font-mono'>meta.tracking.sections</code>, fire qua{' '}
            <code className='font-mono'>data-rexer-section</code> /{' '}
            <code className='font-mono'>data-rexer-cta</code> ở public render.
            Số liệu đọc thật từ{' '}
            <code className='font-mono'>analytics/breakdown</code> (group_by{' '}
            <code className='font-mono'>dimensions.section_id</code>) — chưa có
            traffic thì hiển thị 0.
          </div>
        </div>
      )}

      {/* Grid */}
      {loading && !blocks && !sections ? (
        <div className='text-content-muted flex items-center justify-center py-20 text-sm'>
          <Loader2 className='mr-2 size-4 animate-spin' />
          Đang tải landing page…
        </div>
      ) : sections ? (
        sections.length === 0 ? (
          <div className='border-border rounded-2xl border bg-white p-12 text-center'>
            <p className='text-content-muted text-sm font-semibold'>
              Template chưa khai báo sections
            </p>
            <p className='text-content-muted mx-auto mt-1 max-w-md text-xs'>
              Thêm <code className='font-mono'>tracking.sections</code> vào{' '}
              <code className='font-mono'>
                src/templates/{codeTemplateLabel}/meta.ts
              </code>{' '}
              để analytics breakdown theo section.
            </p>
          </div>
        ) : (
          <>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {sections.map((s, idx) => {
                const stat = sectionStats?.get(s.id);
                const sectionCtas = ctas
                  .filter(c => c.section === s.id)
                  .map(c => ({
                    id: c.id,
                    label: c.label,
                    clicks: ctaStats?.get(c.id)?.clicks ?? 0,
                  }));
                return (
                  <SectionAnalyticsCard
                    key={s.id}
                    index={idx + 1}
                    section={s}
                    views={stat?.views ?? 0}
                    clicks={stat?.clicks ?? 0}
                    series={stat?.series ?? []}
                    ctas={sectionCtas}
                  />
                );
              })}
            </div>

            {/* CTA breakdown — mỗi CTA declared trong meta.tracking.ctas
                render 1 card với clicks count. Aggregated từ
                breakdown(group_by=dimensions.cta_id). User phân tích
                CTA nào convert tốt. */}
            {ctas.length > 0 && (
              <section className='mt-8 flex flex-col gap-3'>
                <header className='flex items-end justify-between gap-3'>
                  <div>
                    <h2 className='text-foreground text-lg font-bold tracking-tight'>
                      Breakdown theo CTA
                    </h2>
                    <p className='text-content-muted text-xs'>
                      Mỗi nút click trên page. Group by{' '}
                      <code className='text-2xs font-mono'>
                        dimensions.cta_id
                      </code>{' '}
                      · {ctas.length} CTAs tracked.
                    </p>
                  </div>
                  <span className='text-3xs text-muted-foreground font-mono'>
                    {Array.from(ctaStats?.values() ?? []).reduce(
                      (a, b) => a + b.clicks,
                      0
                    )}{' '}
                    clicks · {range}d
                  </span>
                </header>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                  {ctas.map(c => {
                    const stat = ctaStats?.get(c.id);
                    return (
                      <CtaAnalyticsCard
                        key={c.id}
                        cta={c}
                        clicks={stat?.clicks ?? 0}
                        series={stat?.series ?? []}
                      />
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )
      ) : blocks && blocks.length === 0 ? (
        <div className='border-border rounded-2xl border bg-white p-12 text-center'>
          <p className='text-content-muted text-sm font-semibold'>
            Landing page chưa có block
          </p>
          <p className='text-content-muted mt-1 text-xs'>
            Mở canvas editor để thêm block trước khi xem analytics.
          </p>
        </div>
      ) : rows && rows.length === 0 ? (
        <div className='border-border rounded-2xl border bg-white p-12 text-center'>
          <p className='text-content-muted text-sm font-semibold'>
            Chưa có event nào trong {range} ngày gần nhất
          </p>
          <p className='text-content-muted mx-auto mt-1 max-w-md text-xs'>
            Page breakdown đọc từ bảng <code>analytics_daily_aggregate</code>{' '}
            (job aggregate tổng hợp event qua đêm). Local DB hiện rỗng — khi có
            view thật sẽ tự hiện. Xem be-audit §11.2 nếu chờ data lâu.
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {blocks?.map((entry, idx) => {
            const row = rowMap.get(entry.block.id);
            const series =
              row?.views_by_day && row.views_by_day.length > 0
                ? row.views_by_day
                : mockSeries(entry.block.id, range, row?.views ?? 0);
            return (
              <BlockAnalyticsCard
                key={entry.block.id}
                index={idx + 1}
                block={entry.block}
                label={entry.label}
                views={row?.views ?? series.reduce((a, b) => a + b, 0)}
                clicks={row?.clicks ?? 0}
                series={series}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Card ──────────────────────────────────────────────────────────── */

function BlockAnalyticsCard({
  index,
  block,
  label,
  views,
  clicks,
  series,
}: {
  index: number;
  block: Block;
  label: string;
  views: number;
  clicks: number;
  series: number[];
}) {
  const max = Math.max(...series, 1);
  const delta = computeDelta(series);
  const ctr = views > 0 ? Math.round((clicks / views) * 1000) / 10 : 0;
  const typeName = BLOCK_TYPE_LABEL[block.blockType] ?? block.blockType;

  return (
    <div className='group border-border hover:border-border flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md'>
      {/* Header row — index + type */}
      <div className='border-border flex items-center justify-between border-b px-3.5 py-2'>
        <div className='flex items-center gap-2'>
          <span className='text-3xs bg-muted text-content-muted flex size-5 items-center justify-center rounded-full font-mono font-bold'>
            {index}
          </span>
          <span className='text-3xs text-muted-foreground font-mono tracking-wider uppercase'>
            {typeName}
          </span>
        </div>
        <DeltaPill delta={delta} />
      </div>

      {/* Thumbnail */}
      <div className='border-border relative aspect-[16/10] overflow-hidden border-b bg-gradient-to-br from-zinc-50 to-zinc-100'>
        <BlockMiniPreview block={block} aspect='16 / 10' />
      </div>

      {/* Metrics */}
      <div className='flex flex-1 flex-col gap-2 p-3.5'>
        <h3 className='text-foreground truncate text-sm font-semibold'>
          {label}
        </h3>
        <div className='grid grid-cols-3 gap-2 text-center'>
          <Metric label='Views' value={views.toLocaleString('vi-VN')} />
          <Metric label='Clicks' value={clicks.toLocaleString('vi-VN')} />
          <Metric label='CTR' value={`${ctr}%`} />
        </div>

        {/* Sparkline */}
        <div className='mt-1'>
          <Sparkline series={series} max={max} />
        </div>
      </div>
    </div>
  );
}

/* ─── SectionAnalyticsCard ───────────────────────────────────────────
 * Variant cho code template — render từ TemplateSection meta thay vì
 * Block instance. Cùng layout BlockAnalyticsCard nhưng dùng thumbnail
 * URL (nếu có) thay vì BlockMiniPreview, label từ section.label.
 * Khi BE GA-style endpoint ship, swap mock series → real series từ
 * `dimensions.section_id` aggregation. */
function SectionAnalyticsCard({
  index,
  section,
  views,
  clicks,
  series,
  ctas = [],
}: {
  index: number;
  section: TemplateSection;
  views: number;
  clicks: number;
  series: number[];
  ctas?: Array<{ id: string; label: string; clicks: number }>;
}) {
  const max = Math.max(...series, 1);
  const delta = computeDelta(series);
  const ctr = views > 0 ? Math.round((clicks / views) * 1000) / 10 : 0;
  const [showCtaList, setShowCtaList] = React.useState(false);
  const popRef = React.useRef<HTMLDivElement>(null);

  // Close khi click outside
  React.useEffect(() => {
    if (!showCtaList) return;
    const onDoc = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) {
        setShowCtaList(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [showCtaList]);

  const sortedCtas = [...ctas].sort((a, b) => b.clicks - a.clicks);
  const ctaClickTotal = ctas.reduce((a, c) => a + c.clicks, 0);

  return (
    <div className='group border-border hover:border-border relative flex flex-col overflow-visible rounded-2xl border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md'>
      <div className='border-border flex items-center justify-between border-b px-3.5 py-2'>
        <div className='flex items-center gap-2'>
          <span className='text-3xs bg-muted text-content-muted flex size-5 items-center justify-center rounded-full font-mono font-bold'>
            {index}
          </span>
          <code className='text-3xs text-muted-foreground font-mono tracking-wider uppercase'>
            {section.id}
          </code>
        </div>
        <div className='flex items-center gap-1.5'>
          {ctas.length > 0 && (
            <div className='relative' ref={popRef}>
              <button
                type='button'
                onClick={() => setShowCtaList(v => !v)}
                className={cn(
                  'text-3xs inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-semibold transition-colors',
                  showCtaList
                    ? 'bg-zinc-900 text-white'
                    : 'bg-muted text-content-muted hover:bg-zinc-200'
                )}
                title={`${ctas.length} CTA tracked · ${ctaClickTotal} clicks`}
                aria-label='Show CTA breakdown for this section'
              >
                <ListTree className='size-3' />
                <span className='font-mono tabular-nums'>{ctas.length}</span>
              </button>
              {showCtaList && (
                <div className='border-border absolute top-full right-0 z-30 mt-1.5 w-64 overflow-hidden rounded-xl border bg-white shadow-xl'>
                  <div className='border-border bg-muted flex items-center justify-between border-b px-3 py-2'>
                    <span className='text-3xs text-content-muted font-bold tracking-wider uppercase'>
                      CTAs · {section.label}
                    </span>
                    <span className='text-3xs text-content-muted font-mono tabular-nums'>
                      {ctaClickTotal} clicks
                    </span>
                  </div>
                  <ul className='max-h-64 divide-y divide-zinc-100 overflow-y-auto'>
                    {sortedCtas.map(c => {
                      const pct =
                        ctaClickTotal > 0
                          ? (c.clicks / ctaClickTotal) * 100
                          : 0;
                      const isDead = c.clicks === 0;
                      return (
                        <li
                          key={c.id}
                          className='relative flex items-center justify-between gap-2 px-3 py-2'
                        >
                          {!isDead && (
                            <span
                              aria-hidden='true'
                              className='absolute inset-y-0 left-0 bg-indigo-50'
                              style={{ width: `${pct}%` }}
                            />
                          )}
                          <div className='relative min-w-0 flex-1'>
                            <p
                              className={cn(
                                'truncate text-xs font-medium',
                                isDead
                                  ? 'text-muted-foreground'
                                  : 'text-foreground'
                              )}
                              title={c.label}
                            >
                              {c.label}
                            </p>
                            <code className='text-3xs text-muted-foreground block truncate font-mono'>
                              {c.id}
                            </code>
                          </div>
                          <span
                            className={cn(
                              'relative shrink-0 font-mono text-xs font-bold tabular-nums',
                              isDead
                                ? 'text-muted-foreground'
                                : 'text-foreground'
                            )}
                          >
                            {c.clicks.toLocaleString('vi-VN')}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
          <DeltaPill delta={delta} />
        </div>
      </div>

      {/* Thumbnail — fallback gradient khi không có */}
      <div className='border-border relative aspect-[16/10] overflow-hidden border-b bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50'>
        {section.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={section.thumbnail}
            alt={section.label}
            className='size-full object-cover'
          />
        ) : (
          <div className='flex h-full items-center justify-center text-2xl font-bold text-blue-200/70'>
            §{index}
          </div>
        )}
      </div>

      <div className='flex flex-1 flex-col gap-2 p-3.5'>
        <h3 className='text-foreground truncate text-sm font-semibold'>
          {section.label}
        </h3>
        <div className='grid grid-cols-3 gap-2 text-center'>
          <Metric label='Views' value={views.toLocaleString('vi-VN')} />
          <Metric label='Clicks' value={clicks.toLocaleString('vi-VN')} />
          <Metric label='CTR' value={`${ctr}%`} />
        </div>
        <div className='mt-1'>
          <Sparkline series={series} max={max} />
        </div>
      </div>
    </div>
  );
}

/* ─── CtaAnalyticsCard ───────────────────────────────────────────────
 * Compact card cho mỗi CTA. Render đầy đủ list CTAs declared trong
 * meta.tracking.ctas — kể cả 0 clicks (để user thấy CTA nào dead).
 * Backend group_by=dimensions.cta_id event_type=cta_click. */
function CtaAnalyticsCard({
  cta,
  clicks,
  series,
}: {
  cta: { id: string; label: string };
  clicks: number;
  series: number[];
}) {
  const max = Math.max(...series, 1);
  const delta = computeDelta(series);
  const isDead = clicks === 0;

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-xl border bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md',
        isDead ? 'border-border' : 'border-border hover:border-border'
      )}
    >
      <div className='flex items-start justify-between gap-2'>
        <div className='min-w-0 flex-1'>
          <p
            className={cn(
              'truncate text-xs font-semibold',
              isDead ? 'text-content-muted' : 'text-foreground'
            )}
            title={cta.label}
          >
            {cta.label}
          </p>
          <code className='text-3xs text-muted-foreground block truncate font-mono tracking-wider uppercase'>
            {cta.id}
          </code>
        </div>
        <DeltaPill delta={delta} />
      </div>
      <div className='flex items-end justify-between gap-3'>
        <div className='flex flex-col gap-0.5'>
          <span className='text-3xs text-muted-foreground font-medium tracking-wider uppercase'>
            Clicks
          </span>
          <span
            className={cn(
              'font-mono text-lg font-bold tabular-nums',
              isDead ? 'text-muted-foreground' : 'text-foreground'
            )}
          >
            {clicks.toLocaleString('vi-VN')}
          </span>
        </div>
        <div className='min-w-0 flex-1'>
          <Sparkline series={series} max={max} />
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex flex-col gap-0.5'>
      <span className='text-3xs text-muted-foreground font-medium tracking-wider uppercase'>
        {label}
      </span>
      <span className='text-foreground font-mono text-xs font-semibold tabular-nums'>
        {value}
      </span>
    </div>
  );
}

function DeltaPill({ delta }: { delta: number }) {
  if (Number.isNaN(delta) || !Number.isFinite(delta)) {
    return <span className='text-3xs text-muted-foreground font-mono'>—</span>;
  }
  const isUp = delta >= 0;
  const sign = isUp ? '+' : '';
  return (
    <span
      className={cn(
        'text-3xs inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-mono font-bold tabular-nums',
        isUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
      )}
    >
      {isUp ? '▲' : '▼'} {sign}
      {Math.abs(delta).toFixed(0)}%
    </span>
  );
}

/* ─── Sparkline ─────────────────────────────────────────────────────── */

/**
 * Smooth (catmull-rom interpolated → cubic bezier) sparkline with a soft
 * area fill below. Renders into a fluid-width SVG via viewBox so the host
 * card can be any width.
 */
function Sparkline({ series, max }: { series: number[]; max: number }) {
  const W = 280;
  const H = 56;
  const PADDING = 4;

  if (series.length === 0) {
    return <div className='bg-muted h-14 rounded' />;
  }

  // Normalise → screen coords
  const points: [number, number][] = series.map((v, i) => {
    const x =
      PADDING + (i / Math.max(1, series.length - 1)) * (W - PADDING * 2);
    const y = H - PADDING - (v / max) * (H - PADDING * 2);
    return [x, y];
  });

  const pathLine = catmullRomToBezier(points);
  const pathArea = `${pathLine} L ${points[points.length - 1][0]} ${H} L ${points[0][0]} ${H} Z`;

  const lastX = points[points.length - 1][0];
  const lastY = points[points.length - 1][1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className='block w-full overflow-visible'
      preserveAspectRatio='none'
    >
      <defs>
        <linearGradient id='spark-fill' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stopColor='#6366f1' stopOpacity='0.22' />
          <stop offset='100%' stopColor='#6366f1' stopOpacity='0.02' />
        </linearGradient>
        <linearGradient id='spark-line' x1='0' y1='0' x2='1' y2='0'>
          <stop offset='0%' stopColor='#8b5cf6' />
          <stop offset='100%' stopColor='#6366f1' />
        </linearGradient>
      </defs>
      <path d={pathArea} fill='url(#spark-fill)' />
      <path
        d={pathLine}
        fill='none'
        stroke='url(#spark-line)'
        strokeWidth={1.75}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <circle
        cx={lastX}
        cy={lastY}
        r={2.5}
        fill='#6366f1'
        stroke='white'
        strokeWidth={1.5}
      />
    </svg>
  );
}

/**
 * Catmull-rom spline through `points` converted to a sequence of cubic
 * bezier curves. Produces the soft, organic curve the user asked for.
 */
function catmullRomToBezier(points: [number, number][]): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    const [x, y] = points[0];
    return `M ${x} ${y}`;
  }
  const [first] = points;
  let d = `M ${first[0]} ${first[1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

/* ─── Mock data ─────────────────────────────────────────────────────── */

/**
 * Deterministic mock daily series so the same block always shows the same
 * shape across reloads. Seeded by `block_id` + range so toggling ranges
 * doesn't produce wildly different traces.
 */
function mockSeries(seed: string, days: number, total: number): number[] {
  let h = 2166136261;
  const seedStr = `${seed}:${days}`;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rng = () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 1000) / 1000;
  };
  const base = total > 0 ? total / days : 8 + rng() * 30;
  const trendBias = (rng() - 0.4) * 0.6; // -0.24 to +0.36
  const out: number[] = [];
  for (let i = 0; i < days; i++) {
    const t = i / Math.max(1, days - 1);
    const trend = 1 + trendBias * t;
    const wave = 1 + Math.sin(t * Math.PI * 3 + rng() * 2) * 0.18;
    const noise = 1 + (rng() - 0.5) * 0.35;
    out.push(Math.max(0, Math.round(base * trend * wave * noise)));
  }
  return out;
}

/**
 * % change from first half avg → second half avg. Returns NaN if data is
 * too sparse or the first-half avg is zero.
 */
function computeDelta(series: number[]): number {
  if (series.length < 4) return NaN;
  const mid = Math.floor(series.length / 2);
  const a = series.slice(0, mid);
  const b = series.slice(mid);
  const avg = (arr: number[]) =>
    arr.reduce((s, v) => s + v, 0) / Math.max(1, arr.length);
  const first = avg(a);
  const second = avg(b);
  if (first === 0) return NaN;
  return ((second - first) / first) * 100;
}

/* ─── Subcomponents ─────────────────────────────────────────────────── */

function SummaryCard({
  icon,
  label,
  value,
  accent,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  accent: 'emerald' | 'violet' | 'zinc';
}) {
  const palette: Record<typeof accent, string> = {
    emerald: 'border-emerald-100 bg-emerald-50/40 text-emerald-700',
    violet: 'border-violet-100 bg-violet-50/40 text-violet-700',
    zinc: 'border-border bg-white text-content-muted',
  };
  return (
    <div
      className={cn(
        'flex flex-col gap-1 rounded-2xl border px-4 py-3 shadow-sm',
        palette[accent]
      )}
    >
      <div className='text-3xs flex items-center gap-1.5 font-semibold tracking-[0.18em] uppercase opacity-75'>
        {icon}
        {label}
      </div>
      <div className='text-foreground font-mono text-xl font-bold tabular-nums'>
        {value}
      </div>
    </div>
  );
}

function BackLink({ backHref }: { backHref: string }) {
  return (
    <a
      href={backHref}
      className='group border-border text-content-muted hover:text-foreground inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-xs font-medium shadow-sm transition-all hover:-translate-x-0.5 hover:border-zinc-900'
    >
      <ArrowLeft className='size-3.5 transition-transform group-hover:-translate-x-0.5' />
      Landing pages
    </a>
  );
}

/** Best-effort block label — pull the first text content if available. */
function extractLabel(block: Block): string {
  const v = block.contentVi?.desktop;
  if (v && typeof v === 'object') {
    const obj = v as Record<string, unknown>;
    for (const key of ['title', 'heading', 'name', 'label']) {
      const val = obj[key];
      if (typeof val === 'string' && val.trim()) return val.trim();
    }
  }
  return BLOCK_TYPE_LABEL[block.blockType] ?? block.blockType;
}
