import { getCatalog } from '@/lib/books';
import BookList from '@/components/BookList';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const books = await getCatalog();
  const year = new Date().getFullYear();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={`${styles.headerInner} shell`}>
          <div className={styles.brand}>
            <span className={styles.brandMark}>Biblioteca</span>
            <span className={styles.brandNum}>est. {year}</span>
          </div>
          <a href="/admin" className={styles.adminLink}>
            Administrar
          </a>
        </div>
      </header>

      <section className={`${styles.hero} shell`}>
        <div className={styles.heroGrid}>
          <div>
            <div className={styles.eyebrow}>Acervo de Estudo</div>
            <h1 className={styles.title}>
              Uma coleção<br />
              de leituras <span className={styles.titleItalic}>essenciais.</span>
            </h1>
            <p className={styles.lede}>
              Obras selecionadas e disponibilizadas para consulta acadêmica.
              Cada volume preserva o pensamento original do autor.
            </p>
          </div>

          <div className={styles.heroMeta}>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Volumes</span>
              <span className={styles.metaCount}>
                {String(books.length).padStart(2, '0')}
              </span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Formato</span>
              <span className={styles.metaValue}>pdf</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Atualizado</span>
              <span className={styles.metaValue}>
                {books[0]
                  ? new Date(books[0].uploadedAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '—'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <BookList books={books} />

      <footer className={`${styles.footer} shell`}>
        <span>© {year} — uso acadêmico</span>
        <span>curadoria pessoal</span>
      </footer>
    </main>
  );
}
