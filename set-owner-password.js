import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

const sql = neon(process.env.DATABASE_URL);

function hashPassword(password) {
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${hash}.${salt}`;
}

async function setOwnerPassword() {
  try {
    const hashedPassword = hashPassword('Views#14ever');
    
    await sql`
      UPDATE users 
      SET password = ${hashedPassword}, is_active = true 
      WHERE username = 'owner' AND role = 'owner'
    `;
    
    console.log('✅ Owner password set to: Views#14ever');
    console.log('✅ Account activated successfully');
    
    const result = await sql`
      SELECT username, email, role, is_active 
      FROM users 
      WHERE username = 'owner'
    `;
    
    console.log('Owner account status:', result[0]);
    
  } catch (error) {
    console.error('❌ Error setting password:', error);
  }
}

setOwnerPassword();