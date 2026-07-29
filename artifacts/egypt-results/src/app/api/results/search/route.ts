import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { ensureStoreLoaded } from '@/lib/preload';

export async function GET(request: NextRequest) {
  await ensureStoreLoaded();

  const { searchParams } = request.nextUrl;
  const name = searchParams.get('name');

  if (!name || name.trim().length === 0) {
    return NextResponse.json(
      { error: 'name query parameter is required' },
      { status: 400 }
    );
  }

  const page = Math.max(1, Math.floor(Number(searchParams.get('page') ?? '1')));
  const limit = Math.min(
    100,
    Math.max(1, Math.floor(Number(searchParams.get('limit') ?? '20')))
  );

  const { students, total } = store.searchByName(name, page, limit);
  return NextResponse.json({ students, total, page, limit });
}
