import { productEndpoint } from '@/services/endpoint/product';
import type { ApiErrorResponse, ApiSuccessResponse } from '@/types/api';

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductFeature {
  label: string;
  description: string;
}

export interface ProductDTO {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  sku: string | null;
  sizes: string[];
  colors: ProductColor[];
  variants: string[];
  ingredients: string[];
  certifications: string[];
  features: ProductFeature[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductCreatePayload {
  name: string;
  category?: string;
  description?: string;
  sku?: string;
  sizes?: string[];
  colors?: ProductColor[];
  variants?: string[];
  ingredients?: string[];
  certifications?: string[];
  features?: ProductFeature[];
}

export type ProductUpdatePayload = Partial<ProductCreatePayload>;

export class ProductApiError extends Error {
  code: string;
  status: number;
  details?: unknown;
  constructor(body: ApiErrorResponse, status: number) {
    super(body.code);
    this.name = 'ProductApiError';
    this.code = body.code;
    this.status = status;
    this.details = body.details;
  }
}

const request = async <T>(
  url: string,
  init?: Omit<RequestInit, 'body'> & { body?: unknown }
): Promise<T> => {
  const { body, headers, ...rest } = init ?? {};
  const res = await fetch(url, {
    ...rest,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  const parsed = (text ? JSON.parse(text) : null) as
    ApiSuccessResponse<T> | ApiErrorResponse | null;
  if (!res.ok || !parsed || parsed.success === false) {
    throw new ProductApiError(
      parsed && parsed.success === false
        ? parsed
        : ({ success: false, code: 'INTERNAL_ERROR' } as ApiErrorResponse),
      res.status
    );
  }
  return parsed.data;
};

export const productApi = {
  list: (query?: { page?: number; limit?: number; search?: string }) => {
    const usp = new URLSearchParams();
    if (query?.page) usp.set('page', String(query.page));
    if (query?.limit) usp.set('limit', String(query.limit));
    if (query?.search) usp.set('search', query.search);
    const qs = usp.toString();
    return request<{ items: ProductDTO[] }>(
      `${productEndpoint.LIST}${qs ? `?${qs}` : ''}`
    );
  },
  get: (id: string) => request<ProductDTO>(productEndpoint.byId(id)),
  create: (payload: ProductCreatePayload) =>
    request<ProductDTO>(productEndpoint.CREATE, {
      method: 'POST',
      body: payload,
    }),
  update: (id: string, payload: ProductUpdatePayload) =>
    request<ProductDTO>(productEndpoint.byId(id), {
      method: 'PATCH',
      body: payload,
    }),
  remove: (id: string) =>
    request<null>(productEndpoint.byId(id), { method: 'DELETE' }),
};
