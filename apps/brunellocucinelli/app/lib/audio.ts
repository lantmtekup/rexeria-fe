import { useSyncExternalStore } from 'react';

const AUDIO_SRC = '/Solomeo.webm';

/**
 * Trạng thái nhạc dùng chung (Header và trình xem artwork cùng một nút).
 * Mặc định tắt; bấm nút sẽ phát Solomeo.webm lặp.
 */
let muted = true;
let audio: HTMLAudioElement | null = null;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach(l => l());

const getAudio = () => {
  if (typeof window === 'undefined') return null;
  if (!audio) {
    audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.preload = 'auto';
  }
  return audio;
};

const syncAudio = () => {
  const el = getAudio();
  if (!el) return;

  if (muted) {
    el.pause();
    return;
  }

  void el.play().catch(() => {
    muted = true;
    el.pause();
    notify();
  });
};

export const toggleMuted = () => {
  muted = !muted;
  syncAudio();
  notify();
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useMuted = () =>
  useSyncExternalStore(
    subscribe,
    () => muted,
    () => true
  );
