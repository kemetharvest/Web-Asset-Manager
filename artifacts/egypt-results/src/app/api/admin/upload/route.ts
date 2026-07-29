import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { validateToken, extractToken } from '@/lib/auth';
import { parseExcelBuffer } from '@/lib/preload';

// Allow up to 60 s for large-file parsing (Vercel Pro / self-hosted)
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const token = extractToken(request.headers.get('authorization') ?? undefined);
  if (!validateToken(token)) {
    return NextResponse.json(
      { error: 'غير مصرح لك بهذا الإجراء' },
      { status: 401 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'لم يتم رفع أي ملف' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'لم يتم رفع أي ملف' }, { status: 400 });
  }

  const isValidType =
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.type === 'application/vnd.ms-excel' ||
    file.name.endsWith('.xlsx') ||
    file.name.endsWith('.xls');

  if (!isValidType) {
    return NextResponse.json(
      { error: 'Only .xlsx and .xls files are allowed' },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const students = parseExcelBuffer(buffer);

    if (students.length === 0) {
      return NextResponse.json(
        { error: 'لم يتم العثور على بيانات صحيحة في الملف' },
        { status: 400 }
      );
    }

    store.load(students);
    return NextResponse.json({
      count: students.length,
      message: `تم رفع بيانات ${students.length.toLocaleString('ar-EG')} طالب بنجاح`,
    });
  } catch {
    return NextResponse.json(
      { error: 'فشل في قراءة الملف. تأكد من أنه ملف Excel صحيح' },
      { status: 400 }
    );
  }
}
