import { NextResponse } from 'next/server';

import { constants } from '@/settings/constants';

export const runtime = 'nodejs';

export async function POST(): Promise<NextResponse> {
  const res = NextResponse.json({ success: true });
  res.cookies.delete(constants.ACCESS_TOKEN);
  return res;
}
