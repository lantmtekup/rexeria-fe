'use client';

import { useState } from 'react';
import AdWrapper from './shared/AdWrapper';
import VideoPlayer from './shared/VideoPlayer';

/**
 * Tap to Play Ad — Poster image with play button, tap to reveal video.
 * Ref: Van Cleef & Arpels https://mobkoi-uk.celtra.com/preview/2643a991
 */
export default function TapToPlayAd({
  posterImage,
  videoUrl,
  brandName,
  headline,
  subtitle,
  endCard,
  cta,
  ctaFont = "'Cormorant Garamond', Georgia, serif",
}) {
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);

  return (
    <AdWrapper brandName={brandName} cta={cta} ctaFont={ctaFont}>
      <div className='ttp-ad'>
        {!started ? (
          <>
            {/* Poster */}
            <div
              className='ttp-poster'
              style={{ backgroundImage: `url(${posterImage})` }}
            />

            {/* Play button */}
            <button className='ttp-play' onClick={() => setStarted(true)}>
              <div className='ttp-play-ring'>
                <svg width='14' height='19' viewBox='0 0 14 19' fill='none'>
                  <path d='M0 0L14 9.5L0 19V0Z' fill='#ffffff' />
                </svg>
              </div>
              <span className='ttp-play-text'>Play VIDEO</span>
            </button>
          </>
        ) : ended ? (
          /* End card */
          <div className='ttp-endcard'>
            <div
              className='ttp-endcard-bg'
              style={{ backgroundImage: `url(${posterImage})` }}
            />
            <div className='ttp-endcard-content'>
              <h3>{endCard?.title || 'Ready to Explore?'}</h3>
              <div className='ttp-endcard-actions'>
                <button
                  className='ttp-replay'
                  onClick={() => {
                    setEnded(false);
                    setStarted(true);
                  }}
                >
                  REPLAY
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Video */
          <VideoPlayer
            src={videoUrl}
            poster={posterImage}
            autoPlay
            onEnd={() => setEnded(true)}
          />
        )}
      </div>
    </AdWrapper>
  );
}
