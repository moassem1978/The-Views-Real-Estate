import { Pool } from 'pg';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function resetOwnerCredentials() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('Resetting owner password with enhanced security...');

    const password = 'owner123';
    const hashedPassword = await hashPassword(password);
    console.log('Password hashed successfully');

    // First check if owner exists
    const checkQuery = 'SELECT id, username FROM users WHERE username = $1';
    const checkResult = await pool.query(checkQuery, ['owner']);

    if (checkResult.rows.length === 0) {
      // Create owner if doesn't exist
      const createQuery = `
        INSERT INTO users (username, password, email, full_name, role, is_agent, is_active, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING id, username, role
      `;
      const createResult = await pool.query(createQuery, [
        'owner', hashedPassword, 'owner@theviews.com', 'System Owner', 'owner', true, true
      ]);
      console.log('✅ Owner account created successfully');
      console.log('Username: owner');
      console.log('Password: owner123');
    } else {
      // Update existing owner
      const updateQuery = `
        UPDATE users 
        SET password = $1, is_active = true, updated_at = NOW()
        WHERE username = 'owner'
        RETURNING id, username, role
      `;
      const result = await pool.query(updateQuery, [hashedPassword]);
      console.log('✅ Owner credentials updated successfully');
      console.log('Username: owner');
      console.log('Password: owner123');
    }

  } catch (error) {
    console.error('❌ Error resetting owner credentials:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

resetOwnerCredentials();