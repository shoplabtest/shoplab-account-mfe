import { ApiError } from '@shoplab/ui-kit';

/** Maps an API failure from login or registration to text a shopper can act on. */
export function describeAuthError(e: unknown, mode: 'login' | 'register'): string {
  if (e instanceof ApiError) {
    if (e.status === 401) return 'Wrong email or password.';
    if (e.status === 409) return 'That email is already registered.';
    if (e.status === 400) return mode === 'register' ? 'Check your details: use a valid email and a password of 8+ characters.' : 'Enter your email and password.';
  }
  return 'Something went wrong. Please try again.';
}
