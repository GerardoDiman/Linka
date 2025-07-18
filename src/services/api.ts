// Lógica base para llamadas a la API
const API_URL = '/api'; // Siempre usar /api como prefijo

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  
  console.log('🔗 API Request:', {
    url,
    method: options.method || 'GET',
    body: options.body,
    environment: window.location.hostname === 'localhost' ? 'local' : 'production'
  });
  
  try {
    const res = await fetch(url, {
      credentials: 'include',
      ...options,
    });
    
    console.log('📊 API Response:', {
      status: res.status,
      ok: res.ok,
      statusText: res.statusText
    });
    
    if (!res.ok) {
      let errorData;
      try {
        errorData = await res.json();
      } catch {
        errorData = { error: `Error ${res.status}: ${res.statusText}` };
      }
      console.error('❌ API Error:', errorData);
      throw new Error(errorData.error || `Error ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log('✅ API Success:', data);
    return data;
  } catch (error) {
    console.error('❌ Network Error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error de conexión');
  }
} 