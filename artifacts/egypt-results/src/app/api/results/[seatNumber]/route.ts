import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { ensureStoreLoaded } from '@/lib/preload';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ seatNumber: string }> }
) {
  await ensureStoreLoaded();

  const { seatNumber: seatParam } = await params;
  const seatNumber = Number(seatParam);

  if (isNaN(seatNumber) || seatNumber <= 0) {
    return NextResponse.json({ error: 'Invalid seat number' }, { status: 400 });
  }

  const student = store.getBySeat(seatNumber);
  if (!student) {
    return NextResponse.json(
      { error: 'لم يتم العثور على نتيجة لهذا الرقم' },
      { status: 404 }
    );
  }

  return NextResponse.json(student);
}
