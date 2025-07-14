export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  // Simulación: simplemente responde OK
  return res.status(200).json({ ok: true });
} 