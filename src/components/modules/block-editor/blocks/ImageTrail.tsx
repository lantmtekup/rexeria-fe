'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  ImageTrailContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface ImageTrailProps {
  content: ImageTrailContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

const IN_EASE = 'cubic-bezier(.07,.5,.5,1)';
const OUT_EASE = 'cubic-bezier(.87,0,.13,1)';

// ── Vector strokes cho auto-demo tracer ────────────────────────────────────
// Toạ độ chuẩn hoá: x trong [0, GLYPH_W], y trong [0,1] cho mỗi ký tự. Mỗi ký
// tự là một hoặc nhiều polyline (stroke); giữa các stroke con trỏ "nhấc bút"
// (không sinh ảnh). Đủ ký tự cho "2026" và "M".
type Pt = [number, number];
const GLYPH_W = 0.6;
const GLYPH_GAP = 0.22;
const GLYPHS: Record<string, Pt[][]> = {
  '0': [
    [
      [0.3, 0.03],
      [0.5, 0.13],
      [0.56, 0.5],
      [0.5, 0.87],
      [0.3, 0.97],
      [0.1, 0.87],
      [0.04, 0.5],
      [0.1, 0.13],
      [0.3, 0.03],
    ],
  ],
  '2': [
    [
      [0.06, 0.24],
      [0.12, 0.08],
      [0.32, 0.02],
      [0.5, 0.12],
      [0.52, 0.33],
      [0.38, 0.52],
      [0.12, 0.78],
      [0.05, 0.96],
      [0.56, 0.96],
    ],
  ],
  '6': [
    [
      [0.52, 0.12],
      [0.32, 0.03],
      [0.14, 0.22],
      [0.06, 0.52],
      [0.07, 0.76],
      [0.22, 0.95],
      [0.42, 0.96],
      [0.55, 0.78],
      [0.48, 0.6],
      [0.28, 0.53],
      [0.12, 0.63],
    ],
  ],
  M: [
    [
      [0.05, 0.96],
      [0.05, 0.04],
      [0.3, 0.62],
      [0.55, 0.04],
      [0.55, 0.96],
    ],
  ],
};

/** Rải đều một polyline thành các điểm cách nhau ~step px. */
function resample(poly: Pt[], step: number): Pt[] {
  if (poly.length < 2) return poly.slice();
  const out: Pt[] = [poly[0]];
  let a = poly[0];
  for (let i = 1; i < poly.length; i++) {
    const b = poly[i];
    let dist = Math.hypot(b[0] - a[0], b[1] - a[1]);
    while (dist >= step) {
      const t = step / dist;
      const np: Pt = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      out.push(np);
      a = np;
      dist = Math.hypot(b[0] - a[0], b[1] - a[1]);
    }
    a = b;
  }
  return out;
}

interface DropPt {
  x: number;
  y: number;
  penUp: boolean;
}

/** Dựng danh sách điểm thả ảnh (toạ độ client px) vẽ thành `text` trong rect. */
function buildWordPoints(
  text: string,
  rect: DOMRect,
  imgSize: number
): DropPt[] {
  const chars = [...text].filter(c => GLYPHS[c]);
  if (!chars.length) return [];

  // 1) ghép strokes của các ký tự theo phương ngang (toạ độ layout).
  const strokesL: Pt[][] = [];
  let adv = 0;
  for (const c of chars) {
    for (const s of GLYPHS[c]) {
      strokesL.push(s.map(([x, y]) => [x + adv, y] as Pt));
    }
    adv += GLYPH_W + GLYPH_GAP;
  }
  const spanX = adv - GLYPH_GAP;

  // 2) scale giữ tỉ lệ, canh giữa trong vùng vẽ.
  const drawW = rect.width * 0.82;
  const drawH = rect.height * 0.46;
  const scale = Math.min(drawW / spanX, drawH / 1);
  const offX = rect.left + (rect.width - spanX * scale) / 2;
  const offY = rect.top + (rect.height - scale) / 2;
  const step = Math.max(34, imgSize * 0.42);

  // 3) map sang client px + rải đều; điểm đầu mỗi stroke = nhấc bút.
  const pts: DropPt[] = [];
  for (const s of strokesL) {
    const mapped: Pt[] = s.map(([x, y]) => [
      offX + x * scale,
      offY + y * scale,
    ]);
    resample(mapped, step).forEach((p, i) =>
      pts.push({ x: p[0], y: p[1], penUp: i === 0 })
    );
  }
  return pts;
}

