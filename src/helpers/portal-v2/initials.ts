export const initialsFrom = (
  name?: string | null,
  email?: string | null
): string => {
  const raw = (name || email || '?').trim();
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  }
  return raw.slice(0, 2).toUpperCase();
};
