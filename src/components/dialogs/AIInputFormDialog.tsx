'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Spinner } from '@/components/atoms/spinner';
import {
  DynamicSchemaForm,
  type DynamicFormValues,
} from '@/components/modules/CanvasTemplate/ai/DynamicSchemaForm';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import { parseAITemplateError } from '@/components/modules/CanvasTemplate/ai/errors';
import type { AITemplate } from '@/services/rexer/types';

interface Props {
  /** Template id to fetch detail for. Dialog is closed when null. */
  templateId: string | null;
  onClose: () => void;
}

/**
 * Dialog shown after the user picks an AI-enabled template. Renders a form
 * derived from `template.fields`, submits to `/generate`, then routes to the
 * Phase 2 Review page with the resulting session_id.
 */
export function AIInputFormDialog({ templateId, onClose }: Props) {
  const router = useRouter();
  const t = useTranslations('ai_templates.input_form');
  const tErr = useTranslations('ai_templates.errors');

  const [template, setTemplate] = React.useState<AITemplate | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // Reset when templateId changes / dialog reopens.
  React.useEffect(() => {
    if (!templateId) {
      setTemplate(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    rexerApi.aiTemplates
      .get(templateId)
      .then(tpl => {
        if (!cancelled) setTemplate(tpl);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        toast.error(rxErrorMessage(err, tErr));
        onClose();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [templateId, onClose, tErr]);

  const handleSubmit = async (values: DynamicFormValues) => {
    if (!template) return;
    setSubmitting(true);
    try {
      const result = await rexerApi.aiTemplates.generate(template.id, {
        user_input: coerceUserInput(values),
        lang: 'vi',
      });
      // Cache the full generate response so the Review page can render
      // immediately without a round-trip to /sessions/{id}. The session API
      // is still the source of truth for version history.
      try {
        sessionStorage.setItem(
          `aitpl:gen:${result.session_id}`,
          JSON.stringify({
            template_id: template.id,
            user_input: values,
            result,
          })
        );
      } catch {
        // Storage quota / private mode — fall back to session fetch.
      }
      router.push(
        `/ai-templates/${template.id}/review?session=${result.session_id}`
      );
      onClose();
    } catch (err: unknown) {
      const parsed = parseAITemplateError(err);
      // BE Q2 forward-compat: surface missing_fields[] when present.
      if (
        'missing_fields' in parsed &&
        parsed.missing_fields &&
        parsed.missing_fields.length > 0
      ) {
        const labels = parsed.missing_fields.map(
          (key: string) =>
            template?.fields?.find(f => f.field_key === key)?.label ?? key
        );
        toast.error(`${tErr('missing_required')}: ${labels.join(', ')}`);
      } else {
        toast.error(rxErrorMessage(err, tErr));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const open = templateId !== null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className='max-h-[85vh] overflow-y-auto sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className='flex items-center justify-center py-10'>
            <Spinner />
          </div>
        ) : template ? (
          <DynamicSchemaForm
            fields={template.fields ?? []}
            onSubmit={handleSubmit}
            onCancel={onClose}
            submitting={submitting}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

/**
 * BE Q11: `user_input` values must be `string | number | boolean`.
 * RHF stores everything as `unknown` since the form is dynamic, so we
 * coerce here. Booleans aren't produced by current fields (text/number/
 * textarea/select/image) but we keep the type permissive.
 */
function coerceUserInput(
  values: DynamicFormValues
): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(values)) {
    if (v === undefined || v === null) continue;
    if (
      typeof v === 'string' ||
      typeof v === 'number' ||
      typeof v === 'boolean'
    ) {
      out[k] = v;
    } else {
      out[k] = String(v);
    }
  }
  return out;
}

function rxErrorMessage(err: unknown, tErr: (key: string) => string): string {
  if (err instanceof RxApiError) {
    switch (err.code) {
      case 'ERR_AI_TEMPLATE_MISSING_REQUIRED':
        return tErr('missing_required');
      case 'ERR_AI_TEMPLATE_REGEN_LIMIT':
        return tErr('regen_limit');
      case 'ERR_AI_TEMPLATE_INACTIVE':
        return tErr('template_inactive');
      case 'ERR_AI_TEMPLATE_INVALID':
      case 'ERR_AI_TEMPLATE_NOT_FOUND':
      case 'ERR_AI_TEMPLATE_SESSION_NOT_FOUND':
      case 'ERR_LLM_TIMEOUT':
      case 'ERR_AI_PROVIDER_FAILURE':
        return err.message || tErr('generic');
      default:
        return err.message || tErr('generic');
    }
  }
  if (err instanceof Error) return err.message;
  return tErr('generic');
}
