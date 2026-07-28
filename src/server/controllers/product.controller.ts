import 'server-only';

import { NextRequest } from 'next/server';

import { verifyJwtFromRequest } from '@/server/auth/session';
import { HttpException } from '@/server/errors';
import { sendError, sendSuccess, sendZodError } from '@/server/response';
import { productService } from '@/server/services/product.service';
import {
  productCreateSchema,
  productListQuerySchema,
  productUpdateSchema,
} from '@/server/validation/product';
import { ErrorCode, HttpStatus } from '@/settings/enums';

// Mongo product mirror là data platform-level (không scope tenant) → chỉ
// admin được đụng. `role` trong cookie gate đã được verify với BE tại
// /api/auth/session-set, không còn là input client.
const requireAdmin = async (req: NextRequest): Promise<string> => {
  const payload = await verifyJwtFromRequest(req);
  if (!payload?.sub) {
    throw HttpException.unauthorized(ErrorCode.UNAUTHORIZED);
  }
  if (payload.role !== 'admin') {
    throw HttpException.forbidden();
  }
  return String(payload.sub);
};

const toDTO = (doc: {
  _id: unknown;
  name: string;
  category?: string;
  description?: string;
  sku?: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  variants: string[];
  ingredients: string[];
  certifications: string[];
  features: { label: string; description: string }[];
  createdAt?: Date;
  updatedAt?: Date;
}) => ({
  id: String(doc._id),
  name: doc.name,
  category: doc.category ?? null,
  description: doc.description ?? null,
  sku: doc.sku ?? null,
  sizes: doc.sizes,
  colors: doc.colors,
  variants: doc.variants,
  ingredients: doc.ingredients,
  certifications: doc.certifications,
  features: doc.features,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export const productController = {
  async list(req: NextRequest) {
    try {
      await requireAdmin(req);
      const url = new URL(req.url);
      const parsed = productListQuerySchema.safeParse(
        Object.fromEntries(url.searchParams)
      );
      if (!parsed.success) return sendZodError(parsed.error);

      const result = await productService.list(parsed.data);
      return sendSuccess({ items: result.items.map(toDTO) }, undefined, {
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (err) {
      return sendError(err);
    }
  },

  async get(req: NextRequest, id: string) {
    try {
      await requireAdmin(req);
      const doc = await productService.getById(id);
      return sendSuccess(toDTO(doc));
    } catch (err) {
      return sendError(err);
    }
  },

  async create(req: NextRequest) {
    try {
      const userId = await requireAdmin(req);
      const raw = await req.json();
      const parsed = productCreateSchema.safeParse(raw);
      if (!parsed.success) return sendZodError(parsed.error);

      const doc = await productService.create(parsed.data, userId);
      return sendSuccess(toDTO(doc), 'Product created', {
        status: HttpStatus.CREATED,
      });
    } catch (err) {
      return sendError(err);
    }
  },

  async update(req: NextRequest, id: string) {
    try {
      await requireAdmin(req);
      const raw = await req.json();
      const parsed = productUpdateSchema.safeParse(raw);
      if (!parsed.success) return sendZodError(parsed.error);

      const doc = await productService.update(id, parsed.data);
      return sendSuccess(toDTO(doc), 'Product updated');
    } catch (err) {
      return sendError(err);
    }
  },

  async remove(req: NextRequest, id: string) {
    try {
      await requireAdmin(req);
      await productService.remove(id);
      return sendSuccess(null, 'Product deleted');
    } catch (err) {
      return sendError(err);
    }
  },
};
