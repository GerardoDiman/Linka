import { apiFetch } from './api';

export async function login(email: string, password: string) {
  // En local: /auth/login, en producción: /api/auth/login
  const endpoint = window.location.hostname === 'localhost' ? '/auth/login' : '/auth/login';
  return apiFetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export async function register(email: string, password: string) {
  // En local: /auth/register, en producción: /api/auth/register
  const endpoint = window.location.hostname === 'localhost' ? '/auth/register' : '/auth/register';
  return apiFetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export async function logout() {
  // En local: /auth/logout, en producción: /api/auth/logout
  const endpoint = window.location.hostname === 'localhost' ? '/auth/logout' : '/auth/logout';
  return apiFetch(endpoint, { method: 'POST' });
} 