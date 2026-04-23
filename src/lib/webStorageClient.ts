import Cookies from 'js-cookie';

import { constants } from '@/settings/constants';

const webStorageClient = {
  set(key: string, rawValue: any, option?: any) {
    const value =
      typeof rawValue === 'string' ? rawValue : JSON?.stringify(rawValue);
    Cookies.set(key, value, option);
  },

  get(key: string) {
    const value: string = Cookies.get(key) || '';
    try {
      return JSON?.parse(value);
    } catch {
      return value;
    }
  },

  remove(key: string) {
    Cookies.remove(key);
  },

  removeAll() {
    Object.keys(Cookies.get()).forEach(cookieName => {
      Cookies.remove(cookieName);
    });
  },

  setToken(value: string, option?: any) {
    Cookies.set(constants.ACCESS_TOKEN, value, option);
  },

  getToken() {
    return Cookies.get(constants.ACCESS_TOKEN);
  },
};

export default webStorageClient;
