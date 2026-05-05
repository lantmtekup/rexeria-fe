'use client';

import * as React from 'react';
import { Monitor, Smartphone, Tablet, X } from 'lucide-react';

import { cn } from '@/lib/cn';

import { RenderBlock } from './blocks/renderBlock';
import { InViewBlock } from './InViewBlock';
import { readVariant, type Block, type Device, type Lang } from './types';

interface PreviewModeProps {
  blocks: Block[];
  lang: Lang;
  onClose: () => void;
}

const DEVICE_WIDTH: Record<Device, number> = {
  desktop: 1280,
  tablet: 834,
  mobile: 390,
};

const DEVICE_BUTTONS: {
  value: Device;
  icon: React.ElementType;
  label: string;
}[] = [
  { value: 'desktop', icon: Monitor, label: 'Desktop' },
  { value: 'tablet', icon: Tablet, label: 'Tablet' },
  { value: 'mobile', icon: Smartphone, label: 'Mobile' },
];

export function PreviewMode({ blocks, lang, onClose }: PreviewModeProps) {
  const [device, setDevice] = React.useState<Device>('desktop');

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const visible = blocks.filter(b => b.isVisible);

  return (
    <div className='fixed inset-0 z-50 flex flex-col bg-neutral-950/95 backdrop-blur'>
      <header className='flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 text-white'>
        <span className='text-xs font-medium tracking-widest text-white/70 uppercase'>
          Xem trước · {visible.length}/{blocks.length} block
        </span>
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-0.5 rounded-md border border-white/15 bg-white/5 p-0.5'>
            {DEVICE_BUTTONS.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                type='button'
                aria-label={label}
                onClick={() => setDevice(value)}
                className={cn(
                  'flex size-7 cursor-pointer items-center justify-center rounded-sm text-white/60 transition-colors hover:text-white',
                  device === value && 'bg-white text-neutral-900 shadow-sm'
                )}
              >
                <Icon className='size-3.5' />
              </button>
            ))}
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label='Đóng xem trước'
            className='flex size-8 cursor-pointer items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white'
          >
            <X className='size-4' />
          </button>
        </div>
      </header>

      <div className='flex-1 overflow-auto p-8'>
        <div
          className='@container mx-auto flex flex-col gap-3 transition-[max-width] duration-200'
          style={{ maxWidth: DEVICE_WIDTH[device] }}
        >
          {visible.length === 0 && (
            <div className='rounded-lg border border-white/10 bg-white/5 p-12 text-center text-sm text-white/60'>
              Chưa có block nào hiển thị.
            </div>
          )}
          {visible.map(block => {
            const langContent =
              lang === 'vi' ? block.contentVi : block.contentEn;
            const content =
              readVariant(langContent, device) ?? langContent.desktop;
            const styles = readVariant(block.elementStyles, device);
            const background = readVariant(block.background, device);
            const order = readVariant(block.elementOrder, device);
            return (
              <InViewBlock
                key={block.id}
                className='overflow-hidden rounded-md bg-white shadow-2xl ring-1 ring-black/10'
              >
                <RenderBlock
                  block={block}
                  content={content}
                  styles={styles}
                  background={background}
                  order={order}
                />
              </InViewBlock>
            );
          })}
        </div>
      </div>
    </div>
  );
}
