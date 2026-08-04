'use client';

/**
 * Admin "Duplicate landing page" — compose create + copy page canvas.
 * BE không có POST /pages/:id/clone. Bản copy luôn draft, cùng workspace.
 */

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import { resolveTemplateFromVersionId } from '@/services/rexer/resolveTemplateFromVersion';
import type { CreatePageRequest, Page } from '@/services/rexer/types';

export interface DuplicateLandingDialogProps {
  open: boolean;
  source: Page | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (created: Page) => void;
}

/** Slug: lowercase kebab, starts with letter, 2–80 chars. */
const SLUG_RE = /^[a-z][a-z0-9-]{1,79}$/;

function rxMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.code || err.message || 'API_ERROR';
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function defaultCopyName(name: string): string {
  const base = name.trim() || 'Landing';
  return `${base} (copy)`.slice(0, 255);
}

/** Short suffix so workspace slug stays unique across repeated duplicates. */
function uniqueSlugSuffix(): string {
  return Math.random().toString(36).slice(2, 6);
}

function defaultCopySlug(
  name: string,
  sourceSlug: string | undefined,
  suffix: string
): string {
  const base =
    (sourceSlug?.trim() ? slugify(sourceSlug) : '') ||
    slugify(name) ||
    'landing';
  const withCopy = base.endsWith('-copy') ? base : `${base}-copy`;
  return `${withCopy}-${suffix}`.slice(0, 80);
}

function looksLikeCanvas(
  value: Record<string, unknown> | undefined
): value is Record<string, unknown> {
  if (!value) return false;
  return (
    Array.isArray(value.blocks) ||
    Array.isArray(value.pages) ||
    typeof value.schema_version === 'string'
  );
}

async function resolveSourceCanvas(page: Page): Promise<{
  canvas_blueprint?: Record<string, unknown>;
  config_json: Record<string, unknown>;
}> {
  try {
    const revs = await rexerApi.pages.revisions(page.id, { limit: 1 });
    const latest = (revs.items ?? [])[0];
    if (latest) {
      const fromBlueprint = latest.canvas_blueprint;
      const fromConfig = looksLikeCanvas(latest.config_json)
        ? latest.config_json
        : undefined;
      return {
        canvas_blueprint: fromBlueprint ?? fromConfig,
        config_json: latest.config_json ?? {},
      };
    }
  } catch {
    /* fall through */
  }

  if (page.slug) {
    try {
      const pub = await rexerApi.publicPages.get(page.slug);
      if (pub.canvas_blueprint) {
        return {
          canvas_blueprint: pub.canvas_blueprint as Record<string, unknown>,
          config_json: {},
        };
      }
    } catch {
      /* unpublished / private */
    }
  }

  return { config_json: {} };
}

