import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { ensureStoreLoaded } from '@/lib/preload';
import { validateToken, extractToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const token = extractToken(request.headers.get('authorization') ?? undefined);
  if (!validateToken(token)) {
    return NextResponse.json(
      { error: 'غير مصرح لك بهذا الإجراء' },
      { status: 401 }
    );
  }

  await ensureStoreLoaded();
  return NextResponse.json(store.getStats());
}
