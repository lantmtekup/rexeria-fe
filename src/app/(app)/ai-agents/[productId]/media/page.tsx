'use client';

import * as React from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Image as ImageIcon,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import { Spinner } from '@/components/atoms/spinner';
import { ProductWorkspaceLayout } from '@/components/templates/ProductWorkspaceLayout';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';

interface PageProps {
  params: Promise<{ productId: string }>;
}

const DEFAULT_SECTIONS = ['hero', 'gallery', 'feature', 'testimonial'];

function rxErrorMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.message || err.code;
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

function isUrl(s: string) {
  return /^https?:\/\//i.test(s);
}

function SuggestionCard({ value }: { value: string }) {
  return (
    <div className='border-border bg-background overflow-hidden rounded-lg border'>
      <div className='bg-muted flex aspect-video items-center justify-center'>
        {isUrl(value) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=''
            className='h-full w-full object-cover'
            onError={e => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <ImageIcon className='text-muted-foreground size-8' />
        )}
      </div>
      <p className='text-foreground line-clamp-2 px-3 py-2 text-xs'>{value}</p>
    </div>
  );
}

export default function AiAgentsMediaPage({ params }: PageProps) {
  const { productId } = use(params);
  const router = useRouter();

  const [sections, setSections] = React.useState<string[]>(DEFAULT_SECTIONS);
  const [suggestions, setSuggestions] = React.useState<
    Record<string, string[]>
  >({});
  const [loading, setLoading] = React.useState(true);

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await rexerApi.ai.mediaSuggest({
        product_id: productId,
        section_keys: sections,
      });
      setSuggestions(res.suggestions ?? {});
    } catch (err) {
      toast.error(`AI media suggest failed: ${rxErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  }, [productId, sections]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  return (
    <ProductWorkspaceLayout
      basePath={`/ai-agents/${productId}`}
      productName='Media suggestions'
      scope='ai-agents'
      section='media'
      actions={
        <Button
          variant='primary'
          size='sm'
          onClick={() => router.push(`/ai-agents/${productId}/campaign`)}
        >
          Continue <ArrowRight className='size-3.5' />
        </Button>
      }
    >
      <div className='mx-auto w-full max-w-[1200px] px-6 pb-10'>
        <section className='border-border bg-background mb-4 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center'>
          <div className='flex-1'>
            <p className='text-foreground text-sm font-semibold'>
              <Sparkles className='-mt-1 mr-1 inline size-3.5' />
              AI media hints
            </p>
            <p className='text-muted-foreground text-xs'>
              Suggestions per landing section. Use them as creative briefs —
              upload &amp; bind real assets in the landing media step.
            </p>
          </div>
          <input
            value={sections.join(', ')}
            onChange={e =>
              setSections(
                e.target.value
                  .split(',')
                  .map(s => s.trim())
                  .filter(Boolean)
              )
            }
            placeholder='hero, gallery, feature'
            className='border-input h-10 rounded-md border bg-transparent px-3 text-sm outline-none sm:w-72'
          />
          <Button
            variant='outline'
            size='sm'
            onClick={reload}
            disabled={loading || sections.length === 0}
          >
            {loading ? (
              <>
                <Spinner size={14} /> Suggesting…
              </>
            ) : (
              <>
                <RefreshCw className='size-3.5' /> Re-suggest
              </>
            )}
          </Button>
        </section>

        {loading ? (
          <div className='text-muted-foreground flex justify-center py-12'>
            <Spinner size={20} />
          </div>
        ) : Object.keys(suggestions).length === 0 ? (
          <p className='text-muted-foreground py-12 text-center text-sm'>
            No suggestions returned. Add section keys above and re-suggest.
          </p>
        ) : (
          <div className='flex flex-col gap-6'>
            {sections.map(section => {
              const items = suggestions[section] ?? [];
              return (
                <div key={section}>
                  <header className='mb-2 flex items-center gap-2'>
                    <h3 className='text-foreground text-base font-semibold capitalize'>
                      {section}
                    </h3>
                    <span className='text-muted-foreground text-xs'>
                      {items.length} suggestion(s)
                    </span>
                  </header>
                  {items.length === 0 ? (
                    <p className='text-muted-foreground text-xs italic'>
                      No suggestions for this section.
                    </p>
                  ) : (
                    <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                      {items.map((s, i) => (
                        <SuggestionCard key={`${section}-${i}`} value={s} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ProductWorkspaceLayout>
  );
}
