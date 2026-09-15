'use client';

import Image from 'next/image';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from '../lib/motion';
import {
  STORY,
  closeStory,
  finishAnswer,
  useStoryState,
  type Round,
  type StoryCard,
} from '../lib/story';
import { getLenis } from './SmoothScrollProvider';

/**
 * Trang bài viết (trang mẫu: `.c-story`) — lớp fixed toàn màn tự cuộn, phủ lên
 * trang chủ nhưng nằm dưới Header và ô chat (Header đổi sang nút Back/Share).
 * Hai chế độ: 'article' (bấm card — bài mock) và 'chat' (Enter ở ô chat —
 * mỗi câu hỏi là một lượt: tiêu đề câu hỏi + câu trả lời hiện từng chữ).
 * Mở: fade 0.4s, các khối trồi lên lần lượt; đóng: fade, trả Lenis.
 */
export default function StoryView() {
  const { open, mode, rounds } = useStoryState();
  const [rendered, setRendered] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setRendered(true);
  }, [open]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !rendered) return;
    const lenis = getLenis();
    const ctx = gsap.context(() => {
      if (open) {
        lenis?.stop();
        document.documentElement.style.overflow = 'hidden';
        root.scrollTop = 0;
        gsap.fromTo(
          root,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.4, ease: 'power2.out' }
        );
        // Chat tự chạy hiệu ứng từng lượt (ChatRound).
        if (mode === 'chat') return;
        gsap.fromTo(
          '[data-story-block]',
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.12,
            delay: 0.15,
          }
        );
      } else {
        gsap.to(root, {
          autoAlpha: 0,
          duration: 0.35,
          ease: 'power2.out',
          onComplete: () => {
            document.documentElement.style.overflow = '';
            lenis?.start();
            setRendered(false);
          },
        });
      }
    }, root);
    return () => {
      if (!open) ctx.revert();
    };
    // mode chỉ đọc lúc mở; đổi lượt chat không chạy lại hiệu ứng mở.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, rendered]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeStory();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!rendered) return null;

  // Card gợi ý mở lại chính bài mock — đưa về đầu bài cho có phản hồi.
  const reopen = () =>
    rootRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div
      ref={rootRef}
      role='dialog'
      aria-modal='true'
      aria-label={STORY.title}
      data-lenis-prevent
      className='invisible fixed inset-0 z-30 overflow-y-auto overscroll-contain bg-[#F8F8F6]'
    >
      {mode === 'chat' ? (
        <div className='mx-auto max-w-[62.5rem] px-4 pt-40 pb-56 md:px-8 md:pt-60'>
          {rounds.map((r, i) => (
            <ChatRound
              key={r.id}
              round={r}
              scroller={rootRef}
              first={i === 0}
            />
          ))}
        </div>
      ) : (
        <article className='px-4 pt-40 pb-56 md:px-8 md:pt-60'>
          <h1
            data-story-block
            className='mx-auto max-w-[44rem] text-center text-[40px] leading-[1.15] font-normal text-balance text-neutral-900 md:text-[56px]'
          >
            {STORY.title}
          </h1>

          <figure
            data-story-block
            className='mx-auto mt-24 max-w-[62.5rem] md:mt-44'
          >
            <Image
              src={STORY.image.src}
              alt=''
              width={STORY.image.w}
              height={STORY.image.h}
              sizes='(max-width: 1023px) 100vw, 1000px'
              priority
              className='h-auto w-full'
            />
            <figcaption className='font-ui mx-auto mt-10 max-w-[44rem] text-center text-[11px] tracking-[0.03em] text-neutral-700 md:mt-28 md:text-[13px]'>
              {STORY.caption}
            </figcaption>
          </figure>

          <div
            data-story-block
            className='mx-auto mt-14 max-w-[43rem] space-y-5 text-[17px] leading-[1.6] text-neutral-900 md:mt-20 md:text-[18px] [&_strong]:font-semibold'
          >
            {STORY.paragraphs.map((p, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
            ))}
          </div>

          <Image
            data-story-block
            src={STORY.signature.src}
            alt='Brunello Cucinelli'
            width={STORY.signature.w}
            height={STORY.signature.h}
            sizes='(max-width: 1023px) 100vw, 1000px'
            className='mx-auto mt-16 h-auto w-full max-w-[62.5rem] mix-blend-multiply'
          />

          {/* Gợi ý: chủ đề + 2 bài liên quan, rồi "You may also be interested in". */}
          <section data-story-block className='mx-auto mt-28 max-w-[62.5rem]'>
            <ul className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              <li>
                <button
                  type='button'
                  onClick={reopen}
                  className='group flex aspect-[323/396] w-full flex-col items-center justify-center gap-6 bg-linear-to-b from-[#efeeea] to-[#e6e4de] px-8 text-center'
                >
                  <span className='text-[24px] leading-tight text-neutral-500 group-hover:underline'>
                    {STORY.topic}
                  </span>
                  <Image
                    src='/00-ui/topic.svg'
                    alt=''
                    width={30}
                    height={30}
                    className='size-6 opacity-70'
                  />
                </button>
              </li>
              {STORY.suggested.map(c => (
                <li key={c.src}>
                  <Card card={c} onClick={reopen} />
                </li>
              ))}
            </ul>

            <p className='font-ui my-8 flex items-center gap-4 text-[11px] tracking-[0.2em] text-neutral-900 uppercase before:h-px before:flex-1 before:bg-neutral-300 after:h-px after:flex-1 after:bg-neutral-300 md:text-[13px]'>
              You may also be interested in
            </p>

            <ul className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {STORY.related.map(c => (
                <li key={c.src}>
                  <Card card={c} onClick={reopen} />
                </li>
              ))}
            </ul>
          </section>
        </article>
      )}
    </div>
  );
}

