import { list, put, del, head } from '@vercel/blob';
import type { Book } from './types';

const CATALOG_PATHNAME = 'catalog.json';

export async function getCatalog(): Promise<Book[]> {
  try {
    const { blobs } = await list({ prefix: CATALOG_PATHNAME, limit: 1 });
    const catalog = blobs.find((b) => b.pathname === CATALOG_PATHNAME);
    if (!catalog) return [];
    const res = await fetch(catalog.url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = (await res.json()) as Book[];
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Erro lendo catalog:', err);
    return [];
  }
}

export async function saveCatalog(books: Book[]): Promise<void> {
  const { blobs } = await list({ prefix: CATALOG_PATHNAME, limit: 1 });
  const existing = blobs.find((b) => b.pathname === CATALOG_PATHNAME);
  if (existing) await del(existing.url);
  await put(CATALOG_PATHNAME, JSON.stringify(books, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  });
}

export async function getBookBySlug(slug: string): Promise<Book | null> {
  const catalog = await getCatalog();
  return catalog.find((b) => b.slug === slug) ?? null;
}

export async function addBook(book: Book): Promise<void> {
  const catalog = await getCatalog();
  catalog.unshift(book);
  await saveCatalog(catalog);
}

export async function removeBook(id: string): Promise<void> {
  const catalog = await getCatalog();
  const book = catalog.find((b) => b.id === id);
  if (!book) return;
  try {
    await del(book.pdfUrl);
  } catch (err) {
    console.error('Falha ao deletar blob do PDF:', err);
  }
  await saveCatalog(catalog.filter((b) => b.id !== id));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}
