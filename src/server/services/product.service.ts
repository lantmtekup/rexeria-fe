import 'server-only';

import { Types, type FilterQuery } from 'mongoose';

import { connectDB } from '@/lib/mongodb';
import { ProductModel, type ProductDoc } from '@/models/Product';
import { HttpException } from '@/server/errors';
import { ErrorCode } from '@/settings/enums';
import type {
  ProductCreateInput,
  ProductListQuery,
  ProductUpdateInput,
} from '@/server/validation/product';

const assertValidId = (id: string) => {
  if (!id || !Types.ObjectId.isValid(id)) {
    throw HttpException.invalidId({ logMessage: `Invalid product id: ${id}` });
  }
};

export interface ProductListResult {
  items: ProductDoc[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const productService = {
  async list(query: ProductListQuery): Promise<ProductListResult> {
    await connectDB();
    const { page, limit, search } = query;
    const filter: FilterQuery<ProductDoc> = { isDeleted: { $ne: true } };
    if (search) {
      // Escape metachar + cap độ dài: input user đi thẳng vào $regex có thể
      // là pattern catastrophic (ReDoS). Chỉ cần substring match literal.
      const escaped = search
        .slice(0, 100)
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.name = { $regex: escaped, $options: 'i' };
    }
    const [items, total] = await Promise.all([
      ProductModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean<ProductDoc[]>(),
      ProductModel.countDocuments(filter),
    ]);
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  },

  async getById(id: string): Promise<ProductDoc> {
    assertValidId(id);
    await connectDB();
    const doc = await ProductModel.findOne({
      _id: id,
      isDeleted: { $ne: true },
    }).lean<ProductDoc | null>();
    if (!doc) {
      throw HttpException.notFound(ErrorCode.RESOURCE_NOT_FOUND);
    }
    return doc;
  },

  async create(
    input: ProductCreateInput,
    createdBy?: string
  ): Promise<ProductDoc> {
    await connectDB();
    const created = await ProductModel.create({
      ...input,
      createdBy:
        createdBy && Types.ObjectId.isValid(createdBy) ? createdBy : undefined,
    });
    return created.toObject() as ProductDoc;
  },

  async update(id: string, input: ProductUpdateInput): Promise<ProductDoc> {
    assertValidId(id);
    await connectDB();
    const doc = await ProductModel.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      { $set: input },
      { new: true, runValidators: true }
    ).lean<ProductDoc | null>();
    if (!doc) {
      throw HttpException.notFound(ErrorCode.RESOURCE_NOT_FOUND);
    }
    return doc;
  },

  async remove(id: string): Promise<void> {
    assertValidId(id);
    await connectDB();
    const doc = await ProductModel.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );
    if (!doc) {
      throw HttpException.notFound(ErrorCode.RESOURCE_NOT_FOUND);
    }
  },
};
