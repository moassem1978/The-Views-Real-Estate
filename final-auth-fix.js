import { neon } from '@neondatabase/serverless';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const sql = neon(process.env.DATABASE_URL);
const scryptAsync = promisify(scrypt);

// Exact same hash function as server/auth.ts
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

// Test password comparison function
async function comparePasswords(supplied, stored) {
  try {
    const parts = stored.split(".");
    if (parts.length !== 2) {
      return false;
    }
    
    const [hashed, salt] = parts;
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = await scryptAsync(supplied, salt, 64);
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    return false;
  }
}

async function finalAuthFix() {
  try {
    console.log('Setting owner password with exact server authentication logic...');
    
    const newPassword = 'Views#14ever';
    const hashedPassword = await hashPassword(newPassword);
    
    // Update the password
    await sql`
      UPDATE users 
      SET password = ${hashedPassword}, is_active = true 
      WHERE username = 'owner' AND role = 'owner'
    `;
    
    // Verify the password works
    const user = await sql`
      SELECT username, password, email, role, is_active 
      FROM users 
      WHERE username = 'owner'
    `;
    
    if (user.length > 0) {
      const passwordMatch = await comparePasswords(newPassword, user[0].password);
      console.log('Password verification result:', passwordMatch);
      
      if (passwordMatch) {
        console.log('SUCCESS: Authentication fixed');
        console.log('Username: owner');
        console.log('Password: Views#14ever');
        console.log('Account active:', user[0].is_active);
      } else {
        console.log('ERROR: Password verification failed');
      }
    }
    
  } catch (error) {
    console.error('Error in final auth fix:', error);
  }
}

finalAuthFix();