function Card({ card, onClick }: { card: StoryCard; onClick: () => void }) {
  return (
    <button
      type='button'
      onClick={onClick}
      className='group flex aspect-[323/356] w-full flex-col overflow-hidden bg-white text-left'
    >
      <span className='relative block w-full flex-1 overflow-hidden'>
        <Image
          src={card.src}
          alt=''
          fill
          sizes='(max-width: 639px) 100vw, 323px'
          className='object-contain transition-transform duration-700 ease-out group-hover:scale-[1.04]'
        />
      </span>
      <span className='flex h-24 items-center justify-center px-8 text-center text-[16px] leading-snug text-neutral-900'>
        <span className='group-hover:underline'>{card.title}</span>
      </span>
    </button>
  );
}

/**
 * Một lượt hỏi đáp (trang mẫu: `.c-round` → `.c-block-title` +
 * `.c-block-answer`). Câu hỏi hiện trước, câu trả lời lộ ra từng chữ như đang
 * được viết, xong mới hiện dòng ghi chú và trả lại ô chat.
 */
function ChatRound({
  round,
  scroller,
  first,
}: {
  round: Round;
  scroller: React.RefObject<HTMLDivElement | null>;
  first: boolean;
}) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!first)
      scroller.current?.scrollTo({
        top: el.offsetTop - 140,
        behavior: 'smooth',
      });

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray<HTMLElement>('[data-word]', el);
      gsap
        .timeline({ onComplete: finishAnswer, delay: first ? 0.35 : 0.1 })
        .fromTo(
          '[data-question]',
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: reduce ? 0 : 0.7, ease: 'power3.out' }
        )
        // "Đang viết": một nhịp chờ ngắn rồi chữ lộ dần, mỗi chữ mờ lên trong
        // 0.6s nên phần vừa viết nhạt hơn phần trước như trang mẫu.
        .to(
          words,
          {
            opacity: 1,
            duration: reduce ? 0 : 0.6,
            ease: 'none',
            stagger: reduce ? 0 : 0.045,
          },
          reduce ? '>' : '+=0.5'
        )
        .fromTo(
          '[data-credit]',
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: reduce ? 0 : 0.5 },
          '-=0.3'
        );
    }, el);
    return () => ctx.revert();
    // Mỗi lượt chỉ chạy một lần khi gắn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section ref={ref} className={first ? '' : 'mt-28 md:mt-40'}>
      <h2
        data-question
        className='invisible text-[26px] leading-[1.2] text-neutral-900 md:text-[30px]'
      >
        {round.question}
      </h2>
      <div className='mt-7 space-y-6 text-[18px] leading-[1.6] text-neutral-900 md:text-[20px]'>
        {round.answer.map((para, i) => (
          <p key={i}>
            {para.split(' ').map((w, j) => (
              <span key={j} data-word className='opacity-0'>
                {w}{' '}
              </span>
            ))}
          </p>
        ))}
      </div>
      <p data-credit className='invisible mt-5 text-[14px] text-neutral-500'>
        Content crafted for you by Callimacus
      </p>
    </section>
  );
}
