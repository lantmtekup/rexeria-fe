/**
 * Detects image bases that cannot serve S3 uploads (e.g. http://localhost:3000/static).
 * Those are fine for bundled static assets but not for objects stored in a bucket.
 */

export const isMisleadingLocalImageBase = (raw: string): boolean => {
  const trimmed = raw.trim();
  if (!trimmed) return true;
  try {
    const withProto =
      trimmed.includes('://') || trimmed.startsWith('//')
        ? trimmed.startsWith('//')
          ? `https:${trimmed}`
          : trimmed
        : `https://${trimmed}`;
    const u = new URL(withProto);
    const h = u.hostname.toLowerCase().replace(/^\[|\]$/g, '');
    return h === 'localhost' || h === '127.0.0.1' || h === '::1';
  } catch {
    return true;
  }
};
