import { Clock, ExternalLink, FileCode2, type LucideIcon } from 'lucide-react';
import Link from 'next/link';

export type AdminComingSoonDependency = {
  status: 'done' | 'in_progress' | 'new';
  text: string;
};

export function AdminComingSoon({
  icon: Icon,
  title,
  subtitle,
  specFile,
  estTime,
  dependencies,
  previewHref,
  previewLabel,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  specFile: string;
  estTime: string;
  dependencies: AdminComingSoonDependency[];
  previewHref?: string;
  previewLabel?: string;
}) {
  return (
    <div className='mx-auto max-w-3xl p-6'>
      <div className='overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm'>
        {/* Header */}
        <div className='border-b border-zinc-100 bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 p-6'>
          <div className='flex items-start gap-3'>
            <div className='flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-md'>
              <Icon className='size-6' />
            </div>
            <div className='flex-1'>
              <div className='flex items-center gap-2'>
                <span className='rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-700 uppercase'>
                  Coming soon
                </span>
                <span className='inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 font-mono text-[10px] text-zinc-600'>
                  <Clock className='size-2.5' /> {estTime}
                </span>
              </div>
              <h1 className='mt-1 text-2xl font-bold tracking-tight'>
                {title}
              </h1>
              <p className='mt-1 text-[13px] text-zinc-600'>{subtitle}</p>
            </div>
          </div>
        </div>

        {/* Spec link */}
        <div className='border-b border-zinc-100 px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div>
              <div className='text-[10px] font-semibold tracking-wider text-zinc-500 uppercase'>
                Spec BE
              </div>
              <code className='mt-0.5 inline-block rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[11.5px] text-zinc-700'>
                docs/{specFile}
              </code>
            </div>
            <Link
              href={`/overview/document-BE#${specFile.replace('.md', '').replace('be-', 'be-')}`}
              className='flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100'
            >
              <FileCode2 className='size-3.5' />
              Xem spec
              <ExternalLink className='size-3' />
            </Link>
          </div>
        </div>

        {/* Dependencies */}
        <div className='px-6 py-4'>
          <div className='mb-3 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase'>
            Phụ thuộc
          </div>
          <ul className='space-y-2'>
            {dependencies.map((d, i) => (
              <li key={i} className='flex items-start gap-2 text-[13px]'>
                <span
                  className={`mt-1 inline-flex size-2.5 shrink-0 items-center justify-center rounded-full ${
                    d.status === 'done'
                      ? 'bg-emerald-500'
                      : d.status === 'in_progress'
                        ? 'bg-amber-500'
                        : 'bg-blue-500'
                  }`}
                />
                <span className='flex-1 text-zinc-700'>{d.text}</span>
                <span
                  className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase ${
                    d.status === 'done'
                      ? 'bg-emerald-100 text-emerald-700'
                      : d.status === 'in_progress'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {d.status === 'done'
                    ? 'Done'
                    : d.status === 'in_progress'
                      ? 'WIP'
                      : 'New'}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Preview link (demo) */}
        {previewHref && previewLabel && (
          <div className='border-t border-zinc-100 bg-zinc-50/50 px-6 py-4'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-[10px] font-semibold tracking-wider text-zinc-500 uppercase'>
                  UI Demo có sẵn
                </div>
                <p className='mt-0.5 text-[12px] text-zinc-600'>
                  Xem trước UI + UX design tại trang demo (fake data).
                </p>
              </div>
              <Link
                href={previewHref}
                className='flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700'
              >
                {previewLabel}
                <ExternalLink className='size-3' />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
