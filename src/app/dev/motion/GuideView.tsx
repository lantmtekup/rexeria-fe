'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className='border-b border-stone-200 pb-8 last:border-b-0'>
    <h2 className='text-lg font-semibold tracking-tight text-stone-800'>
      {title}
    </h2>
    <div className='mt-3 space-y-3 text-sm leading-relaxed text-stone-600'>
      {children}
    </div>
  </section>
);

const Code = ({ children }: { children: string }) => (
  <pre className='overflow-x-auto rounded-md border border-stone-200 bg-stone-200/60 px-3 py-2.5 font-mono text-[12px] leading-relaxed text-stone-800'>
    {children}
  </pre>
);

const FlowArrow = () => (
  <div
    aria-hidden
    className='flex justify-center py-1 font-mono text-stone-400'
  >
    ↓
  </div>
);

const FlowNode = ({
  label,
  sub,
  tone = 'default',
}: {
  label: string;
  sub?: string;
  tone?: 'default' | 'decision' | 'hit' | 'miss' | 'host' | 'done';
}) => {
  const toneClass = {
    default: 'border-stone-300 bg-white text-stone-800',
    decision: 'border-amber-300 bg-amber-50 text-amber-950',
    hit: 'border-teal-300 bg-teal-50 text-teal-950',
    miss: 'border-orange-300 bg-orange-50 text-orange-950',
    host: 'border-sky-300 bg-sky-50 text-sky-950',
    done: 'border-emerald-300 bg-emerald-50 text-emerald-950',
  }[tone];

  return (
    <div
      className={cn(
        'rounded-md border px-3 py-2.5 text-center shadow-sm',
        toneClass
      )}
    >
      <p className='text-sm font-medium tracking-tight'>{label}</p>
      {sub ? (
        <p className='mt-0.5 font-mono text-[11px] leading-snug opacity-80'>
          {sub}
        </p>
      ) : null}
    </div>
  );
};

const FlowBranch = ({
  items,
}: {
  items: Array<{
    title: string;
    detail: string;
    tone?: 'hit' | 'miss' | 'host' | 'done' | 'default';
  }>;
}) => (
  <div className='grid gap-2 sm:grid-cols-3'>
    {items.map(item => (
      <FlowNode
        key={item.title}
        label={item.title}
        sub={item.detail}
        tone={item.tone ?? 'default'}
      />
    ))}
  </div>
);

/** Visual flowchart — mirrors motion-pick SKILL flow. */
const ProcessDiagram = () => (
  <div className='rounded-lg border border-stone-200 bg-stone-50/80 p-4 md:p-5'>
    <p className='mb-4 font-mono text-[11px] tracking-wide text-stone-500 uppercase'>
      Flow đầy đủ
    </p>

    <div className='mx-auto flex max-w-xl flex-col'>
      <FlowNode label='Intent' sub='effect? gắn attr? tạo/port block?' />
      <FlowArrow />

      <FlowNode
        tone='decision'
        label='Tạo / port / wire block?'
        sub='Gate trước Step 0'
      />
      <FlowArrow />

      <FlowBranch
        items={[
          {
            title: 'Có — apps / native',
            detail: 'Đọc + follow apps-port-host',
            tone: 'host',
          },
          {
            title: 'Có — Framer',
            detail: 'Đọc + follow framer-clone-host',
            tone: 'host',
          },
          {
            title: 'Không',
            detail: 'Block đã có → bỏ qua gate',
            tone: 'default',
          },
        ]}
      />
      <FlowArrow />

      <FlowNode
        label='Step 0 — Sync catalog'
        sub='yarn motion:catalog → effects-catalog.md'
      />
      <FlowArrow />

      <FlowNode label='Đọc catalog' sub='category / tags / appliesTo / vs' />
      <FlowArrow />

      <FlowNode
        tone='decision'
        label='Match trong allowlist?'
        sub='HIT hoặc MISS'
      />
      <FlowArrow />

      <div className='grid gap-3 sm:grid-cols-2'>
        <div className='flex flex-col gap-2'>
          <FlowNode
            tone='hit'
            label='HIT'
            sub='1–2 ứng viên → vs + whenNotToUse'
          />
          <FlowArrow />
          <FlowNode
            tone='done'
            label='Gắn data-motion'
            sub='+ useMotionAttributes · verify /dev/motion'
          />
        </div>

        <div className='flex flex-col gap-2'>
          <FlowNode tone='miss' label='MISS' sub='Chưa có trong library' />
          <FlowArrow />
          <div className='flex flex-col gap-2'>
            <FlowNode
              tone='hit'
              label='MẶC ĐỊNH — Extend library'
              sub='gsap-* → MOTION_EFFECTS + meta'
            />
            <FlowNode
              label='Ngoại lệ: sibling gần'
              sub='Chỉ khác timing → override attr'
            />
            <FlowNode
              tone='miss'
              label='Ngoại lệ: T3'
              sub='pin/Flip/trail → useBlockMotion'
            />
          </div>
          <FlowArrow />
          <FlowNode
            tone='done'
            label='Sync lại → gắn attr'
            sub='yarn motion:catalog · #fx-<id>'
          />
        </div>
      </div>
    </div>
  </div>
);

