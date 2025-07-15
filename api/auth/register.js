// api/auth/register.js

// Simulación de base de datos en memoria (persistente entre invocaciones en serverless)
if (!global.users) {
  global.users = [];
}

export default async function handler(req, res) {
  console.log("Método recibido:", req.method);
  console.log("Body recibido:", req.body);
  // Siempre agregar los headers de CORS
  res.setHeader('Access-Control-Allow-Origin', '*'); // Cambia '*' por tu dominio en producción si lo deseas
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
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