import { pool } from './database.js';

async function checkUsers() {
  try {
    const result = await pool.query('SELECT email, role FROM users');
    console.log('Usuarios en la base de datos:');
    result.rows.forEach(user => {
      console.log(`- ${user.email} (${user.role})`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

checkUsers(); 