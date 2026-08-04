'use client';

/**
 * Admin "Duplicate template" — compose create + copy canvas blueprint.
 * BE không có POST /templates/:id/clone; FE nhân bản shell + draft/version.
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
import type {
  CreateTemplateRequest,
  Template,
  TemplateVersion,
} from '@/services/rexer/types';

export interface DuplicateTemplateDialogProps {
  open: boolean;
  source: Template | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (created: Template) => void;
}

// snake-kebab code: lowercase, starts with letter, 2-100 chars.
const CODE_RE = /^[a-z][a-z0-9_-]{1,99}$/;

const PREVIEW_MODES = new Set<CreateTemplateRequest['preview_mode']>([
  'static',
  'rendered',
  'live_stub',
]);

const PAGE_TYPES = new Set<
  NonNullable<CreateTemplateRequest['target_page_type']>
>(['landing', 'ad', 'curate', 'email']);

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
    .slice(0, 100);
}

function defaultCopyName(name: string): string {
  const base = name.trim() || 'Template';
  return `${base} (copy)`.slice(0, 255);
}

function defaultCopyCode(name: string, sourceCode?: string): string {
  const fromName = slugify(name);
  if (fromName) return fromName.slice(0, 100);
  const fromSource = sourceCode?.trim()
    ? `${slugify(sourceCode)}-copy`
    : 'template-copy';
  return fromSource.slice(0, 100);
}

async function resolveSourceVersion(
  templateId: string,
  currentVersionId?: string
): Promise<TemplateVersion | null> {
  try {
    const versList = await rexerApi.templates.versions(templateId);
    const head = (versList.items ?? []).reduce<TemplateVersion | null>(
      (max, v) =>
        !max || (v.version_no ?? 0) > (max.version_no ?? 0) ? v : max,
      null
    );
    if (head) {
      // List items may omit canvas_blueprint — fetch full version when needed.
      if (head.canvas_blueprint) return head;
      return rexerApi.templates.version(templateId, head.id);
    }
  } catch {
    /* fall through */
  }
  if (!currentVersionId) return null;
  try {
    return await rexerApi.templates.version(templateId, currentVersionId);
  } catch {
    return null;
  }
}

export function DuplicateTemplateDialog({
  open,
  source,
  onOpenChange,
  onSuccess,
}: DuplicateTemplateDialogProps) {
  const router = useRouter();
  const [name, setName] = React.useState('');
  const [code, setCode] = React.useState('');
  const [codeTouched, setCodeTouched] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open || !source) return;
    const nextName = defaultCopyName(source.name);
    setName(nextName);
    setCode(defaultCopyCode(nextName, source.code));
    setCodeTouched(false);
  }, [open, source]);

  const handleNameChange = (v: string) => {
    setName(v);
    if (codeTouched) return;
    setCode(defaultCopyCode(v, source?.code));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!source || submitting) return;

    const nameT = name.trim();
    const codeT = code.trim().toLowerCase();
    if (!nameT) {
      toast.error('Tên template không được rỗng');
      return;
    }
    if (!codeT) {
      toast.error('Code không được rỗng');
      return;
    }
    if (!CODE_RE.test(codeT)) {
      toast.error(
        'Code: lowercase, bắt đầu bằng chữ, 2-100 ký tự (a-z 0-9 - _)'
      );
      return;
    }

    setSubmitting(true);
    try {
      const tplRes = await rexerApi.templates.get(source.id);
      const full = tplRes.template;
      const sourceVersion = await resolveSourceVersion(
        full.id,
        full.current_version_id
      );

      const blueprint =
        full.draft_canvas_blueprint ??
        sourceVersion?.canvas_blueprint ??
        undefined;

      const previewMode = PREVIEW_MODES.has(
        full.preview_mode as CreateTemplateRequest['preview_mode']
      )
        ? (full.preview_mode as CreateTemplateRequest['preview_mode'])
        : 'rendered';

      const pageType = PAGE_TYPES.has(
        full.target_page_type as NonNullable<
          CreateTemplateRequest['target_page_type']
        >
      )
        ? (full.target_page_type as NonNullable<
            CreateTemplateRequest['target_page_type']
          >)
        : undefined;

      const body: CreateTemplateRequest = {
        code: codeT,
        name: nameT,
        preview_mode: previewMode,
        status: 'draft',
        ...(full.description ? { description: full.description } : {}),
        ...(full.category ? { category: full.category } : {}),
        ...(full.tags?.length ? { tags: full.tags } : {}),
        ...(full.thumbnail_url ? { thumbnail_url: full.thumbnail_url } : {}),
        ...(pageType ? { target_page_type: pageType } : {}),
      };

      const created = await rexerApi.templates.create(body);

      if (blueprint) {
        await rexerApi.templates.patchDraftBlueprint(created.id, blueprint);
      }

      await rexerApi.templates.createVersion(created.id, {
        version: '1.0.0',
        schema_version: sourceVersion?.schema_version ?? '1',
        field_schema_json: sourceVersion?.field_schema_json ?? {},
        default_config_json: sourceVersion?.default_config_json ?? {},
        ...(blueprint ? { canvas_blueprint: blueprint } : {}),
        ...(sourceVersion?.renderer_key
          ? { renderer_key: sourceVersion.renderer_key }
          : {}),
        ...(sourceVersion?.preview_descriptor_json
          ? {
              preview_descriptor_json: sourceVersion.preview_descriptor_json,
            }
          : {}),
        ...(full.thumbnail_url ? { thumbnail_url: full.thumbnail_url } : {}),
        change_note: `Duplicated from ${full.code || full.id}`,
      });

      toast.success(`Đã nhân bản thành "${created.name}"`);
      onOpenChange(false);
      onSuccess?.(created);
      router.push(`/admin/templates/${created.id}/edit`);
    } catch (err) {
      toast.error(`Nhân bản thất bại: ${rxMessage(err)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Nhân bản template</DialogTitle>
          <DialogDescription>
            Tạo bản copy dạng draft, giữ canvas và metadata từ “
            {source?.name ?? 'template'}”. Code phải duy nhất.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='dup-tpl-name'>
              Tên template <span className='text-rose-600'>*</span>
            </Label>
            <Input
              id='dup-tpl-name'
              autoFocus
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder='Landing Hero v2 (copy)'
              maxLength={255}
              disabled={submitting}
              required
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='dup-tpl-code'>
              Code <span className='text-rose-600'>*</span>
            </Label>
            <Input
              id='dup-tpl-code'
              value={code}
              onChange={e => {
                setCodeTouched(true);
                setCode(e.target.value.toLowerCase());
              }}
              placeholder='landing-hero-v2-copy'
              maxLength={100}
              className='font-mono'
              disabled={submitting}
              required
            />
            <p className='text-muted-foreground text-2xs'>
              Auto-sinh từ nguồn + “-copy”. Slug duy nhất, không đổi được sau
              khi tạo.
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
            disabled={submitting || !name.trim() || !code.trim()}
          >
            {submitting && <Loader2 className='mr-1 size-3.5 animate-spin' />}
            Nhân bản
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
