import { Pool } from '@neondatabase/serverless';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function resetOwnerAccess() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Generate new secure credentials
    const newUsername = 'admin_owner';
    const newPassword = 'SecureAccess2024!';
    const hashedPassword = await hashPassword(newPassword);
    
    console.log('🔄 Creating new owner account...');
    
    // Create or update owner account
    const result = await pool.query(`
      INSERT INTO users (username, password, email, full_name, role, is_agent, is_active, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (username) DO UPDATE SET
        password = EXCLUDED.password,
        is_active = true,
        email = EXCLUDED.email,
        role = EXCLUDED.role
      RETURNING id, username, email, role, is_active;
    `, [
      newUsername,
      hashedPassword,
      'admin@theviews.com',
      'System Administrator',
      'owner',
      true,
      true,
      new Date().toISOString()
    ]);
    
    console.log('✅ New owner account created successfully:');
    console.log('Username:', newUsername);
    console.log('Password:', newPassword);
    console.log('Email:', 'admin@theviews.com');
    console.log('Account Details:', result.rows[0]);
    
    // Also ensure original owner account is active
    await pool.query(`
      UPDATE users 
      SET is_active = true, password = $1
      WHERE username = 'owner'
    `, [hashedPassword]);
    
    console.log('✅ Original owner account also updated and activated');
    
  } catch (error) {
    console.error('❌ Error resetting owner access:', error);
  } finally {
    await pool.end();
  }
}

resetOwnerAccess();