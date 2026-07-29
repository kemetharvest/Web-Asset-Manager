import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { validateToken, extractToken } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
  const token = extractToken(request.headers.get('authorization') ?? undefined);
  if (!validateToken(token)) {
    return NextResponse.json(
      { error: 'غير مصرح لك بهذا الإجراء' },
      { status: 401 }
    );
  }

  store.clear();
  return NextResponse.json({ message: 'تم حذف جميع البيانات بنجاح' });
}
