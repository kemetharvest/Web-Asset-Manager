import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { ensureStoreLoaded } from '@/lib/preload';

export async function GET() {
  await ensureStoreLoaded();
  return NextResponse.json({ loaded: store.loaded, count: store.count });
}
