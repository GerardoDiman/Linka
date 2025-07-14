// api/auth/register.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método no permitido' });
    }
  
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }
  
    // Simulación de usuario creado
    const user = { email };
  
    return res.status(200).json({ user });
  }