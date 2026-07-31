/**
 * Zoom bounds shared by both canvas surfaces and the zoom bar.
 *
 * The floor is deliberately very low. On the full-page canvas "fit" means
 * containing the WHOLE page — a 12-section landing page is easily 10 000 px
 * tall, which lands around 8 %. A 25 % floor (what the artboard used to ship)
 * silently refused that and opened the editor already scrolled into the first
 * section, which reads as "fit is broken".
 */
export const CANVAS_ZOOM_MIN = 5;
export const CANVAS_ZOOM_MAX = 200;

export const clampCanvasZoom = (n: number) =>
  Math.max(CANVAS_ZOOM_MIN, Math.min(CANVAS_ZOOM_MAX, n));
