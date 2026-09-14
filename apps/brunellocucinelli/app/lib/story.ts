import { useSyncExternalStore } from 'react';
import MOCK from './story-mock.json';

/**
 * Bài viết mở khi bấm card (trang mẫu: view `story`, `#story`). Chưa có API
 * nên mọi card mở cùng một bài mock — "Saint Francis and Sister Artificial
 * Intelligence", nội dung chép từ brunellocucinelli.ai.
 */
export type StoryCard = { title: string; src: string };

export type Story = {
  title: string;
  image: { src: string; w: number; h: number };
  caption: string;
  /** HTML đã lọc — chỉ còn <strong>/<em>. */
  paragraphs: string[];
  signature: { src: string; w: number; h: number };
  topic: string;
  suggested: StoryCard[];
  related: StoryCard[];
};

export const STORY: Story = {
  title: MOCK.title,
  image: { src: '/hl-1/02-San-Francesco_2880.jpg', w: 1600, h: 800 },
  caption: MOCK.caption,
  paragraphs: MOCK.paragraphs,
  signature: { src: '/story/signature.jpg', w: 1440, h: 250 },
  topic: 'Technology, Humanism and Artificial Intelligence',
  suggested: [
    {
      title: '2026 - Letter to Brother Saint Francis',
      src: '/hl-1/04-Immagine_Pensiero.jpg',
    },
    {
      title: '2023 - Letter on Artificial and Human Intelligence',
      src: '/hl-5/01-2023-letter-on-artificial-and-human-intelligence.jpg',
    },
  ],
  related: [
    {
      title: 'Technological Sustainability',
      src: '/hl-3/06-technological-sustainability.jpg',
    },
    {
      title: 'Technology, Humanism and Artificial Intelligence',
      src: '/hl-5/02-technology-humanism-and-artificial-intelligence.jpg',
    },
  ],
};

// ── Chat: câu trả lời tạm trong lúc website đang phát triển ────────────
export const DEV_ANSWER = [
  'Thank you for your question. This website is still under development, so our AI system is not able to craft a response for you just yet.',
  'Soon you will be able to ask anything about Brunello Cucinelli, the hamlet of Solomeo and the ideas behind our work, and receive an answer written just for you. Please come back and visit us again shortly.',
];

export type Round = { id: number; question: string; answer: string[] };

// ── Trạng thái (Header đổi nút, StoryView hiện, ô chat ẩn khi đang trả lời) ──
type State = {
  open: boolean;
  mode: 'article' | 'chat';
  rounds: Round[];
  answering: boolean;
};

let state: State = {
  open: false,
  mode: 'article',
  rounds: [],
  answering: false,
};
let nextId = 1;
const listeners = new Set<() => void>();
const set = (patch: Partial<State>) => {
  state = { ...state, ...patch };
  listeners.forEach(l => l());
};

export const openStory = () => set({ open: true, mode: 'article', rounds: [] });

/** Gửi câu hỏi từ ô chat: mở trang trả lời (hoặc thêm lượt mới nếu đang mở). */
export const askQuestion = (question: string) => {
  const q = question.trim();
  if (!q || state.answering) return;
  const round = { id: nextId++, question: q, answer: DEV_ANSWER };
  set({
    open: true,
    mode: 'chat',
    rounds:
      state.mode === 'chat' && state.open ? [...state.rounds, round] : [round],
    answering: true,
  });
};

export const finishAnswer = () => set({ answering: false });

export const closeStory = () => set({ open: false, answering: false });

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

const SERVER: State = {
  open: false,
  mode: 'article',
  rounds: [],
  answering: false,
};
export const useStoryState = () =>
  useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER
  );

export const useStoryOpen = () => useStoryState().open;
