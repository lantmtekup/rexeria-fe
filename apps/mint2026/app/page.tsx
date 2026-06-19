'use client';

// DEMO TẠM — "The Vault" showcase 2026 collection theo mạch 4 hồi. Xoá khi xong.
// Reveal (halo) → Collection (1 cơ chế cuộn ngang) → Craft (proof) → Invitation (lead).
// Desktop-first · 1 palette (tối + vàng) · 1 ngôn ngữ chuyển động (gloss + đèn rọi + tilt).
import * as React from 'react';

import { AccordionMedia } from '@/lib/block-editor/blocks/AccordionMedia';
import { Gallery3dDepth } from '@/lib/block-editor/blocks/Gallery3dDepth';
import { ImageExplosion } from '@/lib/block-editor/blocks/ImageExplosion';
import { ImageTrail } from '@/lib/block-editor/blocks/ImageTrail';

import { COINS, type Coin } from './coins';

const COIN_IMAGES = COINS.slice(0, 12).map(c => c.image);

// Ảnh minh hoạ "Vì sao đáng sở hữu" (Unsplash) — hợp chủ đề hơn ảnh coin.
const U = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;
const CRAFT_IMG = {
  gold: U('1624365169364-0640dd10e180'), // gold bullion bars
  vault: U('1582139329536-e7284fece509'), // bank vault door
  proof: U('1628058494685-6c2f796ac24a'), // craftsman/goldsmith hands
  heritage: U('1640549755250-04d2751c5aba'), // classical columns
};

