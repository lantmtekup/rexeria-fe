'use client';

import {
  ChevronRight,
  FileArchive,
  FileImage,
  FileText,
  FileVideo,
  Folder,
  FolderOpen,
  FolderPlus,
  Grid3x3,
  Home,
  List,
  Loader2,
  MoreHorizontal,
  Music,
  Search,
  Tag,
  UploadCloud,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
  FAKE_FOLDERS,
  FAKE_MEDIA_FILES,
  fmtBytes,
  type AssetKind,
  type MediaFile,
  type MediaFolder,
} from '../_data';
import { PortalShell } from '../_shell';

const KIND_META: Record<
  AssetKind,
  { icon: LucideIcon; color: string; gradient: string }
> = {
  image: {
    icon: FileImage,
    color: 'bg-blue-500',
    gradient: 'from-blue-400 to-blue-600',
  },
  video: {
    icon: FileVideo,
    color: 'bg-rose-500',
    gradient: 'from-rose-400 to-rose-600',
  },
  document: {
    icon: FileText,
    color: 'bg-emerald-500',
    gradient: 'from-emerald-400 to-emerald-600',
  },
  audio: {
    icon: Music,
    color: 'bg-fuchsia-500',
    gradient: 'from-fuchsia-400 to-fuchsia-600',
  },
  archive: {
    icon: FileArchive,
    color: 'bg-amber-500',
    gradient: 'from-amber-400 to-amber-600',
  },
};

const RANDOM_GRADIENTS = [
  'from-rose-400 to-red-500',
  'from-orange-400 to-pink-500',
  'from-amber-300 to-orange-400',
  'from-emerald-300 to-lime-500',
  'from-blue-400 to-violet-500',
  'from-cyan-400 to-blue-500',
  'from-fuchsia-400 to-purple-500',
  'from-zinc-700 to-zinc-900',
  'from-violet-300 to-fuchsia-400',
];

function detectKind(mime: string): AssetKind {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  if (
    mime === 'application/zip' ||
    mime === 'application/x-rar-compressed' ||
    mime === 'application/x-7z-compressed'
  )
    return 'archive';
  return 'document';
}

type UploadingItem = {
  id: string;
  name: string;
  size_bytes: number;
  kind: AssetKind;
  progress: number; // 0-100
  folder_id: string;
};

