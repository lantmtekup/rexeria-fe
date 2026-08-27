/**
 * `?open=<id>` — mở sẵn hộp chi tiết của một mục khi màn Experiences vừa hiện.
 *
 * Sinh ra cho luồng "Thêm từ chợ": bấm Thêm ở Exchange xong, người dùng bị thả
 * lại giữa lưới và phải tự đi tìm thứ vừa lấy — sang Experiences, mò đúng tab,
 * mò đúng thẻ, mở ra, rồi mới thấy nút "Dùng trải nghiệm này". Bốn bước mò mẫm
 * ở đúng lúc người ta đang có đà.
 *
 * Tách khỏi `?preview=`: hai tham số mở HAI hộp khác nhau (`preview` mở khung
 * xem trước toàn màn hình, `open` mở hộp chi tiết), nên dùng chung một tên sẽ
 * phải đoán ý — và đoán sai thì người dùng nhận về đúng cái hộp họ không cần.
 */
export const EXPERIENCE_OPEN_PARAM = 'open';

export const readExperienceOpenParam = (
  searchParams: Record<string, string | string[] | undefined>
): string | null => {
  const raw = searchParams[EXPERIENCE_OPEN_PARAM];
  const id = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  return id || null;
};

/**
 * Đường dẫn mở thẳng một mục trong thư viện.
 *
 * Dùng ở cả hai chỗ trên màn Exchange: ngay sau khi Thêm thành công, và ở nút
 * "Mở trong thư viện" của những thẻ đã lấy về từ trước.
 */
export const experienceOpenHref = (base: string, id: string): string =>
  `${base}/experiences?${EXPERIENCE_OPEN_PARAM}=${encodeURIComponent(id)}`;

/**
 * Xoá `?open=` khỏi thanh địa chỉ sau khi đã mở hộp.
 *
 * `replaceState` để không đẻ thêm một mục lịch sử: bấm Back sau đó phải quay
 * về màn Exchange, chứ không phải mở lại chính cái hộp vừa đóng.
 */
export const clearExperienceOpenParam = (): void => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has(EXPERIENCE_OPEN_PARAM)) return;
  url.searchParams.delete(EXPERIENCE_OPEN_PARAM);
  window.history.replaceState(window.history.state, '', url.toString());
};