export default function Vault() {
  const [selected, setSelected] = React.useState<Coin | null>(null);
  const [active, setActive] = React.useState(0);

  const coins = COINS;

  const sectionRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const spotRef = React.useRef<HTMLDivElement>(null);
  const revealRef = React.useRef<HTMLDivElement>(null);
  const revealInnerRef = React.useRef<HTMLDivElement>(null);
  const inviteRef = React.useRef<HTMLElement>(null);
  const pointer = React.useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = e.clientX / window.innerWidth - 0.5;
      pointer.current.y = e.clientY / window.innerHeight - 0.5;
      // spotlight bám chuột cho Hồi IV (Lời mời)
      const inv = inviteRef.current;
      if (inv) {
        const r = inv.getBoundingClientRect();
        inv.style.setProperty('--mx', `${e.clientX - r.left}px`);
        inv.style.setProperty('--my', `${e.clientY - r.top}px`);
      }
    };
    window.addEventListener('pointermove', onMove);

    const tick = () => {
      // Parallax: gallery "cửa hầm" drift + scale theo tiến trình cuộn qua section.
      const rv = revealRef.current;
      const ri = revealInnerRef.current;
      if (rv && ri) {
        const r = rv.getBoundingClientRect();
        const d = rv.offsetHeight - window.innerHeight;
        const pr = d > 0 ? Math.min(1, Math.max(0, -r.top / d)) : 0;
        const drift = reduce ? 0 : (pr - 0.5) * -140;
        const sc = reduce ? 1 : 1.08 - pr * 0.08;
        ri.style.transform = `translateY(${drift}px) scale(${sc})`;
      }
      const section = sectionRef.current;
      const track = trackRef.current;
      if (section && track) {
        const vw = window.innerWidth;
        const rect = section.getBoundingClientRect();
        const dist = section.offsetHeight - window.innerHeight;
        const p = dist > 0 ? Math.min(1, Math.max(0, -rect.top / dist)) : 0;
        const maxX = Math.max(0, track.scrollWidth - vw);
        track.style.transform = `translate3d(${-p * maxX}px,0,0)`;

        let best = 0;
        let bestD = Infinity;
        cardRefs.current.forEach((el, i) => {
          if (!el) return;
          const r = el.getBoundingClientRect();
          const c = r.left + r.width / 2;
          const d = Math.abs(c - vw / 2) / (vw / 2);
          if (d < bestD) {
            bestD = d;
            best = i;
          }
          const scale = reduce ? 1 : Math.max(0.55, 1.16 - d * 0.62);
          el.style.opacity = String(Math.max(0.25, 1 - d * 0.7));
          el.style.zIndex = String(1000 - Math.round(d * 1000));
          const inner = el.firstElementChild as HTMLElement | null;
          if (inner) {
            const baseTilt = reduce ? 0 : ((c - vw / 2) / vw) * 16;
            const mt = d < 0.25 && !reduce ? pointer.current : { x: 0, y: 0 };
            inner.style.transform = `scale(${scale}) rotateY(${baseTilt + mt.x * 10}deg) rotateX(${-mt.y * 8}deg)`;
            inner.classList.toggle('vault-live', d < 0.18 && !reduce);
          }
        });
        setActive(best);
        const el = cardRefs.current[best];
        if (spotRef.current && el) {
          const r = el.getBoundingClientRect();
          spotRef.current.style.setProperty(
            '--sx',
            `${r.left + r.width / 2}px`
          );
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
    };
  }, [coins.length]);

  const activeCoin = coins[active];

  return (
    <div className='relative bg-[#08070a] text-white'>
      <style>{VAULT_CSS}</style>

      {/* NEO UI cố định — luôn biết đang ở "The 2026 Collection" */}
      <header className='fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-4 md:px-10'>
        <div className='flex items-center gap-3'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src='/rcm-logo.svg'
            alt='Royal Canadian Mint'
            className='h-8 w-auto opacity-90 [filter:brightness(0)_invert(1)]'
          />
          <span className='hidden text-xs font-semibold tracking-[0.28em] text-white/80 uppercase sm:inline'>
            The 2026 Collection
          </span>
        </div>
        <a
          href='#invite'
          className='rounded-full border border-[#c9a96e]/50 px-4 py-1.5 text-[11px] font-semibold tracking-wide text-[#c9a96e] transition-colors hover:bg-[#c9a96e]/10'
        >
          Reserve yours
        </a>
      </header>

      {/* ───────── HỒI I · THE REVEAL — hero tương tác (image_trail) ───────── */}
      <section className='relative h-screen overflow-hidden'>
        {/* lớp tương tác: di chuột → coin hiện theo vệt (re-skin nền tối) */}
        <div className='absolute inset-0'>
          <ImageTrail
            content={{
              images: COIN_IMAGES,
              autoDemo: true,
              autoDemoText: '2026',
            }}
            background={{ color: '#08070a' }}
            className='!h-full !min-h-screen !rounded-none'
          />
        </div>
        <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(60vw_60vh_at_50%_42%,rgba(201,169,110,0.12),transparent_70%)]' />
        {/* copy overlay — pointer-events-none để vệt coin chạy xuyên qua */}
        <div className='pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center'>
          <p className='mb-4 text-[11px] font-semibold tracking-[0.4em] text-[#c9a96e] uppercase'>
            Royal Canadian Mint · 2026
          </p>
          <h1
            className='text-6xl leading-[0.95] font-light tracking-[-0.01em] md:text-8xl'
            style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
          >
            The collection of a year.
          </h1>
          <p className='mt-6 max-w-md text-sm leading-relaxed text-white/60'>
            Thirty treasures in pure gold and silver. Struck in limited mintage,
            each with its own story.
          </p>
          <div className='vault-hint-pill mt-8 inline-flex items-center gap-2.5 rounded-full border border-[#c9a96e]/40 bg-[#c9a96e]/10 py-2.5 pr-5 pl-2.5 backdrop-blur-sm'>
            <span className='vault-hint-ring relative flex size-9 items-center justify-center rounded-full border border-[#c9a96e]/50 bg-[#08070a]/40'>
              <svg
                viewBox='0 0 24 24'
                className='vault-hint-cursor size-4 fill-[#c9a96e]'
                aria-hidden
              >
                <path d='M5 3l15 9-6 1.5L11 20 5 3z' />
              </svg>
            </span>
            <span className='vault-hint-text text-[11px] font-semibold tracking-[0.2em] text-[#c9a96e] uppercase'>
              Move your cursor to wake the vault
            </span>
          </div>
        </div>
      </section>

      {/* Reveal "cửa hầm mở" — FULL-SCREEN + parallax theo scroll */}
      <section ref={revealRef} className='relative h-[180vh]'>
        <div className='sticky top-0 h-screen overflow-hidden'>
          <div
            ref={revealInnerRef}
            className='absolute inset-0 will-change-transform'
          >
            <Gallery3dDepth
              content={{
                eyebrow: 'The vault opens',
                title: '30 treasures, one collection',
                images: COIN_IMAGES.slice(0, 6),
              }}
              className='!h-screen !min-h-screen !w-full !rounded-none'
            />
          </div>
        </div>
      </section>

      {/* ───────── HỒI II · THE COLLECTION (full-screen, cuộn ngang) ───────── */}
      <section
        ref={sectionRef}
        style={{ height: `${coins.length * 48 + 40}vh` }}
        className='relative'
      >
        <div className='sticky top-0 h-screen overflow-hidden'>
          {/* nhãn hồi — gập vào panel để giữ full-screen liền mạch */}
          <div className='absolute top-20 left-6 z-30 md:left-10'>
            <p className='text-[11px] tracking-[0.3em] text-[#c9a96e] uppercase'>
              II · The Collection
            </p>
            <p className='mt-1 text-xs text-white/40'>Most coveted first</p>
          </div>
          <div
            ref={spotRef}
            className='pointer-events-none absolute inset-0'
            style={{
              background:
                'radial-gradient(40vw 60vh at var(--sx,50%) 46%, rgba(201,169,110,0.14), transparent 70%)',
            }}
          />
          {/* track: coin vào slot cao cố định + object-contain → spacing đều,
              căn lên trên để chừa đáy cho info (không bị đè) */}
          <div
            ref={trackRef}
            className='flex h-full items-center pb-[26vh] will-change-transform'
            style={{ paddingInline: '41.5vw', gap: '6vw' }}
          >
            {coins.map((coin, i) => (
              <button
                key={coin.url}
                ref={el => {
                  cardRefs.current[i] = el;
                }}
                type='button'
                onClick={() => setSelected(coin)}
                className='relative shrink-0'
                style={{ width: '17vw', perspective: '1000px' }}
              >
                <div className='vault-inner relative flex h-[40vh] items-center justify-center will-change-transform'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coin.image}
                    alt={coin.name}
                    className='max-h-full max-w-full object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]'
                    loading='lazy'
                  />
                  <span className='vault-gloss' />
                </div>
              </button>
            ))}
          </div>

          {activeCoin && (
            <div className='pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center bg-gradient-to-t from-[#08070a] via-[#08070a]/85 to-transparent px-6 pt-20 pb-12 text-center'>
              <span className='mb-2 rounded-full border border-[#c9a96e]/40 px-3 py-1 text-[10px] tracking-[0.18em] text-[#c9a96e] uppercase'>
                {activeCoin.metal}
                {activeCoin.weight ? ` · ${activeCoin.weight}` : ''}
              </span>
              <h2
                className='max-w-2xl text-2xl leading-tight font-light md:text-3xl'
                style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
              >
                {activeCoin.name}
              </h2>
              <p className='mt-1 text-lg font-semibold text-[#c9a96e]'>
                {activeCoin.price}
              </p>
              <button
                type='button'
                onClick={() => setSelected(activeCoin)}
                className='pointer-events-auto mt-4 rounded-full bg-white/10 px-5 py-2 text-xs font-semibold text-white backdrop-blur transition-colors hover:bg-white/20'
              >
                View details →
              </button>
            </div>
          )}

          <div className='absolute top-1/2 right-6 z-30 -translate-y-1/2 text-right text-xs text-white/40 tabular-nums'>
            {String(active + 1).padStart(2, '0')}
            <span className='text-white/20'> / {coins.length}</span>
          </div>
        </div>
      </section>

      {/* ───────── HỒI III · THE CRAFT (full-screen, proof) ───────── */}
      <section className='flex min-h-screen flex-col items-center justify-center px-6'>
        <div className='mb-12 text-center'>
          <p className='text-[11px] tracking-[0.3em] text-[#c9a96e] uppercase'>
            III · The Craft
          </p>
          <h2
            className='mt-3 text-3xl leading-tight font-light md:text-4xl'
            style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
          >
            Why each coin is worth holding.
          </h2>
        </div>
        <div className='w-full max-w-6xl'>
          <AccordionMedia
            content={{
              items: [
                {
                  title: '99.99% Pure Gold',
                  description:
                    'Each coin is struck from precious metal of the highest standard. Value that endures over time.',
                  imageUrl: CRAFT_IMG.gold,
                },
                {
                  title: 'Limited Mintage',
                  description:
                    'The mintage is sealed and never struck again. Scarcity is what creates the value.',
                  imageUrl: CRAFT_IMG.vault,
                },
                {
                  title: 'Proof Finish',
                  description:
                    'Hand-polished to collector grade, every detail of the engraving razor-sharp.',
                  imageUrl: CRAFT_IMG.proof,
                },
                {
                  title: 'Backed by the Royal Canadian Mint',
                  description:
                    "Issued by Canada's national mint, trusted for over a century.",
                  imageUrl: CRAFT_IMG.heritage,
                },
              ],
            }}
          />
        </div>
      </section>

      {/* ───────── HỒI IV · THE INVITATION (chốt lead) — spotlight bám chuột ───────── */}
      <section
        id='invite'
        ref={inviteRef}
        className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-24 text-center'
        style={{ '--mx': '50%', '--my': '42%' } as React.CSSProperties}
      >
        {/* hình nền vàng mờ — spotlight quét qua sẽ làm sáng */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={CRAFT_IMG.gold}
          alt=''
          className='pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.14]'
        />
        <div className='pointer-events-none absolute inset-0 bg-[#08070a]/40' />
        {/* coin nổ tung khi cuộn tới — image_explosion làm nền động cho lời mời */}
        <div className='pointer-events-none absolute inset-0'>
          <ImageExplosion
            content={{ images: COIN_IMAGES }}
            background={{ color: 'transparent' }}
            className='!min-h-full !justify-end !rounded-none !bg-transparent !pb-0'
          />
        </div>
        {/* spotlight bám chuột — sáng hơn (gold glow) */}
        <div
          className='pointer-events-none absolute inset-0'
          style={{
            background:
              'radial-gradient(440px circle at var(--mx) var(--my), rgba(201,169,110,0.34), rgba(201,169,110,0.08) 45%, transparent 66%)',
          }}
        />
        <div className='relative z-10 flex w-full flex-col items-center'>
          <p className='mb-3 text-[11px] tracking-[0.3em] text-[#c9a96e] uppercase'>
            IV · The Invitation
          </p>
          <h2
            className='max-w-2xl text-3xl leading-tight font-light md:text-5xl'
            style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
          >
            Claim a treasure before it fades into history.
          </h2>
          <LeadForm />
          <p className='mt-4 text-xs text-white/40'>
            Limited release. Priority for the collector list.
          </p>
        </div>
      </section>

      {selected && (
        <CoinDetail coin={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function LeadForm() {
  const [done, setDone] = React.useState(false);
  if (done)
    return (
      <p className='mt-9 rounded-full border border-[#c9a96e]/40 px-6 py-3 text-sm text-[#c9a96e]'>
        Thank you! We will reach out when the collection goes on sale.
      </p>
    );
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        setDone(true);
      }}
      className='mt-9 flex w-full max-w-md flex-col gap-3 sm:flex-row'
    >
      <input
        required
        type='email'
        placeholder='Your email'
        className='h-12 flex-1 rounded-full border border-white/15 bg-white/[0.04] px-5 text-sm text-white outline-none placeholder:text-white/40 focus:border-[#c9a96e]'
      />
      <button
        type='submit'
        className='h-12 rounded-full bg-[#c9a96e] px-7 text-sm font-semibold text-[#08070a] transition-transform hover:-translate-y-0.5'
      >
        Reserve yours
      </button>
    </form>
  );
}

function CoinDetail({ coin, onClose }: { coin: Coin; onClose: () => void }) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='relative grid max-w-4xl animate-[fadeUp_.4s_ease] gap-10 md:grid-cols-2'
        onClick={e => e.stopPropagation()}
      >
        <div className='flex items-center justify-center'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coin.image}
            alt={coin.name}
            className='vault-live max-h-[60vh] w-auto drop-shadow-[0_30px_80px_rgba(0,0,0,0.7)]'
          />
        </div>
        <div className='flex flex-col justify-center'>
          <span className='mb-3 text-[11px] tracking-[0.2em] text-[#c9a96e] uppercase'>
            {coin.metal}
            {coin.weight ? ` · ${coin.weight}` : ''}, Limited edition
          </span>
          <h2
            className='text-3xl leading-tight font-light text-white md:text-4xl'
            style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
          >
            {coin.name}
          </h2>
          <p className='mt-4 text-2xl font-semibold text-[#c9a96e]'>
            {coin.price}
          </p>
          <p className='mt-4 text-sm leading-relaxed text-white/60'>
            A limited-mintage masterpiece from the Royal Canadian Mint. Pure
            precious metal, proof finish. Own it while you still can.
          </p>
          <div className='mt-7 flex flex-wrap gap-3'>
            <button
              type='button'
              className='rounded-full bg-[#c9a96e] px-6 py-3 text-sm font-semibold text-[#08070a]'
            >
              Reserve yours
            </button>
            <a
              href={coin.url}
              target='_blank'
              rel='noreferrer'
              className='rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10'
            >
              View on Mint.ca ↗
            </a>
          </div>
        </div>
        <button
          type='button'
          onClick={onClose}
          aria-label='Close'
          className='absolute -top-3 -right-3 flex size-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20'
        >
          ✕
        </button>
      </div>
    </div>
  );
}

