'use client';

import * as React from 'react';

import { Button } from '@/components/atoms/button';
import { Chip } from '@/components/atoms/chip';
import { ColorSwatch } from '@/components/atoms/color-swatch';
import { cn } from '@/lib/cn';

export interface ProductSpec {
  name: string;
  price: string;
  imageSrc?: string;
  imageBg?: string;
  colors?: { hex: string; label?: string }[];
  sizes?: string[];
  sku?: string;
  date?: string;
}

export interface ProductCardProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'onClick'>, ProductSpec {
  /** Render Edit + Share floating buttons (default: true) */
  showActions?: boolean;
  editLabel?: React.ReactNode;
  shareLabel?: React.ReactNode;
  /** URLs for the action buttons — when omitted, buttons render as non-interactive */
  editHref?: string;
  shareHref?: string;
  /** i18n overrides for field labels */
  labels?: {
    productName?: string;
    price?: string;
    color?: string;
    size?: string;
    sku?: string;
    date?: string;
  };
}

const DEFAULT_LABELS = {
  productName: 'Product Name',
  price: 'Price',
  color: 'Color',
  size: 'Size',
  sku: 'SKU',
  date: 'Date',
};

/**
 * Horizontal product card — image pane on the left (with floating Edit/Share
 * buttons) and a labelled info pane on the right. Matches the Home Product
 * column and the Product list layout in the Figma source.
 */
function ProductCard({
  name,
  price,
  imageSrc,
  imageBg,
  colors = [],
  sizes = [],
  sku,
  date,
  showActions = true,
  editLabel = 'Edit',
  shareLabel = 'Share',
  editHref,
  shareHref,
  labels,
  className,
  ...props
}: ProductCardProps) {
  const L = { ...DEFAULT_LABELS, ...labels };
  return (
    <article
      className={cn(
        'border-border bg-background flex overflow-hidden rounded-xl border',
        className
      )}
      {...props}
    >
      {/* Image pane with floating action buttons */}
      <div
        className='relative flex aspect-square w-2/5 shrink-0 items-center justify-center bg-neutral-100'
        style={imageBg ? { background: imageBg } : undefined}
      >
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt={name}
            className='size-full object-cover'
            draggable={false}
          />
        ) : (
          <span className='text-lg font-semibold text-neutral-400'>{name}</span>
        )}
        {showActions && (
          <div className='absolute bottom-3 left-3 flex items-center gap-2'>
            {editHref ? (
              <Button
                asChild
                variant='outline'
                size='sm'
                className='h-8 px-4 text-xs'
              >
                <a href={editHref}>{editLabel}</a>
              </Button>
            ) : (
              <Button variant='outline' size='sm' className='h-8 px-4 text-xs'>
                {editLabel}
              </Button>
            )}
            {shareHref ? (
              <Button
                asChild
                variant='primary'
                size='sm'
                className='h-8 px-4 text-xs'
              >
                <a href={shareHref}>{shareLabel}</a>
              </Button>
            ) : (
              <Button variant='primary' size='sm' className='h-8 px-4 text-xs'>
                {shareLabel}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Info pane */}
      <div className='flex min-w-0 flex-1 flex-col gap-3 p-4 text-sm'>
        <InfoRow label={L.productName}>
          <p className='text-foreground line-clamp-2 text-base font-semibold tracking-[-0.02em]'>
            {name}
          </p>
        </InfoRow>
        <InfoRow label={L.price}>
          <p className='text-foreground text-xl font-semibold tracking-[-0.02em]'>
            {price}
          </p>
        </InfoRow>
        {colors.length > 0 && (
          <InfoRow label={L.color}>
            <div className='flex flex-wrap gap-1.5'>
              {colors.map((c, i) => (
                <ColorSwatch
                  key={`${c.hex}-${i}`}
                  color={c.hex}
                  label={c.label}
                  size={18}
                  asSpan
                />
              ))}
            </div>
          </InfoRow>
        )}
        {sizes.length > 0 && (
          <InfoRow label={L.size}>
            <div className='flex flex-wrap gap-1.5'>
              {sizes.map(s => (
                <Chip key={s} size='sm'>
                  {s}
                </Chip>
              ))}
            </div>
          </InfoRow>
        )}
        {sku && (
          <InfoRow label={L.sku}>
            <p className='text-foreground'>{sku}</p>
          </InfoRow>
        )}
        {date && (
          <InfoRow label={L.date}>
            <p className='text-foreground'>{date}</p>
          </InfoRow>
        )}
      </div>
    </article>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className='flex flex-col gap-1'>
      <span className='text-content-muted text-xs font-semibold tracking-[-0.02em]'>
        {label}
      </span>
      {children}
    </div>
  );
}

export { ProductCard };
