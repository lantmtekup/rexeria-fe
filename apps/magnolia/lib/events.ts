/**
 * Window events the page uses to hand off between parts that must not import each other.
 *
 * `OPENING_DONE` fires when the preloader's curtains have finished parting. Its timing cannot
 * be derived: the beat holds until the hero film's 286 frames are decoded, so it is as long as
 * the download takes. Anything that has to wait for the page to be revealed listens for this.
 */
export const OPENING_DONE = 'magnolia:opening-done';
