'use client';

import * as React from 'react';
import { Check, GitBranch, History } from 'lucide-react';

import { Badge } from '@/components/atoms/badge';
import { Spinner } from '@/components/atoms/spinner';
import type { TemplateVersion } from '@/services/rexer/types';
import { cn } from '@/lib/cn';

interface TemplateVersionsPanelProps {
  versions: TemplateVersion[];
  loading?: boolean;
  currentVersionId?: string;
  selectedVersionId?: string;
  onSelect?: (version: TemplateVersion) => void;
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString();
}

function TemplateVersionsPanel({
  versions,
  loading,
  currentVersionId,
  selectedVersionId,
  onSelect,
}: TemplateVersionsPanelProps) {
  return (
    <aside className='border-border bg-background flex w-full max-w-xs flex-col rounded-xl border'>
      <header className='border-border flex items-center justify-between gap-2 border-b px-4 py-3'>
        <div className='flex items-center gap-2'>
          <History className='text-muted-foreground size-4' />
          <h3 className='text-foreground text-sm font-semibold'>Versions</h3>
        </div>
        {loading && <Spinner size={12} />}
      </header>

      {loading && versions.length === 0 ? (
        <div className='text-muted-foreground flex justify-center py-8'>
          <Spinner size={16} />
        </div>
      ) : versions.length === 0 ? (
        <p className='text-muted-foreground px-4 py-6 text-center text-xs'>
          No versions yet.
        </p>
      ) : (
        <ul className='flex flex-col divide-y divide-neutral-100'>
          {versions.map(v => {
            const isCurrent = v.id === currentVersionId;
            const isSelected = v.id === selectedVersionId;
            return (
              <li key={v.id}>
                <button
                  type='button'
                  onClick={() => onSelect?.(v)}
                  className={cn(
                    'hover:bg-muted flex w-full items-start gap-3 px-4 py-3 text-left transition-colors',
                    isSelected && 'bg-primary/5'
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-md',
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {isSelected ? (
                      <Check className='size-3.5' />
                    ) : (
                      <GitBranch className='size-3.5' />
                    )}
                  </span>
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-2'>
                      <span className='text-foreground truncate text-sm font-semibold'>
                        v{v.version}
                      </span>
                      {isCurrent && (
                        <Badge variant='default' className='px-1.5 text-[10px]'>
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className='text-muted-foreground mt-0.5 text-xs'>
                      {v.change_note || '—'}
                    </p>
                    <p className='text-muted-foreground/80 mt-0.5 text-[10px]'>
                      {formatDate(v.created_at)} · schema {v.schema_version}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}

export { TemplateVersionsPanel };
