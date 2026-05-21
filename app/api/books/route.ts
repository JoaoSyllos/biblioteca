import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { removeBook } from '@/lib/books';

export const runtime = 'nodejs';

export async function DELETE(req: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID é obrigatório.' }, { status: 400 });
  }
  try {
    await removeBook(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Erro ao remover livro:', err);
    return NextResponse.json({ error: 'Falha ao remover.' }, { status: 500 });
  }
}
