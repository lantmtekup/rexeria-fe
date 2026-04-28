import { Schema, type Types } from 'mongoose';

import { getOrCreateModel } from '@/models/registry';

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductFeature {
  label: string;
  description: string;
}

export interface ProductDoc {
  _id: Types.ObjectId;
  name: string;
  category?: string;
  description?: string;
  sku?: string;
  sizes: string[];
  colors: ProductColor[];
  variants: string[];
  ingredients: string[];
  certifications: string[];
  features: ProductFeature[];
  createdBy?: Types.ObjectId;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const productColorSchema = new Schema<ProductColor>(
  {
    name: { type: String, required: true, trim: true },
    hex: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const productFeatureSchema = new Schema<ProductFeature>(
  {
    label: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const productSchema = new Schema<ProductDoc>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    description: { type: String, trim: true },
    sku: { type: String, trim: true },
    sizes: { type: [String], default: [] },
    colors: { type: [productColorSchema], default: [] },
    variants: { type: [String], default: [] },
    ingredients: { type: [String], default: [] },
    certifications: { type: [String], default: [] },
    features: { type: [productFeatureSchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

productSchema.index({ name: 1 });
productSchema.index({ sku: 1 }, { sparse: true });

export const ProductModel = getOrCreateModel<ProductDoc>(
  'Product',
  productSchema
);
