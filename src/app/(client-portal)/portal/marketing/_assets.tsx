'use client';

/**
 * Section Assets của editor marketing — theo Figma 1827-7340: 3 hàng
 * Image / Video / 3D, mỗi hàng là khung trắng chứa tile Upload + thumbnails,
 * dưới khung có pill "Add folder" (folder = khung con có tên riêng).
 * Upload đi luồng media thật init → raw/presigned → complete (tái dùng
 * pattern IntakeWizard/MediaLibrary); url CDN lưu vào brief (notes JSON).
 */

import { Box, ImagePlus, Loader2, Plus, SquarePlay, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import { InfoTip } from '@/components/molecules/FeatureField';
import { Input } from '@/components/atoms/input';
import { cn } from '@/lib/cn';
import { rexerApi } from '@/services/rexer/endpoints';

/* ── state types (persist trong notes JSON marketing_brief.assets) ─────── */

export interface AssetItem {
  url: string;
  name: string;
  media_id?: string;
}
export interface AssetFolder {
  name: string;
  items: AssetItem[];
}
export interface AssetGroup {
  items: AssetItem[];
  folders: AssetFolder[];
}
export type AssetKind = 'image' | 'video' | '3d';
export type AssetsState = Record<AssetKind, AssetGroup>;

export const emptyAssets = (): AssetsState => ({
  image: { items: [], folders: [] },
  video: { items: [], folders: [] },
  '3d': { items: [], folders: [] },
});

const ROWS: {
  kind: AssetKind;
  label: string;
  accept: string;
  uploadLabel: string;
  icon: typeof ImagePlus;
  infoKey: string;
}[] = [
  {
    kind: 'image',
    label: 'Image',
    accept: 'image/*',
    uploadLabel: 'Upload Image',
    icon: ImagePlus,
    infoKey: 'infoImage',
  },
  {
    kind: 'video',
    label: 'Video',
    accept: 'video/*',
    uploadLabel: 'Upload Video',
    icon: SquarePlay,
    infoKey: 'infoVideo',
  },
  {
    kind: '3d',
    label: '3D',
    accept: '.glb,.gltf,.obj,.fbx,.usdz',
    uploadLabel: 'Upload 3D',
    icon: Box,
    infoKey: 'info3d',
  },
];

/**
 * init → raw/presigned → complete; trả AssetItem (url CDN). `kind` bỏ trống
 * thì tự nhận diện từ mime (dùng cho đính kèm brief ở FeatureField).
 */
export async function uploadOne(
  file: File,
  kind?: AssetKind
): Promise<AssetItem> {
  const mediaType = kind
    ? kind === '3d'
      ? 'file'
      : kind
    : file.type.startsWith('image/')
      ? 'image'
      : file.type.startsWith('video/')
        ? 'video'
        : 'file';
  const init = await rexerApi.media.initUpload({
    filename: file.name,
    mime_type: file.type || 'application/octet-stream',
    file_size: file.size,
    owner_scope: 'library',
    media_type: mediaType,
  });
  const ps = init.presigned_url;
  const useDirect =
    !!ps && /^https?:\/\//i.test(ps) && !ps.includes('/media/uploads/');
  if (useDirect) {
    const r = await fetch(ps!, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    });
    if (!r.ok) throw new Error(`upload ${r.status}`);
  } else {
    await rexerApi.media.uploadRaw(init.upload_id, file);
  }
  const res = await rexerApi.media.completeUpload({
    upload_id: init.upload_id,
  });
  const a = res.media_asset;
  return {
    url: a.public_url ?? '',
    name: a.original_filename || file.name,
    media_id: a.id,
  };
}

export function AssetsSection({
  assets,
  onChange,
}: {
  assets: AssetsState;
  onChange: (next: AssetsState) => void;
}) {
  return (
    <div className='flex max-w-4xl flex-col gap-10'>
      {ROWS.map(row => (
        <AssetRow
          key={row.kind}
          row={row}
          group={assets[row.kind]}
          onGroupChange={g => onChange({ ...assets, [row.kind]: g })}
        />
      ))}
    </div>
  );
}

