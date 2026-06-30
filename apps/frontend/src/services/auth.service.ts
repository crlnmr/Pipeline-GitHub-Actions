export class AuthError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

interface SignInResponse {
  message: string;
}

interface SignUpResponse {
  id: string;
  email: string;
  name?: string;
}

export async function signIn(email: string, password: string): Promise<SignInResponse> {
  const res = await fetch('/api/v1/auth/sign-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new AuthError(body.detail ?? 'Email ou senha inválidos', res.status);
  }

  return res.json();
}

export async function signUp(email: string, password: string, name?: string): Promise<SignUpResponse> {
  const res = await fetch('/api/v1/auth/sign-up', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new AuthError(body.detail ?? 'Erro ao criar conta', res.status);
  }

  return res.json();
}

export async function getCurrentUser(): Promise<{ clerkId: string; email: string; name?: string; role: string } | null> {
  try {
    const res = await fetch('/api/v1/auth/me', { method: 'GET' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
