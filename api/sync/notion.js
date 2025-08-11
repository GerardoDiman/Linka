import { Client } from '@notionhq/client';
import { initDatabase, getPool } from '../_lib/database.js';
import { verifyUserToken } from '../_lib/auth.js';

export default async function handler(req, res) {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  await initDatabase();
  const pool = getPool();

  // Autenticación por header, query o body
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];
  if (!token) token = req.query.token;
  if (!token && req.body && typeof req.body.token === 'string') token = req.body.token;
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  const user = await verifyUserToken(token);
  if (!user || (user.role !== 'admin' && user.role !== 'approved')) {
    return res.status(403).json({ error: 'No autorizado' });
  }

  try {
    if (!process.env.NOTION_TOKEN || !process.env.NOTION_LEADS_DATABASE_ID) {
      return res.status(400).json({ error: 'Notion no está configurado' });
    }

    const notion = new Client({ auth: process.env.NOTION_TOKEN });

    // Consulta completa de leads en Notion
    const response = await notion.databases.query({
      database_id: process.env.NOTION_LEADS_DATABASE_ID,
      page_size: 100,
      sorts: [{ property: 'Fecha de Registro', direction: 'descending' }]
    });

    // Upsert en tabla users
    for (const lead of response.results) {
      const p = lead.properties;
      const email = p.Email?.email || '';
      if (!email) continue;
      const name = p.Nombre?.title?.[0]?.plain_text || email.split('@')[0];
      const role = (p.Estado?.select?.name || 'pending').toLowerCase();
      const company = p.Empresa?.rich_text?.[0]?.plain_text || null;
      const roleTitle = p['Rol / Cargo']?.select?.name || p['Rol/Cargo']?.select?.name || null;
      const description = p.Descripción?.rich_text?.[0]?.plain_text || null;
      const source = p.Fuente?.select?.name || 'Landing Page';

      await pool.query(
        `INSERT INTO users (email, password_hash, name, role, notion_lead_id, company, role_title, description, source)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (email) DO UPDATE SET
           name = EXCLUDED.name,
           role = EXCLUDED.role,
           notion_lead_id = EXCLUDED.notion_lead_id,
           company = EXCLUDED.company,
           role_title = EXCLUDED.role_title,
           description = EXCLUDED.description,
           source = EXCLUDED.source,
           updated_at = NOW()`,
        [email, 'temp_not_used', name, role, lead.id, company, roleTitle, description, source]
      );
    }

    return res.status(200).json({ success: true, message: `Sincronización completada: ${response.results.length} leads procesados` });
  } catch (e) {
    console.error('❌ Error sync Notion:', e);
    return res.status(500).json({ error: e.message || 'Error sincronizando con Notion' });
  }
}


