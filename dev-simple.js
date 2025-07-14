const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// API Routes
app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  
  // Simular creación de usuario
  const user = { id: Date.now(), email, name };
  
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
  
  // Simular autenticación
  const user = { id: Date.now(), email, name: 'Usuario Demo' };
  
  res.json({ 
    success: true, 
    user,
    message: 'Login exitoso' 
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logout exitoso' });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📱 API disponible en http://localhost:${PORT}/api`);
}); 