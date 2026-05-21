import { isAuthenticated } from '@/lib/auth';
import { getCatalog } from '@/lib/books';
import AdminPanel from '@/components/AdminPanel';
import LoginForm from '@/components/LoginForm';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const authed = isAuthenticated();

  if (!authed) {
    return <LoginForm />;
  }

  const books = await getCatalog();

  return (
    <main className={styles.page}>
      <header className={`${styles.topbar} shell`}>
        <a href="/" className={styles.back}>
          ver acervo público
        </a>
        <form action="/api/auth" method="POST">
          <input type="hidden" name="action" value="logout" />
          <button type="submit" className={styles.logout}>
            sair
          </button>
        </form>
      </header>

      <section className={`${styles.head} shell`}>
        <div className={styles.eyebrow}>Curadoria</div>
        <h1 className={styles.title}>
          Painel <em>administrativo</em>
        </h1>
        <p className={styles.lede}>
          Adicione novos volumes ao acervo ou remova livros existentes.
          O catálogo é atualizado em tempo real.
        </p>
      </section>

      <div className="shell">
        <AdminPanel books={books} />
      </div>
    </main>
  );
}
