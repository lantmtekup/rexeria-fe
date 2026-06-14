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

export default function MaisonNoir({ page, content }: TemplateProps) {
  const c = content as Content;
  const ref = React.useRef<HTMLDivElement>(null);
  useMaisonMotion(ref);

  const brand = c.brandName ?? 'Maison Éclat';
  const ctaUrl = c.ctaUrl ?? '#book';
  const ctaText = c.ctaText ?? 'Book a private viewing';

  return (
    <div className='mz-root mz-noir' ref={ref}>
      <link
        rel='stylesheet'
        href='https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap'
      />
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
          <a href='#coll'>The Éternel Line</a>
          <a href='#book'>Book a Viewing</a>
        </nav>
      </div>

      <main id='top'>
        {/* HERO */}
        <section className='hero' data-rexer-section='hero'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className='hero__bg'
            data-hero-clip
            src={
              c.heroImage ??
              'https://images.pexels.com/photos/2735981/pexels-photo-2735981.jpeg?auto=compress&cs=tinysrgb&w=2000'
            }
            alt=''
          />
          <div className='hero__grad' />
          <div className='hero__sheen' />
          <div className='wrap hero__in'>
            <p className='eyebrow' data-hero-fade>
              {c.heroEyebrow ?? 'Bridal & Engagement · Paris'}
            </p>
            <h1 className='display'>
              <span data-hero-split>{c.heroTitle ?? 'Éternel'}</span>
            </h1>
            <p className='lede hero__desc' data-hero-fade>
              {c.heroSubtitle ??
                'An engagement ring is the one object you will wear every day, for the rest of your life.'}
            </p>
            <div className='hero__row' data-hero-fade>
              <Btn href={ctaUrl} cta='hero-book'>
                {ctaText}
              </Btn>
              <div className='stats'>
                <div className='stat'>
                  <span className='stat__v'>GIA</span>
                  <span className='stat__l'>Certified</span>
                </div>
                <div className='stat'>
                  <span className='stat__v'>100%</span>
                  <span className='stat__l'>Conflict-free</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <div className='marquee'>
          <div className='marquee__t'>
            <span>
              <b>Éternel</b>
            </span>
            <span>·</span>
            <span>{brand}</span>
            <span>·</span>
            <span>Paris</span>
            <span>·</span>
            <span>
              <b>Since 1924</b>
            </span>
            <span>·</span>
            <span>High Jewellery</span>
            <span>·</span>
            <span>
              <b>Éternel</b>
            </span>
            <span>·</span>
            <span>{brand}</span>
            <span>·</span>
            <span>Paris</span>
            <span>·</span>
            <span>
              <b>Since 1924</b>
            </span>
            <span>·</span>
            <span>High Jewellery</span>
            <span>·</span>
          </div>
        </div>

        {/* FOUR Cs */}
        <section
          className='sec fours'
          id='fours'
          data-parallax-scope
          data-rexer-section='fours'
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className='fours__bg'
            data-parallax='12'
            src='https://images.pexels.com/photos/31677622/pexels-photo-31677622.jpeg?auto=compress&cs=tinysrgb&w=1600'
            alt=''
          />
          <div className='wrap'>
            <header className='fours__head'>
              <h2 className='h2' data-split>
                The Four Cs, without the jargon.
              </h2>
            </header>
            <div className='fours__grid reveal'>
              {[
                [
                  'Cut',
                  "The single greatest influence on a diamond's fire, graded, never guessed.",
                ],
                [
                  'Colour',
                  'From icy D to warm, we show you the scale and let your eye decide.',
                ],
                [
                  'Clarity',
                  'Every inclusion mapped on the GIA certificate that travels with your stone.',
                ],
                [
                  'Carat',
                  'Weight is the beginning of the conversation, never the whole of it.',
                ],
              ].map(([t, b]) => (
                <div className='fourc' key={t}>
                  <div className='fourc__k'>C</div>
                  <div className='fourc__t'>{t}</div>
                  <p className='fourc__b'>{b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CRAFT pinned story */}
        <section
          className='sec craft'
          id='craft'
          data-pin-story
          data-rexer-section='craft'
        >
          <div className='wrap craft__grid'>
            <div className='craft__media' data-pin-media>
              {[
                'https://images.pexels.com/photos/4354569/pexels-photo-4354569.jpeg?auto=compress&cs=tinysrgb&w=1400',
                'https://images.pexels.com/photos/32700209/pexels-photo-32700209.jpeg?auto=compress&cs=tinysrgb&w=1400',
                'https://images.pexels.com/photos/691046/pexels-photo-691046.jpeg?auto=compress&cs=tinysrgb&w=1400',
              ].map(src => (
                // eslint-disable-next-line @next/next/no-img-element
                <img data-step-media src={src} alt='' key={src} />
              ))}
            </div>
            <div className='craft__steps'>
              {[
                [
                  'The bench',
                  'Drawn, then forged by hand.',
                  'Every Éternel begins on paper in our Paris atelier and is forged in recycled gold by a single master jeweller.',
                ],
                [
                  'The stone',
                  'Chosen under the loupe.',
                  'We grade each centre stone against the GIA standard with you in the room. Natural or lab-grown, both are real.',
                ],
                [
                  'The setting',
                  'Set to hold light for a lifetime.',
                  'A hundred and fifty hours later, the ring is yours, and ours to service, freely, forever.',
                ],
              ].map(([n, h, p]) => (
                <div className='craft__step' data-step key={n}>
                  <p className='n'>{n}</p>
                  <h2 className='h2'>{h}</h2>
                  <p
                    className='muted'
                    style={{ marginTop: '1.2rem', maxWidth: '40ch' }}
                  >
                    {p}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COLLECTION horizontal gallery */}
        <section id='coll' data-hgallery-scope data-rexer-section='coll'>
          <div className='hgal'>
            <div className='hgal__track' data-hgallery>
              <div className='gal__item' style={{ width: '34vw' }}>
                <div className='coll__head'>
                  <p className='eyebrow'>The Éternel line</p>
                  <h2 className='h2' style={{ marginTop: '1rem' }}>
                    Six ways
                    <br />
                    to say always.
                  </h2>
                  <p
                    className='muted'
                    style={{ marginTop: '1.5rem', maxWidth: '26ch' }}
                  >
                    Scroll →
                  </p>
                </div>
              </div>
              {[
                [
                  'https://images.pexels.com/photos/2735981/pexels-photo-2735981.jpeg?auto=compress&cs=tinysrgb&w=900',
                  'La Goutte',
                  'Pear · 1.4ct',
                ],
                [
                  'https://images.pexels.com/photos/9953655/pexels-photo-9953655.jpeg?auto=compress&cs=tinysrgb&w=900',
                  "L'Infini",
                  'Eternity · Marquise',
                ],
                [
                  'https://images.pexels.com/photos/691046/pexels-photo-691046.jpeg?auto=compress&cs=tinysrgb&w=900',
                  'La Solitaire',
                  'Brilliant · 1.0ct',
                ],
                [
                  'https://images.pexels.com/photos/3641059/pexels-photo-3641059.jpeg?auto=compress&cs=tinysrgb&w=900',
                  'Le Jonc',
                  'Rose gold · Pavé',
                ],
                [
                  'https://images.pexels.com/photos/19869445/pexels-photo-19869445.jpeg?auto=compress&cs=tinysrgb&w=900',
                  'La Lumière',
                  'Pendant · 18k',
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
          style={{ paddingTop: '2rem', overflow: 'hidden' }}
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
                <div className='fig__l'>Maison founded, Paris</div>
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

        {/* BRIDAL QUOTE */}
        <section className='quote' data-parallax-scope>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className='quote__bg'
            data-parallax='16'
            src='https://images.pexels.com/photos/34638444/pexels-photo-34638444.jpeg?auto=compress&cs=tinysrgb&w=2000'
            alt=''
          />
          <div className='quote__o' />
          <div className='wrap'>
            <q data-words-reveal>
              A promise you can hold, cut to catch the light forever.
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
