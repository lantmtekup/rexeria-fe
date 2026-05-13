'use client';

import * as React from 'react';
import { Clock, RotateCcw, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import { Spinner } from '@/components/atoms/spinner';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type {
  AIGenerationSession,
  AIGenerationVersion,
} from '@/services/rexer/types';

interface Props {
  open: boolean;
  sessionId: string;
  currentVersion: number;
  onClose: () => void;
  /** Caller swaps the blocks state to the chosen version. */
  onRestore: (version: AIGenerationVersion) => void;
}

// BE Q14: versions[] include full block content — FE can render preview
// without an extra fetch.
// BE Q15: no rollback endpoint. We do client-side state swap; the prior
// versions stay in the append-only log so "restoring" never deletes
// later versions.
export function VersionHistoryDrawer({
  open,
  sessionId,
  currentVersion,
  onClose,
  onRestore,
}: Props) {
  const tReview = useTranslations('ai_templates.review');
  const [session, setSession] = React.useState<AIGenerationSession | null>(
    null
  );
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open || !sessionId) return;
    let cancelled = false;
    setLoading(true);
    rexerApi.aiTemplates
      .session(sessionId)
      .then(s => {
        if (!cancelled) setSession(s);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        toast.error(
          err instanceof RxApiError ? err.message || err.code : String(err)
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, sessionId]);

  if (!open) return null;

  return (
    <>
      <div
        className='fixed inset-0 z-40 bg-black/40'
        onClick={onClose}
        aria-hidden
      />
      <aside className='bg-background fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l shadow-xl'>
        <header className='flex items-center justify-between border-b px-4 py-3'>
          <h2 className='flex items-center gap-2 text-sm font-semibold'>
            <Clock className='size-4' />
            {tReview('version_history')}
          </h2>
          <Button variant='ghost' size='icon' onClick={onClose}>
            <X className='size-4' />
          </Button>
        </header>

        <div className='flex-1 overflow-y-auto px-4 py-3'>
          {loading ? (
            <div className='flex justify-center py-8'>
              <Spinner />
            </div>
          ) : !session || session.versions.length === 0 ? (
            <p className='text-muted-foreground py-8 text-center text-sm'>
              Chưa có lịch sử phiên bản.
            </p>
          ) : (
            <ul className='flex flex-col gap-2'>
              {session.versions
                .slice()
                .sort((a, b) => b.version - a.version)
                .map(v => {
                  const isCurrent = v.version === currentVersion;
                  return (
                    <li
                      key={v.version}
                      className={
                        'rounded-md border p-3 ' +
                        (isCurrent
                          ? 'border-primary bg-primary/5'
                          : 'border-border')
                      }
                    >
                      <div className='flex items-center justify-between gap-2'>
                        <div className='min-w-0'>
                          <p className='text-sm font-medium'>
                            v{v.version}
                            <span className='text-muted-foreground ml-1 text-xs'>
                              · {v.kind}
                              {v.target_block_id
                                ? ` (${v.target_block_id})`
                                : ''}
                            </span>
                          </p>
                          <p className='text-muted-foreground text-xs'>
                            {new Date(v.created_at).toLocaleString()}
                          </p>
                        </div>
                        {!isCurrent ? (
                          <Button
                            variant='outline'
                            size='sm'
                            className='gap-1'
                            onClick={() => onRestore(v)}
                          >
                            <RotateCcw className='size-3' />
                            Khôi phục
                          </Button>
                        ) : (
                          <span className='text-muted-foreground text-xs'>
                            Hiện tại
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
