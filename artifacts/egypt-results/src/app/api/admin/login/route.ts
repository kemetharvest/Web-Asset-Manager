import { NextRequest, NextResponse } from 'next/server';
import { validatePassword, createToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as Record<string, unknown>).password !== 'string'
  ) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { password } = body as { password: string };
  if (!validatePassword(password)) {
    return NextResponse.json(
      { error: 'كلمة المرور غير صحيحة' },
      { status: 401 }
    );
  }

  const token = createToken();
  return NextResponse.json({ token });
}
