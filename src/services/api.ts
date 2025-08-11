// Lógica base para llamadas a la API
import { config } from '../config/environment';

const API_URL = config.apiUrl;

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('authToken');
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${API_URL}${endpoint}${token ? `${separator}token=${encodeURIComponent(token)}` : ''}`;
  
  // Obtener token del localStorage
  // token ya calculado arriba
  
  console.log('🔗 API Request:', {
    url,
    method: options.method || 'GET',
    body: options.body,
    environment: config.isDevelopment ? 'development' : 'production',
    hostname: window.location.hostname,
    apiUrl: API_URL
  });
  
  console.log('🔑 Token en localStorage:', token ? 'Presente' : 'Ausente');
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(token && { 'X-Auth-Token': token }), // Fallback por si algún proxy elimina Authorization
      ...options.headers,
    } as Record<string, string>;
    
    console.log('📋 Headers enviados:', headers);
    console.log('🔑 Token incluido:', token ? 'Sí' : 'No');
    
    const res = await fetch(url, {
      credentials: 'include', // envía cookies si las hay
      headers,
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