import { ApiError, FormField } from '@shoplab/ui-kit';
import { useState, type FormEvent } from 'react';
import { useAuth } from 'host/ui';
import { describeAuthError } from '../errors.ts';

type Mode = 'login' | 'register';

async function register(email: string, password: string, fullName: string) {
  const res = await fetch('/auth/register', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password, fullName }) });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new ApiError(res.status, body.error ?? 'request_failed');
  }
}

export function AuthForm() {
  const { login } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === 'register') await register(email, password, fullName);
      await login(email, password);
    } catch (err) {
      setError(describeAuthError(err, mode));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} aria-label={mode === 'login' ? 'Log in' : 'Create account'}>
      <h2>{mode === 'login' ? 'Log in' : 'Create account'}</h2>
      {mode === 'register' && (
        <FormField label="Full name" name="fullName">
          <input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </FormField>
      )}
      <FormField label="Email" name="email">
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </FormField>
      <FormField label="Password" name="password">
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </FormField>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={busy}>{mode === 'login' ? 'Log in' : 'Create account'}</button>
      <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}>
        {mode === 'login' ? 'Need an account?' : 'Have an account?'}
      </button>
    </form>
  );
}
