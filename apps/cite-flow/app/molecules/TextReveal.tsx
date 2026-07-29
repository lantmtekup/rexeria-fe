import { Fragment } from 'react';
import { gsap } from '../lib/motion';

export function RevealWords({ text }: { text: string }) {
  const words = text.split(' ');
  return (
    <>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className='reveal-word inline-block'>{word}</span>
          {i < words.length - 1 ? ' ' : ''}
        </Fragment>
      ))}
    </>
  );
}

export function revealText(
  ref: React.RefObject<HTMLElement | null>,
  opts: { duration: number; stagger: number; ease: string }
) {
  const words = ref.current!.querySelectorAll('.reveal-word');
  gsap.set(words, { opacity: 0.001, filter: 'blur(3px)', y: 10 });
  gsap.to(words, {
    opacity: 1,
    filter: 'blur(0px)',
    y: 0,
    duration: opts.duration,
    stagger: opts.stagger,
    ease: opts.ease,
    scrollTrigger: {
      trigger: ref.current,
      start: 'top bottom',
    },
  });
}
