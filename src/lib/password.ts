/**
 * Password helpers dùng chung — sinh password mạnh + copy robust (Clipboard
 * API với fallback execCommand). Tách ra để AdminCreateUserModal và
 * reset-password (members) cùng dùng.
 */

/**
 * 16 ký tự, đảm bảo có lower/upper/digit/symbol, tránh ký tự dễ nhầm
 * (l, 1, O, 0) để đọc trên màn hình.
 */
export function generatePassword(): string {
  const lowers = 'abcdefghijkmnopqrstuvwxyz';
  const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '23456789';
  const symbols = '!@#$%^&*-_=+';
  const all = lowers + uppers + digits + symbols;
  const pick = (set: string, n: number) => {
    const arr = new Uint32Array(n);
    crypto.getRandomValues(arr);
    return Array.from(arr, x => set[x % set.length]).join('');
  };
  const base =
    pick(lowers, 1) + pick(uppers, 1) + pick(digits, 1) + pick(symbols, 1);
  const rest = pick(all, 12);
  // Trộn ngẫu nhiên (Fisher–Yates) để 4 ký tự bắt buộc không đứng đầu.
  const chars = (base + rest).split('');
  for (let i = chars.length - 1; i > 0; i--) {
    const r = new Uint32Array(1);
    crypto.getRandomValues(r);
    const j = r[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

/** Copy text — Clipboard API, fallback textarea+execCommand. True nếu OK. */
export async function copyText(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    /* fallback */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = value;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
