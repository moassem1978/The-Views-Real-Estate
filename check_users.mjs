// List users in the database
import { pool } from './server/db.js';

async function getUsers() {
  try {
    const result = await pool.query('SELECT id, username, role, password FROM users');
    console.log('All users in database:');
    console.log(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    await pool.end();
  }
}

getUsers();
