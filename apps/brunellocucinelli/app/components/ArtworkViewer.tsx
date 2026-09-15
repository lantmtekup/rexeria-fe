'use client';

import Image from 'next/image';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { gsap } from '../lib/motion';
import { toggleMuted, useMuted } from '../lib/audio';
import type { EpArtwork } from '../lib/highlights';
import { getLenis } from './SmoothScrollProvider';
import { iconButton as headerIconButton } from './Header';

// Trên tranh (nền gần trắng) nút tròn cần bóng nhẹ mới tách khỏi nền.
const iconButton = `${headerIconButton} shadow-[0_2px_14px_rgba(40,40,30,0.08)]`;

/**
 * Trình xem artwork toàn màn (trang mẫu: `epartwork-container` + `ep-webxp`).
 * Tranh là app EpicPaper nhúng qua iframe `art.solomei.ai` — kéo để di
 * chuyển, cuộn để zoom đều nằm trong iframe.
 *
 * Điều khiển chương dùng đúng giao thức postMessage của
 * `webxp-integration.min.js`: gửi `{ fct, data: [...] }` vào iframe; iframe
 * trả `{ fct, url, data }`. Không nạp script đó (nó quét `.ep-webxp` lúc
 * DOMContentLoaded nên không nhận iframe tạo sau).
 */
const WEBXP = 'https://art.solomei.ai';
const FEATURES = [
  'visitBookmark',
  'onBookmarkNearby',
  'showNavBar',
  'showTravelButtons',
  'readyEvent',
];

const HINTS_DESKTOP = [
  {
    icon: '/00-ui/move_desktop-B_mU2jT5.svg',
    label: 'Grab and move in all directions',
  },
  {
    icon: encodeURI('/00-ui/mouse scroll_desktop-Driub86M.svg'),
    label: 'Scroll to zoom',
  },
];
const HINTS_MOBILE = [
  { icon: '/00-ui/move_mobile-OqKiVeW0.svg', label: 'Move in all directions' },
  {
    icon: encodeURI('/00-ui/zoom out_mobile-hile_IXX.svg'),
    label: 'Pinch to zoom out',
  },
  {
    icon: encodeURI('/00-ui/zoom in_mobile-DT7RbnR9.svg'),
    label: 'Pinch to zoom in',
  },
  { icon: '/00-ui/chapters_mobile-CyPpR6Pj.svg', label: 'Chapters guide' },
];

type Bookmark =
  | string
  | { name?: string; id?: string; zoomFactor?: number; zoom?: number };

const bookmarkName = (b: Bookmark) =>
  typeof b === 'string' ? b : (b.name ?? b.id);
const bookmarkZoom = (b: Bookmark) =>
  typeof b === 'string' ? undefined : (b.zoomFactor ?? b.zoom);

type ArtworkViewerProps = {
  ep: EpArtwork;
  open: boolean;
  onClose: () => void;
};

