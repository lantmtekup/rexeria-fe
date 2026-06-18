import webStorageClient from '@/lib/webStorageClient';
import { constants } from '@/settings/constants';

/**
 * Ngôn ngữ UI hiện tại (cookie `i18nextLng`) dùng cho mọi request AI-Insights, để
 * BE sinh prose (rationale, journey, block/template copy…) đúng ngôn ngữ đang chọn.
 * Đọc client-side; trên server (SSR) cookie không có → trả 'vi' (đúng default BE).
 */
export function currentInsightLang(): 'vi' | 'en' {
  return webStorageClient.get(constants.LANGUAGE) === 'en' ? 'en' : 'vi';
}
