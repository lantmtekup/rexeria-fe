/**
 * Read/write nested block content via element keys such as
 * `items[0].name` or `items.0.imageUrl`.
 */
export function parseContentPath(key: string): Array<string | number> {
  const segments: Array<string | number> = [];
  const re = /([^.\[\]]+)|\[(\d+)\]/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(key)) !== null) {
    if (match[1] !== undefined) {
      segments.push(match[1]);
    } else if (match[2] !== undefined) {
      segments.push(Number(match[2]));
    }
  }
  return segments;
}

export function getContentAt(
  root: Record<string, unknown>,
  key: string
): unknown {
  const parts = parseContentPath(key);
  let cur: unknown = root;
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    if (typeof part === 'number') {
      if (!Array.isArray(cur)) return undefined;
      cur = cur[part];
      continue;
    }
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

export function setContentAt(
  root: Record<string, unknown>,
  key: string,
  value: unknown
): Record<string, unknown> {
  const parts = parseContentPath(key);
  if (parts.length === 0) return root;

  const setAt = (current: unknown, idx: number): unknown => {
    const part = parts[idx];
    const isLast = idx === parts.length - 1;

    if (isLast) {
      if (typeof part === 'number') {
        const arr = Array.isArray(current) ? [...current] : [];
        arr[part] = value;
        return arr;
      }
      return { ...(current as Record<string, unknown>), [part]: value };
    }

    const nextPart = parts[idx + 1];
    if (typeof part === 'number') {
      const arr = Array.isArray(current) ? [...current] : [];
      const child = arr[part];
      arr[part] = setAt(
        child != null && typeof child === 'object'
          ? child
          : typeof nextPart === 'number'
            ? []
            : {},
        idx + 1
      );
      return arr;
    }

    const obj = { ...(current as Record<string, unknown>) };
    const child = obj[part];
    obj[part] = setAt(
      child != null && typeof child === 'object'
        ? child
        : typeof nextPart === 'number'
          ? []
          : {},
      idx + 1
    );
    return obj;
  };

  return setAt(root, 0) as Record<string, unknown>;
}
