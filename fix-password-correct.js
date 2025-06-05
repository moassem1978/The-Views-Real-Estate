import { neon } from '@neondatabase/serverless';
import { randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const sql = neon(process.env.DATABASE_URL);
const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function fixPasswordCorrect() {
  try {
    const hashedPassword = await hashPassword('Views#14ever');
    
    await sql`
      UPDATE users 
      SET password = ${hashedPassword}, is_active = true 
      WHERE username = 'owner' AND role = 'owner'
    `;
    
    console.log('Password fixed with correct scrypt algorithm');
    console.log('Username: owner');
    console.log('Password: Views#14ever');
    
    const result = await sql`
      SELECT username, email, role, is_active 
      FROM users 
      WHERE username = 'owner'
    `;
    
    console.log('Owner account verified:', result[0]);
    
  } catch (error) {
    console.error('Error fixing password:', error);
  }
}

fixPasswordCorrect();