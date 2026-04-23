'use client';

const webSessionStorage = {
  set(key: string, rawValue: any) {
    const value =
      typeof rawValue === 'string' ? rawValue : JSON?.stringify(rawValue);
    sessionStorage.setItem(key, value);
  },
  get(key: string) {
    const value: string = sessionStorage.getItem(key) || '';
    try {
      return JSON?.parse(value);
    } catch {
      return value;
    }
  },
  remove(key: string) {
    sessionStorage.removeItem(key);
  },
};

export default webSessionStorage;
