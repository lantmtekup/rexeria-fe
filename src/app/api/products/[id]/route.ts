import { NextRequest } from 'next/server';

import { productController } from '@/server/controllers/product.controller';

export const runtime = 'nodejs';

interface RouteCtx {
  params: Promise<{ id: string }>;
}

export const GET = async (req: NextRequest, ctx: RouteCtx) => {
  const { id } = await ctx.params;
  return productController.get(req, id);
};

export const PATCH = async (req: NextRequest, ctx: RouteCtx) => {
  const { id } = await ctx.params;
  return productController.update(req, id);
};

export const DELETE = async (req: NextRequest, ctx: RouteCtx) => {
  const { id } = await ctx.params;
  return productController.remove(req, id);
};
