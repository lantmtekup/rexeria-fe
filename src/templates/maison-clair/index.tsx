'use client';

import * as React from 'react';

import type { TemplateProps } from '../types';
import { useMaisonMotion } from '../_maison/useMaisonMotion';
import '../_maison/base.css';
import './styles.css';

interface Content {
  brandName?: string;
  heroEyebrow?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  ctaText?: string;
  ctaUrl?: string;
}

export default function MaisonClair({ page, content }: TemplateProps) {
  const c = content as Content;
  const ref = React.useRef<HTMLDivElement>(null);
  useMaisonMotion(ref);

  const brand = c.brandName ?? 'Maison Éclat';
  const ctaUrl = c.ctaUrl ?? '#book';

  return (
    <div className='mz-root mz-clair' ref={ref}>
      <div className='grain' aria-hidden />

      <header className='nav'>
        <a className='brand' href='#top'>
          {brand}
        </a>
        <div className='nav__r'>
          <a className='nav__cta' href='#book' data-magnetic='10'>
            Book a viewing
          </a>
          <button className='burger' aria-label='Menu' type='button'>
            <span />
            <span />
          </button>
        </div>
      </header>
      <div className='menu'>
        <nav>
          <a href='#fours'>The Four Cs</a>
          <a href='#coll'>The Éternel Line</a>
          <a href='#stmt'>Natural or Grown</a>
          <a href='#book'>Book a Viewing</a>
        </nav>
      </div>

      <main id='top'>
        {/* HERO minimal centered */}
        <section className='hero' data-rexer-section='hero'>
          <p className='eyebrow' data-hero-fade>
            {c.heroEyebrow ?? 'Bridal & Engagement · Paris'}
          </p>
          <h1 className='display'>
            <span data-hero-split>{c.heroTitle ?? 'Éternel'}</span>
          </h1>
          <p className='lede' data-hero-fade>
            {c.heroSubtitle ??
              'Modern, conscious fine jewellery, lab-grown or natural, always certified.'}
          </p>
          <div className='hero__cta' data-hero-fade>
            <a
              className='btn'
              href={ctaUrl}
              data-magnetic='16'
              data-rexer-cta='hero-book'
            >
              <span>{c.ctaText ?? 'Book a private viewing'}</span>
              <span className='btn__i' aria-hidden>
                ↗
              </span>
            </a>
            <a className='btn btn--ghost' href='#coll' data-magnetic='12'>
              <span>View the collection</span>
              <span className='btn__i' aria-hidden>
                ↗
              </span>
            </a>
          </div>
          <div className='hero__img' data-hero-clip>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                c.heroImage ??
                'https://images.pexels.com/photos/691046/pexels-photo-691046.jpeg?auto=compress&cs=tinysrgb&w=1200'
              }
              alt=''
            />
          </div>
          <div className='hero__meta' data-hero-fade>
            <div className='stat'>
              <span className='stat__v'>GIA</span>
              <span className='stat__l'>Certified</span>
            </div>
            <div className='stat'>
              <span className='stat__v'>100%</span>
              <span className='stat__l'>Conflict-free</span>
            </div>
            <div className='stat'>
              <span className='stat__v'>∞</span>
              <span className='stat__l'>Lifetime care</span>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <div className='marquee'>
          <div className='marquee__t'>
            {[0, 1].map(k => (
              <React.Fragment key={k}>
                <span>
                  <b>Éternel</b>
                </span>
                <span>·</span>
                <span>{brand}</span>
                <span>·</span>
                <span>Lab-grown & Natural</span>
                <span>·</span>
                <span>
                  <b>GIA Certified</b>
                </span>
                <span>·</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* FOUR Cs minimal rows */}
        <section className='sec fours' id='fours' data-rexer-section='fours'>
          <div className='wrap'>
            <header className='fours__head'>
              <h2 className='h2' data-split>
                The Four Cs, without the jargon.
              </h2>
            </header>
            <ul className='crows reveal'>
              {[
                [
                  '01',
                  'Cut',
                  "The single greatest influence on a diamond's fire, graded, never guessed.",
                ],
                [
                  '02',
                  'Colour',
                  'From icy D to candle-warm, we show you the scale and let your eye decide.',
                ],
                [
                  '03',
                  'Clarity',
                  'Every inclusion mapped on the GIA certificate that travels with your stone.',
                ],
                [
                  '04',
                  'Carat',
                  'Weight is where the conversation begins, never where it ends.',
                ],
              ].map(([n, t, b]) => (
                <li className='crow' key={n}>
                  <span className='crow__n'>{n}</span>
                  <span className='crow__t'>{t}</span>
                  <span className='crow__b'>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* COLLECTION horizontal gallery */}
        <div className='coll__intro'>
          <p className='eyebrow reveal'>The Éternel line</p>
          <h2 className='h2' data-split style={{ marginTop: '1rem' }}>
            Scroll the collection →
          </h2>
        </div>
        <section id='coll' data-hgallery-scope data-rexer-section='coll'>
          <div className='hgal'>
            <div className='hgal__track' data-hgallery>
              {[
                [
                  'https://images.pexels.com/photos/691046/pexels-photo-691046.jpeg?auto=compress&cs=tinysrgb&w=1000',
                  'La Solitaire',
                  'Brilliant · 1.0ct',
                ],
                [
                  'https://images.pexels.com/photos/9953655/pexels-photo-9953655.jpeg?auto=compress&cs=tinysrgb&w=1000',
                  "L'Infini",
                  'Eternity · Marquise',
                ],
                [
                  'https://images.pexels.com/photos/2735981/pexels-photo-2735981.jpeg?auto=compress&cs=tinysrgb&w=1000',
                  'La Goutte',
                  'Pear · 1.4ct',
                ],
                [
                  'https://images.pexels.com/photos/3641059/pexels-photo-3641059.jpeg?auto=compress&cs=tinysrgb&w=1000',
                  'Le Jonc',
                  'Rose gold · Pavé',
                ],
                [
                  'https://images.pexels.com/photos/19869445/pexels-photo-19869445.jpeg?auto=compress&cs=tinysrgb&w=1000',
                  'La Lumière',
                  'Pendant · 18k',
                ],
                [
                  'https://images.pexels.com/photos/15439169/pexels-photo-15439169.jpeg?auto=compress&cs=tinysrgb&w=1000',
                  'Le Coffret',
                  'The proposal box',
                ],
              ].map(([src, name, cap]) => (
                <div className='gal__item' key={name}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={name} />
                  <div className='gal__cap'>
                    <b>{name}</b>
                    <span>{cap}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FIGURES */}
        <section
          className='sec'
          style={{ padding: 'clamp(4rem,7vw,6rem) 0', overflow: 'hidden' }}
        >
          <span className='bigmark' aria-hidden>
            Éternel
          </span>
          <div className='wrap' style={{ position: 'relative', zIndex: 1 }}>
            <div className='figs'>
              <div>
                <div className='fig__v' data-count='1924'>
                  0
                </div>
                <div className='fig__l'>Maison founded</div>
              </div>
              <div>
                <div className='fig__v' data-count='150'>
                  0
                </div>
                <div className='fig__l'>Hours per ring</div>
              </div>
              <div>
                <div className='fig__v' data-count='57'>
                  0
                </div>
                <div className='fig__l'>Facets, hand-cut</div>
              </div>
              <div>
                <div className='fig__v'>∞</div>
                <div className='fig__l'>Lifetime servicing</div>
              </div>
            </div>
          </div>
        </section>

        {/* STATEMENT word-reveal */}
        <section className='sec stmt' id='stmt'>
          <div className='wrap'>
            <h2 className='h2' data-split>
              Natural, or grown. Both are real.
            </h2>
            <p className='stmt__lead' data-words-reveal>
              A laboratory diamond is optically identical to a natural one. The
              only difference is the story you wish to tell, and we never sell
              one as a flaw.
            </p>
          </div>
        </section>

        {/* BOOK */}
        <section className='sec' id='book' data-rexer-section='book'>
          <div className='wrap book__grid'>
            <div className='reveal'>
              <p className='eyebrow'>By appointment</p>
              <h2 className='h2' style={{ margin: '1rem 0 1.4rem' }} data-split>
                Book a private consultation.
              </h2>
              <p className='muted' style={{ maxWidth: '42ch' }}>
                One hour, no obligation, in our Paris salon or by video.
              </p>
              <ul className='rows' style={{ marginTop: '2rem' }}>
                {[
                  [
                    '01',
                    'Personalised guidance',
                    'We navigate the 4Cs with you and shortlist stones to your hand.',
                  ],
                  [
                    '02',
                    'Ethical assurance',
                    'GIA-certified, conflict-free, set in recycled gold.',
                  ],
                  [
                    '03',
                    'Lifetime service',
                    'Complimentary cleaning, resizing and care, for life.',
                  ],
                ].map(([n, h, p]) => (
                  <li className='row' key={n}>
                    <span className='n'>{n}</span>
                    <div>
                      <h4>{h}</h4>
                      <p>{p}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className='reveal'>
              <form className='booking form-card'>
                <div className='form-card__in' data-form-body>
                  <div className='field'>
                    <label>Full name</label>
                    <input type='text' required />
                  </div>
                  <div className='field'>
                    <label>Email</label>
                    <input type='email' required />
                  </div>
                  <div className='field'>
                    <label>Preferred date</label>
                    <input type='date' />
                  </div>
                  <div className='field'>
                    <label>Tell us about the occasion</label>
                    <textarea rows={3} />
                  </div>
                  <button
                    className='btn'
                    type='submit'
                    data-magnetic='14'
                    data-rexer-cta='book-submit'
                  >
                    <span>Request an appointment</span>
                    <span className='btn__i' aria-hidden>
                      ↗
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* CLOSER */}
        <section className='sec closer'>
          <div className='closer__in'>
            <p className='eyebrow'>Discover timeless elegance</p>
            <h2
              className='display'
              style={{ fontSize: 'clamp(2.8rem,8vw,6rem)' }}
              data-split
            >
              Begin your Éternel.
            </h2>
            <p className='lede'>
              Design a ring as singular as the reason for it.
            </p>
            <a
              className='btn'
              href={ctaUrl}
              data-magnetic='16'
              data-rexer-cta='closer-design'
            >
              <span>Design your ring</span>
              <span className='btn__i' aria-hidden>
                ↗
              </span>
            </a>
          </div>
        </section>

        <footer className='meta'>
          {brand} · Éternel · {page.slug ? `/p/${page.slug}` : 'preview'}
        </footer>
      </main>
    </div>
  );
}
