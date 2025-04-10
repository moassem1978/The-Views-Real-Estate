const crypto = require('crypto');
const util = require('util');
const { Client } = require('pg');

const scrypt = util.promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const buf = await scrypt(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function main() {
  try {
    const newPassword = await hashPassword('Owner123');
    console.log('New password hash:', newPassword);
    
    // Connect to database
    const client = new Client({
      connectionString: process.env.DATABASE_URL
    });
    await client.connect();
    
    // Update the owner password
    const query = 'UPDATE users SET password = $1 WHERE username = $2 RETURNING id, username';
    const result = await client.query(query, [newPassword, 'owner']);
    
    if (result.rows.length > 0) {
      console.log('Updated password for user:', result.rows[0]);
    } else {
      console.log('User not found');
    }
    
    await client.end();
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
