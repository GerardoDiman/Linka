// api/auth/register.js

// Simulación de base de datos en memoria (persistente entre invocaciones en serverless)
if (!global.users) {
  global.users = [];
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  // Verificar si el usuario ya existe
  const existingUser = global.users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'El usuario ya existe' });
  }

  // Simular creación de usuario
  const user = {
    id: Date.now(),
    email,
    name: name || email.split('@')[0],
    createdAt: new Date().toISOString()
  };
  global.users.push(user);

  return res.status(200).json({
    success: true,
    user,
    message: 'Usuario registrado exitosamente'
  });
}