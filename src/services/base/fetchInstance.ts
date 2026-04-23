import { constants } from '@/settings/constants';
import webStorageClient from '@/lib/webStorageClient';

export type HTTPS_METHOD = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type FetchOptions = {
  queryString?: any;
  variables?: FetchVariables;
  method?: HTTPS_METHOD;
  next?: any;
};

export type FetchVariables = { [key: string]: string | any | undefined };

export type FetchResults<T> = T;

/**
 * Native implementation of lodash omit function
 * Removes specified keys from an object
 */
const omit = <T extends Record<string, any>>(
  obj: T,
  keysToOmit: string | string[]
): Partial<T> => {
  const keys = Array.isArray(keysToOmit) ? keysToOmit : [keysToOmit];
  const result = { ...obj };

  keys.forEach(key => {
    if (key && key in result) {
      delete result[key];
    }
  });

  return result;
};

const fetchInstance = async <T>(
  url: string,
  options?: FetchOptions
): Promise<FetchResults<T>> => {
  const isServer = typeof window === 'undefined' ? true : false;
  let accessToken = null;

  if (isServer) {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    accessToken = cookieStore.get(constants.ACCESS_TOKEN)?.value;
  } else {
    accessToken = webStorageClient.getToken();
  }

  const { queryString, variables, method = 'GET' } = options || {};

  const queryStringURL = queryString
    ? '?' + new URLSearchParams(queryString).toString()
    : '';

  const api = constants.API_URL + url + queryStringURL;
  const isFormData = variables instanceof FormData;

  const optionsAPI = omit(
    {
      method,
      body: isFormData
        ? variables
        : JSON.stringify({
            ...variables,
          }),
      headers: omit(
        {
          ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
          Authorization:
            accessToken && url !== '/v1/internal-setting'
              ? `Bearer ${accessToken}`
              : undefined,
        },
        !accessToken ? 'Authorization' : ''
      ),
    },
    method === 'GET' ? 'body' : ''
  );

  const response = await fetch(api, {
    ...optionsAPI,
    ...(isServer ? {} : { credentials: 'include' as const }),
  });

  const res = await response.json();

  if (res.errors) {
    throw res.errors;
  }

  if (!response.ok) {
    throw new Error(
      res?.message || `Fetch error: ${response.status} ${response.statusText}`
    );
  }

  return { ...res };
};

export { fetchInstance };
