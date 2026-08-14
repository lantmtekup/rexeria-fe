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

function Btn({
  href,
  children,
  cta,
}: {
  href: string;
  children: React.ReactNode;
  cta?: string;
}) {
  return (
    <a className='btn' href={href} data-magnetic='16' data-rexer-cta={cta}>
      <span>{children}</span>
      <span className='btn__i' aria-hidden>
        ↗
      </span>
    </a>
  );
}

export default function MaisonAtelier({ page, content }: TemplateProps) {
  const c = content as Content;
  const ref = React.useRef<HTMLDivElement>(null);
  useMaisonMotion(ref);

  const brand = c.brandName ?? 'Maison Éclat';
  const ctaUrl = c.ctaUrl ?? '#book';

  return (
    <div className='mz-root mz-atelier' ref={ref}>
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
          <a href='#craft'>The Atelier</a>
          <a href='#book'>Book a Viewing</a>
        </nav>
      </div>

      <main id='top'>
        {/* HERO split */}
        <section className='hero' data-rexer-section='hero'>
          <div className='hero__l'>
            <p className='eyebrow' data-hero-fade>
              {c.heroEyebrow ?? 'Bridal & Engagement · Paris'}
            </p>
            <h1 className='display'>
              <span data-hero-split>{c.heroTitle ?? 'Éternel'}</span>
            </h1>
            <p className='lede' data-hero-fade>
              {c.heroSubtitle ??
                'Made the way it was a century ago. Slowly, by hand, to be worn for a lifetime.'}
            </p>
            <div className='hero__row' data-hero-fade>
              <Btn href={ctaUrl} cta='hero-book'>
                {c.ctaText ?? 'Book a private viewing'}
              </Btn>
              <div className='stats'>
                <div className='stat'>
                  <span className='stat__v'>1924</span>
                  <span className='stat__l'>Paris atelier</span>
                </div>
              </div>
            </div>
          </div>
          <div className='hero__r' data-hero-clip>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                c.heroImage ??
                'https://images.pexels.com/photos/35464490/pexels-photo-35464490.jpeg?auto=compress&cs=tinysrgb&w=1400'
              }
              alt=''
            />
            <span className='hero__tag'>{brand} · Atelier de Paris</span>
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
                <span>Fait main</span>
                <span>·</span>
                <span>Paris</span>
                <span>·</span>
                <span>
                  <b>Depuis 1924</b>
                </span>
                <span>·</span>
                <span>Haute Joaillerie</span>
                <span>·</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* FOUR Cs */}
        <section className='sec fours' id='fours' data-rexer-section='fours'>
          <div className='wrap'>
            <header className='fours__head'>
              <h2 className='h2' data-split>
                The Four Cs, in plain language.
              </h2>
            </header>
            <div className='fours__grid reveal'>
              {[
                [
                  'Cut',
                  'Fire first',
                  "The single greatest influence on a diamond's brilliance, graded, never guessed.",
                ],
                [
                  'Colour',
                  'Your eye decides',
                  'From icy D to candle-warm, we lay out the scale and let you choose.',
                ],
                [
                  'Clarity',
                  'Mapped, certified',
                  'Every inclusion charted on the GIA certificate that travels with your stone.',
                ],
                [
                  'Carat',
                  'Never the whole story',
                  'Weight is where the conversation begins, not where it ends.',
                ],
              ].map(([k, t, b]) => (
                <div className='fourc' key={k}>
                  <div className='fourc__k'>{k}</div>
                  <div className='fourc__t'>{t}</div>
                  <p className='fourc__b'>{b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CRAFT centerpiece */}
        <section
          className='sec craft'
          id='craft'
          data-pin-story
          data-rexer-section='craft'
        >
          <div className='wrap'>
            <header className='craft__head'>
              <p className='eyebrow reveal'>The atelier</p>
              <h2 className='h2' data-split>
                One hundred and fifty hours, by one pair of hands.
              </h2>
            </header>
            <div className='craft__grid'>
              <div className='craft__media' data-pin-media>
                {[
                  'https://images.pexels.com/photos/4354569/pexels-photo-4354569.jpeg?auto=compress&cs=tinysrgb&w=1400',
                  'https://images.pexels.com/photos/32700209/pexels-photo-32700209.jpeg?auto=compress&cs=tinysrgb&w=1400',
                  'https://images.pexels.com/photos/6098251/pexels-photo-6098251.jpeg?auto=compress&cs=tinysrgb&w=1400',
                  'https://images.pexels.com/photos/691046/pexels-photo-691046.jpeg?auto=compress&cs=tinysrgb&w=1400',
                ].map(src => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img data-step-media src={src} alt='' key={src} />
                ))}
              </div>
              <div className='craft__steps'>
                {[
                  [
                    'Drawn',
                    'It begins on paper.',
                    'Every Éternel is sketched by hand before a single gram of recycled gold is forged.',
                  ],
                  [
                    'Chosen',
                    'The stone, under the loupe.',
                    'We grade each centre stone to the GIA standard with you in the room. Natural or grown, both are real.',
                  ],
                  [
                    'Set',
                    "Placed by a master's hand.",
                    'Each prong is raised and burnished by one jeweller, so the light sits exactly where it should.',
                  ],
                  [
                    'Yours',
                    'And ours to keep, forever.',
                    'Complimentary cleaning, resizing and care for the life of the ring.',
                  ],
                ].map(([n, h, p]) => (
                  <div className='craft__step' data-step key={n}>
                    <p className='n'>{n}</p>
                    <h2 className='h2'>{h}</h2>
                    <p
                      className='muted'
                      style={{ marginTop: '1.1rem', maxWidth: '40ch' }}
                    >
                      {p}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FIGURES */}
        <section
          className='sec'
          style={{ paddingTop: 'clamp(4rem,8vw,7rem)', overflow: 'hidden' }}
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

        {/* QUOTE */}
        <section className='quote' data-parallax-scope>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className='quote__bg'
            data-parallax='16'
            src='https://images.pexels.com/photos/6262842/pexels-photo-6262842.jpeg?auto=compress&cs=tinysrgb&w=2000'
            alt=''
          />
          <div className='quote__o' />
          <div className='wrap'>
            <q data-words-reveal>
              A promise you can hold, made to outlast us all.
            </q>
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
            <Btn href={ctaUrl} cta='closer-design'>
              Design your ring
            </Btn>
          </div>
        </section>

        <footer className='meta'>
          {brand} · Éternel · {page.slug ? `/p/${page.slug}` : 'preview'}
        </footer>
      </main>
    </div>
  );
}
