'use client';

import * as React from 'react';
import { Image as ImageIcon, RefreshCcw, Sparkles, User } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Textarea } from '@/components/atoms/textarea';
import type {
  AIBlockRole,
  AIBlockSource,
  AIGeneratedBlock,
} from '@/services/rexer/types';

interface Props {
  block: AIGeneratedBlock;
  onContentChange: (content: Record<string, unknown>) => void;
  onRegenerate: () => void;
  onPickImage?: () => void;
}

const SOURCE_TO_BADGE: Record<
  AIBlockSource,
  {
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
    key: string;
    icon: React.ReactNode;
  }
> = {
  ai: {
    variant: 'default',
    key: 'ai_badge',
    icon: <Sparkles className='size-3' />,
  },
  stub: {
    variant: 'secondary',
    key: 'stub_badge',
    icon: <Sparkles className='size-3' />,
  },
  kept: {
    variant: 'outline',
    key: 'kept_badge',
    icon: <User className='size-3' />,
  },
  skipped: {
    variant: 'outline',
    key: 'skipped_badge',
    icon: <RefreshCcw className='size-3' />,
  },
};

export function BlockReviewCard({
  block,
  onContentChange,
  onRegenerate,
  onPickImage,
}: Props) {
  const tReview = useTranslations('ai_templates.review');
  const tRoles = useTranslations('ai_templates.block_roles');
  const badge = SOURCE_TO_BADGE[block.source] ?? SOURCE_TO_BADGE.ai;

  const isImageRole = block.role === 'image';

  return (
    <article className='border-border bg-background flex flex-col gap-3 rounded-xl border p-4'>
      <header className='flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <span className='text-muted-foreground text-xs font-medium'>
            #{block.position}
          </span>
          <h3 className='text-foreground text-sm font-semibold'>
            {tRoles(block.role)}
          </h3>
          <Badge variant={badge.variant} className='text-3xs gap-1'>
            {badge.icon}
            {tReview(badge.key)}
          </Badge>
        </div>
        <div className='flex items-center gap-1'>
          {isImageRole && onPickImage ? (
            <Button
              variant='outline'
              size='sm'
              onClick={onPickImage}
              className='gap-1'
            >
              <ImageIcon className='size-3.5' />
              {tReview('pick_image')}
            </Button>
          ) : null}
          <Button
            variant='outline'
            size='sm'
            onClick={onRegenerate}
            className='gap-1'
          >
            <RefreshCcw className='size-3.5' />
            {tReview('regenerate')}
          </Button>
        </div>
      </header>
      {block.skipped || block.content === null ? (
        <p className='text-muted-foreground bg-muted/40 rounded-md p-3 text-xs'>
          Block bị bỏ qua (locked-optional field thiếu).
        </p>
      ) : (
        <BlockContentEditor
          role={block.role}
          content={block.content}
          onChange={onContentChange}
        />
      )}
    </article>
  );
}

interface ContentProps {
  role: AIBlockRole;
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

function BlockContentEditor({ role, content, onChange }: ContentProps) {
  // Helper to patch one key.
  const patch = (key: string, value: unknown) =>
    onChange({ ...content, [key]: value });

  switch (role) {
    case 'hero':
      // BE Q6 example uses title/body/alt/caption keys.
      return (
        <div className='flex flex-col gap-2'>
          <Input
            value={asString(content.title)}
            onChange={e => patch('title', e.target.value)}
            placeholder='Title'
          />
          <Textarea
            value={asString(content.body)}
            onChange={e => patch('body', e.target.value)}
            placeholder='Body'
          />
        </div>
      );
    case 'tagline':
      return (
        <Input
          value={asString(content.text)}
          onChange={e => patch('text', e.target.value)}
          placeholder='Tagline'
        />
      );
    case 'pain':
    case 'solution':
      return (
        <Textarea
          value={asString(content.text)}
          onChange={e => patch('text', e.target.value)}
          placeholder='Nội dung'
        />
      );
    case 'feature':
      return (
        <Textarea
          value={
            Array.isArray(content.items)
              ? (content.items as unknown[])
                  .map(v => String(v ?? ''))
                  .join('\n')
              : asString(content.text)
          }
          onChange={e =>
            patch(
              'items',
              e.target.value
                .split('\n')
                .map(s => s.trim())
                .filter(Boolean)
            )
          }
          placeholder='Mỗi tính năng 1 dòng'
        />
      );
    case 'image':
      return (
        <ImageBlockPreview
          mediaUrl={asString(content.url) || asString(content.thumbnail_url)}
          alt={asString(content.alt)}
        />
      );
    case 'testimonial':
      return (
        <div className='flex flex-col gap-2'>
          <Textarea
            value={asString(content.quote)}
            onChange={e => patch('quote', e.target.value)}
            placeholder='Lời chứng thực'
          />
          <Input
            value={asString(content.author)}
            onChange={e => patch('author', e.target.value)}
            placeholder='Tác giả'
          />
        </div>
      );
    case 'price':
      return (
        <Input
          value={asString(content.text)}
          onChange={e => patch('text', e.target.value)}
          placeholder='Giá'
        />
      );
    case 'cta':
      return (
        <div className='flex flex-col gap-2'>
          <Input
            value={asString(content.label)}
            onChange={e => patch('label', e.target.value)}
            placeholder='Nút CTA'
          />
          <Input
            value={asString(content.description)}
            onChange={e => patch('description', e.target.value)}
            placeholder='Mô tả thêm'
          />
        </div>
      );
    case 'faq':
      return <FAQEditor content={content} onChange={onChange} />;
    default:
      return (
        <pre className='bg-muted text-muted-foreground rounded-md p-2 text-xs'>
          {JSON.stringify(content, null, 2)}
        </pre>
      );
  }
}

function ImageBlockPreview({
  mediaUrl,
  alt,
}: {
  mediaUrl: string;
  alt: string;
}) {
  if (!mediaUrl) {
    return (
      <div className='bg-muted text-muted-foreground flex aspect-video items-center justify-center rounded-md text-xs'>
        Chưa chọn ảnh
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={mediaUrl}
      alt={alt || ''}
      className='aspect-video w-full rounded-md object-cover'
    />
  );
}

interface FAQItem {
  q: string;
  a: string;
}
function FAQEditor({
  content,
  onChange,
}: {
  content: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  const items: FAQItem[] = Array.isArray(content.items)
    ? (content.items as unknown[]).map(v => {
        const o = (v ?? {}) as Record<string, unknown>;
        return { q: asString(o.q), a: asString(o.a) };
      })
    : [];

  const update = (i: number, patch: Partial<FAQItem>) => {
    const next = items.map((it, idx) => (idx === i ? { ...it, ...patch } : it));
    onChange({ ...content, items: next });
  };

  return (
    <div className='flex flex-col gap-3'>
      {items.map((it, i) => (
        <div key={i} className='flex flex-col gap-1'>
          <Input
            value={it.q}
            onChange={e => update(i, { q: e.target.value })}
            placeholder='Câu hỏi'
          />
          <Textarea
            value={it.a}
            onChange={e => update(i, { a: e.target.value })}
            placeholder='Câu trả lời'
          />
        </div>
      ))}
    </div>
  );
}

function asString(v: unknown): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  return '';
}
