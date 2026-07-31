/**
 * Number formatting for the preview shell, pinned to one locale.
 *
 * The shell is always mounted (it hides itself with CSS rather than
 * unmounting), so its markup is produced during SSR too. A bare
 * `.toLocaleString()` would resolve against Node's ICU locale on the server and
 * the browser's during hydration — a mismatch waiting for the first user whose
 * machine disagrees with the build box.
 */
const NUM = new Intl.NumberFormat('en-US');

export const formatPreviewCount = (n: number): string =>
  NUM.format(Math.round(n));

/** Signed, with a true minus sign. 0.18 → '+18%', −0.09 → '−9%'. */
export const formatPreviewLift = (lift: number): string => {
  const pct = Math.round(lift * 100);
  return pct >= 0 ? `+${pct}%` : `−${Math.abs(pct)}%`;
};
