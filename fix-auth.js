import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

const sql = neon(process.env.DATABASE_URL);

// Use the same hashing algorithm as the server
function hashPassword(password) {
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${hash}.${salt}`;
}

async function fixAuthentication() {
  try {
    // First check current owner account
    const currentOwner = await sql`
      SELECT username, email, role, is_active, password 
      FROM users 
      WHERE username = 'owner'
    `;
    
    console.log('Current owner account:', currentOwner[0]);
    
    // Set the password using the exact same method as the server
    const newPassword = hashPassword('Views#14ever');
    
    await sql`
      UPDATE users 
      SET password = ${newPassword}, is_active = true
      WHERE username = 'owner'
    `;
    
    console.log('Password updated successfully');
    console.log('Username: owner');
    console.log('Password: Views#14ever');
    
    // Verify the update
    const updatedOwner = await sql`
      SELECT username, email, role, is_active 
      FROM users 
      WHERE username = 'owner'
    `;
    
    console.log('Updated owner account:', updatedOwner[0]);
    
  } catch (error) {
    console.error('Error fixing authentication:', error);
  }
}

fixAuthentication();