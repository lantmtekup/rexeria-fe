'use client';

import { useState, useEffect, useCallback } from 'react';
import AdWrapper from './shared/AdWrapper';

/**
 * Countdown Ad — Real-time countdown to an event date.
 * Ref: New Balance https://mobkoi-uk.celtra.com/preview/7aefded5
 */
export default function CountdownAd({
  targetTime = '15:00',
  targetDate,
  backgroundImage,
  title,
  subtitle,
  brandName,
  cta,
  ctaFont = "'Cormorant Garamond', serif",
  expiredMessage = 'Now Open!',
  style = 'flip',
}) {
  // Mốc đích: ưu tiên targetTime (reset hằng ngày) — tính lần xuất hiện kế
  // tiếp của giờ 'HH:mm'; nếu hôm nay đã qua thì lấy ngày mai → không expired.
  // Fallback về targetDate tuyệt đối (cho event có ngày cố định).
  const getTarget = useCallback(() => {
    if (targetTime) {
      const [h, m = 0] = targetTime.split(':').map(Number);
      const target = new Date();
      target.setHours(h, m, 0, 0);
      if (target.getTime() <= Date.now()) {
        target.setDate(target.getDate() + 1);
      }
      return target;
    }
    return new Date(targetDate);
  }, [targetTime, targetDate]);

  const calcTimeLeft = useCallback(() => {
    const diff = getTarget() - new Date();
    if (diff <= 0) return null;
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }, [getTarget]);

  const [timeLeft, setTimeLeft] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(calcTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calcTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [calcTimeLeft]);

  const expired = mounted && !timeLeft;

  const units = [
    { label: 'Hours', value: timeLeft ? timeLeft.hours : 0 },
    { label: 'Minutes', value: timeLeft ? timeLeft.minutes : 0 },
    { label: 'Seconds', value: timeLeft ? timeLeft.seconds : 0 },
  ];

  return (
    <AdWrapper brandName={brandName} cta={cta} ctaFont={ctaFont}>
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
            <div className='cd-right'>
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

              {subtitle && <p className='cd-subtitle'>{subtitle}</p>}
            </div>
          )}
        </div>
      </div>
    </AdWrapper>
  );
}
