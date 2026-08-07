'use client';

/**
 * 3D Image Scroll — port từ Codegrid cg-3d-slider-threejs (discord 215).
 *
 * Live: sticky pin + Three.js curved plane; ScrollTrigger scrub offset texture
 * (ảnh + tiêu đề vẽ lên canvas texture). Bỏ chữ 4 góc nav/footer.
 * Canvas: lưới phẳng tất cả slide để edit title/ảnh.
 */

import * as React from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

import { cn } from '@/lib/cn';

import { useLandingMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  Cg3dSliderContent,
  Cg3dSliderSlide,
  ElementPositionsMap,
  ElementStylesMap,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import {
  CG_3D_SLIDER_DEFAULT_SLIDES,
  resolveCg3dSliderSlides,
} from './_registry/defs/cg3dSlider';
import { useIsCanvasEdit } from './useIsCanvasEdit';

interface Props {
  content: Cg3dSliderContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

const COLORS = {
  bg: '#000000',
  title: '#ffffff',
  overlayEdge: 'rgba(0,0,0,0.5)',
} as const;

const RESPONSIVE = {
  titleFont: 'clamp(28px, 6cqi, 56px)',
  canvasSlideMinH: 'clamp(220px, 36cqi, 380px)',
  padding: 'clamp(16px, 2cqi, 24px)',
} as const;

const PARENT_WIDTH = 20;
const PARENT_HEIGHT = 75;
const CURVATURE = 35;
const SEGMENTS = 200;
const SLIDE_HEIGHT = 15;
const GAP = 0.5;
const TEXTURE_W = 2048;
const TEXTURE_H = 8192;
const TITLE_FONT = '500 180px system-ui, -apple-system, sans-serif';

const loadImage = (src: string): Promise<HTMLImageElement | null> =>
  new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

const clipRoundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r = 24
) => {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.clip();
    return;
  }
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
};

