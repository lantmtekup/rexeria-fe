'use client';

/**
 * Dev preview cho block code ở `src/blocks/` (1 block / lần).
 *
 * Dropdown tự nạp từ registry code (`getAllLegacyBlocks()`) — KHÔNG gọi DB,
 * KHÔNG gõ tên folder. Chọn 1 block → render LIVE component đó với
 * `schema.defaults[lang]`. Dev sửa `src/blocks/<name>/component.tsx` → save →
 * hot-reload thấy ngay. "Đưa vào DB" seed 1 block instance (legacy_embed, draft)
 * để load lên editor + hiện ở thư viện.
 */

import * as React from 'react';
import { Loader2, Monitor, Smartphone, Tablet, Database } from 'lucide-react';
import { toast } from 'sonner';

import { getAllLegacyBlocks } from '@/blocks/registry';
import { Button } from '@/components/atoms/button';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import { cn } from '@/lib/cn';

type Lang = 'vi' | 'en';
type Device = 'desktop' | 'tablet' | 'mobile';

const DEVICE_WIDTH: Record<Device, number | null> = {
  desktop: null, // full width
  tablet: 834,
  mobile: 390,
};

// Error boundary nhẹ — block code lỗi thì hiện thông báo thay vì vỡ cả trang.
class BlockBoundary extends React.Component<
  { resetKey: string; children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }
  render() {
    if (this.state.error) {
      return (
        <div className='border-destructive/30 bg-danger-bg text-destructive m-6 rounded-lg border p-4 text-sm'>
          <p className='font-semibold'>Block render lỗi</p>
          <pre className='text-2xs mt-2 overflow-auto whitespace-pre-wrap'>
            {this.state.error.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function BlockPreviewPage() {
  const blocks = React.useMemo(() => getAllLegacyBlocks(), []);
  const [id, setId] = React.useState(blocks[0]?.schema.id ?? '');
  const [lang, setLang] = React.useState<Lang>('vi');
  const [device, setDevice] = React.useState<Device>('desktop');
  const [seeding, setSeeding] = React.useState(false);

  const entry = blocks.find(b => b.schema.id === id);

  const handleSeed = async () => {
    if (!entry) return;
    const { schema } = entry;
    setSeeding(true);
    try {
      await rexerApi.blocks.create({
        type_code: 'legacy_embed',
        name: schema.name,
        description: schema.description,
        settings: {
          id: `b_${Math.random().toString(36).slice(2, 10)}`,
          blockType: 'legacy_embed',
          name: schema.name,
          contentVi: { desktop: { schemaId: schema.id } },
          contentEn: { desktop: { schemaId: schema.id } },
          isVisible: true,
        } as unknown as Record<string, unknown>,
        scope: 'brand_private',
        status: 'draft',
        tags: ['legacy', schema.category.toLowerCase()],
      });
      toast.success(`Đã đưa "${schema.name}" vào thư viện (draft)`);
    } catch (err) {
      const msg =
        err instanceof RxApiError
          ? err.code || err.message
          : err instanceof Error
            ? err.message
            : 'unknown';
      toast.error(`Đưa vào DB thất bại: ${msg}`);
    } finally {
      setSeeding(false);
    }
  };

  const content = entry
    ? ((entry.schema.defaults[lang] ??
        entry.schema.defaults.vi ??
        entry.schema.defaults.en ??
        {}) as Record<string, unknown>)
    : {};
  const width = DEVICE_WIDTH[device];

  return (
    <div className='flex h-[calc(100vh-3.5rem)] flex-col'>
      {/* Toolbar */}
      <div className='border-border bg-background flex flex-wrap items-center gap-3 border-b px-6 py-3'>
        <div className='leading-tight'>
          <div className='text-3xs text-content-muted font-semibold tracking-[0.18em] uppercase'>
            Dev preview · src/blocks
          </div>
          <div className='text-sm font-semibold'>Xem block code (1/lần)</div>
        </div>

        <select
          value={id}
          onChange={e => setId(e.target.value)}
          className='border-border bg-background h-9 min-w-[260px] rounded-md border px-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
        >
          {blocks.map(b => (
            <option key={b.schema.id} value={b.schema.id}>
              {b.schema.name} — {b.schema.id}
            </option>
          ))}
        </select>

        {/* VI / EN */}
        <div className='border-border bg-background flex items-center gap-0.5 rounded-lg border p-0.5'>
          {(['vi', 'en'] as const).map(l => (
            <button
              key={l}
              type='button'
              onClick={() => setLang(l)}
              className={cn(
                'text-2xs rounded px-2 py-1 font-mono font-semibold uppercase',
                lang === l
                  ? 'bg-foreground text-background'
                  : 'text-content-muted hover:bg-muted'
              )}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Device */}
        <div className='border-border bg-background flex items-center gap-0.5 rounded-lg border p-0.5'>
          {(
            [
              ['desktop', Monitor],
              ['tablet', Tablet],
              ['mobile', Smartphone],
            ] as const
          ).map(([d, Icon]) => (
            <button
              key={d}
              type='button'
              onClick={() => setDevice(d)}
              className={cn(
                'flex size-7 items-center justify-center rounded',
                device === d
                  ? 'bg-foreground text-background'
                  : 'text-content-muted hover:bg-muted'
              )}
              title={d}
            >
              <Icon className='size-3.5' />
            </button>
          ))}
        </div>

        <div className='ml-auto flex items-center gap-3'>
          {entry && (
            <span className='text-2xs text-content-muted hidden sm:block'>
              {entry.schema.category} · {entry.schema.fields.length} fields
            </span>
          )}
          <Button size='sm' onClick={handleSeed} disabled={!entry || seeding}>
            {seeding ? (
              <Loader2 className='size-3.5 animate-spin' />
            ) : (
              <Database className='size-3.5' />
            )}
            Đưa vào DB
          </Button>
        </div>
      </div>

      {/* Live render */}
      <div className='bg-muted/40 flex-1 overflow-auto p-6'>
        {!entry ? (
          <div className='text-content-muted py-20 text-center text-sm'>
            Không có block.
          </div>
        ) : (
          <div
            className='border-border bg-background mx-auto overflow-hidden rounded-lg border shadow-sm'
            style={width ? { maxWidth: width } : undefined}
          >
            <BlockBoundary resetKey={`${id}-${lang}-${device}`}>
              <entry.Component content={content} editable={false} />
            </BlockBoundary>
          </div>
        )}
      </div>
    </div>
  );
}
