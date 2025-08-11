import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/linka',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Función para inicializar la base de datos
export async function initDatabase() {
  try {
    console.log('🔧 Inicializando base de datos...');
    
    // Crear tabla de usuarios si no existe
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'pending',
        notion_lead_id VARCHAR(255),
        company VARCHAR(255),
        role_title VARCHAR(255),
        description TEXT,
        source VARCHAR(100) DEFAULT 'Landing Page',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Crear tabla de sesiones si no existe
    const createSessionsTable = `
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        token VARCHAR(500) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Crear tabla de invitaciones si no existe
    const createInvitationsTable = `
      CREATE TABLE IF NOT EXISTS invitations (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        invited_by INTEGER REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'pending',
        expires_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await pool.query(createUsersTable);
    await pool.query(createSessionsTable);
    await pool.query(createInvitationsTable);
    
    // Crear admin por defecto si no existe
    await createDefaultAdmin();
    
    console.log('✅ Base de datos inicializada correctamente');
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    throw error;
  }
}

// Función para crear admin por defecto
async function createDefaultAdmin() {
  try {
    const adminEmail = 'admin@linka.com';
    const adminPassword = 'admin123'; // Cambiar en producción
    
    // Verificar si el admin ya existe
    const existingAdmin = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [adminEmail]
    );
    
    if (existingAdmin.rows.length === 0) {
      // Hashear contraseña del admin
      const bcrypt = await import('bcryptjs');
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      
      // Crear admin
      await pool.query(
        `INSERT INTO users (email, password_hash, name, role, source, notes)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [adminEmail, passwordHash, 'Administrador', 'admin', 'Sistema', 'Admin por defecto del sistema']
      );
      
      console.log('👑 Admin por defecto creado: admin@linka.com / admin123');
    } else {
      console.log('👑 Admin por defecto ya existe');
    }
  } catch (error) {
    console.error('❌ Error creando admin por defecto:', error);
  }
}

// Función para obtener conexión
export async function getConnection() {
  return pool;
}

// Función para cerrar conexión
export async function closeConnection() {
  await pool.end();
}

export { pool };
export default pool; 