export function GuideView() {
  return (
    <article className='mx-auto max-w-3xl px-6 py-10 md:px-10'>
      <header className='mb-10'>
        <p className='font-mono text-[11px] tracking-wide text-teal-700 uppercase'>
          motion-pick skill
        </p>
        <h1 className='mt-1 text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl'>
          Quy trình dùng Motion Attribute
        </h1>
        <p className='mt-2 max-w-2xl text-sm leading-relaxed text-stone-500'>
          Retrieve effect có sẵn, hoặc extend library khi miss — kèm gate tạo
          block qua apps-port-host / framer-clone-host.
        </p>
      </header>

      <div className='flex flex-col gap-10'>
        <Section title='1. Skill làm gì — 3 quy tắc'>
          <ol className='list-decimal space-y-1.5 pl-5'>
            <li>
              <strong className='font-medium text-stone-800'>Library có</strong>{' '}
              → dùng: pick id từ catalog, gắn{' '}
              <code className='font-mono text-stone-800'>data-motion</code> +
              attrs.
            </li>
            <li>
              <strong className='font-medium text-stone-800'>
                Library chưa có → mặc định extend
              </strong>
              : đọc gsap-* skills → viết effect mới vào{' '}
              <code className='font-mono'>motionLibrary.ts</code> → sync catalog
              → dùng. Không viết GSAP tay one-off; ngoại lệ duy nhất là T3.
            </li>
            <li>
              <strong className='font-medium text-stone-800'>
                Tạo / port block
              </strong>{' '}
              → đọc{' '}
              <code className='font-mono text-[12px]'>apps-port-host</code>{' '}
              trước (Framer →{' '}
              <code className='font-mono text-[12px]'>framer-clone-host</code>
              ); motion-pick lo bước chọn/extend effect trong port.
            </li>
          </ol>
          <p>Không đoán id từ tên; không invent id trước khi có entry.</p>
          <ul className='list-disc space-y-1 pl-5'>
            <li>
              Source runtime + meta:{' '}
              <code className='font-mono text-[12px]'>
                src/.../motion/motionLibrary.ts
              </code>
            </li>
            <li>
              Catalog agent:{' '}
              <code className='font-mono text-[12px]'>
                .claude/skills/motion-pick/references/effects-catalog.md
              </code>
            </li>
            <li>
              Extend checklist:{' '}
              <code className='font-mono text-[12px]'>
                .claude/skills/motion-pick/references/extend-library.md
              </code>
            </li>
            <li>
              Tạo/port block:{' '}
              <code className='font-mono text-[12px]'>
                .claude/skills/apps-port-host/SKILL.md
              </code>
            </li>
            <li>
              Skill:{' '}
              <code className='font-mono text-[12px]'>
                .claude/skills/motion-pick/SKILL.md
              </code>
            </li>
          </ul>
        </Section>

        <Section title='2. Khi nào gọi skill'>
          <ul className='list-disc space-y-1 pl-5'>
            <li>Hỏi “effect nào cho heading / card / ảnh…”</li>
            <li>Gắn animation bằng attribute vào block</li>
            <li>
              Migrate GSAP tay →{' '}
              <code className='font-mono'>data-motion-*</code>
            </li>
            <li>
              Wire <code className='font-mono'>useMotionAttributes</code>
            </li>
            <li>Catalog miss — thêm effect reusable vào library</li>
            <li>
              Tạo / port / wire block từ{' '}
              <code className='font-mono'>apps/&lt;brand&gt;</code> → đọc{' '}
              <code className='font-mono text-[12px]'>apps-port-host</code>{' '}
              trước (Framer →{' '}
              <code className='font-mono text-[12px]'>framer-clone-host</code>)
            </li>
          </ul>
          <p>
            Case T3 (pin, frame-scrub, Flip, trail, mouse-parallax theo chuột,
            carousel) → <code className='font-mono'>useBlockMotion</code> +
            skill gsap-*; không nhét attribute.
          </p>
        </Section>

        <Section title='3. Quy trình đầy đủ'>
          <ProcessDiagram />

          <ol className='mt-6 list-decimal space-y-4 pl-5'>
            <li>
              <strong className='font-medium text-stone-800'>
                Gate — tạo / port block
              </strong>
              <p className='mt-1'>
                Intent tạo hoặc port block → đọc và follow host skill trước khi
                sync catalog:
              </p>
              <ul className='mt-1 list-disc space-y-1 pl-5'>
                <li>
                  <code className='font-mono'>apps/&lt;brand&gt;</code> hoặc
                  native →{' '}
                  <code className='font-mono text-[12px]'>
                    apps-port-host/SKILL.md
                  </code>{' '}
                  (full vs sub, canvas styles, Layers, verify)
                </li>
                <li>
                  Framer recon/clone →{' '}
                  <code className='font-mono text-[12px]'>
                    framer-clone-host/SKILL.md
                  </code>
                </li>
                <li>
                  Chỉ hỏi effect trên block đã có → bỏ qua gate, vào Step 0
                </li>
              </ul>
            </li>
            <li>
              <strong className='font-medium text-stone-800'>
                Step 0 — Sync
              </strong>
              <p className='mt-1'>Mỗi lần dùng skill, chạy trong repo root:</p>
              <Code>{'yarn motion:catalog'}</Code>
              <p className='mt-1'>
                Đợi thấy{' '}
                <code className='font-mono text-[12px]'>
                  Wrote …/effects-catalog.md
                </code>
                . Catalog stale = pick sai.
              </p>
            </li>
            <li>
              <strong className='font-medium text-stone-800'>
                Đọc catalog
              </strong>
              — lọc <code className='font-mono'>category</code> /{' '}
              <code className='font-mono'>tags</code> /{' '}
              <code className='font-mono'>appliesTo</code>, đối chiếu{' '}
              <code className='font-mono'>vs</code> /{' '}
              <code className='font-mono'>whenNotToUse</code> / prerequisites.
            </li>
            <li>
              <strong className='font-medium text-stone-800'>HIT</strong> — 1–2
              ứng viên trong allowlist → JSX{' '}
              <code className='font-mono'>data-motion</code> + attrs từ{' '}
              <code className='font-mono'>relevantAttrs</code> +{' '}
              <code className='font-mono'>useMotionAttributes(rootRef)</code>.
              Verify mắt tại{' '}
              <code className='font-mono'>/dev/motion#fx-&lt;id&gt;</code>.
            </li>
            <li>
              <strong className='font-medium text-stone-800'>
                MISS — mặc định extend library
              </strong>
              : đọc{' '}
              <code className='font-mono text-[12px]'>extend-library.md</code> +
              gsap-* → đăng ký <code className='font-mono'>MOTION_EFFECTS</code>{' '}
              + <code className='font-mono'>meta</code> →{' '}
              <code className='font-mono'>yarn motion:catalog</code> → verify →
              gắn attr. Chỉ 2 ngoại lệ:
              <ul className='mt-1 list-disc space-y-1 pl-5'>
                <li>
                  Sibling gần + chỉ khác timing/biên độ → dùng sibling +{' '}
                  <code className='font-mono'>data-motion-*</code> override
                  (không extend)
                </li>
                <li>
                  T3 (pin, Flip, trail, mouse-parallax, carousel…) →{' '}
                  <code className='font-mono'>useBlockMotion</code> + gsap-* —
                  không nhét attribute
                </li>
              </ul>
            </li>
          </ol>
        </Section>

        <Section title='4. Hard rules'>
          <ol className='list-decimal space-y-2 pl-5'>
            <li>
              Chỉ dùng id trong catalog — trừ khi đang extend (đăng ký + sync
              rồi mới gắn JSX).
            </li>
            <li>
              1 element = 1 driver — không mix{' '}
              <code className='font-mono'>data-motion</code> với{' '}
              <code className='font-mono'>useBlockMotion</code> / System B trên
              cùng node.
            </li>
            <li>
              T3 → <code className='font-mono'>useBlockMotion</code> (pin,
              sticky, frame-scrub, Flip, trail/explosion, mouse-parallax,
              carousel/drawer).
            </li>
            <li>
              Block gắn attribute phải gọi{' '}
              <code className='font-mono'>
                useMotionAttributes(rootRef[, deps])
              </code>
              .
            </li>
            <li>
              Miss catalog → mặc định extend library (extend-library.md +
              gsap-*); ngoại lệ: sibling override, T3. Không invent id rồi gắn
              thẳng.
            </li>
            <li>
              Tạo / port block → đọc apps-port-host (hoặc framer-clone-host)
              trước; không scaffold BlockType chỉ từ motion-pick.
            </li>
          </ol>
        </Section>

        <Section title='5. Decision tree nhanh'>
          <div className='overflow-x-auto rounded-md border border-stone-200'>
            <table className='w-full min-w-md text-left text-sm'>
              <thead className='bg-stone-100 text-stone-700'>
                <tr>
                  <th className='px-3 py-2 font-medium'>Intent</th>
                  <th className='px-3 py-2 font-medium'>Category / ưu tiên</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-stone-200'>
                {[
                  ['Body / card entrance', 'entrance — mặc định fade-up'],
                  [
                    'Hero heading cinematic',
                    'text — char / word / line-reveal',
                  ],
                  [
                    'Ảnh reveal / Ken Burns',
                    'image — clip-reveal / media-zoom / zoom-in',
                  ],
                  ['Scroll depth / thanh vẽ', 'scroll — parallax / line-draw'],
                  ['Hover feedback', 'hover — scale / lift / tilt / zoom'],
                  ['Số liệu đếm', 'special — counter'],
                  ['Ticker ngang', 'loop — marquee-loop'],
                  [
                    'Catalog miss (mặc định)',
                    'extend-library + gsap-* → MOTION_EFFECTS',
                  ],
                  [
                    'Pin / Flip / trail / mouse-parallax',
                    'T3 — useBlockMotion',
                  ],
                  [
                    'Tạo / port block từ apps',
                    'apps-port-host → rồi motion-pick',
                  ],
                  ['Framer → block', 'framer-clone-host → rồi motion-pick'],
                ].map(([intent, cat]) => (
                  <tr key={intent} className='bg-white'>
                    <td className='px-3 py-2 text-stone-700'>{intent}</td>
                    <td className='px-3 py-2 font-mono text-[12px] text-stone-600'>
                      {cat}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title='6. Output mẫu'>
          <Code>{`import { useMotionAttributes } from '../motion/useMotionAttributes';

useMotionAttributes(rootRef);

<h2 data-motion='word-reveal'>…</h2>
<p data-motion='fade-up' data-motion-distance='30'>…</p>`}</Code>
          <p>
            Group list: <code className='font-mono'>data-motion-group</code>{' '}
            trên container +{' '}
            <code className='font-mono'>data-motion-stagger-children</code> —
            xem mục Pattern ở sidebar.
          </p>
          <p>
            Spec đầy đủ:{' '}
            <code className='font-mono text-[12px]'>
              docs/landing-motion-foundation.md
            </code>{' '}
            §3b.
          </p>
          <p>
            Thêm effect mới: checklist trong{' '}
            <code className='font-mono text-[12px]'>extend-library.md</code> —
            entry + <code className='font-mono'>meta</code> trong{' '}
            <code className='font-mono'>motionLibrary.ts</code>, rồi{' '}
            <code className='font-mono'>yarn motion:catalog</code>. Sidebar /
            meta / Stage (auto) hiện ngay; custom demo trong{' '}
            <code className='font-mono'>demos.tsx</code> chỉ khi cần stage đặc
            biệt.
          </p>
        </Section>
      </div>
    </article>
  );
}
