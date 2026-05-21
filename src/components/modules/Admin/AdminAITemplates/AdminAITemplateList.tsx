'use client';

import * as React from 'react';
import Link from 'next/link';
import { Pencil, Plus, Sparkles, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Spinner } from '@/components/atoms/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/atoms/table';
import { EmptyState } from '@/components/molecules/EmptyState';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type { AITemplate } from '@/services/rexer/types';

function errMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.message || err.code;
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

export function AdminAITemplateList() {
  const [items, setItems] = React.useState<AITemplate[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState<
    'all' | 'active' | 'inactive'
  >('all');

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const r = await rexerApi.adminAiTemplates.list({
        q: search.trim() || undefined,
        is_active:
          activeFilter === 'all' ? undefined : activeFilter === 'active',
        limit: 50,
      });
      setItems(r.items);
    } catch (err) {
      toast.error(`Failed to load: ${errMessage(err)}`);
    } finally {
      setLoading(false);
    }
  }, [search, activeFilter]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  const handleDelete = async (t: AITemplate) => {
    if (!window.confirm(`Xoá "${t.name}"?`)) return;
    try {
      await rexerApi.adminAiTemplates.remove(t.id);
      toast.success('Đã xoá');
      reload();
    } catch (err) {
      toast.error(`Delete failed: ${errMessage(err)}`);
    }
  };

  return (
    <div className='flex flex-col gap-4 p-6'>
      <div className='flex items-center justify-between gap-2'>
        <h1 className='text-xl font-semibold'>AI Templates</h1>
        <Link href='/admin/ai-templates/new'>
          <Button variant='primary' size='sm' className='gap-1'>
            <Plus className='size-3.5' /> Tạo mới
          </Button>
        </Link>
      </div>

      <div className='flex flex-wrap items-center gap-2'>
        <Input
          placeholder='Tìm theo tên / mô tả / chủ đề…'
          value={search}
          onChange={e => setSearch(e.target.value)}
          className='max-w-xs'
        />
        <div className='flex items-center gap-1'>
          {(['all', 'active', 'inactive'] as const).map(k => (
            <Button
              key={k}
              variant={activeFilter === k ? 'primary' : 'outline'}
              size='sm'
              onClick={() => setActiveFilter(k)}
            >
              {k === 'all' ? 'Tất cả' : k === 'active' ? 'Đang bật' : 'Đã tắt'}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className='flex justify-center py-12'>
          <Spinner size={20} />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Sparkles className='size-10' />}
          title='Chưa có AI template'
          description='Bấm "Tạo mới" để thiết kế template đầu tiên.'
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Chủ đề</TableHead>
              <TableHead>Field</TableHead>
              <TableHead>Block</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Cập nhật</TableHead>
              <TableHead className='w-20'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(t => (
              <TableRow key={t.id}>
                <TableCell className='font-medium'>{t.name}</TableCell>
                <TableCell>{t.topic ?? '—'}</TableCell>
                <TableCell>{t.fields?.length ?? 0}</TableCell>
                <TableCell>{t.blocks?.length ?? 0}</TableCell>
                <TableCell>
                  <Badge variant={t.is_active ? 'default' : 'outline'}>
                    {t.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className='text-muted-foreground text-xs'>
                  {new Date(t.updated_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className='flex justify-end gap-1'>
                    <Link href={`/admin/ai-templates/${t.id}/edit`}>
                      <Button variant='ghost' size='icon' className='size-7'>
                        <Pencil className='size-3.5' />
                      </Button>
                    </Link>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='text-muted-foreground hover:text-destructive size-7'
                      onClick={() => handleDelete(t)}
                    >
                      <Trash2 className='size-3.5' />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
