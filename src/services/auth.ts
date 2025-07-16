import { apiFetch } from './api';

export async function login(email: string, password: string) {
  const endpoint = '/auth/login';
  return apiFetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export async function register(email: string, password: string) {
  const endpoint = '/auth/register';
  return apiFetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export async function logout() {
  const endpoint = '/auth/logout';
  return apiFetch(endpoint, { method: 'POST' });
} 