function AssetRow({
  row,
  group,
  onGroupChange,
}: {
  row: (typeof ROWS)[number];
  group: AssetGroup;
  onGroupChange: (g: AssetGroup) => void;
}) {
  const t = useTranslations('portal');
  const [addingFolder, setAddingFolder] = useState(false);
  const [folderName, setFolderName] = useState('');

  const handleAddFolder = () => {
    const name = folderName.trim();
    if (!name) return;
    if (group.folders.some(f => f.name === name)) {
      toast.error(t('marketingAssets.folderExists', { name }));
      return;
    }
    onGroupChange({
      ...group,
      folders: [...group.folders, { name, items: [] }],
    });
    setFolderName('');
    setAddingFolder(false);
  };

  return (
    <div className='flex items-start gap-6'>
      <p className='text-foreground flex w-32 shrink-0 items-center gap-1.5 pt-3 text-sm font-semibold'>
        {row.label}
        <InfoTip text={t(`marketingAssets.${row.infoKey}`)} />
      </p>
      <div className='flex min-w-0 flex-1 flex-col gap-3'>
        <AssetFrame
          row={row}
          items={group.items}
          onItemsChange={items => onGroupChange({ ...group, items })}
        />
        {group.folders.map((f, fi) => (
          <AssetFrame
            key={f.name}
            row={row}
            title={f.name}
            items={f.items}
            onItemsChange={items =>
              onGroupChange({
                ...group,
                folders: group.folders.map((x, i) =>
                  i === fi ? { ...x, items } : x
                ),
              })
            }
            onRemove={() =>
              onGroupChange({
                ...group,
                folders: group.folders.filter((_, i) => i !== fi),
              })
            }
          />
        ))}
        {addingFolder ? (
          <div className='flex items-center gap-2'>
            <Input
              autoFocus
              value={folderName}
              onChange={e => setFolderName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddFolder()}
              placeholder={t('marketingAssets.folderNamePlaceholder')}
              className='h-8 w-52 text-sm'
            />
            <Button size='sm' className='h-8' onClick={handleAddFolder}>
              {t('marketingAssets.add')}
            </Button>
            <Button
              size='sm'
              variant='ghost'
              className='h-8'
              onClick={() => setAddingFolder(false)}
            >
              {t('marketingAssets.cancel')}
            </Button>
          </div>
        ) : (
          <button
            type='button'
            onClick={() => setAddingFolder(true)}
            className='bg-muted text-foreground hover:bg-muted/70 inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors'
          >
            <Plus className='bg-foreground text-background size-4 rounded-full p-0.5' />
            {t('marketingAssets.addFolder')}
          </button>
        )}
      </div>
    </div>
  );
}

/** Khung trắng: tile upload + thumbnails (1 khung = root hoặc 1 folder). */
function AssetFrame({
  row,
  title,
  items,
  onItemsChange,
  onRemove,
}: {
  row: (typeof ROWS)[number];
  title?: string;
  items: AssetItem[];
  onItemsChange: (items: AssetItem[]) => void;
  onRemove?: () => void;
}) {
  const t = useTranslations('portal');
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (list: FileList | null) => {
    const files = list ? Array.from(list) : [];
    if (!files.length) return;
    setUploading(true);
    const ok: AssetItem[] = [];
    for (const file of files) {
      try {
        ok.push(await uploadOne(file, row.kind));
      } catch (err) {
        toast.error(
          t('marketingAssets.uploadFailed', {
            name: file.name,
            detail: err instanceof Error ? `: ${err.message}` : '',
          })
        );
      }
    }
    if (ok.length) onItemsChange([...items, ...ok]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className='border-border bg-card rounded-2xl border p-3'>
      {(title || onRemove) && (
        <div className='mb-2 flex items-center justify-between px-1'>
          <p className='text-foreground text-xs font-semibold'>{title}</p>
          {onRemove && (
            <button
              type='button'
              aria-label={t('marketingAssets.removeFolder')}
              onClick={onRemove}
              className='text-muted-foreground hover:text-destructive'
            >
              <X className='size-3.5' />
            </button>
          )}
        </div>
      )}
      <div className='flex flex-wrap gap-2'>
        <button
          type='button'
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className='bg-muted text-foreground hover:bg-muted/70 flex size-32 shrink-0 flex-col items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60'
        >
          {uploading ? (
            <Loader2 className='size-6 animate-spin' />
          ) : (
            <row.icon className='size-6' />
          )}
          {uploading ? t('marketingAssets.uploading') : row.uploadLabel}
        </button>
        <input
          ref={inputRef}
          type='file'
          accept={row.accept}
          multiple
          hidden
          onChange={e => handleFiles(e.target.files)}
        />
        {items.map((item, i) => (
          <Thumb
            key={`${item.url}-${i}`}
            kind={row.kind}
            item={item}
            onRemove={() => onItemsChange(items.filter((_, x) => x !== i))}
          />
        ))}
      </div>
    </div>
  );
}

function Thumb({
  kind,
  item,
  onRemove,
}: {
  kind: AssetKind;
  item: AssetItem;
  onRemove: () => void;
}) {
  const t = useTranslations('portal');
  return (
    <div className='group relative size-32 shrink-0 overflow-hidden rounded-xl'>
      {kind === 'image' && item.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.url}
          alt={item.name}
          className='size-full object-cover'
        />
      ) : kind === 'video' && item.url ? (
        <video src={item.url} muted className='size-full object-cover' />
      ) : (
        <div
          className={cn(
            'bg-foreground text-background flex size-full flex-col items-center justify-center gap-1 px-2'
          )}
        >
          <Box className='size-6' />
          <span className='text-3xs w-full truncate text-center'>
            {item.name}
          </span>
        </div>
      )}
      <button
        type='button'
        aria-label={t('marketingAssets.removeFile')}
        onClick={onRemove}
        className='absolute top-1 right-1 hidden rounded-full bg-black/60 p-1 text-white group-hover:block'
      >
        <X className='size-3' />
      </button>
    </div>
  );
}