export default function ArtworkViewer({
  ep,
  open,
  onClose,
}: ArtworkViewerProps) {
  const [mounted, setMounted] = useState(false);
  const [rendered, setRendered] = useState(open);
  const [loaded, setLoaded] = useState(false);
  const [current, setCurrent] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hintOpen, setHintOpen] = useState(true);
  const muted = useMuted();

  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  const src = `${WEBXP}/?id=${ep.id}&showNavBar=false&showTravelButtons=false`;

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (open) {
      setRendered(true);
      setHintOpen(true);
      setMenuOpen(false);
    }
  }, [open]);

  const send = useCallback((fct: string, ...data: unknown[]) => {
    frameRef.current?.contentWindow?.postMessage({ fct, data }, '*');
  }, []);

  // Mở/đóng: fade 0.4s như trang mẫu; khoá cuộn trang phía sau.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !rendered) return;
    const lenis = getLenis();
    if (open) {
      lenis?.stop();
      document.documentElement.style.overflow = 'hidden';
      gsap.fromTo(
        root,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.4, ease: 'power2.out' }
      );
    } else {
      gsap.to(root, {
        autoAlpha: 0,
        duration: 0.4,
        ease: 'power2.out',
        onComplete: () => {
          document.documentElement.style.overflow = '';
          lenis?.start();
          setRendered(false);
          setLoaded(false);
        },
      });
    }
  }, [open, rendered]);

  // Esc đóng menu trước, rồi đóng trình xem.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (menuOpen) setMenuOpen(false);
      else onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, menuOpen, onClose]);

  // Tin nhắn từ tranh: sẵn sàng → ẩn thanh điều hướng mặc định; bookmark gần
  // → cập nhật chương hiện tại, người dùng đã zoom thì ẩn gợi ý.
  useEffect(() => {
    if (!rendered) return;
    const init = () => {
      send('areFeaturesAvailable', FEATURES);
      send('showNavBar', false);
      send('showTravelButtons', false);
      send('nearbyBookmarkRequest', 0);
    };
    const onMessage = (e: MessageEvent) => {
      if (e.source !== frameRef.current?.contentWindow) return;
      const { fct, data } = (e.data ?? {}) as {
        fct?: string;
        data?: unknown[];
      };
      if (fct === 'readyEvent') init();
      if (fct !== 'onBookmarkNearby' || !Array.isArray(data)) return;
      const raw = data[0];
      const list: Bookmark[] = Array.isArray(raw)
        ? raw
        : ((raw as { bookmarks?: Bookmark[] })?.bookmarks ?? []);
      const hit = list.find(b =>
        ep.chapters.some(c => c.id === bookmarkName(b))
      );
      if (!hit) return;
      const zoom = bookmarkZoom(hit);
      if (typeof zoom === 'number' && zoom > 0.04) setHintOpen(false);
      const i = ep.chapters.findIndex(c => c.id === bookmarkName(hit));
      if (i !== -1) setCurrent(i);
    };
    window.addEventListener('message', onMessage);
    const frame = frameRef.current;
    frame?.addEventListener('load', init);
    return () => {
      window.removeEventListener('message', onMessage);
      frame?.removeEventListener('load', init);
    };
  }, [rendered, ep.chapters, send]);

  // Menu chương trượt từ trái. Lần gắn đầu (mỗi lần mở trình xem) đặt thẳng
  // vị trí đóng, không animate — tránh menu lướt qua màn lúc mở.
  const menuPlaced = useRef(false);
  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) {
      menuPlaced.current = false;
      return;
    }
    if (!menuPlaced.current) {
      gsap.set(menu, { xPercent: -100 });
      menuPlaced.current = true;
      return;
    }
    gsap.to(menu, {
      xPercent: menuOpen ? 0 : -100,
      duration: 0.6,
      ease: 'quart.out',
      overwrite: true,
    });
  }, [menuOpen, rendered]);

  const goTo = (i: number) => {
    setCurrent(i);
    setHintOpen(false);
    send('visitBookmark', ep.chapters[i].id);
    if (window.matchMedia('(max-width: 767px)').matches) setMenuOpen(false);
  };

  if (!mounted || !rendered) return null;

  const pill =
    'pointer-events-auto flex items-center gap-4 rounded-full bg-white/90 shadow-[0_2px_14px_rgba(40,40,30,0.08)] py-2 pr-2 pl-5 text-[15px] text-neutral-900 backdrop-blur transition-colors hover:bg-white md:text-[17px]';

  const hintClose = (
    <button
      type='button'
      aria-label='Close help'
      tabIndex={hintOpen ? 0 : -1}
      onClick={e => {
        e.stopPropagation();
        setHintOpen(false);
      }}
      className='absolute top-2.5 right-2.5 grid size-9 place-items-center rounded-full transition-colors hover:bg-black/5 active:scale-[0.96]'
    >
      <Image
        src='/00-ui/close.svg'
        alt=''
        width={30}
        height={30}
        className='size-5'
      />
    </button>
  );

  return createPortal(
    <div
      ref={rootRef}
      role='dialog'
      aria-modal='true'
      aria-label={ep.title}
      data-lenis-prevent
      className='font-fell invisible fixed inset-0 z-[100] bg-[#F8F8F6]'
    >
      <iframe
        ref={frameRef}
        src={src}
        title={ep.title}
        allow='fullscreen'
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Lớp UI — không bắt chuột trừ các nút, để kéo/zoom xuyên vào tranh. */}
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute top-4 left-4'>
          <button
            type='button'
            title='Music'
            aria-label={muted ? 'Turn music on' : 'Turn music off'}
            aria-pressed={!muted}
            onClick={toggleMuted}
            className={iconButton}
          >
            <Image
              src={muted ? '/00-ui/audio-off.svg' : '/00-ui/audio-on.svg'}
              alt=''
              width={30}
              height={30}
              className='size-6 md:size-[30px]'
            />
          </button>
        </div>

        <div className='absolute top-4 right-4'>
          <button
            type='button'
            aria-label='Close artwork'
            onClick={onClose}
            className={iconButton}
          >
            <Image
              src='/00-ui/close.svg'
              alt=''
              width={30}
              height={30}
              className='size-6 md:size-[30px]'
            />
          </button>
        </div>

        {/* Tiêu đề chương hiện tại — nền tan mềm như ep-overlay. */}
        <p
          aria-live='polite'
          className='absolute top-4 left-1/2 w-max max-w-[calc(100vw-8.5rem)] -translate-x-1/2 rounded-[10px] bg-white/35 px-4 py-2 text-center text-[20px] leading-[1.25] text-balance text-neutral-900 backdrop-blur-md md:top-5 md:px-8 md:text-[24px]'
        >
          {ep.chapters[current]?.title ?? ep.title}
        </p>

        {/* Gợi ý thao tác — desktop: góc dưới phải, chuột; mobile: giữa màn,
            cảm ứng (4 dòng như trang mẫu). Tắt bằng nút ✕ góc bảng; mobile
            chạm vào bảng cũng tắt. */}
        <div
          aria-hidden={!hintOpen}
          className={`absolute right-4 bottom-20 hidden w-[18.75rem] flex-col gap-6 rounded-xl bg-white/50 px-9 py-8 text-[17px] leading-snug text-neutral-900 backdrop-blur-md transition-[opacity,transform] duration-500 md:flex ${hintOpen ? 'pointer-events-auto translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}
        >
          {hintClose}
          {HINTS_DESKTOP.map(h => (
            <div key={h.label} className='flex items-center gap-8'>
              <Image src={h.icon} alt='' width={35} height={35} />
              <span>{h.label}</span>
            </div>
          ))}
        </div>
        <div
          aria-hidden={!hintOpen}
          onClick={() => setHintOpen(false)}
          className={`absolute top-1/2 left-1/2 flex w-[min(20rem,calc(100vw-5rem))] -translate-x-1/2 -translate-y-[42%] flex-col gap-9 rounded-xl bg-white/55 px-10 py-10 text-[18px] leading-snug text-neutral-900 backdrop-blur-md transition-opacity duration-500 md:hidden ${hintOpen ? 'pointer-events-auto opacity-100' : 'opacity-0'}`}
        >
          {hintClose}
          {HINTS_MOBILE.map(h => (
            <span key={h.label} className='flex items-center gap-8'>
              <Image
                src={h.icon}
                alt=''
                width={34}
                height={34}
                className='size-10 shrink-0'
              />
              <span>{h.label}</span>
            </span>
          ))}
        </div>

        {/* Dưới trái: Chapters — pill có chữ trên desktop, nút tròn trên mobile. */}
        <div className='absolute bottom-4 left-4'>
          <button
            type='button'
            aria-label='Chapters'
            onClick={() => setMenuOpen(true)}
            className={`${iconButton} md:hidden`}
          >
            <Image
              src='/00-ui/chapters-book.svg'
              alt=''
              width={30}
              height={19}
              className='h-auto w-6'
            />
          </button>
          <button
            type='button'
            onClick={() => setMenuOpen(true)}
            className={`${pill} hidden md:flex`}
          >
            <Image
              src='/00-ui/chapters-book.svg'
              alt=''
              width={30}
              height={19}
              className='-ml-1 h-auto w-7'
            />
            <span className='pr-3'>Chapters</span>
          </button>
        </div>

        {/* Dưới phải: Help — tương tự. */}
        <div className='absolute right-4 bottom-4'>
          <button
            type='button'
            aria-label='Help'
            aria-pressed={hintOpen}
            onClick={() => setHintOpen(h => !h)}
            className={`${iconButton} md:hidden`}
          >
            <Image
              src='/00-ui/help.svg'
              alt=''
              width={30}
              height={30}
              className='size-7'
            />
          </button>
          <button
            type='button'
            aria-pressed={hintOpen}
            onClick={() => setHintOpen(h => !h)}
            className={`${pill} hidden md:flex`}
          >
            <span>Help</span>
            <Image
              src='/00-ui/help.svg'
              alt=''
              width={30}
              height={30}
              className='size-8'
            />
          </button>
        </div>
      </div>

      {/* Menu chương: timeline chấm + vạch dọc. */}
      <nav
        ref={menuRef}
        aria-label='Chapters'
        aria-hidden={!menuOpen}
        className='absolute inset-y-0 left-0 flex w-full flex-col bg-white/80 backdrop-blur-2xl md:w-[22.75rem]'
      >
        <div className='flex justify-end px-8 pt-5'>
          <button
            type='button'
            aria-label='Close chapters'
            onClick={() => setMenuOpen(false)}
            className='grid size-10 place-items-center rounded-full transition-colors hover:bg-black/5'
          >
            <Image src='/00-ui/menu-close.svg' alt='' width={22} height={20} />
          </button>
        </div>
        <ol
          className='relative flex-1 overflow-y-auto px-12 pt-2 pb-8'
          data-lenis-prevent
        >
          {ep.chapters.map((c, i) => {
            const active = i === current;
            return (
              <li key={c.id} className='relative'>
                {/* Vạch nối giữa các chấm (không vẽ dưới chấm cuối). */}
                {i < ep.chapters.length - 1 && (
                  <span
                    aria-hidden
                    className='absolute top-1/2 left-[5px] h-full w-px bg-neutral-900'
                  />
                )}
                <button
                  type='button'
                  onClick={() => goTo(i)}
                  aria-current={active ? 'step' : undefined}
                  className='relative flex w-full items-center gap-8 py-[1.3rem] text-left text-[15px] text-neutral-900'
                >
                  <span
                    aria-hidden
                    className='relative grid size-[11px] shrink-0 place-items-center rounded-full bg-neutral-900'
                  >
                    {active && (
                      <span className='absolute size-[17px] rounded-full border border-neutral-900 bg-[#f1f1f1]'>
                        <span className='absolute inset-[3px] rounded-full bg-neutral-900' />
                      </span>
                    )}
                  </span>
                  <span
                    className={active ? 'font-semibold' : 'hover:underline'}
                  >
                    {c.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <p className='px-14 pb-8 text-[17px] tracking-wide uppercase'>
          Chapters
        </p>
      </nav>
    </div>,
    document.body
  );
}
