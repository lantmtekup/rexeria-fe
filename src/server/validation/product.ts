import { z } from 'zod';

const HEX_REGEX = /^#?[0-9a-fA-F]{3,8}$/;

const colorSchema = z.object({
  name: z.string().trim().min(1),
  hex: z
    .string()
    .trim()
    .regex(HEX_REGEX, 'Invalid hex color')
    .transform(v => (v.startsWith('#') ? v : `#${v}`)),
});

const featureSchema = z.object({
  label: z.string().trim().min(1),
  description: z.string().trim().default(''),
});

export const productCreateSchema = z.object({
  name: z.string().trim().min(1, 'Product name is required'),
  category: z.string().trim().optional(),
  description: z.string().trim().optional(),
  sku: z.string().trim().optional(),
  sizes: z.array(z.string().trim().min(1)).default([]),
  colors: z.array(colorSchema).default([]),
  variants: z.array(z.string().trim().min(1)).default([]),
  ingredients: z.array(z.string().trim().min(1)).default([]),
  certifications: z.array(z.string().trim().min(1)).default([]),
  features: z.array(featureSchema).default([]),
});

export const productUpdateSchema = productCreateSchema.partial();

export const productListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type ProductListQuery = z.infer<typeof productListQuerySchema>;
