'use client';

import * as React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { z } from 'zod';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/atoms/form';
import { Input } from '@/components/atoms/input';
import { Spinner } from '@/components/atoms/spinner';
import { Textarea } from '@/components/atoms/textarea';
import type { AITemplateField } from '@/services/rexer/types';

export type DynamicFormValues = Record<string, unknown>;

interface Props {
  fields: AITemplateField[];
  defaultValues?: DynamicFormValues;
  onSubmit: (values: DynamicFormValues) => Promise<void> | void;
  onCancel?: () => void;
  submitting?: boolean;
}

/**
 * Build a zod schema at runtime from the template Input Schema (spec §5.2).
 * - `is_required: true` → field is required; otherwise optional.
 * - `data_type: number` → coerce to number.
 * - `data_type: select` → restrict to `options[].value`.
 * - All other types are loose strings — AI handles richer formatting.
 */
function buildZodSchema(fields: AITemplateField[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const f of fields) {
    let s: z.ZodTypeAny;
    switch (f.data_type) {
      case 'number': {
        const base = z.coerce.number();
        s = f.is_required ? base : base.optional();
        break;
      }
      case 'select': {
        // BE Q13: options is a flat string[].
        const values = f.options ?? [];
        if (values.length === 0) {
          s = f.is_required ? z.string().min(1) : z.string().optional();
        } else {
          const base = z.enum(values as [string, ...string[]]);
          // Allow empty string when optional so the default-blank <option>
          // doesn't trigger enum validation.
          s = f.is_required ? base : z.union([z.literal(''), base]).optional();
        }
        break;
      }
      case 'image': {
        // Phase 1: treat image as media_id string. ImagePicker integration in Phase 2.
        s = f.is_required ? z.string().min(1) : z.string().optional();
        break;
      }
      case 'text':
      case 'textarea':
      default: {
        s = f.is_required
          ? z.string().trim().min(1)
          : z.string().trim().optional();
      }
    }
    shape[f.field_key] = s;
  }
  return z.object(shape);
}

function FieldBadges({ field }: { field: AITemplateField }) {
  const t = useTranslations('ai_templates.input_form');
  return (
    <div className='flex flex-wrap gap-1'>
      {field.is_required ? (
        <Badge variant='destructive' className='text-[10px]'>
          {t('required_badge')}
        </Badge>
      ) : field.ai_can_infer ? (
        <Badge variant='secondary' className='text-[10px]'>
          {t('ai_infer_badge')}
        </Badge>
      ) : (
        <Badge variant='outline' className='text-[10px]'>
          {t('locked_badge')}
        </Badge>
      )}
    </div>
  );
}

/**
 * Core component: renders a form derived from `AITemplateField[]`.
 * Used by AIInputFormDialog (Phase 1) and the Review page's "Edit inputs"
 * re-entry (Phase 2).
 */
export function DynamicSchemaForm({
  fields,
  defaultValues,
  onSubmit,
  onCancel,
  submitting,
}: Props) {
  const t = useTranslations('ai_templates.input_form');

  const schema = React.useMemo(() => buildZodSchema(fields), [fields]);

  const initial = React.useMemo<DynamicFormValues>(() => {
    const init: DynamicFormValues = {};
    for (const f of fields) {
      init[f.field_key] = defaultValues?.[f.field_key] ?? '';
    }
    return init;
  }, [fields, defaultValues]);

  const form = useForm<DynamicFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial,
    mode: 'onSubmit',
  });

  const handle: SubmitHandler<DynamicFormValues> = async values => {
    // Strip empty optionals so BE can distinguish "not provided" vs "blank".
    const cleaned: DynamicFormValues = {};
    for (const f of fields) {
      const v = values[f.field_key];
      if (v === '' || v === undefined || v === null) {
        if (f.is_required) cleaned[f.field_key] = v;
        // skip empty optional
      } else {
        cleaned[f.field_key] = v;
      }
    }
    await onSubmit(cleaned);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handle)}
        className='flex flex-col gap-4'
      >
        <div className='flex flex-col gap-5'>
          {fields.map(f => (
            <FormField
              key={f.field_key}
              control={form.control}
              name={f.field_key}
              render={({ field }) => (
                <FormItem>
                  <div className='flex items-center justify-between gap-2'>
                    <FormLabel>{f.label}</FormLabel>
                    <FieldBadges field={f} />
                  </div>
                  <FormControl>{renderControl(f, field)}</FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <div className='flex items-center justify-end gap-2 pt-2'>
          {onCancel ? (
            <Button
              type='button'
              variant='outline'
              onClick={onCancel}
              disabled={submitting}
            >
              {t('cancel')}
            </Button>
          ) : null}
          <Button type='submit' variant='primary' disabled={submitting}>
            {submitting ? (
              <span className='flex items-center gap-2'>
                <Spinner size={14} />
                {t('submitting')}
              </span>
            ) : (
              t('submit')
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function renderControl(f: AITemplateField, field: any): React.ReactElement {
  switch (f.data_type) {
    case 'textarea':
      return <Textarea {...field} placeholder={f.placeholder} />;
    case 'number':
      return (
        <Input
          {...field}
          type='number'
          placeholder={f.placeholder}
          inputMode='numeric'
        />
      );
    case 'select':
      return (
        <select
          {...field}
          className='border-input bg-background placeholder:text-muted-foreground h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs'
        >
          <option value=''>{f.placeholder ?? ''}</option>
          {(f.options ?? []).map(opt => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    case 'image':
      // Phase 1 placeholder — Phase 2 swaps to MediaPicker.
      return <Input {...field} placeholder={f.placeholder ?? 'media_id'} />;
    case 'text':
    default:
      return <Input {...field} placeholder={f.placeholder} />;
  }
}
