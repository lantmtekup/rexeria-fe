'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

/**
 * Custom video player with controls.
 *
 * @param {Object}  props
 * @param {string}  props.src          - Video URL
 * @param {string}  props.poster       - Poster image URL
 * @param {boolean} props.autoPlay     - Auto play (muted)
 * @param {boolean} props.loop         - Loop video
 * @param {boolean} props.showControls - Show custom controls
 * @param {function} props.onEnd       - Callback when video ends
 * @param {string}  props.className    - Additional class
 */
export default function VideoPlayer({
  src,
  poster,
  autoPlay = false,
  loop = false,
  showControls = true,
  onEnd,
  className = '',
}) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(autoPlay);
  const [muted, setMuted] = useState(autoPlay); // autoplay requires muted
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
  }, []);

  const handleSeek = useCallback(e => {
    const v = videoRef.current;
    if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * v.duration;
  }, []);

  const handleEnded = useCallback(() => {
    setPlaying(false);
    onEnd?.();
  }, [onEnd]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onMeta = () => setDuration(v.duration);
    v.addEventListener('loadedmetadata', onMeta);
    return () => v.removeEventListener('loadedmetadata', onMeta);
  }, []);

  const formatTime = sec => {
    if (!sec || !isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`vp-wrapper ${className}`}>
      {}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onClick={togglePlay}
        className='vp-video'
      />

      {/* Play overlay (when paused and not autoplay) */}
      {!playing && !autoPlay && (
        <button className='vp-play-overlay' onClick={togglePlay}>
          <svg width='64' height='64' viewBox='0 0 64 64' fill='none'>
            <circle
              cx='32'
              cy='32'
              r='31'
              stroke='rgba(255,255,255,0.6)'
              strokeWidth='2'
            />
            <path d='M26 20L46 32L26 44V20Z' fill='rgba(255,255,255,0.9)' />
          </svg>
        </button>
      )}

      {/* Custom controls */}
      {showControls && (
        <div className='vp-controls'>
          <button className='vp-btn' onClick={togglePlay}>
            {playing ? (
              <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
                <rect x='2' y='2' width='4' height='12' rx='1' fill='#fff' />
                <rect x='10' y='2' width='4' height='12' rx='1' fill='#fff' />
              </svg>
            ) : (
              <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
                <path d='M4 2L14 8L4 14V2Z' fill='#fff' />
              </svg>
            )}
          </button>

          <div className='vp-progress' onClick={handleSeek}>
            <div
              className='vp-progress-fill'
              style={{ width: `${progress}%` }}
            />
          </div>

          <span className='vp-time'>
            {formatTime(videoRef.current?.currentTime)} / {formatTime(duration)}
          </span>

          <button className='vp-btn' onClick={toggleMute}>
            {muted ? (
              <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
                <path d='M2 5.5H5L9 2v12l-4-3.5H2V5.5Z' fill='#fff' />
                <line
                  x1='11'
                  y1='5'
                  x2='15'
                  y2='11'
                  stroke='#fff'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                />
                <line
                  x1='15'
                  y1='5'
                  x2='11'
                  y2='11'
                  stroke='#fff'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                />
              </svg>
            ) : (
              <svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
                <path d='M2 5.5H5L9 2v12l-4-3.5H2V5.5Z' fill='#fff' />
                <path
                  d='M11 4.5c1.5 1 2.5 2.1 2.5 3.5s-1 2.5-2.5 3.5'
                  stroke='#fff'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                />
                <path
                  d='M12 6.5c.8.6 1.2 1.2 1.2 1.5s-.4.9-1.2 1.5'
                  stroke='#fff'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
