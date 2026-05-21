import { NextRequest, NextResponse } from 'next/server';
import { checkPassword, setAuthCookie, clearAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') ?? '';

  // Logout via form
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const form = await req.formData();
    if (form.get('action') === 'logout') {
      clearAuthCookie();
      return NextResponse.redirect(new URL('/admin', req.url));
    }
  }

  // Login JSON
  try {
    const { password } = (await req.json()) as { password?: string };
    if (!password) {
      return NextResponse.json({ error: 'Senha é obrigatória.' }, { status: 400 });
    }
    const token = checkPassword(password);
    if (!token) {
      return NextResponse.json({ error: 'Senha incorreta.' }, { status: 401 });
    }
    setAuthCookie(token);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 });
  }
}
