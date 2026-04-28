'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AppWindow,
  ArrowLeft,
  Database,
  RefreshCw,
  Save,
  TableProperties,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Spinner } from '@/components/atoms/spinner';
import { SubTabBar } from '@/components/organisms/SubTabBar';
import { dataCollectionRemote as dataCollectionLocal } from '@/services/dataCollection.remote';
import type {
  CollectionFieldConfig,
  DataCollection,
  DataCollectionRecord,
} from '@/types/dataCollection';
import { cn } from '@/lib/cn';

import { FieldSchemaBuilder } from './FieldSchemaBuilder';
import { RecordEditor } from './RecordEditor';
import { RecordTable } from './RecordTable';

type TabKey = 'schema' | 'records';

export function CollectionDetail({ collectionId }: { collectionId: string }) {
  const router = useRouter();

  const [collection, setCollection] = React.useState<DataCollection | null>(
    null
  );
  const [fields, setFields] = React.useState<CollectionFieldConfig[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);
  const [tab, setTab] = React.useState<TabKey>('schema');

  // Record editor modal state.
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editingRecord, setEditingRecord] =
    React.useState<DataCollectionRecord | null>(null);
  const [duplicateRecord, setDuplicateRecord] =
    React.useState<DataCollectionRecord | null>(null);
  const [recordRefreshKey, setRecordRefreshKey] = React.useState(0);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await dataCollectionLocal.getCollectionById(collectionId);
      if (!res.success) {
        toast.error(res.error);
        router.push('/collections');
        return;
      }
      setCollection(res.data);
      setFields([...res.data.fields].sort((a, b) => a.order - b.order));
      setDirty(false);
    } finally {
      setLoading(false);
    }
  }, [collectionId, router]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleFieldsChange = (next: CollectionFieldConfig[]) => {
    setFields(next);
    setDirty(true);
  };

  const handleSaveSchema = async () => {
    if (!collection) return;
    setSaving(true);
    try {
      const res = await dataCollectionLocal.updateCollection(collection.id, {
        fields,
        version: collection.version,
      });
      if (!res.success) {
        if (res.code === 'VERSION_CONFLICT') {
          toast.error(res.error);
          load();
          return;
        }
        toast.error(res.error);
        return;
      }
      setCollection(res.data);
      setDirty(false);
      toast.success('Schema saved');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !collection) {
    return (
      <div className='text-muted-foreground flex justify-center py-16'>
        <Spinner size={20} />
      </div>
    );
  }

  return (
    <div className='mx-auto w-full max-w-[1100px] px-8 py-6'>
      <div className='mb-3 flex items-center gap-2 text-xs'>
        <Link
          href='/collections'
          className='text-muted-foreground hover:text-foreground inline-flex items-center gap-1'
        >
          <ArrowLeft className='size-3.5' /> Collections
        </Link>
      </div>

      <header className='mb-4 flex items-start justify-between gap-3'>
        <div className='flex min-w-0 items-center gap-3'>
          <span
            className='inline-flex size-11 shrink-0 items-center justify-center rounded-xl'
            style={{
              background: `${collection.color || '#4f46e5'}1a`,
              color: collection.color || '#4f46e5',
            }}
          >
            <Database className='size-5' />
          </span>
          <div className='min-w-0'>
            <h1 className='text-foreground text-2xl font-semibold tracking-[-0.02em]'>
              {collection.name}
            </h1>
            <p className='text-muted-foreground text-xs'>
              v{collection.version} · {collection.record_count} record(s) ·{' '}
              {collection.is_template ? (
                <Badge variant='secondary' className='ml-1'>
                  Template
                </Badge>
              ) : (
                <span>regular</span>
              )}
            </p>
            {collection.description && (
              <p className='text-muted-foreground mt-1 max-w-2xl text-sm'>
                {collection.description}
              </p>
            )}
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={load}
            disabled={loading || saving}
          >
            <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
            Refresh
          </Button>
          {tab === 'schema' && (
            <Button
              variant='primary'
              size='sm'
              onClick={handleSaveSchema}
              disabled={!dirty || saving}
            >
              <Save className='size-3.5' />
              {saving ? 'Saving…' : dirty ? 'Save *' : 'Saved'}
            </Button>
          )}
        </div>
      </header>

      <SubTabBar
        tabs={[
          {
            key: 'schema',
            label: (
              <span className='inline-flex items-center gap-2'>
                <AppWindow className='size-3.5' /> Schema
              </span>
            ),
          },
          {
            key: 'records',
            label: (
              <span className='inline-flex items-center gap-2'>
                <TableProperties className='size-3.5' /> Records
              </span>
            ),
          },
        ]}
        activeKey={tab}
        onChange={k => setTab(k as TabKey)}
      />

      <div className='pt-4'>
        {tab === 'schema' && (
          <FieldSchemaBuilder
            fields={fields}
            recordCount={collection.record_count}
            onChange={handleFieldsChange}
          />
        )}
        {tab === 'records' && (
          <RecordTable
            collection={collection}
            refreshKey={recordRefreshKey}
            onCreate={() => {
              setEditingRecord(null);
              setDuplicateRecord(null);
              setEditorOpen(true);
            }}
            onEdit={r => {
              setEditingRecord(r);
              setDuplicateRecord(null);
              setEditorOpen(true);
            }}
            onDuplicate={r => {
              setEditingRecord(null);
              setDuplicateRecord(r);
              setEditorOpen(true);
            }}
          />
        )}
      </div>

      <RecordEditor
        collection={collection}
        record={editingRecord}
        duplicateFrom={duplicateRecord}
        open={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setEditingRecord(null);
          setDuplicateRecord(null);
        }}
        onSaved={() => {
          setRecordRefreshKey(k => k + 1);
          load();
        }}
      />
    </div>
  );
}
