import { useState } from 'react';

// Author Mode UI (?author). Click the model to drop polygon points, fill in the
// item info, Finish to add a zone, then Copy JSON to paste into floors.js.
export default function AuthorPanel({
  floorKey,
  draft,
  zones,
  form,
  setForm,
  onFinish,
  onUndo,
  onClear,
  onRemove,
}) {
  const [copied, setCopied] = useState(false);

  const copyJSON = () => {
    const json = JSON.stringify(
      zones.map(({ id, title, eyebrow, type, src, points }) => ({
        id,
        title,
        eyebrow,
        type,
        src,
        points,
      })),
      null,
      2
    );
    navigator.clipboard?.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const field =
    'w-full rounded-md border border-neutral-300 px-2 py-1.5 text-[13px] text-neutral-900 outline-none focus:border-amber-500';

  return (
    <div className='fixed top-4 left-4 z-[70] w-72 rounded-xl bg-white/95 p-4 text-neutral-900 shadow-2xl ring-1 ring-black/10 backdrop-blur'>
      <div className='mb-2 flex items-center justify-between'>
        <span className='text-xs font-semibold tracking-wider text-amber-600 uppercase'>
          Author · {floorKey}
        </span>
        <span className='text-[11px] text-neutral-400'>
          {draft.length} điểm
        </span>
      </div>
      <p className='mb-3 text-[11px] leading-snug text-neutral-500'>
        Click lên model để thêm điểm (≥3). Nhập thông tin rồi <b>Finish</b>.
        Nhấn <b>ESC</b> để thoát chế độ vẽ.
      </p>

      <div className='space-y-2'>
        <input
          className={field}
          placeholder='Tiêu đề (vd: Sofa)'
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
        />
        <input
          className={field}
          placeholder='Eyebrow (vd: Nội thất)'
          value={form.eyebrow}
          onChange={e => setForm(f => ({ ...f, eyebrow: e.target.value }))}
        />
        <select
          className={field}
          value={form.type}
          onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
        >
          <option value='model'>3D model (GLB)</option>
          <option value='image'>Hình ảnh</option>
        </select>
        <input
          className={field}
          placeholder={form.type === 'model' ? 'URL .glb' : 'URL ảnh'}
          value={form.src}
          onChange={e => setForm(f => ({ ...f, src: e.target.value }))}
        />
      </div>

      <div className='mt-3 flex gap-2'>
        <button
          onClick={onFinish}
          disabled={draft.length < 3}
          className='flex-1 rounded-md bg-amber-500 py-1.5 text-[12px] font-medium text-neutral-950 disabled:opacity-40'
        >
          Finish
        </button>
        <button
          onClick={onUndo}
          disabled={!draft.length}
          className='rounded-md bg-neutral-200 px-3 py-1.5 text-[12px] disabled:opacity-40'
        >
          Undo
        </button>
        <button
          onClick={onClear}
          disabled={!draft.length}
          className='rounded-md bg-neutral-200 px-3 py-1.5 text-[12px] disabled:opacity-40'
        >
          Clear
        </button>
      </div>

      <div className='mt-4 border-t border-neutral-200 pt-3'>
        <div className='mb-1 flex items-center justify-between'>
          <span className='text-[11px] font-medium text-neutral-500'>
            Zones ({zones.length})
          </span>
          <button
            onClick={copyJSON}
            disabled={!zones.length}
            className='rounded bg-neutral-900 px-2 py-1 text-[11px] text-white disabled:opacity-40'
          >
            {copied ? 'Đã copy ✓' : 'Copy JSON'}
          </button>
        </div>
        <ul className='max-h-32 space-y-1 overflow-y-auto text-[12px]'>
          {zones.map(z => (
            <li
              key={z.id}
              className='flex items-center justify-between gap-2 rounded bg-neutral-100 px-2 py-1'
            >
              <span className='truncate'>
                {z.title}{' '}
                <span className='text-neutral-400'>
                  · {z.type} · {z.points.length}pt
                </span>
              </span>
              <button
                onClick={() => onRemove(z.id)}
                aria-label='Remove'
                className='shrink-0 text-neutral-400 hover:text-red-500'
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
