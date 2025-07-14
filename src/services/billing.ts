import { apiFetch } from './api';

export async function getPlans() {
  return apiFetch('/billing/plans');
}

export async function subscribe(planId: string) {
  return apiFetch('/billing/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId }),
  });
} 