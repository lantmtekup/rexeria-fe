/**
 * Suy ra "template này cần người dùng điền những gì" từ canvas thô, và ghi
 * nội dung người dùng điền ngược lại vào canvas.
 *
 * ⚠️ Luật phân loại field ở đây là BẢN SAO của BE — nguồn gốc:
 *   be-ReXeR.ai/internal/usecase/insight_block_schema.go:25-80
 *     · mediaSuffixes / mediaExtensions  → isMediaField
 *     · linkSuffixes                     → isLinkField
 *     · localeContent                    → contentVi.desktop ?? contentEn.desktop
 * BE dùng đúng luật này để dựng JSON schema gửi cho model, nên checklist chỉ
 * đúng chừng nào hai bên còn khớp. Sửa một bên thì phải soát bên kia.
 *
 * Làm việc trên JSON THÔ, cố ý không đi qua `parseCanvas`/`serialize` của
 * block-editor: hàm đó chuẩn hoá về `Block` và làm rụng field lạ (đã xác nhận
 * nó bỏ `block_id`), round-trip qua nó là mất dữ liệu của canvas gốc.
 */

const MEDIA_SUFFIXES = ['url', 'src', 'image', 'photo', 'img', 'icon', 'logo'];
const MEDIA_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.avif',
  '.svg',
  '.gif',
  '.mp4',
  '.webm',
];
const VIDEO_EXTENSIONS = ['.mp4', '.webm'];
const LINK_SUFFIXES = [
  'href',
  'link',
  'route',
  'path',
  'anchor',
  'slug',
  'target',
];

/**
 * Khác BE một điểm CÓ CHỦ Ý: key kết thúc bằng `id` (vd `sections[].sectionId`)
 * là định danh để neo/scroll, không phải chữ hiển thị. BE vẫn để model ghi đè
 * chúng — đó là chuyện của BE — nhưng bắt người dùng gõ tay một cái id thì chỉ
 * có hỏng điều hướng, nên checklist giấu đi.
 */
const IDENTIFIER_SUFFIXES = ['id'];

/**
 * Ô "phụ": chữ thay thế cho ảnh (`imageAlt`, `productAlt`, `logoAlt`). Vẫn cho
 * sửa, nhưng giấu sau nút "hiện ô phụ" — với khuôn Cool Hunter chúng chiếm 8/28
 * ô chữ, bày ra hết khiến checklist trông như một biểu mẫu bắt buộc điền, trong
 * khi đây đúng là loại chữ AI viết được và người dùng gần như không bao giờ gõ.
 */
const SECONDARY_SUFFIXES = ['alt'];

/** Chữ dài hơn ngần này thì cho textarea thay vì input một dòng. */
const MULTILINE_AT = 80;

export type FieldKind = 'text' | 'image' | 'video';

export interface ChecklistField {
  /** Đường dẫn trong `contentVi.desktop`: `title`, `titleLines[0]`, `items[2].imageUrl`. */
  path: string;
  kind: FieldKind;
  /** Giá trị template đang có — làm placeholder, và là tuỳ chọn "giữ ảnh template". */
  current: string;
  multiline: boolean;
  /** Ô ít giá trị để gõ tay (alt text) — mặc định giấu đi. */
  secondary: boolean;
}

export interface ChecklistBlock {
  /** `id` của instance trong canvas (vd `b_ybx2548k`) — khoá để ghi đè về sau. */
  blockId: string;
  blockType: string;
  name: string;
  fields: ChecklistField[];
}

/** `{ [blockId]: { [fieldPath]: giá trị người dùng nhập } }`. Rỗng = để AI viết. */
export type ChecklistOverrides = Record<string, Record<string, string>>;

function isMediaField(key: string, value: string): boolean {
  const k = key.toLowerCase();
  if (MEDIA_SUFFIXES.some(s => k.endsWith(s))) return true;
  const v = value.toLowerCase();
  if (MEDIA_EXTENSIONS.some(e => v.includes(e))) return true;
  return v.startsWith('http://') || v.startsWith('https://');
}

function isLinkField(key: string, value: string): boolean {
  const k = key.toLowerCase();
  if (LINK_SUFFIXES.some(s => k.endsWith(s))) return true;
  const v = value.toLowerCase();
  return v.startsWith('#') || v.startsWith('mailto:') || v.startsWith('tel:');
}