const VAULT_CSS = `
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
.vault-gloss{position:absolute;inset:0;border-radius:9999px;pointer-events:none;
  background:linear-gradient(115deg,transparent 35%,rgba(255,255,255,0.45) 50%,transparent 65%);
  mix-blend-mode:screen;opacity:0;transform:translateX(-120%)}
.vault-inner.vault-live .vault-gloss{opacity:1;animation:gloss 2.6s ease-in-out infinite}
@keyframes gloss{0%{transform:translateX(-120%)}55%,100%{transform:translateX(120%)}}
img.vault-live{animation:floaty 4s ease-in-out infinite}
@keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
/* hero hover hint — pill nhún nhảy mời di chuột */
.vault-hint-pill{animation:vbob 1.5s ease-in-out infinite;will-change:transform;
  box-shadow:0 8px 30px rgba(201,169,110,0.18)}
.vault-hint-text{animation:vblink 1.6s ease-in-out infinite}
.vault-hint-cursor{animation:vwiggle 2.4s ease-in-out infinite;transform-origin:center}
.vault-hint-ring::after{content:'';position:absolute;inset:-2px;border-radius:9999px;
  border:1px solid rgba(201,169,110,0.6);animation:vring 2s ease-out infinite}
@keyframes vbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
@keyframes vblink{0%,100%{opacity:.4}50%{opacity:1}}
@keyframes vwiggle{0%,100%{transform:translate(0,0) rotate(0)}30%{transform:translate(7px,-5px) rotate(-10deg)}65%{transform:translate(-5px,6px) rotate(8deg)}}
@keyframes vring{0%{transform:scale(.85);opacity:.8}100%{transform:scale(1.6);opacity:0}}
@media(prefers-reduced-motion:reduce){.vault-inner.vault-live .vault-gloss,img.vault-live,
  .vault-hint-pill,.vault-hint-text,.vault-hint-cursor,.vault-hint-ring::after{animation:none}}
`;
