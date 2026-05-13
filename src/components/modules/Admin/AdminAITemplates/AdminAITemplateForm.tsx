'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Switch } from '@/components/atoms/switch';
import { Textarea } from '@/components/atoms/textarea';
import { AdminTestPromptDialog } from '@/components/dialogs/AdminTestPromptDialog';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type {
  AIBlockRole,
  AIBlockTone,
  AIFieldDataType,
  AITemplate,
  AITemplateBlock,
  AITemplateBlockPrompt,
  AITemplateField,
} from '@/services/rexer/types';

interface Props {
  /** When set, form is in edit mode (PATCH). */
  initial?: AITemplate;
}

const ALL_ROLES: AIBlockRole[] = [
  'hero',
  'tagline',
  'pain',
  'solution',
  'feature',
  'image',
  'testimonial',
  'price',
  'cta',
  'faq',
];

const TONES: AIBlockTone[] = [
  'formal',
  'friendly',
  'energetic',
  'luxury',
  'minimal',
];

const DATA_TYPES: AIFieldDataType[] = [
  'text',
  'number',
  'select',
  'image',
  'textarea',
];

interface FormState {
  name: string;
  description: string;
  topic: string;
  is_active: boolean;
  fields: AITemplateField[];
  blocks: AITemplateBlock[];
  block_prompts: AITemplateBlockPrompt[];
  /** Only for edit mode — optimistic lock (BE Q21/Q24). */
  version: number;
}

function emptyState(): FormState {
  // Spec §4.1 step 2 — admin starts with the 10 fixed-role block skeleton.
  const blocks: AITemplateBlock[] = ALL_ROLES.map((role, i) => ({
    block_id: `blk_${role}`,
    position: i + 1,
    role,
    layout_type:
      role === 'image' ? 'image' : role === 'hero' ? 'mixed' : 'text',
  }));
  return {
    name: '',
    description: '',
    topic: '',
    is_active: false,
    fields: [],
    blocks,
    block_prompts: blocks.map(b => ({
      block_id: b.block_id,
      prompt_instruction: '',
      required_fields: [],
      examples: [],
    })),
    version: 0,
  };
}

function fromTemplate(t: AITemplate): FormState {
  // BE GET returns block_prompts for admin (Q5 — user GET strips). Fall
  // back to an empty prompt per block when admin GET omits it.
  const promptByBlock = new Map(
    (t.block_prompts ?? []).map(p => [p.block_id, p])
  );
  const block_prompts = t.blocks.map(
    b =>
      promptByBlock.get(b.block_id) ?? {
        block_id: b.block_id,
        prompt_instruction: '',
        required_fields: [],
        examples: [],
      }
  );
  return {
    name: t.name,
    description: t.description ?? '',
    topic: t.topic ?? '',
    is_active: t.is_active,
    fields: t.fields,
    blocks: t.blocks,
    block_prompts,
    version: t.version,
  };
}

function rxMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.message || err.code;
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

