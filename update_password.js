const { scrypt, randomBytes } = require('crypto');
const { promisify } = require('util');
const { Pool } = require('pg');

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function main() {
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Hash the password 'owner123'
    const hashedPassword = await hashPassword('owner123');
    console.log('Hashed password:', hashedPassword);
    
    // Update the password in the database
    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE username = $2 RETURNING id, username',
      [hashedPassword, 'owner']
    );
    
    console.log('Updated user:', result.rows[0]);
    
    await pool.end();
  } catch (error) {
    console.error('Error updating password:', error);
  }
}

main();
