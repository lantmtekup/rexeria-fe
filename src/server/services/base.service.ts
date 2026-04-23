import 'server-only';
import { Model, FilterQuery, UpdateQuery, Types } from 'mongoose';

import { HttpException } from '@/server/errors';
import { ErrorCode } from '@/settings/enums';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export abstract class BaseService<T = any> {
  protected abstract getModel(): Model<T>;

  async create(data: Partial<T>): Promise<T> {
    try {
      const doc = await this.getModel().create(data);
      return doc as T;
    } catch (error: any) {
      if (error.code === 11000) {
        throw HttpException.conflict(ErrorCode.DUPLICATE_ENTRY, {
          logMessage: 'Duplicate key',
        });
      }
      throw error;
    }
  }

  async findOne(id: string): Promise<T | null> {
    if (!this.isValidObjectId(id)) {
      throw HttpException.badRequest(ErrorCode.INVALID_ID, {
        logMessage: 'Invalid ObjectId',
      });
    }
    const doc = await this.getModel().findById(id);
    return (doc as T) || null;
  }

  async findOneByFilter(filter: FilterQuery<T>): Promise<T | null> {
    const doc = await this.getModel().findOne(filter);
    return (doc as T) || null;
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const doc = await this.getModel().exists(filter);
    return !!doc;
  }

  async findMany(filter: FilterQuery<T> = {}): Promise<T[]> {
    const docs = await this.getModel().find(filter);
    return docs as T[];
  }

  async findManyWithSort(
    filter: FilterQuery<T> = {},
    sort: Record<string, 1 | -1> = { createdAt: -1 }
  ): Promise<T[]> {
    const docs = await this.getModel().find(filter).sort(sort);
    return docs as T[];
  }

  async updateOne(id: string, data: UpdateQuery<T>): Promise<T | null> {
    if (!this.isValidObjectId(id)) {
      throw HttpException.badRequest(ErrorCode.INVALID_ID, {
        logMessage: 'Invalid ObjectId',
      });
    }
    const doc = await this.getModel().findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      throw HttpException.notFound(ErrorCode.RESOURCE_NOT_FOUND, {
        logMessage: 'Document not found',
      });
    }
    return doc as T;
  }

  async updateOneByFilter(
    filter: FilterQuery<T>,
    data: UpdateQuery<T>
  ): Promise<T | null> {
    const doc = await this.getModel().findOneAndUpdate(filter, data, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      throw HttpException.notFound(ErrorCode.RESOURCE_NOT_FOUND, {
        logMessage: 'Document not found',
      });
    }
    return doc as T;
  }

  async deleteOne(id: string): Promise<T | null> {
    if (!this.isValidObjectId(id)) {
      throw HttpException.badRequest(ErrorCode.INVALID_ID, {
        logMessage: 'Invalid ObjectId',
      });
    }
    const doc = await this.getModel().findByIdAndDelete(id);
    if (!doc) {
      throw HttpException.notFound(ErrorCode.RESOURCE_NOT_FOUND, {
        logMessage: 'Document not found',
      });
    }
    return doc as T;
  }

  async deleteOneSoft(id: string): Promise<T | null> {
    if (!this.isValidObjectId(id)) {
      throw HttpException.badRequest(ErrorCode.INVALID_ID, {
        logMessage: 'Invalid ObjectId',
      });
    }
    const doc = await this.getModel().findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!doc) {
      throw HttpException.notFound(ErrorCode.RESOURCE_NOT_FOUND, {
        logMessage: 'Document not found',
      });
    }
    return doc as T;
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.getModel().countDocuments(filter);
  }

  async paginate(
    filter: FilterQuery<T> = {},
    options: {
      page?: number;
      limit?: number;
      sort?: Record<string, 1 | -1>;
    } = {}
  ): Promise<PaginatedResult<T>> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;
    const sort = options.sort || { createdAt: -1 };

    const [data, total] = await Promise.all([
      this.getModel().find(filter).skip(skip).limit(limit).sort(sort),
      this.getModel().countDocuments(filter),
    ]);

    return {
      data: data as T[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private isValidObjectId(id: string): boolean {
    if (!id) return false;
    return (
      Types.ObjectId.isValid(id) && new Types.ObjectId(id).toString() === id
    );
  }
}