/**
 * Image Trail — port từ CodeGrid "Burocratik image trail" (243_…, vanilla DOM
 * + CSS transition, zero-dep). Rê con trỏ trong block → ảnh lần lượt mọc tại
 * vị trí con trỏ (xoay ngẫu nhiên, scale 0→1) rồi tự thu nhỏ biến mất.
 *
 * Khác bản gốc: nghe pointer trên ROOT của block (không phải document) → chỉ
 * phản ứng khi hover trong block, mini-preview đứng yên. Tôn trọng
 * reduced-motion. Thao tác DOM trực tiếp (không render ảnh qua React) + cleanup.
 *
 * `autoDemo` + `autoDemoText` → shape mode: con trỏ ảo vẽ theo nét chữ để ảnh
 * xếp thành chuỗi (vd "2026"), giữ rồi mờ và lặp. Rê chuột thật → tắt hẳn demo,
 * quay về trail thường.
 */
export function ImageTrail({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: ImageTrailProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const rootRef = React.useRef<HTMLDivElement>(null);
  const images = React.useMemo(
    () => (Array.isArray(content.images) ? content.images : []),
    [content.images]
  );
  const threshold = content.threshold ?? 100;
  const lifespan = content.lifespan ?? 750;
  const inDuration = content.inDuration ?? 750;
  const outDuration = content.outDuration ?? 1000;
  const autoDemo = content.autoDemo ?? false;

  React.useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || images.length === 0) return;

    const root = rootRef.current;
    if (!root) return;

    let mouseX = 0;
    let mouseY = 0;
    let lastX = 0;
    let lastY = 0;
    let inside = false;
    let lastRemoval = 0;
    const removalDelay = 50;
    const trail: { el: HTMLImageElement; rot: number; removeAt: number }[] = [];
    let raf = 0;

    const createImage = (size = 180) => {
      const rect = root.getBoundingClientRect();
      const img = document.createElement('img');
      const rot = (Math.random() - 0.5) * 50;
      img.src = images[Math.floor(Math.random() * images.length)];
      img.alt = '';
      img.className = 'pointer-events-none absolute z-[1] rounded';
      img.style.width = `${size}px`;
      img.style.height = `${size}px`;
      img.style.objectFit = 'cover';
      img.style.left = `${mouseX - rect.left}px`;
      img.style.top = `${mouseY - rect.top}px`;
      img.style.transformOrigin = 'center';
      img.style.willChange = 'transform';
      img.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(0)`;
      img.style.transition = `transform ${inDuration}ms ${IN_EASE}`;
      root.appendChild(img);
      // ép reflow rồi animate vào.
      window.setTimeout(() => {
        img.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(1)`;
      }, 10);
      trail.push({ el: img, rot, removeAt: Date.now() + lifespan });
    };

    const movedEnough = () =>
      Math.hypot(mouseX - lastX, mouseY - lastY) > threshold;

    const removeOld = () => {
      const now = Date.now();
      if (now - lastRemoval < removalDelay || trail.length === 0) return;
      if (now >= trail[0].removeAt) {
        const item = trail.shift()!;
        item.el.style.transition = `transform ${outDuration}ms ${OUT_EASE}`;
        item.el.style.transform = `translate(-50%, -50%) rotate(${item.rot}deg) scale(0)`;
        lastRemoval = now;
        window.setTimeout(() => item.el.remove(), outDuration);
      }
    };

    // ── attract mode: con trỏ ảo lang thang khi user chưa tương tác ──
    let attract = autoDemo;
    let started = false;
    let tx = 0;
    let ty = 0;
    let vx = 0;
    let vy = 0;
    const pickTarget = () => {
      const rect = root.getBoundingClientRect();
      tx = rect.left + rect.width * (0.12 + Math.random() * 0.76);
      ty = rect.top + rect.height * (0.18 + Math.random() * 0.64);
    };

    // ── shape mode: con trỏ ảo vẽ theo nét chuỗi autoDemoText (vd "2026") ──
    // Không có autoDemoText (hoặc chuỗi không chứa ký tự nào trong GLYPHS) →
    // shapeMode = false → rơi về attract mode y như trước.
    const shapeText = (content.autoDemoText ?? '').trim();
    const shapeMode = autoDemo && [...shapeText].some(c => GLYPHS[c]);
    const SHAPE_SIZE = 132;
    let wordPts: DropPt[] = [];
    let wi = 0;
    let phase: 'draw' | 'hold' | 'fade' = 'draw';
    let phaseUntil = 0;
    const buildWord = () => {
      wordPts = buildWordPoints(
        shapeText,
        root.getBoundingClientRect(),
        SHAPE_SIZE
      );
      wi = 0;
      phase = 'draw';
    };
    const fadeAll = () => {
      while (trail.length) {
        const item = trail.shift()!;
        item.el.style.transition = `transform ${outDuration}ms ${OUT_EASE}`;
        item.el.style.transform = `translate(-50%, -50%) rotate(${item.rot}deg) scale(0)`;
        window.setTimeout(() => item.el.remove(), outDuration);
      }
    };
    const tickShape = () => {
      const now = Date.now();
      if (phase === 'draw') {
        if (!wordPts.length) buildWord();
        if (!wordPts.length) return; // chuỗi không có ký tự hỗ trợ
        const p = wordPts[wi];
        if (p.penUp) {
          // nhấc bút: nhảy thẳng tới đầu nét rồi thả ảnh, không vẽ nối khe hở.
          vx = p.x;
          vy = p.y;
          mouseX = p.x;
          mouseY = p.y;
          createImage(SHAPE_SIZE);
          wi++;
        } else {
          vx += (p.x - vx) * 0.3;
          vy += (p.y - vy) * 0.3;
          if (Math.hypot(p.x - vx, p.y - vy) < 12) {
            mouseX = p.x;
            mouseY = p.y;
            createImage(SHAPE_SIZE);
            wi++;
          }
        }
        if (wi >= wordPts.length) {
          phase = 'hold';
          phaseUntil = now + 1500;
        }
      } else if (phase === 'hold') {
        if (now >= phaseUntil) {
          fadeAll();
          phase = 'fade';
          phaseUntil = now + outDuration + 200;
        }
      } else if (phase === 'fade') {
        if (now >= phaseUntil) buildWord();
      }
    };

    const tick = () => {
      // shape mode chỉ chạy khi user chưa tương tác; rê chuột thật → trail thường.
      if (shapeMode && attract) {
        tickShape();
        raf = requestAnimationFrame(tick);
        return;
      }
      if (attract) {
        if (!started) {
          const rect = root.getBoundingClientRect();
          vx = rect.left + rect.width / 2;
          vy = rect.top + rect.height / 2;
          pickTarget();
          started = true;
        }
        vx += (tx - vx) * 0.075;
        vy += (ty - vy) * 0.075;
        mouseX = vx;
        mouseY = vy;
        inside = true;
        if (Math.hypot(tx - vx, ty - vy) < 28) pickTarget();
      }
      if (inside && movedEnough()) {
        lastX = mouseX;
        lastY = mouseY;
        createImage();
      }
      removeOld();
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      attract = false; // user rê chuột thật → tắt chào mời
      mouseX = e.clientX;
      mouseY = e.clientY;
      inside = true;
    };
    const onLeave = () => {
      inside = false;
    };

    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
      trail.forEach(t => t.el.remove());
    };
  }, [
    images,
    threshold,
    lifespan,
    inDuration,
    outDuration,
    autoDemo,
    content.autoDemoText,
  ]);

  return (
    <div
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in @container relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden rounded-md bg-[#f4f1ea] duration-500 ease-out',
        className
      )}
    >
      <div className='pointer-events-none relative z-[2] flex flex-col items-center gap-2 px-6 text-center'>
        {content.eyebrow && (
          <span
            data-element-key='eyebrow'
            style={styleOf('eyebrow')}
            className={selectableClass(
              activeKey === 'eyebrow',
              'text-2xs text-content-muted pointer-events-auto font-semibold tracking-[0.32em] uppercase @2xl:text-xs'
            )}
          >
            {content.eyebrow}
          </span>
        )}
        {content.title && (
          <h2
            data-element-key='title'
            style={styleOf('title')}
            className={selectableClass(
              activeKey === 'title',
              'text-foreground pointer-events-auto text-2xl font-semibold tracking-tight @2xl:text-4xl'
            )}
          >
            {content.title}
          </h2>
        )}
      </div>
    </div>
  );
}
