'use client';

/**
 * MediaLibrary — quản lý asset/folder dùng chung cho portal (brand của user)
 * và admin (xem/tạo hộ brand qua `brandId`). Wire API thật:
 *   folders: mediaFolders.list/create/update/remove
 *   assets:  media.list / initUpload→uploadRaw→completeUpload / update / bulkDelete / bulkMove
 *
 * `brandId` undefined → BE auto scope theo caller (portal). Có → admin scope
 * brand đó (cần BE ship brand_id scoping — be-spec-admin-asset-scope-2026-06-07).
 */

import * as React from 'react';
import {
  ArrowLeft,
  Check,
  FileText,
  Film,
  FolderPlus,
  Folder as FolderIcon,
  ImageIcon,
  LayoutGrid,
  Loader2,
  Pencil,
  Search,
  Table as TableIcon,
  Trash2,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { cn } from '@/lib/cn';
import { rexerApi } from '@/services/rexer/endpoints';
import type { MediaAsset, MediaFolder } from '@/services/rexer/types';

function fmtBytes(n: number): string {
  if (!n) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function mediaKind(mime: string): 'image' | 'video' | 'file' {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  return 'file';
}

function FileThumb({
  asset,
  className,
}: {
  asset: MediaAsset;
  className?: string;
}) {
  const [errored, setErrored] = React.useState(false);
  const kind = asset.media_type || mediaKind(asset.mime_type);
  // Ảnh có public_url + load được → thumbnail thật; lỗi → fallback icon
  // (alt='' để không hiện text tên file khi ảnh vỡ).
  if (kind === 'image' && asset.public_url && !errored) {
    return (
      <img
        src={asset.public_url}
        alt=''
        loading='lazy'
        onError={() => setErrored(true)}
        className={cn('bg-muted object-cover', className)}
      />
    );
  }
  const Icon =
    kind === 'video' ? Film : kind === 'image' ? ImageIcon : FileText;
  const tone =
    kind === 'video'
      ? 'text-violet-400'
      : kind === 'image'
        ? 'text-sky-400'
        : 'text-content-muted';
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100',
        tone,
        className
      )}
    >
      <Icon className='size-8' />
    </div>
  );
}

