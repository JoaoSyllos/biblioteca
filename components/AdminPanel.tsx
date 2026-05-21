'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Book } from '@/lib/types';
import styles from '../app/admin/page.module.css';

type Props = { books: Book[] };

export default function AdminPanel({ books: initial }: Props) {
  const router = useRouter();
  const [books, setBooks] = useState(initial);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function pickFile(f: File | null) {
    if (!f) return;
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      setMessage({ type: 'error', text: 'Apenas arquivos PDF são aceitos.' });
      return;
    }
    setFile(f);
    setMessage(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files?.[0] ?? null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) {
      setMessage({ type: 'error', text: 'Selecione um PDF antes de enviar.' });
      return;
    }
    const fd = new FormData(e.currentTarget);
    fd.set('file', file);

    setUploading(true);
    setMessage(null);
    setProgress(0);

    // XHR para barra de progresso
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload');
    xhr.upload.addEventListener('progress', (ev) => {
      if (ev.lengthComputable) {
        setProgress(Math.round((ev.loaded / ev.total) * 100));
      }
    });
    xhr.onload = () => {
      setUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as { book: Book };
          setBooks((prev) => [data.book, ...prev]);
          setMessage({ type: 'success', text: `"${data.book.title}" foi adicionado ao acervo.` });
          formRef.current?.reset();
          setFile(null);
          setProgress(0);
          router.refresh();
        } catch {
          setMessage({ type: 'error', text: 'Resposta inválida do servidor.' });
        }
      } else {
        let errMsg = 'Erro ao enviar o arquivo.';
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.error) errMsg = data.error;
        } catch {}
        setMessage({ type: 'error', text: errMsg });
      }
    };
    xhr.onerror = () => {
      setUploading(false);
      setMessage({ type: 'error', text: 'Erro de rede durante o upload.' });
    };
    xhr.send(fd);
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Remover "${title}" da biblioteca?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/books?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) {
        setBooks((prev) => prev.filter((b) => b.id !== id));
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage({ type: 'error', text: data.error || 'Erro ao remover.' });
      }
    } finally {
      setDeletingId(null);
    }
  }

  function formatSize(b: number): string {
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className={styles.grid}>
      {/* COLUNA: FORMULÁRIO */}
      <div className={styles.formCol}>
        <h2>
          Adicionar volume <em>— novo registro</em>
        </h2>
        <p className={styles.subhead}>Preencha os metadados e envie o PDF</p>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className={styles.form}
          encType="multipart/form-data"
        >
          <div className={styles.field}>
            <label className={styles.label} htmlFor="title">
              Título <span className={styles.opt}>obrigatório</span>
            </label>
            <input
              id="title"
              name="title"
              required
              className={styles.input}
              placeholder="A República"
              maxLength={200}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              Arquivo PDF <span className={styles.opt}>obrigatório</span>
            </label>
            <div
              className={`${styles.fileBox} ${dragging ? styles.fileBoxActive : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <div className={styles.fileSelected}>
                  <span className={styles.fname}>{file.name}</span>
                  <span className={styles.fsize}>{formatSize(file.size)}</span>
                </div>
              ) : (
                <>
                  <div className={styles.fileBoxLabel}>
                    arraste o pdf ou <strong>clique para escolher</strong>
                  </div>
                  <div className={styles.fileBoxHint}>somente .pdf</div>
                </>
              )}
            </div>

            {uploading && (
              <div className={styles.progressWrap}>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                </div>
                <div className={styles.progressLabel}>
                  <span>enviando…</span>
                  <span>{progress}%</span>
                </div>
              </div>
            )}
          </div>

          {message && (
            <div
              className={`${styles.msg} ${
                message.type === 'success' ? styles.msgSuccess : styles.msgError
              }`}
            >
              {message.text}
            </div>
          )}

          <button type="submit" className={styles.submit} disabled={uploading}>
            {uploading ? 'enviando' : 'publicar volume'}
          </button>
        </form>
      </div>

      {/* COLUNA: GERENCIAR */}
      <div className={styles.listCol}>
        <h2>
          Acervo atual <em>— {books.length} {books.length === 1 ? 'volume' : 'volumes'}</em>
        </h2>
        <p className={styles.subhead}>Gerencie os livros já publicados</p>

        <div className={styles.adminList}>
          {books.length === 0 ? (
            <div className={styles.emptyList}>nenhum livro publicado ainda.</div>
          ) : (
            books.map((b) => (
              <div key={b.id} className={styles.adminItem}>
                <div className={styles.adminItemInfo}>
                  <h3>{b.title}</h3>
                  <p>{formatSize(b.fileSize)}</p>
                </div>
                <button
                  className={styles.delete}
                  onClick={() => handleDelete(b.id, b.title)}
                  disabled={deletingId === b.id}
                >
                  {deletingId === b.id ? 'removendo…' : 'remover'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
