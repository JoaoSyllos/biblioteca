import { notFound } from 'next/navigation';
import { getBookBySlug } from '@/lib/books';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function BookPage({
  params,
}: {
  params: { slug: string };
}) {
  const book = await getBookBySlug(params.slug);
  if (!book) notFound();

  return (
    <main className={styles.page}>
      <header className={`${styles.topbar} shell`}>
        <a href="/" className={styles.back}>
          voltar ao acervo
        </a>
        <a
          href={book.pdfUrl}
          download
          className={styles.download}
          target="_blank"
          rel="noopener noreferrer"
        >
          baixar pdf
        </a>
      </header>

      <section className={`${styles.cover} shell`}>
        <div className={styles.coverGrid}>
          <div>
            <div className={styles.eyebrow}>Volume</div>
            <h1 className={styles.title}>{book.title}</h1>
          </div>

          <div className={styles.meta}>
            <div className={styles.metaRow}>
              <span>Formato</span>
              <span>PDF</span>
            </div>
            <div className={styles.metaRow}>
              <span>Tamanho</span>
              <span>{formatSize(book.fileSize)}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="shell">
        <div className={styles.readerWrap}>
          <div className={styles.readerHead}>
            <span>leitor — uso o seu navegador</span>
            <span>scroll para navegar</span>
          </div>
          <iframe
            className={styles.reader}
            src={`${book.pdfUrl}#view=FitH`}
            title={book.title}
          />
        </div>
      </div>
    </main>
  );
}
