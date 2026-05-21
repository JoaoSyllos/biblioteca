'use client';

import { useState, useMemo } from 'react';
import type { Book } from '@/lib/types';
import styles from '../app/page.module.css';

export default function BookList({ books }: { books: Book[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return books;
    const q = query.toLowerCase();
    return books.filter((b) => b.title.toLowerCase().includes(q));
  }, [books, query]);

  return (
    <>
      <div className={`${styles.sectionHead} shell`}>
        <h2 className={styles.sectionTitle}>
          O acervo <em>— {filtered.length} {filtered.length === 1 ? 'título' : 'títulos'}</em>
        </h2>

        <div className={styles.search}>
          <span className={styles.searchIcon}>buscar</span>
          <input
            className={styles.searchInput}
            placeholder="título, autor, tema…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
          />
        </div>
      </div>

      <div className={`${styles.catalog} shell`}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyTitle}>nenhum resultado.</div>
            <p className={styles.emptyText}>
              {books.length === 0
                ? 'A biblioteca ainda está vazia. Adicione o primeiro livro pela área administrativa.'
                : 'Tente outra palavra-chave ou volte a listar todos.'}
            </p>
            {books.length === 0 && (
              <a href="/admin" className={styles.emptyLink}>
                Adicionar livro
              </a>
            )}
          </div>
        ) : (
          filtered.map((book, i) => (
            <a
              key={book.id}
              href={`/livro/${book.slug}`}
              className={styles.bookRow}
            >
              <div className={styles.bookNum}>
                № {String(i + 1).padStart(2, '0')}
              </div>
              <div className={styles.bookMain}>
                <h3 className={styles.bookTitle}>{book.title}</h3>
              </div>
              <div className={styles.bookAction}>Ler</div>
            </a>
          ))
        )}
      </div>
    </>
  );
}
