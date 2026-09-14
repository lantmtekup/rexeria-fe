import { useSyncExternalStore } from 'react';

/**
 * Lớp phủ toàn màn của hành trình — cùng một cơ chế cho hai việc, đúng như
 * `story.ts` của trang mẫu:
 *
 *   'place' — bấm vào một card thì mở trang giới thiệu nơi đó phủ lên trang,
 *             không rời khỏi vị trí đang cuộn.
 *   'ask'   — gõ câu hỏi ở ô ghim đáy màn thì mở trang trả lời.
 *
 * Store ngoài React (useSyncExternalStore) để ô nhập ở footer, các card ở
 * giữa trang và lớp phủ ở layout cùng đọc một trạng thái mà không phải bọc
 * provider quanh cả trang.
 */
export type Place = {
  title: string;
  body: string;
  src: string;
  /** Link tour 360° của nơi này, nếu có. */
  tour?: string;
  /** Nhãn CTA, theo ngôn ngữ đang chọn. */
  cta?: string;
};

type State =
  | { open: false }
  | { open: true; mode: 'place'; place: Place }
  | { open: true; mode: 'ask'; question: string };

let state: State = { open: false };
const listeners = new Set<() => void>();
const set = (next: State) => {
  state = next;
  listeners.forEach(l => l());
};

export const openPlace = (place: Place) => set({ open: true, mode: 'place', place });

export const askQuestion = (question: string) => {
  const q = question.trim();
  if (q) set({ open: true, mode: 'ask', question: q });
};

export const closeOverlay = () => set({ open: false });

const SERVER: State = { open: false };

export const useOverlay = () =>
  useSyncExternalStore(
    l => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => SERVER
  );