export function MediaLibrary({
  brandId,
  onCount,
}: {
  brandId?: string;
  /** Báo tổng (folders + files) ở thư mục gốc cho badge tab admin. */
  onCount?: (n: number) => void;
}) {
  const onCountRef = React.useRef(onCount);
  onCountRef.current = onCount;
  const [folderId, setFolderId] = React.useState<string | null>(null);
  const [crumbs, setCrumbs] = React.useState<MediaFolder[]>([]);
  const [folders, setFolders] = React.useState<MediaFolder[]>([]);
  const [files, setFiles] = React.useState<MediaAsset[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [view, setView] = React.useState<'grid' | 'list'>('grid');
  const [search, setSearch] = React.useState('');
  const [q, setQ] = React.useState('');
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [uploading, setUploading] = React.useState<{
    done: number;
    total: number;
  } | null>(null);

  // dialogs
  const [newFolderOpen, setNewFolderOpen] = React.useState(false);
  const [renameTarget, setRenameTarget] = React.useState<{
    kind: 'folder' | 'file';
    id: string;
    name: string;
  } | null>(null);
  const [tagTarget, setTagTarget] = React.useState<MediaAsset | null>(null);
  const [moveOpen, setMoveOpen] = React.useState(false);

  const fileInput = React.useRef<HTMLInputElement>(null);
  const inputId = `media-upload-${brandId ?? 'self'}`;

  React.useEffect(() => {
    const t = setTimeout(() => setQ(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setSelected(new Set());
    // Tải folders + files ĐỘC LẬP: folders endpoint có thể 403 (admin chưa có
    // brand_id scoping — be-spec-admin-asset-scope) nhưng media-list đã honor
    // brand_id → vẫn hiện file thay vì hỏng cả trang.
    const [fRes, mRes] = await Promise.allSettled([
      rexerApi.mediaFolders.list({
        parent_id: folderId ?? undefined,
        brand_id: brandId,
      }),
      rexerApi.media.list({
        folder_id: folderId ?? undefined,
        brand_id: brandId,
        q: q || undefined,
        limit: 200,
      }),
    ]);
    const rawFolders =
      fRes.status === 'fulfilled' ? (fRes.value.items ?? []) : [];
    const rawFiles =
      mRes.status === 'fulfilled' ? (mRes.value.items ?? []) : [];
    // BE media-list chưa filter theo brand_id cho platform admin (trả tất cả) →
    // lọc client-side để đổi brand là đổi data + rỗng khi brand chưa có asset.
    // Khi BE honor ?brand_id (be-spec-admin-asset-scope) thì lọc này là no-op.
    const folderItems = brandId
      ? rawFolders.filter(f => f.brand_id === brandId)
      : rawFolders;
    const fileItems = brandId
      ? rawFiles.filter(a => a.brand_id === brandId)
      : rawFiles;
    setFolders(folderItems);
    setFiles(fileItems);
    if (mRes.status === 'rejected')
      toast.error('Không tải được danh sách file');
    if (folderId === null)
      onCountRef.current?.(folderItems.length + fileItems.length);
    setLoading(false);
  }, [folderId, brandId, q]);

  React.useEffect(() => {
    load();
  }, [load]);

  const enterFolder = (f: MediaFolder) => {
    setCrumbs(c => [...c, f]);
    setFolderId(f.id);
  };
  const goCrumb = (idx: number) => {
    // idx = -1 → root
    setCrumbs(c => c.slice(0, idx + 1));
    setFolderId(idx < 0 ? null : crumbs[idx].id);
  };

  /* ── upload ── */
  const uploadFiles = async (list: FileList | File[]) => {
    const arr = Array.from(list);
    if (arr.length === 0) return;
    setUploading({ done: 0, total: arr.length });
    let done = 0;
    const newIds: string[] = [];
    for (const file of arr) {
      try {
        const init = await rexerApi.media.initUpload({
          filename: file.name,
          mime_type: file.type || 'application/octet-stream',
          file_size: file.size,
          owner_scope: 'library',
          media_type: mediaKind(file.type),
          brand_id: brandId,
          folder_id: folderId ?? undefined,
        });
        // Chỉ PUT thẳng khi presigned_url là URL storage EXTERNAL thật (S3…).
        // BE local trả presigned_url = chính endpoint raw `/v1/media/uploads/
        // {id}/raw` (không proxy) → browser 404. Trường hợp đó dùng uploadRaw
        // (đi qua /api/rexer rewrite).
        const ps = init.presigned_url;
        const useDirect =
          !!ps && /^https?:\/\//i.test(ps) && !ps.includes('/media/uploads/');
        if (useDirect) {
          const r = await fetch(ps!, {
            method: 'PUT',
            headers: {
              'Content-Type': file.type || 'application/octet-stream',
            },
            body: file,
          });
          if (!r.ok) throw new Error(`upload ${r.status}`);
        } else {
          await rexerApi.media.uploadRaw(init.upload_id, file);
        }
        const res = await rexerApi.media.completeUpload({
          upload_id: init.upload_id,
        });
        if (res?.media_asset?.id) newIds.push(res.media_asset.id);
      } catch {
        toast.error(`Upload "${file.name}" thất bại`);
      } finally {
        done += 1;
        setUploading({ done, total: arr.length });
      }
    }
    // BE init-upload chưa bind folder_id (spec admin-asset-scope chưa ship) →
    // asset rớt về root. Đang trong folder thì move vào folder đó (bulk-move
    // đã có sẵn). No-op an toàn khi BE đã bind sẵn.
    if (folderId && newIds.length > 0) {
      try {
        await rexerApi.media.bulkMove({ ids: newIds, folder_id: folderId });
      } catch {
        toast.error('Upload xong nhưng chuyển vào thư mục thất bại');
      }
    }
    setUploading(null);
    toast.success(`Đã upload ${done}/${arr.length} file`);
    load();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
  };

  /* ── mutations ── */
  const toggleSel = (id: string) =>
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const removeFolder = async (f: MediaFolder) => {
    if (!window.confirm(`Xoá thư mục "${f.name}"? (phải rỗng)`)) return;
    try {
      await rexerApi.mediaFolders.remove(f.id);
      toast.success('Đã xoá thư mục');
      load();
    } catch {
      toast.error('Xoá thất bại (thư mục còn nội dung?)');
    }
  };

  const bulkDelete = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (!window.confirm(`Xoá ${ids.length} file?`)) return;
    try {
      await rexerApi.media.bulkDelete(ids);
      toast.success(`Đã xoá ${ids.length} file`);
      load();
    } catch {
      toast.error('Xoá thất bại');
    }
  };

  const doMove = async (target: string | null) => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    try {
      await rexerApi.media.bulkMove({ ids, folder_id: target });
      toast.success(`Đã chuyển ${ids.length} file`);
      setMoveOpen(false);
      load();
    } catch {
      toast.error('Chuyển thất bại');
    }
  };

  const filteredFolders = folders; // search applies to files via API q

  return (
    <div onDragOver={e => e.preventDefault()} onDrop={onDrop}>
      {/* Toolbar */}
      <div className='border-border flex flex-wrap items-center gap-2 rounded-2xl border bg-white p-2 shadow-sm'>
        <div className='relative max-w-xs flex-1'>
          <Search className='text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2' />
          <Input
            placeholder='Tìm file…'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='pl-9'
          />
        </div>
        <div className='ml-auto flex items-center gap-2'>
          <button
            type='button'
            onClick={() => setNewFolderOpen(true)}
            className='border-border text-content-muted hover:bg-muted inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium'
          >
            <FolderPlus className='size-3.5' /> Thư mục
          </button>
          {/* Nút Upload — <label> bọc TRỰC TIẾP <input>: click label kích hoạt
              input native (không JS .click() — cách này Playwright đã verify mở
              được picker). Input off-screen nhưng vẫn trong DOM + trong label. */}
          <label
            className={cn(
              'inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700',
              uploading && 'pointer-events-none opacity-50'
            )}
          >
            {uploading ? (
              <>
                <Loader2 className='size-3.5 animate-spin' /> {uploading.done}/
                {uploading.total}
              </>
            ) : (
              <>
                <Upload className='size-3.5' /> Upload
              </>
            )}
            <input
              id={inputId}
              ref={fileInput}
              type='file'
              multiple
              style={{
                position: 'absolute',
                width: 1,
                height: 1,
                opacity: 0,
                pointerEvents: 'none',
              }}
              onChange={e => {
                if (e.target.files) uploadFiles(e.target.files);
                e.target.value = '';
              }}
            />
          </label>
          <div className='border-border inline-flex items-center gap-0.5 rounded-lg border bg-white p-0.5'>
            <ViewBtn active={view === 'grid'} onClick={() => setView('grid')}>
              <LayoutGrid className='size-3.5' />
            </ViewBtn>
            <ViewBtn active={view === 'list'} onClick={() => setView('list')}>
              <TableIcon className='size-3.5' />
            </ViewBtn>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className='text-content-muted mt-3 flex items-center gap-1 text-xs'>
        <button
          type='button'
          onClick={() => goCrumb(-1)}
          className='hover:text-foreground font-medium'
        >
          Thư viện
        </button>
        {crumbs.map((c, i) => (
          <React.Fragment key={c.id}>
            <span>/</span>
            <button
              type='button'
              onClick={() => goCrumb(i)}
              className='hover:text-foreground font-medium'
            >
              {c.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Body */}
      {loading ? (
        <div className='text-content-muted flex items-center justify-center gap-2 py-16 text-sm'>
          <Loader2 className='size-4 animate-spin' /> Đang tải…
        </div>
      ) : (
        <div className='mt-3 space-y-4'>
          {/* Folders */}
          {filteredFolders.length > 0 && (
            <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'>
              {filteredFolders.map(f => (
                <div
                  key={f.id}
                  className='group border-border hover:border-foreground/30 flex items-center gap-2 rounded-xl border bg-white p-2.5'
                >
                  <button
                    type='button'
                    onClick={() => enterFolder(f)}
                    className='flex min-w-0 flex-1 items-center gap-2 text-left'
                  >
                    <FolderIcon className='size-5 shrink-0 text-amber-500' />
                    <div className='min-w-0'>
                      <div className='truncate text-sm font-medium'>
                        {f.name}
                      </div>
                      <div className='text-3xs text-muted-foreground'>
                        {f.file_count} file · {f.child_count} thư mục
                      </div>
                    </div>
                  </button>
                  <div className='flex shrink-0 items-center opacity-0 group-hover:opacity-100'>
                    <IconBtn
                      title='Đổi tên'
                      onClick={() =>
                        setRenameTarget({
                          kind: 'folder',
                          id: f.id,
                          name: f.name,
                        })
                      }
                    >
                      <Pencil className='size-3' />
                    </IconBtn>
                    <IconBtn
                      title='Xoá'
                      onClick={() => removeFolder(f)}
                      className='text-rose-500 hover:bg-rose-50'
                    >
                      <Trash2 className='size-3' />
                    </IconBtn>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Files */}
          {files.length === 0 && filteredFolders.length === 0 ? (
            <label
              htmlFor={inputId}
              className='border-border text-content-muted hover:border-foreground/30 hover:bg-muted/40 block cursor-pointer rounded-2xl border border-dashed py-16 text-center text-sm'
            >
              {q
                ? 'Không có file khớp.'
                : 'Thư mục trống — bấm đây hoặc kéo-thả để Upload.'}
            </label>
          ) : view === 'grid' ? (
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'>
              {files.map(a => (
                <FileCard
                  key={a.id}
                  asset={a}
                  selected={selected.has(a.id)}
                  onToggle={() => toggleSel(a.id)}
                  onRename={() =>
                    setRenameTarget({
                      kind: 'file',
                      id: a.id,
                      name: a.original_filename,
                    })
                  }
                  onTag={() => setTagTarget(a)}
                />
              ))}
            </div>
          ) : (
            <FileTable
              files={files}
              selected={selected}
              onToggle={toggleSel}
              onRename={a =>
                setRenameTarget({
                  kind: 'file',
                  id: a.id,
                  name: a.original_filename,
                })
              }
              onTag={a => setTagTarget(a)}
            />
          )}
        </div>
      )}

      {/* Selection bar */}
      {selected.size > 0 && (
        <div className='sticky bottom-4 z-30 mx-auto mt-4 flex w-fit items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 shadow-2xl'>
          <span className='text-xs font-medium text-white'>
            {selected.size} file
          </span>
          <button
            type='button'
            onClick={() => setSelected(new Set())}
            className='text-2xs text-white/70 hover:text-white'
          >
            Bỏ chọn
          </button>
          <div className='h-4 w-px bg-white/20' />
          <button
            type='button'
            onClick={() => setMoveOpen(true)}
            className='text-2xs rounded-md bg-white/15 px-2.5 py-1 font-medium text-white hover:bg-white/25'
          >
            Chuyển thư mục
          </button>
          <button
            type='button'
            onClick={bulkDelete}
            className='text-2xs inline-flex items-center gap-1 rounded-md bg-rose-600 px-2.5 py-1 font-medium text-white hover:bg-rose-500'
          >
            <Trash2 className='size-3' /> Xoá
          </button>
        </div>
      )}

      {/* Dialogs */}
      <NameDialog
        open={newFolderOpen}
        title='Thư mục mới'
        label='Tên thư mục'
        onOpenChange={setNewFolderOpen}
        onSubmit={async name => {
          await rexerApi.mediaFolders.create({
            name,
            parent_id: folderId ?? undefined,
            brand_id: brandId,
          });
          toast.success('Đã tạo thư mục');
          load();
        }}
      />
      <NameDialog
        open={!!renameTarget}
        title='Đổi tên'
        label='Tên mới'
        initial={renameTarget?.name}
        onOpenChange={o => !o && setRenameTarget(null)}
        onSubmit={async name => {
          if (!renameTarget) return;
          if (renameTarget.kind === 'folder')
            await rexerApi.mediaFolders.update(renameTarget.id, { name });
          else
            await rexerApi.media.update(renameTarget.id, {
              original_filename: name,
            });
          toast.success('Đã đổi tên');
          load();
        }}
      />
      <TagDialog
        asset={tagTarget}
        onOpenChange={o => !o && setTagTarget(null)}
        onSaved={() => load()}
      />
      <MoveDialog
        open={moveOpen}
        brandId={brandId}
        count={selected.size}
        onOpenChange={setMoveOpen}
        onMove={doMove}
      />
    </div>
  );
}

/* ── bits ── */

function ViewBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'rounded-md px-2 py-1',
        active ? 'bg-zinc-900 text-white' : 'text-content-muted hover:bg-muted'
      )}
    >
      {children}
    </button>
  );
}

function IconBtn({
  title,
  onClick,
  className,
  children,
}: {
  title: string;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type='button'
      title={title}
      aria-label={title}
      onClick={onClick}
      className={cn(
        'text-content-muted hover:bg-muted hover:text-foreground inline-flex size-6 items-center justify-center rounded-md',
        className
      )}
    >
      {children}
    </button>
  );
}

function FileCard({
  asset,
  selected,
  onToggle,
  onRename,
  onTag,
}: {
  asset: MediaAsset;
  selected: boolean;
  onToggle: () => void;
  onRename: () => void;
  onTag: () => void;
}) {
  return (
    <div
      className={cn(
        'group border-border relative overflow-hidden rounded-xl border bg-white',
        selected && 'ring-primary ring-2'
      )}
    >
      <button
        type='button'
        onClick={onToggle}
        className='absolute top-1.5 left-1.5 z-10 flex size-5 items-center justify-center rounded-md border border-white/60 bg-black/30 text-white backdrop-blur'
      >
        {selected && <Check className='size-3.5' />}
      </button>
      <div className='absolute top-1.5 right-1.5 z-10 flex items-center gap-0.5 opacity-0 group-hover:opacity-100'>
        <IconBtn title='Đổi tên' onClick={onRename} className='bg-white/80'>
          <Pencil className='size-3' />
        </IconBtn>
        <IconBtn title='Tags' onClick={onTag} className='bg-white/80'>
          <FileText className='size-3' />
        </IconBtn>
      </div>
      <FileThumb asset={asset} className='aspect-square w-full' />
      <div className='p-2'>
        <div
          className='truncate text-xs font-medium'
          title={asset.original_filename}
        >
          {asset.original_filename}
        </div>
        <div className='text-3xs text-muted-foreground'>
          {fmtBytes(asset.file_size)}
        </div>
        {asset.tags && asset.tags.length > 0 && (
          <div className='mt-1 flex flex-wrap gap-0.5'>
            {asset.tags.slice(0, 3).map(t => (
              <span
                key={t}
                className='bg-muted text-3xs rounded px-1 py-0.5 font-mono'
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FileTable({
  files,
  selected,
  onToggle,
  onRename,
  onTag,
}: {
  files: MediaAsset[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onRename: (a: MediaAsset) => void;
  onTag: (a: MediaAsset) => void;
}) {
  return (
    <div className='border-border overflow-hidden rounded-2xl border bg-white'>
      <table className='w-full text-sm'>
        <thead>
          <tr className='border-border text-content-muted text-2xs border-b text-left tracking-wider uppercase'>
            <th className='w-8 px-3 py-2' />
            <th className='px-3 py-2 font-semibold'>Tên file</th>
            <th className='px-3 py-2 font-semibold'>Loại</th>
            <th className='px-3 py-2 text-right font-semibold'>Kích thước</th>
            <th className='px-3 py-2' />
          </tr>
        </thead>
        <tbody>
          {files.map(a => (
            <tr
              key={a.id}
              className={cn(
                'border-border/60 hover:bg-muted/40 border-b last:border-0',
                selected.has(a.id) && 'bg-muted'
              )}
            >
              <td className='px-3 py-2'>
                <input
                  type='checkbox'
                  checked={selected.has(a.id)}
                  onChange={() => onToggle(a.id)}
                  className='size-3.5 cursor-pointer rounded'
                />
              </td>
              <td className='px-3 py-2'>
                <div className='flex items-center gap-2'>
                  <FileThumb asset={a} className='size-8 rounded' />
                  <span className='truncate font-medium'>
                    {a.original_filename}
                  </span>
                </div>
              </td>
              <td className='text-content-muted text-3xs px-3 py-2 font-mono'>
                {a.media_type || a.mime_type}
              </td>
              <td className='text-content-muted px-3 py-2 text-right font-mono text-xs'>
                {fmtBytes(a.file_size)}
              </td>
              <td className='px-3 py-2'>
                <div className='flex items-center justify-end gap-1'>
                  <IconBtn title='Đổi tên' onClick={() => onRename(a)}>
                    <Pencil className='size-3' />
                  </IconBtn>
                  <IconBtn title='Tags' onClick={() => onTag(a)}>
                    <FileText className='size-3' />
                  </IconBtn>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NameDialog({
  open,
  title,
  label,
  initial,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  title: string;
  label: string;
  initial?: string;
  onOpenChange: (o: boolean) => void;
  onSubmit: (name: string) => Promise<void>;
}) {
  const [name, setName] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  React.useEffect(() => {
    if (open) {
      setName(initial ?? '');
      setSaving(false);
    }
  }, [open, initial]);
  const submit = async () => {
    if (!name.trim()) return toast.error('Nhập tên');
    setSaving(true);
    try {
      await onSubmit(name.trim());
      onOpenChange(false);
    } catch {
      toast.error('Thất bại');
    } finally {
      setSaving(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div>
          <Label className='text-2xs text-content-muted font-semibold tracking-wider uppercase'>
            {label}
          </Label>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            autoFocus
            className='mt-1'
          />
        </div>
        <DialogFooter>
          <Button
            variant='pill-light'
            size='sm'
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Huỷ
          </Button>
          <Button variant='pill' size='sm' onClick={submit} disabled={saving}>
            {saving ? 'Đang lưu…' : 'Lưu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TagDialog({
  asset,
  onOpenChange,
  onSaved,
}: {
  asset: MediaAsset | null;
  onOpenChange: (o: boolean) => void;
  onSaved: () => void;
}) {
  const [val, setVal] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  React.useEffect(() => {
    if (asset) setVal((asset.tags ?? []).join(', '));
  }, [asset]);
  const submit = async () => {
    if (!asset) return;
    setSaving(true);
    try {
      const tags = val
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
      await rexerApi.media.update(asset.id, { tags });
      toast.success('Đã lưu tags');
      onOpenChange(false);
      onSaved();
    } catch {
      toast.error('Lưu tags thất bại');
    } finally {
      setSaving(false);
    }
  };
  return (
    <Dialog open={!!asset} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>Tags — {asset?.original_filename}</DialogTitle>
        </DialogHeader>
        <div>
          <Label className='text-2xs text-content-muted font-semibold tracking-wider uppercase'>
            Tags (phân cách bằng dấu phẩy)
          </Label>
          <Input
            value={val}
            onChange={e => setVal(e.target.value)}
            placeholder='banner, tết, hero'
            className='mt-1'
          />
        </div>
        <DialogFooter>
          <Button
            variant='pill-light'
            size='sm'
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Huỷ
          </Button>
          <Button variant='pill' size='sm' onClick={submit} disabled={saving}>
            {saving ? 'Đang lưu…' : 'Lưu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Move dialog — chọn folder gốc của brand (hoặc root). v1: list root-level. */
function MoveDialog({
  open,
  brandId,
  count,
  onOpenChange,
  onMove,
}: {
  open: boolean;
  brandId?: string;
  count: number;
  onOpenChange: (o: boolean) => void;
  onMove: (target: string | null) => void;
}) {
  const [folders, setFolders] = React.useState<MediaFolder[]>([]);
  React.useEffect(() => {
    if (!open) return;
    rexerApi.mediaFolders
      .list({ brand_id: brandId })
      .then(r => setFolders(r.items ?? []))
      .catch(() => setFolders([]));
  }, [open, brandId]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>Chuyển {count} file tới…</DialogTitle>
        </DialogHeader>
        <div className='max-h-64 space-y-1 overflow-y-auto'>
          <button
            type='button'
            onClick={() => onMove(null)}
            className='hover:bg-muted flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm'
          >
            <ArrowLeft className='text-content-muted size-4' /> Thư viện (gốc)
          </button>
          {folders.map(f => (
            <button
              key={f.id}
              type='button'
              onClick={() => onMove(f.id)}
              className='hover:bg-muted flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm'
            >
              <FolderIcon className='size-4 text-amber-500' /> {f.name}
            </button>
          ))}
          {folders.length === 0 && (
            <p className='text-content-muted px-3 py-4 text-center text-xs'>
              Chưa có thư mục nào ở cấp gốc.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant='pill-light'
            size='sm'
            onClick={() => onOpenChange(false)}
          >
            Huỷ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