export default function PortalMediaPage() {
  const [folders, setFolders] = useState<MediaFolder[]>(FAKE_FOLDERS);
  const [files, setFiles] = useState<MediaFile[]>(FAKE_MEDIA_FILES);
  const [currentFolderId, setCurrentFolderId] = useState<string>('f_root');
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [search, setSearch] = useState('');
  const [draggedOver, setDraggedOver] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [uploading, setUploading] = useState<UploadingItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Breadcrumb
  const breadcrumb = useMemo(() => {
    const path: MediaFolder[] = [];
    let cur = folders.find(f => f.id === currentFolderId);
    while (cur) {
      path.unshift(cur);
      cur = cur.parent_id
        ? folders.find(f => f.id === cur!.parent_id)
        : undefined;
    }
    return path;
  }, [currentFolderId, folders]);

  const subfolders = folders.filter(f => f.parent_id === currentFolderId);
  const folderFiles = files.filter(f => f.folder_id === currentFolderId);

  const visibleFolders = search
    ? subfolders.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase())
      )
    : subfolders;
  const visibleFiles = search
    ? folderFiles.filter(
        f =>
          f.name.toLowerCase().includes(search.toLowerCase()) ||
          f.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      )
    : folderFiles;

  /* ---------- create folder ---------- */

  const createFolder = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Tên folder không được rỗng');
      return;
    }
    if (subfolders.some(f => f.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error(`Folder "${trimmed}" đã tồn tại`);
      return;
    }
    const newFolder: MediaFolder = {
      id: `f_${Date.now()}`,
      parent_id: currentFolderId,
      name: trimmed,
      child_folder_count: 0,
      file_count: 0,
      size_bytes: 0,
      updated_at: new Date().toISOString(),
    };
    setFolders(prev => {
      const next = [...prev, newFolder];
      // Increment parent child_folder_count
      return next.map(f =>
        f.id === currentFolderId
          ? { ...f, child_folder_count: f.child_folder_count + 1 }
          : f
      );
    });
    setShowNewFolderModal(false);
    toast.success(`Đã tạo folder "${trimmed}"`);
  };

  /* ---------- upload files ---------- */

  const handleFileSelect = (fileList: FileList | null) => {
    if (!fileList) return;
    const arr = Array.from(fileList);
    if (arr.length === 0) return;

    arr.forEach((f, idx) => {
      const id = `m_${Date.now()}_${idx}`;
      const kind = detectKind(f.type);
      const item: UploadingItem = {
        id,
        name: f.name,
        size_bytes: f.size,
        kind,
        progress: 0,
        folder_id: currentFolderId,
      };
      setUploading(prev => [...prev, item]);

      // Simulate progress
      let p = 0;
      const interval = setInterval(() => {
        p += Math.random() * 25 + 10;
        if (p >= 100) {
          p = 100;
          clearInterval(interval);
          // Move from uploading → committed
          setTimeout(() => {
            setUploading(prev => prev.filter(u => u.id !== id));
            commitFile(id, f.name, f.size, kind, f.type);
          }, 200);
        }
        setUploading(prev =>
          prev.map(u => (u.id === id ? { ...u, progress: p } : u))
        );
      }, 180);
    });
  };

  const commitFile = (
    id: string,
    name: string,
    size: number,
    kind: AssetKind,
    mime: string
  ) => {
    const gradient =
      RANDOM_GRADIENTS[Math.floor(Math.random() * RANDOM_GRADIENTS.length)];
    const newFile: MediaFile = {
      id,
      folder_id: currentFolderId,
      name,
      kind,
      mime_type: mime || 'application/octet-stream',
      size_bytes: size,
      thumbnail_gradient: gradient,
      uploaded_at: new Date().toISOString(),
      uploaded_by: { name: 'An (Brand)', role: 'brand' },
      tags: ['uploaded'],
      scan_status: 'clean',
    };
    setFiles(prev => [newFile, ...prev]);
    // Bump parent folder file_count + size
    setFolders(prev =>
      prev.map(f =>
        f.id === currentFolderId
          ? {
              ...f,
              file_count: f.file_count + 1,
              size_bytes: f.size_bytes + size,
              updated_at: new Date().toISOString(),
            }
          : f
      )
    );
    toast.success(`Đã upload "${name}"`, {
      description: fmtBytes(size),
    });
  };

  const onUploadClick = () => fileInputRef.current?.click();

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedOver) setDraggedOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget === e.target) setDraggedOver(false);
  };

  return (
    <PortalShell>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type='file'
        multiple
        className='hidden'
        onChange={e => {
          handleFileSelect(e.target.files);
          // Reset so same file can be re-selected
          if (fileInputRef.current) fileInputRef.current.value = '';
        }}
      />

      {/* Container with drag handlers */}
      <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
        {/* Header */}
        <section className='flex flex-wrap items-end justify-between gap-4'>
          <div>
            <div className='text-2xs text-content-muted flex items-center gap-2 font-semibold tracking-wider uppercase'>
              <FolderOpen className='size-3' /> Media · Google Drive style
            </div>
            <h1 className='mt-1 text-2xl font-bold tracking-tight'>
              Thư viện Media
            </h1>
            <p className='text-content-muted mt-1 text-sm'>
              Tổ chức ảnh / video / tài liệu theo thư mục. Kéo-thả file để
              upload trực tiếp.
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => setShowNewFolderModal(true)}
              className='border-border text-content-muted hover:bg-muted flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium'
            >
              <FolderPlus className='size-3.5' /> Tạo folder
            </button>
            <button
              onClick={onUploadClick}
              className='flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-cyan-600'
            >
              <UploadCloud className='size-3.5' /> Upload
            </button>
          </div>
        </section>

        {/* Breadcrumb + toolbar */}
        <div className='border-border mt-5 flex flex-wrap items-center gap-3 rounded-2xl border bg-white p-3 shadow-sm'>
          <nav className='flex flex-1 items-center gap-1 text-sm'>
            {breadcrumb.map((f, i) => (
              <div key={f.id} className='flex items-center gap-1'>
                {i > 0 && (
                  <ChevronRight className='text-muted-foreground size-3.5' />
                )}
                <button
                  onClick={() => {
                    setCurrentFolderId(f.id);
                    setSearch('');
                  }}
                  className={`flex items-center gap-1 rounded-md px-2 py-1 transition-colors ${
                    i === breadcrumb.length - 1
                      ? 'bg-muted text-foreground font-semibold'
                      : 'text-content-muted hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {i === 0 && <Home className='size-3' />}
                  {f.name}
                </button>
              </div>
            ))}
          </nav>

          <div className='flex items-center gap-2'>
            <div className='border-border bg-muted flex items-center gap-1.5 rounded-lg border px-2 py-1'>
              <Search className='text-muted-foreground size-3.5' />
              <input
                type='text'
                placeholder='Search folder...'
                value={search}
                onChange={e => setSearch(e.target.value)}
                className='placeholder:text-muted-foreground w-32 bg-transparent text-xs outline-none'
              />
            </div>
            <div className='border-border inline-flex items-center rounded-lg border bg-white p-0.5'>
              <button
                onClick={() => setView('grid')}
                className={`rounded-md p-1 ${view === 'grid' ? 'bg-zinc-900 text-white' : 'text-content-muted hover:bg-muted'}`}
                aria-label='Grid view'
              >
                <Grid3x3 className='size-3.5' />
              </button>
              <button
                onClick={() => setView('list')}
                className={`rounded-md p-1 ${view === 'list' ? 'bg-zinc-900 text-white' : 'text-content-muted hover:bg-muted'}`}
                aria-label='List view'
              >
                <List className='size-3.5' />
              </button>
            </div>
          </div>
        </div>

        {/* Drag-overlay */}
        {draggedOver && (
          <div className='pointer-events-none mt-5 rounded-2xl border-4 border-dashed border-cyan-500 bg-cyan-100/50 p-12 text-center'>
            <UploadCloud className='mx-auto size-12 text-cyan-700' />
            <div className='mt-2 text-base font-bold text-cyan-800'>
              Thả file để upload vào {breadcrumb[breadcrumb.length - 1]?.name}
            </div>
          </div>
        )}

        {/* Uploading queue */}
        {uploading.length > 0 && (
          <section className='mt-5 rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-4 shadow-sm'>
            <div className='mb-3 flex items-center gap-2'>
              <Loader2 className='size-4 animate-spin text-cyan-600' />
              <h3 className='text-sm font-semibold text-cyan-900'>
                Đang upload ({uploading.length})
              </h3>
            </div>
            <div className='space-y-2'>
              {uploading.map(u => {
                const meta = KIND_META[u.kind];
                const Icon = meta.icon;
                return (
                  <div
                    key={u.id}
                    className='flex items-center gap-3 rounded-lg bg-white px-3 py-2 ring-1 ring-zinc-100'
                  >
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${meta.color} text-white shadow-sm`}
                    >
                      <Icon className='size-4' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-center justify-between gap-2'>
                        <span className='truncate text-xs font-semibold'>
                          {u.name}
                        </span>
                        <span className='text-3xs text-content-muted shrink-0 font-mono'>
                          {fmtBytes(u.size_bytes)}
                        </span>
                      </div>
                      <div className='mt-1 flex items-center gap-2'>
                        <div className='bg-muted h-1 flex-1 overflow-hidden rounded-full'>
                          <div
                            className='h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 transition-all duration-200'
                            style={{ width: `${u.progress}%` }}
                          />
                        </div>
                        <span className='text-3xs font-mono font-semibold text-cyan-700'>
                          {Math.round(u.progress)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Empty state — show upload prompt */}
        {visibleFolders.length === 0 &&
          visibleFiles.length === 0 &&
          uploading.length === 0 && (
            <div
              onClick={onUploadClick}
              className='mt-5 cursor-pointer rounded-2xl border-2 border-dashed border-cyan-300 bg-gradient-to-br from-cyan-50 to-white p-12 text-center transition-all hover:border-cyan-400 hover:from-cyan-100'
            >
              <UploadCloud className='mx-auto size-12 text-cyan-500' />
              <h3 className='mt-3 text-base font-bold'>
                {currentFolderId === 'f_root' ? 'Bắt đầu nào' : 'Folder rỗng'}
              </h3>
              <p className='text-content-muted mt-1 text-xs'>
                Kéo-thả file vào đây hoặc{' '}
                <span className='font-semibold text-cyan-700 underline-offset-2 hover:underline'>
                  click để chọn file
                </span>
              </p>
              <div className='text-3xs text-content-muted mt-3 flex flex-wrap items-center justify-center gap-1.5'>
                <span className='rounded-full bg-white px-2 py-0.5 ring-1 ring-zinc-200'>
                  🖼 Hình ảnh ≤ 100MB
                </span>
                <span className='rounded-full bg-white px-2 py-0.5 ring-1 ring-zinc-200'>
                  🎥 Video ≤ 500MB
                </span>
                <span className='rounded-full bg-white px-2 py-0.5 ring-1 ring-zinc-200'>
                  📄 PDF, DOCX, XLSX, PPTX
                </span>
              </div>
            </div>
          )}

        {/* Folders section */}
        {visibleFolders.length > 0 && (
          <section className='mt-5'>
            <h2 className='text-2xs text-content-muted mb-2 font-semibold tracking-wider uppercase'>
              Thư mục ({visibleFolders.length})
            </h2>
            {view === 'grid' ? (
              <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
                {visibleFolders.map(f => (
                  <FolderCard
                    key={f.id}
                    folder={f}
                    onOpen={() => {
                      setCurrentFolderId(f.id);
                      setSearch('');
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className='border-border divide-y divide-zinc-100 overflow-hidden rounded-2xl border bg-white'>
                {visibleFolders.map(f => (
                  <FolderRow
                    key={f.id}
                    folder={f}
                    onOpen={() => setCurrentFolderId(f.id)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Files section */}
        {visibleFiles.length > 0 && (
          <section className='mt-6'>
            <h2 className='text-2xs text-content-muted mb-2 font-semibold tracking-wider uppercase'>
              File ({visibleFiles.length})
            </h2>
            {view === 'grid' ? (
              <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
                {visibleFiles.map(f => (
                  <FileCard key={f.id} f={f} />
                ))}
              </div>
            ) : (
              <div className='border-border divide-y divide-zinc-100 overflow-hidden rounded-2xl border bg-white'>
                {visibleFiles.map(f => (
                  <FileRow key={f.id} f={f} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* New folder modal */}
      {showNewFolderModal && (
        <NewFolderModal
          onClose={() => setShowNewFolderModal(false)}
          onCreate={createFolder}
          parentName={breadcrumb[breadcrumb.length - 1]?.name ?? 'My Drive'}
        />
      )}
    </PortalShell>
  );
}

/* ---------- New folder modal ---------- */

function NewFolderModal({
  onClose,
  onCreate,
  parentName,
}: {
  onClose: () => void;
  onCreate: (name: string) => void;
  parentName: string;
}) {
  const [name, setName] = useState('Untitled folder');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus + select-all on open
  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl'
        onClick={e => e.stopPropagation()}
      >
        <div className='border-border flex items-center justify-between border-b px-5 py-3'>
          <div className='flex items-center gap-2'>
            <div className='flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm'>
              <FolderPlus className='size-4' />
            </div>
            <h3 className='text-sm font-semibold'>Folder mới</h3>
          </div>
          <button
            onClick={onClose}
            className='text-muted-foreground hover:bg-muted hover:text-content-muted rounded-lg p-1'
            aria-label='Close'
          >
            <X className='size-4' />
          </button>
        </div>
        <form
          onSubmit={e => {
            e.preventDefault();
            onCreate(name);
          }}
          className='px-5 py-4'
        >
          <label className='text-3xs text-content-muted block font-semibold tracking-wider uppercase'>
            Tên folder
          </label>
          <input
            ref={inputRef}
            type='text'
            value={name}
            onChange={e => setName(e.target.value)}
            className='border-border mt-1.5 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100'
            maxLength={64}
          />
          <p className='text-2xs text-content-muted mt-1.5'>
            Tạo trong{' '}
            <span className='text-content-muted font-mono font-semibold'>
              {parentName}
            </span>
          </p>
          <div className='mt-4 flex items-center justify-end gap-2'>
            <button
              type='button'
              onClick={onClose}
              className='border-border text-content-muted hover:bg-muted rounded-lg border bg-white px-3 py-1.5 text-xs font-medium'
            >
              Hủy
            </button>
            <button
              type='submit'
              className='rounded-lg bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-zinc-700'
            >
              Tạo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Folder card / row ---------- */

function FolderCard({
  folder,
  onOpen,
}: {
  folder: MediaFolder;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      className='group border-border flex flex-col items-start overflow-hidden rounded-xl border bg-gradient-to-br from-amber-50 to-white p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md'
    >
      <div className='flex w-full items-center justify-between'>
        <div className='flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm transition-transform group-hover:scale-110'>
          <Folder className='size-5' />
        </div>
        <button
          className='text-muted-foreground hover:bg-muted hover:text-content-muted rounded p-1 opacity-0 transition-opacity group-hover:opacity-100'
          onClick={e => e.stopPropagation()}
          aria-label='More'
        >
          <MoreHorizontal className='size-3.5' />
        </button>
      </div>
      <div
        className='mt-3 line-clamp-1 text-sm font-semibold'
        title={folder.name}
      >
        {folder.name}
      </div>
      <div className='text-3xs text-content-muted mt-0.5'>
        {folder.child_folder_count > 0 &&
          `${folder.child_folder_count} thư mục · `}
        {folder.file_count} file
      </div>
    </button>
  );
}

function FolderRow({
  folder,
  onOpen,
}: {
  folder: MediaFolder;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      className='hover:bg-muted flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors'
    >
      <div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm'>
        <Folder className='size-4' />
      </div>
      <div className='min-w-0 flex-1'>
        <div className='text-sm font-semibold'>{folder.name}</div>
        <div className='text-3xs text-content-muted'>
          {folder.child_folder_count > 0 &&
            `${folder.child_folder_count} thư mục · `}
          {folder.file_count} file · {fmtBytes(folder.size_bytes)}
        </div>
      </div>
      <span className='text-3xs text-muted-foreground font-mono'>
        {new Date(folder.updated_at).toLocaleDateString('vi-VN')}
      </span>
      <ChevronRight className='text-muted-foreground size-4' />
    </button>
  );
}

/* ---------- File card / row ---------- */

function FileCard({ f }: { f: MediaFile }) {
  const meta = KIND_META[f.kind];
  const Icon = meta.icon;
  return (
    <div className='group border-border cursor-pointer overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md'>
      <div
        className={`relative aspect-square bg-gradient-to-br ${f.thumbnail_gradient}`}
      >
        <div className='absolute inset-0 flex items-center justify-center text-white/90'>
          <Icon className='size-10 drop-shadow-md' />
        </div>
        <span
          className={`absolute top-2 left-2 rounded-md ${meta.color} text-3xs px-1.5 py-0.5 font-mono font-bold text-white shadow-sm`}
        >
          {f.kind.toUpperCase()}
        </span>
        {f.campaign && (
          <span className='text-3xs absolute right-2 bottom-2 rounded-md bg-black/40 px-1.5 py-0.5 font-mono text-white backdrop-blur'>
            📢 {f.campaign}
          </span>
        )}
      </div>
      <div className='p-2.5'>
        <div className='truncate text-xs font-semibold' title={f.name}>
          {f.name}
        </div>
        <div className='text-3xs text-content-muted mt-0.5 flex items-center justify-between'>
          <span className='font-mono'>{fmtBytes(f.size_bytes)}</span>
          <span>{f.uploaded_by.name}</span>
        </div>
        {f.tags.length > 0 && (
          <div className='mt-1.5 flex flex-wrap gap-1'>
            {f.tags.slice(0, 2).map(t => (
              <span
                key={t}
                className='text-3xs bg-muted text-content-muted inline-flex items-center gap-0.5 rounded px-1 py-0.5 font-mono'
              >
                <Tag className='size-2' /> {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FileRow({ f }: { f: MediaFile }) {
  const meta = KIND_META[f.kind];
  const Icon = meta.icon;
  return (
    <div className='hover:bg-muted flex items-center gap-3 px-4 py-2.5 transition-colors'>
      <div
        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${meta.color} text-white shadow-sm`}
      >
        <Icon className='size-4' />
      </div>
      <div className='min-w-0 flex-1'>
        <div className='truncate text-sm font-semibold' title={f.name}>
          {f.name}
        </div>
        <div className='text-3xs text-content-muted'>
          {fmtBytes(f.size_bytes)} ·{' '}
          {new Date(f.uploaded_at).toLocaleDateString('vi-VN')} ·{' '}
          {f.uploaded_by.name}
        </div>
      </div>
      {f.campaign && (
        <span className='text-3xs bg-muted text-content-muted rounded-md px-1.5 py-0.5 font-mono'>
          {f.campaign}
        </span>
      )}
      <span className='text-3xs text-muted-foreground font-mono'>
        {f.kind.toUpperCase()}
      </span>
    </div>
  );
}
