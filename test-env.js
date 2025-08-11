import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno especificando la ruta
const result = dotenv.config({ path: path.join(__dirname, '.env') });

console.log('🔍 Resultado de dotenv.config():', result);
console.log('📁 Ruta del archivo .env:', path.join(__dirname, '.env'));

console.log('\n🔍 Verificando variables de entorno:');
console.log('NOTION_TOKEN:', process.env.NOTION_TOKEN ? '✅ Configurado' : '❌ No configurado');
console.log('NOTION_LEADS_DATABASE_ID:', process.env.NOTION_LEADS_DATABASE_ID ? '✅ Configurado' : '❌ No configurado');
console.log('N8N_WEBHOOK_URL:', process.env.N8N_WEBHOOK_URL ? '✅ Configurado' : '❌ No configurado');
console.log('PORT:', process.env.PORT || '3000 (default)');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development (default)'); 