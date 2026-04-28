import { NextRequest } from 'next/server';

import { productController } from '@/server/controllers/product.controller';

export const runtime = 'nodejs';

export const GET = (req: NextRequest) => productController.list(req);
export const POST = (req: NextRequest) => productController.create(req);