export function DuplicateLandingDialog({
  open,
  source,
  onOpenChange,
  onSuccess,
}: DuplicateLandingDialogProps) {
  const router = useRouter();
  const [name, setName] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const slugSuffixRef = React.useRef(uniqueSlugSuffix());

  React.useEffect(() => {
    if (!open || !source) return;
    const nextName = defaultCopyName(source.name);
    slugSuffixRef.current = uniqueSlugSuffix();
    setName(nextName);
    setSlug(defaultCopySlug(nextName, source.slug, slugSuffixRef.current));
    setSlugTouched(false);
  }, [open, source]);

  const handleNameChange = (v: string) => {
    setName(v);
    if (slugTouched) return;
    setSlug(defaultCopySlug(v, source?.slug, slugSuffixRef.current));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!source || submitting) return;

    const nameT = name.trim();
    const slugT = slug.trim().toLowerCase();
    if (!nameT) {
      toast.error('Tên landing không được rỗng');
      return;
    }
    if (slugT && !SLUG_RE.test(slugT)) {
      toast.error('Slug: lowercase, bắt đầu bằng chữ, 2–80 ký tự (a-z 0-9 -)');
      return;
    }

    setSubmitting(true);
    try {
      const full = await rexerApi.pages.get(source.id);
      const isExternal = !!full.external_url;

      let body: CreatePageRequest;

      if (isExternal) {
        body = {
          type: full.type || 'landing',
          name: nameT,
          external_url: full.external_url!,
          ...(slugT ? { slug: slugT } : {}),
          ...(full.description ? { description: full.description } : {}),
          ...(full.type_metadata ? { type_metadata: full.type_metadata } : {}),
        };
      } else {
        if (!full.template_version_id) {
          throw new Error(
            'Page không có template_version_id — không nhân bản được canvas'
          );
        }
        const tpl = await resolveTemplateFromVersionId(
          full.template_version_id
        );
        body = {
          type: full.type || 'landing',
          name: nameT,
          template_id: tpl.id,
          template_version_id: full.template_version_id,
          ...(slugT ? { slug: slugT } : {}),
          ...(full.description ? { description: full.description } : {}),
          ...(full.type_metadata ? { type_metadata: full.type_metadata } : {}),
        };
      }

      const created = await rexerApi.pages.create(full.workspace_id, body);

      if (!isExternal) {
        const { canvas_blueprint, config_json } =
          await resolveSourceCanvas(full);
        if (canvas_blueprint) {
          // Create seeds revision 1 from template — must optimistic-lock
          // against that HEAD, not 0 (ERR_PAGE_REVISION_CONFLICT).
          const createdRevs = await rexerApi.pages.revisions(created.id, {
            limit: 1,
          });
          const createdHead = (createdRevs.items ?? [])[0];
          await rexerApi.pages.saveConfig(created.id, {
            config_json,
            canvas_blueprint,
            base_revision_no: createdHead?.revision_no ?? 1,
          });
        }
      }

      if (full.thumbnail_asset_id) {
        try {
          await rexerApi.pages.setThumbnail(
            created.id,
            full.thumbnail_asset_id
          );
        } catch {
          /* thumbnail optional — không chặn duplicate */
        }
      }

      toast.success(`Đã nhân bản thành "${created.name}"`);
      onOpenChange(false);
      onSuccess?.(created);

      if (!isExternal) {
        router.push(`/admin/landing-pages/${created.slug || created.id}`);
      }
    } catch (err) {
      const code = err instanceof RxApiError ? err.code : '';
      if (code === 'ERR_PAGE_DUPLICATE_SLUG') {
        toast.error('Slug đã tồn tại trong workspace — đổi slug rồi thử lại');
      } else {
        toast.error(`Nhân bản thất bại: ${rxMessage(err)}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Nhân bản landing</DialogTitle>
          <DialogDescription>
            Tạo bản copy dạng draft trong cùng workspace từ “
            {source?.name ?? 'landing'}”. Slug phải duy nhất nếu nhập.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='dup-lp-name'>
              Tên landing <span className='text-rose-600'>*</span>
            </Label>
            <Input
              id='dup-lp-name'
              autoFocus
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder='Campaign Hero (copy)'
              maxLength={255}
              disabled={submitting}
              required
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='dup-lp-slug'>Slug</Label>
            <Input
              id='dup-lp-slug'
              value={slug}
              onChange={e => {
                setSlugTouched(true);
                setSlug(e.target.value.toLowerCase());
              }}
              placeholder='campaign-hero-copy'
              maxLength={80}
              className='font-mono'
              disabled={submitting}
            />
            <p className='text-muted-foreground text-2xs'>
              URL công khai sau publish: /p/{slug || '…'}. Để trống nếu muốn BE
              tự sinh.
            </p>
          </div>
        </form>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Huỷ
          </Button>
          <Button
            type='button'
            onClick={() => handleSubmit()}
            disabled={submitting || !name.trim()}
          >
            {submitting && <Loader2 className='mr-1 size-3.5 animate-spin' />}
            Nhân bản
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
