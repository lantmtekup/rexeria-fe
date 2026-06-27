'use client';

import { useState, useEffect, useCallback } from 'react';
import AdWrapper from './shared/AdWrapper';

/**
 * Countdown Ad — Real-time countdown to an event date.
 * Ref: New Balance https://mobkoi-uk.celtra.com/preview/7aefded5
 */
export default function CountdownAd({
  targetDate,
  backgroundImage,
  title,
  subtitle,
  brandName,
  cta,
  expiredMessage = 'Now Open!',
  style = 'flip',
}) {
  const calcTimeLeft = useCallback(() => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return null;
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(calcTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calcTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [calcTimeLeft]);

  const expired = !timeLeft;

  const units = timeLeft
    ? [
        { label: 'Minutes', value: timeLeft.minutes },
        { label: 'Seconds', value: timeLeft.seconds },
      ]
    : [];

  return (
    <AdWrapper brandName={brandName} cta={cta}>
      <div className='cd-ad'>
        {/* Background */}
        {backgroundImage && (
          <div
            className='cd-bg'
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        )}
        <div className='cd-overlay' />

        <div className='cd-content'>
          <h2 className='cd-title'>{expired ? expiredMessage : title}</h2>

          {!expired && (
            <div className={`cd-units cd-units--${style}`}>
              {units.map((u, index) => (
                <div key={u.label} className='cd-unit-group'>
                  <div className='cd-unit'>
                    <div className='cd-unit-value'>
                      {String(u.value)
                        .padStart(2, '0')
                        .split('')
                        .map((char, charIdx) => (
                          <div key={charIdx} className='cd-flip'>
                            <span>{char}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                  {index < units.length - 1 && (
                    <span className='cd-separator'>:</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {!expired && subtitle && <p className='cd-subtitle'>{subtitle}</p>}
        </div>
      </div>
    </AdWrapper>
  );
}