export function Cg3dSlider({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const pinTrackRef = React.useRef<HTMLDivElement>(null);
  const stickyRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const { hasRoot, scroller, requestRefresh } = useLandingMotion();
  const isCanvas = useIsCanvasEdit(rootRef);

  const slides = React.useMemo(
    () => resolveCg3dSliderSlides(content),
    [content.slides]
  );

  const slidesKey = React.useMemo(
    () =>
      slides
        .map(s => `${s.title ?? ''}|${s.imageUrl ?? ''}|${s.imageAlt ?? ''}`)
        .join('||'),
    [slides]
  );

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  React.useEffect(() => {
    const pinTrack = pinTrackRef.current;
    const sticky = stickyRef.current;
    const canvas = canvasRef.current;
    if (!pinTrack || !sticky || !canvas || slides.length === 0) return;
    if (isCanvas || !hasRoot) return;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let disposed = false;
    let renderer: THREE.WebGLRenderer | null = null;
    let texture: THREE.CanvasTexture | null = null;
    let parentGeometry: THREE.PlaneGeometry | null = null;
    let parentMaterial: THREE.MeshBasicMaterial | null = null;
    let ro: ResizeObserver | null = null;
    let st: ScrollTrigger | null = null;

    const totalSlides = slides.length;
    const cycleHeight = totalSlides * (SLIDE_HEIGHT + GAP);

    const run = async () => {
      const images = await Promise.all(
        slides.map((slide, i) => {
          const fallback =
            CG_3D_SLIDER_DEFAULT_SLIDES[i % CG_3D_SLIDER_DEFAULT_SLIDES.length];
          const src = slide.imageUrl?.trim() || fallback.imageUrl || '';
          return src ? loadImage(src) : Promise.resolve(null);
        })
      );
      if (disposed) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);

      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: 'high-performance',
        alpha: false,
      });
      renderer.setClearColor(0x000000);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      parentGeometry = new THREE.PlaneGeometry(
        PARENT_WIDTH,
        PARENT_HEIGHT,
        SEGMENTS,
        SEGMENTS
      );
      const positionsAttr = parentGeometry.attributes.position
        .array as Float32Array;
      for (let i = 0; i < positionsAttr.length; i += 3) {
        const y = positionsAttr[i + 1];
        const distanceFromCenter = Math.abs(y / (PARENT_HEIGHT / 2));
        positionsAttr[i + 2] = Math.pow(distanceFromCenter, 2) * CURVATURE;
      }
      parentGeometry.computeVertexNormals();

      const textureCanvas = document.createElement('canvas');
      const ctx = textureCanvas.getContext('2d', {
        alpha: false,
        willReadFrequently: false,
      });
      if (!ctx) return;

      textureCanvas.width = TEXTURE_W;
      textureCanvas.height = TEXTURE_H;

      texture = new THREE.CanvasTexture(textureCanvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(
        4,
        renderer.capabilities.getMaxAnisotropy()
      );

      parentMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
      });
      const parentMesh = new THREE.Mesh(parentGeometry, parentMaterial);
      parentMesh.rotation.x = THREE.MathUtils.degToRad(-20);
      parentMesh.rotation.y = THREE.MathUtils.degToRad(20);
      scene.add(parentMesh);

      const distance = 17.5;
      const heightOffset = 5;
      const offsetX = distance * Math.sin(THREE.MathUtils.degToRad(20));
      const offsetZ = distance * Math.cos(THREE.MathUtils.degToRad(20));
      camera.position.set(offsetX, heightOffset, offsetZ);
      camera.lookAt(0, -2, 0);
      camera.rotation.z = THREE.MathUtils.degToRad(-5);

      const updateTexture = (offset = 0) => {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, textureCanvas.width, textureCanvas.height);
        ctx.font = TITLE_FONT;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const extraSlides = 2;
        for (let i = -extraSlides; i < totalSlides + extraSlides; i++) {
          let slideY = -i * (SLIDE_HEIGHT + GAP);
          slideY += offset * cycleHeight;

          const textureY = (slideY / cycleHeight) * textureCanvas.height;
          let wrappedY = textureY % textureCanvas.height;
          if (wrappedY < 0) wrappedY += textureCanvas.height;

          const slideIndex = ((-i % totalSlides) + totalSlides) % totalSlides;
          const slide = slides[slideIndex];
          const fallback =
            CG_3D_SLIDER_DEFAULT_SLIDES[
              slideIndex % CG_3D_SLIDER_DEFAULT_SLIDES.length
            ];
          const title =
            slide?.title?.trim() || fallback.title || `Slide ${slideIndex + 1}`;

          const slideRect = {
            x: textureCanvas.width * 0.05,
            y: wrappedY,
            width: textureCanvas.width * 0.9,
            height: (SLIDE_HEIGHT / cycleHeight) * textureCanvas.height,
          };

          const img = images[slideIndex];
          if (img) {
            const imgAspect = img.width / img.height;
            const rectAspect = slideRect.width / slideRect.height;
            let drawWidth: number;
            let drawHeight: number;
            let drawX: number;
            let drawY: number;

            if (imgAspect > rectAspect) {
              drawHeight = slideRect.height;
              drawWidth = drawHeight * imgAspect;
              drawX = slideRect.x + (slideRect.width - drawWidth) / 2;
              drawY = slideRect.y;
            } else {
              drawWidth = slideRect.width;
              drawHeight = drawWidth / imgAspect;
              drawX = slideRect.x;
              drawY = slideRect.y + (slideRect.height - drawHeight) / 2;
            }

            ctx.save();
            clipRoundRect(
              ctx,
              slideRect.x,
              slideRect.y,
              slideRect.width,
              slideRect.height
            );
            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
            ctx.restore();

            ctx.fillStyle = COLORS.title;
            ctx.fillText(
              title,
              textureCanvas.width / 2,
              wrappedY + slideRect.height / 2
            );
          }
        }

        if (texture) texture.needsUpdate = true;
      };

      const resize = () => {
        if (!renderer) return;
        const w = Math.max(1, sticky.clientWidth);
        const h = Math.max(1, sticky.clientHeight);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
        renderer.render(scene, camera);
      };

      resize();
      ro = new ResizeObserver(() => resize());
      ro.observe(sticky);

      updateTexture(reduced ? 0 : 0);
      renderer.render(scene, camera);

      if (!reduced) {
        st = ScrollTrigger.create({
          trigger: pinTrack,
          scroller: scroller ?? undefined,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: self => {
            updateTexture(-self.progress);
            renderer?.render(scene, camera);
          },
        });
      }

      requestRefresh();
    };

    void run();

    return () => {
      disposed = true;
      st?.kill();
      ro?.disconnect();
      parentGeometry?.dispose();
      parentMaterial?.dispose();
      texture?.dispose();
      renderer?.dispose();
    };
  }, [slides, slidesKey, isCanvas, hasRoot, scroller, requestRefresh]);

  if (slides.length === 0) return null;

  const renderCanvasSlide = (slide: Cg3dSliderSlide, i: number) => {
    const titleKey = `slides[${i}].title`;
    const imageKey = `slides[${i}].imageUrl`;
    const fallback =
      CG_3D_SLIDER_DEFAULT_SLIDES[i % CG_3D_SLIDER_DEFAULT_SLIDES.length];
    const imageUrl = slide.imageUrl?.trim() || fallback.imageUrl || '';
    const imageAlt =
      slide.imageAlt?.trim() || slide.title?.trim() || fallback.imageAlt;
    const title = slide.title?.trim() || fallback.title || `Slide ${i + 1}`;

    return (
      <article
        key={`canvas-slide-${i}`}
        className='relative overflow-hidden'
        style={{
          minHeight: RESPONSIVE.canvasSlideMinH,
          backgroundColor: COLORS.bg,
        }}
      >
        <div
          data-element-key={imageKey}
          className={selectableClass(
            activeKey === imageKey,
            'pointer-events-auto absolute inset-0'
          )}
          style={composeStyle(undefined, styleOf(imageKey))}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={imageAlt}
            className='pointer-events-none h-full w-full object-cover'
            draggable={false}
          />
        </div>
        <div
          className='pointer-events-none absolute inset-0'
          style={{
            background:
              'radial-gradient(circle, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)',
          }}
        />
        <h2
          data-element-key={titleKey}
          className={selectableClass(
            activeKey === titleKey,
            'pointer-events-auto absolute inset-x-4 bottom-6 z-1 m-0 text-center'
          )}
          style={composeStyle(
            {
              color: COLORS.title,
              fontSize: RESPONSIVE.titleFont,
              fontWeight: 500,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            },
            styleOf(titleKey)
          )}
        >
          {title}
        </h2>
      </article>
    );
  };

  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit='true'
        className={cn('c3d @container relative w-full', className)}
        style={composeStyle(
          { backgroundColor: COLORS.bg },
          blockBackgroundStyle(background)
        )}
      >
        <div
          className='flex flex-col gap-4'
          style={{ padding: RESPONSIVE.padding }}
        >
          {slides.map((slide, i) => renderCanvasSlide(slide, i))}
        </div>
      </section>
    );
  }

  const pinVh = Math.max(7, slides.length) * 1.4;

  return (
    <section
      ref={rootRef}
      className={cn('c3d @container relative w-full', className)}
      style={composeStyle(
        { backgroundColor: COLORS.bg },
        blockBackgroundStyle(background)
      )}
    >
      <div
        ref={pinTrackRef}
        className='c3d-pin-track relative w-full'
        style={{ height: `calc(100svh * ${pinVh})` }}
      >
        <div
          ref={stickyRef}
          className='c3d-sticky top-0 w-full overflow-hidden'
          style={{
            position: 'sticky',
            height: '100svh',
            backgroundColor: COLORS.bg,
          }}
        >
          <canvas
            ref={canvasRef}
            className='absolute inset-0 h-full w-full'
            aria-hidden
          />
          <div
            className='pointer-events-none absolute inset-0 z-1'
            style={{
              background: `radial-gradient(circle, rgba(0,0,0,0) 75%, ${COLORS.overlayEdge} 100%)`,
            }}
          />
        </div>
      </div>
    </section>
  );
}