function kindOf(key: string, value: string): FieldKind | null {
  // Thứ tự giống BE: media xét trước link, để đường dẫn ảnh không bị nhận nhầm
  // thành link rồi bị loại khỏi checklist.
  if (isMediaField(key, value)) {
    const v = value.toLowerCase();
    return VIDEO_EXTENSIONS.some(e => v.includes(e)) ? 'video' : 'image';
  }
  if (isLinkField(key, value)) return null; // BE không cho AI đụng, ta cũng không hỏi
  if (IDENTIFIER_SUFFIXES.some(s => key.toLowerCase().endsWith(s))) return null;
  return 'text';
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

/** `contentVi.desktop`, fallback `contentEn.desktop` — khớp `localeContent` của BE. */
function localeContent(
  block: Record<string, unknown>
): Record<string, unknown> {
  for (const locale of ['contentVi', 'contentEn']) {
    const loc = asRecord(block[locale]);
    const desktop = loc && asRecord(loc.desktop);
    if (desktop && Object.keys(desktop).length > 0) return desktop;
  }
  return {};
}

function field(path: string, value: string): ChecklistField | null {
  const key = path.split('.').pop() ?? path;
  const kind = kindOf(key, value);
  if (!kind) return null;
  return {
    path,
    kind,
    current: value,
    multiline: kind === 'text' && value.length > MULTILINE_AT,
    secondary: SECONDARY_SUFFIXES.some(s => key.toLowerCase().endsWith(s)),
  };
}

/**
 * Dựng checklist cho từng block của canvas.
 *
 * Chỉ mở ra string, string[] và object[] có member là string — đúng tập mà BE
 * cho model ghi. Số/boolean/object lồng là layout, sửa vào là vỡ bố cục.
 */
export function buildChecklist(rawBlocks: unknown): ChecklistBlock[] {
  if (!Array.isArray(rawBlocks)) return [];
  const out: ChecklistBlock[] = [];

  for (const raw of rawBlocks) {
    const block = asRecord(raw);
    if (!block) continue;
    const blockId = typeof block.id === 'string' ? block.id : '';
    if (!blockId) continue;

    const content = localeContent(block);
    const fields: ChecklistField[] = [];

    for (const key of Object.keys(content).sort()) {
      const value = content[key];

      if (typeof value === 'string') {
        const f = field(key, value);
        if (f) fields.push(f);
        continue;
      }

      if (!Array.isArray(value) || value.length === 0) continue;

      if (value.every(x => typeof x === 'string')) {
        value.forEach((item, i) => {
          const f = field(`${key}[${i}]`, item as string);
          if (f) fields.push(f);
        });
        continue;
      }

      value.forEach((item, i) => {
        const obj = asRecord(item);
        if (!obj) return;
        for (const sub of Object.keys(obj).sort()) {
          const v = obj[sub];
          if (typeof v !== 'string') continue;
          const f = field(`${key}[${i}].${sub}`, v);
          if (f) fields.push(f);
        }
      });
    }

    out.push({
      blockId,
      blockType:
        (typeof block.blockType === 'string' && block.blockType) ||
        (typeof block.block_type === 'string' && block.block_type) ||
        '',
      name: typeof block.name === 'string' ? block.name : '',
      fields,
    });
  }

  return out;
}

export interface SlotCounts {
  text: number;
  image: number;
  video: number;
}

export function countSlots(blocks: ChecklistBlock[]): SlotCounts {
  const counts: SlotCounts = { text: 0, image: 0, video: 0 };
  for (const b of blocks) {
    for (const f of b.fields) counts[f.kind] += 1;
  }
  return counts;
}

/**
 * Đổ nội dung AI vừa viết vào checklist làm giá trị khởi tạo.
 *
 * Chặng soát dùng cái này: mỗi ô mang sẵn chữ AI đã viết, người dùng sửa trực
 * tiếp lên đó. Khác hẳn chặng nhập (ô trống, `current` chỉ làm placeholder) —
 * ở đây soát và sửa, không phải tự nghĩ ra chữ.
 */
export function overridesFromChecklist(
  blocks: ChecklistBlock[]
): ChecklistOverrides {
  const out: ChecklistOverrides = {};
  for (const b of blocks) {
    const fields: Record<string, string> = {};
    for (const f of b.fields) {
      if (f.current) fields[f.path] = f.current;
    }
    if (Object.keys(fields).length) out[b.blockId] = fields;
  }
  return out;
}

/**
 * Rải ảnh người dùng đã dán vào mọi ô ảnh, xoay vòng theo thứ tự.
 *
 * Có 3 ảnh cho 11 ô là chuyện thường; để AI tự chọn thì nó hay dồn một tấm vào
 * nhiều chỗ. Xoay vòng cho ra bố cục đều hơn, và quan trọng hơn là người dùng
 * chỉ phải bấm một nút thay vì mở 7 block chọn 11 dropdown.
 *
 * Chỉ đụng ô ảnh/video, không đụng ô chữ; ô nào người dùng đã tự chọn thì giữ.
 */
export function autoAssignImages(
  blocks: ChecklistBlock[],
  mediaUrls: string[],
  overrides: ChecklistOverrides,
  opts?: { overwrite?: boolean }
): ChecklistOverrides {
  if (!mediaUrls.length) return overrides;
  const next: ChecklistOverrides = { ...overrides };
  let i = 0;
  for (const block of blocks) {
    for (const f of block.fields) {
      if (f.kind === 'text') continue;
      // Ở chặng soát mọi ô ảnh đã mang sẵn lựa chọn của AI, nên nếu không ghi
      // đè thì nút này bấm xong không đổi gì — đúng lúc người dùng cần nó nhất.
      const already = next[block.blockId]?.[f.path];
      if (!opts?.overwrite && already?.trim()) continue;
      next[block.blockId] = {
        ...(next[block.blockId] ?? {}),
        [f.path]: mediaUrls[i % mediaUrls.length],
      };
      i += 1;
    }
  }
  return next;
}

/** Số ô người dùng đã điền thật sự (bỏ qua chuỗi rỗng). */
export function countFilled(overrides: ChecklistOverrides): number {
  return Object.values(overrides).reduce(
    (n, fields) => n + Object.values(fields).filter(v => v.trim()).length,
    0
  );
}

/**
 * Gán giá trị vào `contentVi.desktop`/`contentEn.desktop` theo `path`.
 *
 * Ghi cả HAI locale giống `mergeLocaleContent` của BE (insight.go:629): renderer
 * đọc theo ngôn ngữ đang xem, chỉ ghi một bên thì đổi ngôn ngữ là mất chữ.
 */
function setAtPath(
  desktop: Record<string, unknown>,
  path: string,
  value: string
): void {
  // `items[2].imageUrl` → ['items', 2, 'imageUrl']
  const steps: (string | number)[] = [];
  for (const part of path.split('.')) {
    const m = /^([^[]+)((\[\d+\])*)$/.exec(part);
    if (!m) return;
    steps.push(m[1]);
    for (const idx of m[2].match(/\d+/g) ?? []) steps.push(Number(idx));
  }

  let cursor: unknown = desktop;
  for (let i = 0; i < steps.length - 1; i += 1) {
    const step = steps[i];
    if (typeof step === 'number') {
      if (!Array.isArray(cursor)) return;
      cursor = cursor[step];
    } else {
      const rec = asRecord(cursor);
      if (!rec) return;
      cursor = rec[step];
    }
    if (cursor == null) return;
  }

  const last = steps[steps.length - 1];
  if (typeof last === 'number') {
    if (Array.isArray(cursor)) cursor[last] = value;
    return;
  }
  const rec = asRecord(cursor);
  if (rec) rec[last] = value;
}

/**
 * Ghi nội dung người dùng điền đè lên canvas AI vừa viết.
 *
 * Chạy SAU khi AI viết xong (không phải qua `block_contents` của handoff): BE
 * bỏ qua nguyên block nếu block đó đã có key `content`, nên điền 2/5 ô sẽ khiến
 * 3 ô còn lại giữ nguyên chữ của template gốc — đúng cái lỗi đang phải sửa.
 * Khớp theo `id` instance nên hai block cùng type cũng không lẫn nhau.
 *
 * Không sửa `canvas` đầu vào — trả về bản mới.
 */
export function applyOverrides(
  canvas: Record<string, unknown>,
  overrides: ChecklistOverrides
): Record<string, unknown> {
  const next = JSON.parse(JSON.stringify(canvas)) as Record<string, unknown>;
  const blocks = next.blocks;
  if (!Array.isArray(blocks)) return next;

  for (const raw of blocks) {
    const block = asRecord(raw);
    if (!block) continue;
    const fields = overrides[String(block.id ?? '')];
    if (!fields) continue;

    for (const locale of ['contentVi', 'contentEn']) {
      const loc = asRecord(block[locale]);
      if (!loc) continue;
      const desktop = asRecord(loc.desktop);
      if (!desktop) continue;
      for (const [path, value] of Object.entries(fields)) {
        if (value.trim()) setAtPath(desktop, path, value);
      }
    }
  }

  return next;
}
