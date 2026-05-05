import * as React from 'react';

import { cn } from '@/lib/cn';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const sizeMap: Record<AvatarSize, string> = {
  xs: 'size-5 text-[10px]',
  sm: 'size-6 text-xs',
  md: 'size-8 text-sm',
  lg: 'size-10 text-base',
  xl: 'size-12 text-lg',
};

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string | null;
  alt?: string;
  /** fallback initials when src missing / errors */
  name?: string;
  size?: AvatarSize;
  /** green success dot bottom-right */
  withStatusDot?: boolean;
}

function initials(name?: string) {
  if (!name) return '';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  (
    { className, src, alt, name, size = 'md', withStatusDot = false, ...props },
    ref
  ) => {
    const [failed, setFailed] = React.useState(false);
    const showImg = src && !failed;
    return (
      <span
        ref={ref}
        className={cn(
          'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-200 font-semibold text-neutral-700',
          sizeMap[size],
          className
        )}
        {...props}
      >
        {showImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt ?? name ?? 'avatar'}
            onError={() => setFailed(true)}
            className='size-full object-cover'
          />
        ) : (
          <span>{initials(name)}</span>
        )}
        {withStatusDot && (
          <span className='bg-success ring-background absolute right-0 bottom-0 size-2 rounded-full ring-2' />
        )}
      </span>
    );
  }
);
Avatar.displayName = 'Avatar';

export interface AvatarStackProps extends React.HTMLAttributes<HTMLDivElement> {
  avatars: Pick<AvatarProps, 'src' | 'name' | 'alt'>[];
  max?: number;
  size?: AvatarSize;
}

function AvatarStack({
  avatars,
  max = 4,
  size = 'sm',
  className,
  ...props
}: AvatarStackProps) {
  const shown = avatars.slice(0, max);
  const remaining = Math.max(avatars.length - shown.length, 0);
  return (
    <div className={cn('flex items-center -space-x-2', className)} {...props}>
      {shown.map((a, i) => (
        <Avatar
          key={`${a.name ?? i}-${i}`}
          {...a}
          size={size}
          className='ring-background ring-2'
        />
      ))}
      {remaining > 0 && (
        <span
          className={cn(
            'text-neutral-0 ring-background inline-flex items-center justify-center rounded-full bg-neutral-900 font-semibold ring-2',
            sizeMap[size]
          )}
        >
          {remaining}
        </span>
      )}
    </div>
  );
}

export { Avatar, AvatarStack };
