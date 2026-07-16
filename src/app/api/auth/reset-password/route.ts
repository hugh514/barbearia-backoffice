import { NextResponse } from 'next/server';
import { apiFetch } from '@/lib/http/server-fetch';
import { resetPasswordSchema } from '@/features/auth/schemas';

export async function POST(request: Request) {
  const raw = await request.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { statusCode: 400, error: 'Bad Request', message: 'Dados inválidos' },
      { status: 400 },
    );
  }

  const { token, password } = parsed.data;
  const res = await apiFetch('/auth/reset-password', {
    method: 'POST',
    body: { token, password },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    return NextResponse.json(json ?? { message: 'Falha ao redefinir' }, {
      status: res.status,
    });
  }
  return NextResponse.json({ ok: true }, { status: 200 });
}