export function AdminAITemplateForm({ initial }: Props) {
  const router = useRouter();
  const [data, setData] = React.useState<FormState>(() =>
    initial ? fromTemplate(initial) : emptyState()
  );
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    if (!data.name.trim()) {
      toast.error('Tên template không được rỗng');
      return;
    }
    if (data.fields.length === 0) {
      toast.error('Cần ít nhất 1 field trong Input Schema (BE validate)');
      return;
    }
    setSubmitting(true);
    try {
      // BE Q20/Q21: send the 3 arrays as separate top-level fields.
      const payload = {
        name: data.name.trim(),
        description: data.description || undefined,
        topic: data.topic || undefined,
        is_active: data.is_active,
        fields: data.fields,
        blocks: data.blocks,
        block_prompts: data.block_prompts,
      };
      if (initial) {
        // BE Q21: PATCH requires `version` for optimistic lock.
        await rexerApi.adminAiTemplates.update(initial.id, {
          version: data.version,
          ...payload,
        });
        toast.success('Đã cập nhật');
      } else {
        await rexerApi.adminAiTemplates.create(payload);
        toast.success('Đã tạo template');
      }
      router.push('/admin/ai-templates');
    } catch (err) {
      if (
        err instanceof RxApiError &&
        err.code === 'ERR_CANVAS_VERSION_CONFLICT'
      ) {
        toast.error(
          'Template đã bị người khác cập nhật. Refresh trang để lấy version mới.'
        );
      } else {
        toast.error(`Lưu thất bại: ${rxMessage(err)}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='flex flex-col gap-6 p-6'>
      <div className='flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => router.push('/admin/ai-templates')}
            className='gap-1'
          >
            <ArrowLeft className='size-3.5' /> Danh sách
          </Button>
          <h1 className='text-xl font-semibold'>
            {initial ? `Sửa: ${initial.name}` : 'Tạo AI Template'}
          </h1>
          {initial ? (
            <Badge variant='outline' className='text-[10px]'>
              v{data.version}
            </Badge>
          ) : null}
        </div>
        <Button variant='primary' onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Đang lưu…' : 'Lưu'}
        </Button>
      </div>

      <BasicSection data={data} setData={setData} />
      <FieldsSection data={data} setData={setData} />
      <BlocksSection data={data} setData={setData} templateId={initial?.id} />
    </div>
  );
}

// ── Basic ────────────────────────────────────────────────────────────────
function BasicSection({
  data,
  setData,
}: {
  data: FormState;
  setData: React.Dispatch<React.SetStateAction<FormState>>;
}) {
  return (
    <section className='border-border flex flex-col gap-3 rounded-lg border p-4'>
      <h2 className='text-sm font-semibold'>Thông tin cơ bản</h2>
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
        <div className='flex flex-col gap-1'>
          <Label>Tên</Label>
          <Input
            value={data.name}
            onChange={e => setData(d => ({ ...d, name: e.target.value }))}
            placeholder='Giới thiệu sản phẩm mới'
          />
        </div>
        <div className='flex flex-col gap-1'>
          <Label>Chủ đề (topic)</Label>
          <Input
            value={data.topic}
            onChange={e => setData(d => ({ ...d, topic: e.target.value }))}
            placeholder='product_launch'
          />
        </div>
      </div>
      <div className='flex flex-col gap-1'>
        <Label>Mô tả</Label>
        <Textarea
          value={data.description}
          onChange={e => setData(d => ({ ...d, description: e.target.value }))}
          placeholder='Ngắn gọn template làm gì…'
        />
      </div>
      <div className='flex items-center gap-2'>
        <Switch
          checked={data.is_active}
          onCheckedChange={v => setData(d => ({ ...d, is_active: v }))}
        />
        <Label>Kích hoạt cho user (is_active)</Label>
      </div>
    </section>
  );
}

// ── Fields (Input Schema §5.2) ────────────────────────────────────────────
function FieldsSection({
  data,
  setData,
}: {
  data: FormState;
  setData: React.Dispatch<React.SetStateAction<FormState>>;
}) {
  const addField = () =>
    setData(d => ({
      ...d,
      fields: [
        ...d.fields,
        {
          field_key: `field_${d.fields.length + 1}`,
          label: '',
          data_type: 'text',
          is_required: false,
          ai_can_infer: true,
          mapped_blocks: [],
        },
      ],
    }));

  const removeField = (idx: number) =>
    setData(d => ({ ...d, fields: d.fields.filter((_, i) => i !== idx) }));

  const patch = (idx: number, patch: Partial<AITemplateField>) =>
    setData(d => ({
      ...d,
      fields: d.fields.map((f, i) => (i === idx ? { ...f, ...patch } : f)),
    }));

  return (
    <section className='border-border flex flex-col gap-3 rounded-lg border p-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-sm font-semibold'>Input Schema</h2>
          <p className='text-muted-foreground text-xs'>
            Các field user sẽ nhập trước khi AI gen nội dung. BE yêu cầu ≥ 1
            field.
          </p>
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={addField}
          className='gap-1'
        >
          <Plus className='size-3.5' /> Thêm field
        </Button>
      </div>

      {data.fields.length === 0 ? (
        <p className='text-muted-foreground py-4 text-center text-sm'>
          Chưa có field nào. Bấm “Thêm field” để bắt đầu.
        </p>
      ) : (
        <div className='flex flex-col gap-3'>
          {data.fields.map((f, idx) => (
            <FieldRow
              key={idx}
              field={f}
              blocks={data.blocks}
              onChange={p => patch(idx, p)}
              onRemove={() => removeField(idx)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function FieldRow({
  field,
  blocks,
  onChange,
  onRemove,
}: {
  field: AITemplateField;
  blocks: AITemplateBlock[];
  onChange: (p: Partial<AITemplateField>) => void;
  onRemove: () => void;
}) {
  return (
    <div className='border-border bg-muted/30 flex flex-col gap-2 rounded-md border p-3'>
      <div className='flex items-start justify-between gap-2'>
        <div className='grid w-full grid-cols-1 gap-2 md:grid-cols-3'>
          <div className='flex flex-col gap-1'>
            <Label className='text-xs'>field_key</Label>
            <Input
              value={field.field_key}
              onChange={e => onChange({ field_key: e.target.value })}
              placeholder='product_name'
            />
          </div>
          <div className='flex flex-col gap-1'>
            <Label className='text-xs'>Label</Label>
            <Input
              value={field.label}
              onChange={e => onChange({ label: e.target.value })}
              placeholder='Tên sản phẩm'
            />
          </div>
          <div className='flex flex-col gap-1'>
            <Label className='text-xs'>data_type</Label>
            <select
              value={field.data_type}
              onChange={e =>
                onChange({ data_type: e.target.value as AIFieldDataType })
              }
              className='border-input bg-background h-9 rounded-md border px-3 text-sm'
            >
              {DATA_TYPES.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Button
          variant='ghost'
          size='icon'
          className='text-muted-foreground hover:text-destructive size-7'
          onClick={onRemove}
        >
          <Trash2 className='size-3.5' />
        </Button>
      </div>

      <div className='grid grid-cols-1 gap-2 md:grid-cols-3'>
        <div className='flex items-center gap-2'>
          <Switch
            checked={field.is_required}
            onCheckedChange={v => onChange({ is_required: v })}
          />
          <Label className='text-xs'>is_required</Label>
        </div>
        <div className='flex items-center gap-2'>
          <Switch
            checked={field.ai_can_infer}
            onCheckedChange={v => onChange({ ai_can_infer: v })}
          />
          <Label className='text-xs'>ai_can_infer</Label>
        </div>
        <div className='flex flex-col gap-1'>
          <Label className='text-xs'>placeholder</Label>
          <Input
            value={field.placeholder ?? ''}
            onChange={e => onChange({ placeholder: e.target.value })}
          />
        </div>
      </div>

      <div className='flex flex-col gap-1'>
        <Label className='text-xs'>
          mapped_blocks (block nào tiêu thụ field này)
        </Label>
        <div className='flex flex-wrap gap-1'>
          {blocks.map(b => {
            const checked = field.mapped_blocks.includes(b.block_id);
            return (
              <button
                key={b.block_id}
                type='button'
                onClick={() =>
                  onChange({
                    mapped_blocks: checked
                      ? field.mapped_blocks.filter(x => x !== b.block_id)
                      : [...field.mapped_blocks, b.block_id],
                  })
                }
                className='cursor-pointer'
              >
                <Badge
                  variant={checked ? 'default' : 'outline'}
                  className='text-[10px]'
                >
                  {b.role}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      {field.data_type === 'select' ? (
        <div className='flex flex-col gap-1'>
          <Label className='text-xs'>Options (mỗi dòng 1 value)</Label>
          <Textarea
            value={(field.options ?? []).join('\n')}
            onChange={e =>
              onChange({
                options: e.target.value
                  .split('\n')
                  .map(s => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder={'friendly\nluxury\nenergetic'}
          />
        </div>
      ) : null}
    </div>
  );
}

// ── Blocks (Prompt Context §5.3) ──────────────────────────────────────────
function BlocksSection({
  data,
  setData,
  templateId,
}: {
  data: FormState;
  setData: React.Dispatch<React.SetStateAction<FormState>>;
  /** Only available in edit mode — required by BE Q22 test-generate endpoint. */
  templateId?: string;
}) {
  const [testOpen, setTestOpen] = React.useState(false);
  const patchPrompt = (blockId: string, p: Partial<AITemplateBlockPrompt>) =>
    setData(d => ({
      ...d,
      block_prompts: d.block_prompts.map(bp =>
        bp.block_id === blockId ? { ...bp, ...p } : bp
      ),
    }));

  return (
    <section className='border-border flex flex-col gap-3 rounded-lg border p-4'>
      <div className='flex items-start justify-between gap-2'>
        <div>
          <h2 className='text-sm font-semibold'>Blocks & AI Prompt Context</h2>
          <p className='text-muted-foreground text-xs'>
            10 block role cố định (spec §5.1). Mỗi block có prompt riêng để AI
            biết sinh nội dung gì.
          </p>
        </div>
        {templateId ? (
          <Button
            variant='outline'
            size='sm'
            onClick={() => setTestOpen(true)}
            disabled={data.fields.length === 0}
          >
            Test prompt
          </Button>
        ) : (
          <span className='text-muted-foreground text-xs'>
            Lưu draft trước để test prompt
          </span>
        )}
      </div>
      <div className='flex flex-col gap-3'>
        {data.blocks.map(b => {
          const prompt = data.block_prompts.find(
            p => p.block_id === b.block_id
          );
          if (!prompt) return null;
          return (
            <BlockPromptRow
              key={b.block_id}
              block={b}
              prompt={prompt}
              fields={data.fields}
              onChange={p => patchPrompt(b.block_id, p)}
            />
          );
        })}
      </div>
      {templateId ? (
        <AdminTestPromptDialog
          open={testOpen}
          templateId={templateId}
          fields={data.fields}
          onClose={() => setTestOpen(false)}
        />
      ) : null}
    </section>
  );
}

function BlockPromptRow({
  block,
  prompt,
  fields,
  onChange,
}: {
  block: AITemplateBlock;
  prompt: AITemplateBlockPrompt;
  fields: AITemplateField[];
  onChange: (p: Partial<AITemplateBlockPrompt>) => void;
}) {
  return (
    <details className='border-border rounded-md border'>
      <summary className='flex cursor-pointer items-center gap-2 px-3 py-2'>
        <span className='text-muted-foreground text-xs'>#{block.position}</span>
        <span className='font-medium'>{block.role}</span>
        <Badge variant='outline' className='text-[10px]'>
          {block.layout_type}
        </Badge>
        {prompt.prompt_instruction ? (
          <Badge variant='secondary' className='text-[10px]'>
            đã có prompt
          </Badge>
        ) : null}
      </summary>
      <div className='flex flex-col gap-2 px-3 pb-3'>
        <div className='flex flex-col gap-1'>
          <Label className='text-xs'>prompt_instruction</Label>
          <Textarea
            value={prompt.prompt_instruction}
            onChange={e => onChange({ prompt_instruction: e.target.value })}
            placeholder='Ví dụ: Viết tagline 6–10 từ, gây tò mò, dùng product_name…'
          />
        </div>
        <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
          <div className='flex flex-col gap-1'>
            <Label className='text-xs'>tone</Label>
            <select
              value={prompt.tone ?? ''}
              onChange={e =>
                onChange({
                  tone: (e.target.value || undefined) as
                    | AIBlockTone
                    | undefined,
                })
              }
              className='border-input bg-background h-9 rounded-md border px-3 text-sm'
            >
              <option value=''>—</option>
              {TONES.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className='flex flex-col gap-1'>
            <Label className='text-xs'>length_constraint</Label>
            <Input
              value={prompt.length_constraint ?? ''}
              onChange={e => onChange({ length_constraint: e.target.value })}
              placeholder='6–10 từ / 200 ký tự…'
            />
          </div>
        </div>
        <div className='flex flex-col gap-1'>
          <Label className='text-xs'>required_fields</Label>
          <div className='flex flex-wrap gap-1'>
            {fields.length === 0 ? (
              <span className='text-muted-foreground text-xs'>
                Chưa khai báo field nào ở Input Schema.
              </span>
            ) : (
              fields.map(f => {
                const checked = (prompt.required_fields ?? []).includes(
                  f.field_key
                );
                return (
                  <button
                    key={f.field_key}
                    type='button'
                    onClick={() =>
                      onChange({
                        required_fields: checked
                          ? (prompt.required_fields ?? []).filter(
                              (k: string) => k !== f.field_key
                            )
                          : [...(prompt.required_fields ?? []), f.field_key],
                      })
                    }
                  >
                    <Badge
                      variant={checked ? 'default' : 'outline'}
                      className='text-[10px]'
                    >
                      {f.field_key}
                    </Badge>
                  </button>
                );
              })
            )}
          </div>
        </div>
        <div className='flex flex-col gap-1'>
          <Label className='text-xs'>
            examples (few-shot, mỗi dòng 1 ví dụ)
          </Label>
          <Textarea
            value={(prompt.examples ?? []).join('\n')}
            onChange={e =>
              onChange({
                examples: e.target.value
                  .split('\n')
                  .map(s => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder='Ví dụ tham chiếu phong cách cho AI'
          />
        </div>
        {/* Test prompt button lives at BlocksSection level — applies to
            all 10 prompts at once (one /generate call returns all). */}
      </div>
    </details>
  );
}
