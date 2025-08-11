import { apiFetch } from './api';

export async function login(email: string, password?: string) {
  const endpoint = '/auth/login';
  const response = await apiFetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return response;
}

export async function setupPassword(email: string, password: string) {
  const endpoint = '/auth/setup-password';
  const response = await apiFetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return response;
}

export async function register(email: string, password: string, name?: string) {
  const endpoint = '/auth/register';
  const response = await apiFetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  return response;
}

export async function logout(token: string) {
  const endpoint = '/auth/logout';
  return apiFetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
}

export async function checkUserStatus(email: string) {
  const endpoint = '/auth/check-status';
  return apiFetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}

export async function getAllUsers() {
  const endpoint = '/auth/get-all-users';
  return apiFetch(endpoint, {
    method: 'GET',
  });
}

export async function updateUserStatus(leadId: string, newStatus: string, adminNotes?: string) {
  const endpoint = '/auth/update-user-status';
  return apiFetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leadId, newStatus, adminNotes }),
  });
} 