
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import pkg from 'pg';
const { Pool } = pkg;

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function resetOwnerPassword() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('Resetting owner password with enhanced security...');
    
    // Hash the password 'owner123'
    const hashedPassword = await hashPassword('owner123');
    console.log('Password hashed successfully');
    
    // Update the password and ensure account is active - using correct column name
    const result = await pool.query(`
      UPDATE users 
      SET password = $1, is_active = true 
      WHERE username = $2 
      RETURNING id, username, role, is_active
    `, [hashedPassword, 'owner']);
    
    if (result.rows.length > 0) {
      console.log('✅ Owner credentials updated successfully:');
      console.log('Username:', result.rows[0].username);
      console.log('Role:', result.rows[0].role);
      console.log('Active:', result.rows[0].is_active);
      console.log('Password: owner123');
    } else {
      console.log('❌ Owner user not found');
    }
    
  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    await pool.end();
  }
}

resetOwnerPassword();
