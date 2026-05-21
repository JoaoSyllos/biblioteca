import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { isAuthenticated } from '@/lib/auth';
import { addBook, getCatalog, slugify } from '@/lib/books';
import type { Book } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

export async function POST(req: NextRequest) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Form inválido.' }, { status: 400 });
  }

  const title = String(form.get('title') ?? '').trim();
  const file = form.get('file');

  if (!title) {
    return NextResponse.json({ error: 'Título é obrigatório.' }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
  }
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return NextResponse.json({ error: 'Apenas PDFs são aceitos.' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: `Arquivo excede o limite de ${MAX_SIZE / (1024 * 1024)} MB.` },
      { status: 413 }
    );
  }

  // Gerar slug único
  const baseSlug = slugify(title) || 'livro';
  const existing = await getCatalog();
  const slugs = new Set(existing.map((b) => b.slug));
  let slug = baseSlug;
  let i = 1;
  while (slugs.has(slug)) {
    slug = `${baseSlug}-${++i}`;
  }

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const pathname = `livros/${slug}.pdf`;

  let blob;
  try {
    blob = await put(pathname, file, {
      access: 'public',
      contentType: 'application/pdf',
      addRandomSuffix: true,
    });
  } catch (err) {
    console.error('Falha no upload para Blob:', err);
    return NextResponse.json(
      { error: 'Falha ao enviar o arquivo. Verifique se o Vercel Blob está configurado.' },
      { status: 500 }
    );
  }

  const book: Book = {
    id,
    slug,
    title,
    pdfUrl: blob.url,
    pdfPathname: blob.pathname,
    fileSize: file.size,
    uploadedAt: new Date().toISOString(),
  };

  await addBook(book);

  return NextResponse.json({ book }, { status: 201 });
}
