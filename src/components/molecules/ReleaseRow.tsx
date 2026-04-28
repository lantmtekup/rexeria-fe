'use client';

import * as React from 'react';
import { ExternalLink, Undo2 } from 'lucide-react';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import type { Release } from '@/services/rexer/types';
import { cn } from '@/lib/cn';

export interface ReleaseRowProps {
  release: Release;
  isActive?: boolean;
  rolling?: boolean;
  onRollback?: (release: Release) => void;
}

const STATE_VARIANT: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  published: 'default',
  active: 'default',
  rolled_back: 'outline',
  superseded: 'outline',
  failed: 'destructive',
  pending: 'secondary',
  building: 'secondary',
};

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

function ReleaseRow({
  release,
  isActive,
  rolling,
  onRollback,
}: ReleaseRowProps) {
  const variant = STATE_VARIANT[release.state] ?? 'secondary';
  return (
    <tr
      className={cn(
        'border-border hover:bg-muted/40 border-b transition-colors',
        isActive && 'bg-primary/5'
      )}
    >
      <td className='px-3 py-3 align-middle'>
        <div className='flex items-center gap-2'>
          <span className='text-foreground text-sm font-semibold'>
            #{release.release_no}
          </span>
          {isActive && (
            <Badge variant='default' className='text-[10px]'>
              Active
            </Badge>
          )}
        </div>
      </td>
      <td className='px-3 py-3 align-middle'>
        <Badge variant={variant} className='capitalize'>
          {release.state.replace(/_/g, ' ')}
        </Badge>
      </td>
      <td className='text-muted-foreground px-3 py-3 align-middle text-sm'>
        {formatDate(release.published_at ?? release.created_at)}
      </td>
      <td className='text-muted-foreground px-3 py-3 align-middle text-sm'>
        {release.template_version_id?.slice(0, 8) ?? '—'}
      </td>
      <td className='px-3 py-3 text-right align-middle'>
        <div className='flex justify-end gap-2'>
          {release.page_url && (
            <Button asChild variant='ghost' size='sm'>
              <a
                href={release.page_url}
                target='_blank'
                rel='noreferrer noopener'
              >
                <ExternalLink className='size-3.5' /> Open
              </a>
            </Button>
          )}
          {!isActive && onRollback && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => onRollback(release)}
              disabled={rolling}
            >
              <Undo2 className='size-3.5' />
              {rolling ? 'Rolling back…' : 'Rollback'}
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

export { ReleaseRow };
