// Configuración de entorno automática
export interface EnvironmentConfig {
  isDevelopment: boolean;
  apiUrl: string;
  webhookUrl: string;
  webhookSecret: string;
  // URLs de n8n para ambos entornos
  n8nWebhookUrl: string;
  n8nWebhookSecret: string;
}

// Detectar el entorno automáticamente
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname.includes('localhost');

// Configuración por defecto
const defaultConfig: EnvironmentConfig = {
  isDevelopment,
  apiUrl: isDevelopment ? '/api' : `${window.location.origin}/api`,
  webhookUrl: 'https://n8n.srv858616.hstgr.cloud/webhook/linka',
  webhookSecret: '8e723900-53ba-4198-a303-fef0224f2d0a',
  // Configuración específica para n8n
  n8nWebhookUrl: 'https://n8n.srv858616.hstgr.cloud/webhook/linka',
  n8nWebhookSecret: '8e723900-53ba-4198-a303-fef0224f2d0a'
};

// Función para obtener la configuración
export const getEnvironmentConfig = (): EnvironmentConfig => {
  // En desarrollo, usar configuración local
  if (isDevelopment) {
    return {
      ...defaultConfig,
      apiUrl: '/api' // Siempre usar /api en desarrollo
    };
  }
  
  // En producción, usar configuración de producción
  return defaultConfig;
};

// Exportar la configuración actual
export const config = getEnvironmentConfig();

console.log('🌍 Environment Config:', {
  isDevelopment: config.isDevelopment,
  hostname: window.location.hostname,
  apiUrl: config.apiUrl
}); 