import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const allowedOrigins = [
  'http://localhost:3001',
  'https://linka-nine.vercel.app'
];
app.use(cors({
  origin: function(origin, callback) {
    // Permitir requests sin origin (como Postman) o si está en la lista
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Simular base de datos de usuarios
const users = [];

// API Routes
app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }
  
  // Verificar si el usuario ya existe
  const existingUser = users.find(u => u.email === email);
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
  
  users.push(user);
  
  console.log(`✅ Usuario registrado: ${user.email}`);
  
  res.json({ 
    success: true, 
    user,
    message: 'Usuario registrado exitosamente' 
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }
  
  // Buscar usuario
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(400).json({ error: 'Usuario no encontrado' });
  }
  
  console.log(`✅ Usuario logueado: ${user.email}`);
  
  res.json({ 
    success: true, 
    user,
    message: 'Login exitoso' 
  });
});

app.post('/api/auth/logout', (req, res) => {
  console.log('✅ Usuario deslogueado');
  res.json({ success: true, message: 'Logout exitoso' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor de autenticación corriendo en http://localhost:${PORT}`);
  console.log(`📱 API disponible en http://localhost:${PORT}/api`);
}); 