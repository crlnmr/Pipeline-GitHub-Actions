'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signUp, AuthError } from '@/services/auth.service';
import styles from './signup.module.css';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string; server?: string }>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const newErrors: { email?: string; password?: string; name?: string } = {};
    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido';
    }
    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 8) {
      newErrors.password = 'Senha deve ter no mínimo 8 caracteres';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      await signUp(email, password, name || undefined);
      router.push('/login');
    } catch (err) {
      if (err instanceof AuthError) {
        setErrors({ server: err.message });
      } else {
        setErrors({ server: 'Erro interno do servidor. Tente novamente.' });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Criar Conta</h1>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {errors.server && (
            <div className={styles.serverError}>{errors.server}</div>
          )}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">Nome</label>
            <input
              id="name"
              className={styles.input}
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <span className={styles.error}>{errors.name}</span>}
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              className={styles.input}
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            {errors.email && <span className={styles.error}>{errors.email}</span>}
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Senha</label>
            <input
              id="password"
              className={styles.input}
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            {errors.password && <span className={styles.error}>{errors.password}</span>}
          </div>
          <button
            className={styles.submitButton}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Criando...' : 'Criar conta'}
          </button>
        </form>
        <div className={styles.loginLink}>
          Já tem uma conta? <a href="/login">Entrar</a>
        </div>
      </div>
    </div>
  );
}
