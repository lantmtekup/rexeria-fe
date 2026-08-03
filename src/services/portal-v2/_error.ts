/**
 * Lấy message thật từ lỗi BE (RxApiError extends Error nên vào nhánh đầu) —
 * dùng chung cho các service Portal V2 vốn không throw ra ngoài.
 */
export const errorMessage = (err: unknown, fallback: string): string =>
  err instanceof Error && err.message ? err.message : fallback;
