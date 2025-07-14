export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { email, password } = req.body;

  // Simulación: acepta cualquier email y password no vacíos
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña requeridos' });
  }

  // Simulación de usuario autenticado
  const user = { email };

  // En producción, deberías crear una cookie/token de sesión aquí
  return res.status(200).json({ user });
} 