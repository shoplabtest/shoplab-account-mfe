import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@shoplab/ui-kit';
import { authFetch, hostState, login, logout } from './stubs/host-ui.ts';
import { stubFetch } from './helpers.ts';
import Account from '../src/Account.tsx';

const profile = { id: 'u-1', email: 'ada@shoplab.test', fullName: 'Ada Lovelace', role: 'customer' };

const fill = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

beforeEach(() => {
  hostState.user = null;
  for (const m of [authFetch, login, logout]) m.mockReset();
});

describe('logged out', () => {
  it('login calls the host login with the entered credentials', async () => {
    login.mockResolvedValue(undefined);
    render(<Account />);
    fill('Email', 'ada@shoplab.test');
    fill('Password', 'password123');
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));
    await waitFor(() => expect(login).toHaveBeenCalledWith('ada@shoplab.test', 'password123'));
  });

  it('wrong credentials (401) show a specific message', async () => {
    login.mockRejectedValue(new ApiError(401, 'invalid_credentials'));
    render(<Account />);
    fill('Email', 'ada@shoplab.test');
    fill('Password', 'nope-nope-1');
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));
    expect((await screen.findByRole('alert')).textContent).toBe('Wrong email or password.');
  });

  it('unexpected failures show a generic message', async () => {
    login.mockRejectedValue(new Error('network'));
    render(<Account />);
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));
    expect((await screen.findByRole('alert')).textContent).toBe('Something went wrong. Please try again.');
  });

  it('register posts to /auth/register, then logs in', async () => {
    login.mockResolvedValue(undefined);
    const calls = stubFetch({ 'POST /auth/register': () => ({ status: 201, body: profile }) });
    render(<Account />);
    fireEvent.click(screen.getByRole('button', { name: 'Need an account?' }));
    fill('Full name', 'Ada Lovelace');
    fill('Email', 'ada@shoplab.test');
    fill('Password', 'password123');
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    await waitFor(() => expect(login).toHaveBeenCalledWith('ada@shoplab.test', 'password123'));
    expect(JSON.parse(calls[0].init.body as string)).toEqual({ email: 'ada@shoplab.test', password: 'password123', fullName: 'Ada Lovelace' });
  });

  it('registering an existing email (409) shows a message and does not log in', async () => {
    stubFetch({ 'POST /auth/register': () => ({ status: 409, body: { error: 'email_taken' } }) });
    render(<Account />);
    fireEvent.click(screen.getByRole('button', { name: 'Need an account?' }));
    fill('Email', 'ada@shoplab.test');
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect((await screen.findByRole('alert')).textContent).toBe('That email is already registered.');
    expect(login).not.toHaveBeenCalled();
  });
});

describe('logged in', () => {
  const routes = (orders: unknown = [], ordersFail = false) =>
    authFetch.mockImplementation(async (path: string, init?: RequestInit) => {
      if (path === '/users/u-1' && !init?.method) return profile as never;
      if (path === '/users/u-1' && init?.method === 'PATCH') return { ...profile, fullName: JSON.parse(init.body as string).fullName } as never;
      if (path === '/orders') {
        if (ordersFail) throw new ApiError(404, 'not_found');
        return orders as never;
      }
      throw new Error(`unexpected ${path}`);
    });

  beforeEach(() => { hostState.user = { id: 'u-1', role: 'customer' }; });

  it('loads the profile for the signed-in user', async () => {
    routes();
    render(<Account />);
    expect(await screen.findByText('ada@shoplab.test')).toBeTruthy();
    expect((screen.getByLabelText('Full name') as HTMLInputElement).value).toBe('Ada Lovelace');
  });

  it('saving sends PATCH /users/:id and confirms', async () => {
    routes();
    render(<Account />);
    await screen.findByText('ada@shoplab.test');
    fill('Full name', 'Ada King');
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect((await screen.findByRole('status')).textContent).toBe('Saved');
    expect(authFetch).toHaveBeenCalledWith('/users/u-1', { method: 'PATCH', body: JSON.stringify({ fullName: 'Ada King' }) });
  });

  it('a blank name is rejected without calling the API', async () => {
    routes();
    render(<Account />);
    await screen.findByText('ada@shoplab.test');
    fill('Full name', '   ');
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect((await screen.findByRole('alert')).textContent).toBe('Could not save your profile.');
    expect(authFetch).not.toHaveBeenCalledWith('/users/u-1', expect.objectContaining({ method: 'PATCH' }));
  });

  it('lists past orders', async () => {
    routes([{ id: 'o-7', status: 'shipped', total: 12500, currency: 'USD', placedAt: '2026-10-15T10:00:00Z' }]);
    render(<Account />);
    expect(await screen.findByText(/o-7 · shipped/)).toBeTruthy();
    expect(screen.getByText('$125.00')).toBeTruthy();
  });

  it('shows an empty state when there are no orders', async () => {
    routes([]);
    render(<Account />);
    expect(await screen.findByText('No orders yet.')).toBeTruthy();
  });

  it('keeps the page usable when the orders service is unavailable', async () => {
    routes([], true);
    render(<Account />);
    expect((await screen.findByText('Order history is unavailable right now.'))).toBeTruthy();
    expect(screen.getByText('ada@shoplab.test')).toBeTruthy();
  });

  it('shows an error when the profile cannot be loaded', async () => {
    authFetch.mockRejectedValue(new ApiError(500, 'boom'));
    render(<Account />);
    expect(await screen.findByText('Could not load your profile.')).toBeTruthy();
  });

  it('log out calls the host logout', async () => {
    routes();
    render(<Account />);
    fireEvent.click(await screen.findByRole('button', { name: 'Log out' }));
    expect(logout).toHaveBeenCalled();
  });
});
