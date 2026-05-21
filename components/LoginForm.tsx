'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../app/admin/page.module.css';

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Senha incorreta.');
    }
  }

  return (
    <div className={styles.loginWrap}>
      <div className={styles.loginCard}>
        <div className={styles.loginEyebrow}>Área restrita</div>
        <h1 className={styles.loginTitle}>
          Acesso <em>privado.</em>
        </h1>
        <p className={styles.loginSub}>
          Informe a senha de administrador para gerenciar o acervo.
        </p>

        <form onSubmit={onSubmit} className={styles.loginForm}>
          <div className={styles.field}>
            <label className={styles.label}>Senha</label>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
            />
          </div>

          {error && (
            <div className={`${styles.msg} ${styles.msgError}`}>{error}</div>
          )}

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? 'verificando' : 'entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
