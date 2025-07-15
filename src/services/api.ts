// Lógica base para llamadas a la API
const API_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:3003'
    : '/api'; // En producción, usa rutas relativas (Vercel serverless o proxy)

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  
  console.log('🔗 API Request:', {
    url,
    method: options.method || 'GET',
    body: options.body
  });
  
  const res = await fetch(url, {
    credentials: 'include',
    ...options,
  });
  
  console.log('📊 API Response:', {
    status: res.status,
    ok: res.ok
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }));
    console.error('❌ API Error:', errorData);
    throw new Error(errorData.error || 'Error en la API');
  }
  
  return res.json();
} 