'use client';

import * as React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { BlockReviewCard } from '@/components/modules/CanvasTemplate/ai/BlockReviewCard';
import { DynamicSchemaForm } from '@/components/modules/CanvasTemplate/ai/DynamicSchemaForm';
import { parseAITemplateError } from '@/components/modules/CanvasTemplate/ai/errors';
import { rexerApi } from '@/services/rexer/endpoints';
import type { AIGeneratedBlock, AITemplateField } from '@/services/rexer/types';

interface Props {
  open: boolean;
  templateId: string;
  /** Used to render the input form. */
  fields: AITemplateField[];
  onClose: () => void;
}

/**
 * Admin-only "Test prompt" preview — wraps the BE Q22 endpoint
 * `POST /admin/ai/templates/{id}/test-generate`. Works on inactive
 * templates and doesn't bill the admin's AI quota.
 */
export function AdminTestPromptDialog({
  open,
  templateId,
  fields,
  onClose,
}: Props) {
  const [blocks, setBlocks] = React.useState<AIGeneratedBlock[]>([]);
  const [submitting, setSubmitting] = React.useState(false);

  // Reset when dialog reopens.
  React.useEffect(() => {
    if (open) setBlocks([]);
  }, [open]);

  const handleSubmit = async (values: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      const userInput: Record<string, string | number | boolean> = {};
      for (const [k, v] of Object.entries(values)) {
        if (v === undefined || v === null || v === '') continue;
        if (
          typeof v === 'string' ||
          typeof v === 'number' ||
          typeof v === 'boolean'
        ) {
          userInput[k] = v;
        } else {
          userInput[k] = String(v);
        }
      }
      const res = await rexerApi.adminAiTemplates.testGenerate(templateId, {
        user_input: userInput,
        lang: 'vi',
      });
      setBlocks(res.blocks);
      toast.success(`Test gen xong (v${res.version})`);
    } catch (err) {
      const parsed = parseAITemplateError(err);
      if (
        'missing_fields' in parsed &&
        parsed.missing_fields &&
        parsed.missing_fields.length > 0
      ) {
        toast.error(`Thiếu field: ${parsed.missing_fields.join(', ')}`);
      } else {
        toast.error(parsed.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-4xl'>
        <DialogHeader>
          <DialogTitle>Test prompt (admin)</DialogTitle>
          <DialogDescription>
            Chạy thử AI gen với input mẫu — không tốn AI quota, hoạt động cả khi
            template đang inactive.
          </DialogDescription>
        </DialogHeader>

        {blocks.length === 0 ? (
          fields.length === 0 ? (
            <p className='text-muted-foreground py-6 text-center text-sm'>
              Khai báo ít nhất 1 field trong Input Schema rồi lưu template trước
              khi test.
            </p>
          ) : (
            <DynamicSchemaForm
              fields={fields}
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          )
        ) : (
          <div className='flex flex-col gap-3'>
            <div className='flex items-center justify-between gap-2'>
              <p className='text-sm font-medium'>
                Kết quả ({blocks.length} block)
              </p>
              <Button variant='outline' size='sm' onClick={() => setBlocks([])}>
                Test input khác
              </Button>
            </div>
            <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
              {blocks
                .slice()
                .sort((a, b) => a.position - b.position)
                .map(b => (
                  <BlockReviewCard
                    key={b.block_id}
                    block={b}
                    onContentChange={() => {
                      /* read-only preview */
                    }}
                    onRegenerate={() => {
                      /* not supported in admin test */
                    }}
                  />
                ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
