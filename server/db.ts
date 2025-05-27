import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}


import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

// Backup directory
const BACKUP_DIR = './backups';

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR);
}

// Backup function
export async function backupDatabase() {
  const filename = path.join(BACKUP_DIR, 'daily-backup.sql');
  
  // Use --no-owner and --no-acl for better compatibility
  // Skip backup on version mismatch to allow app to continue running
  const command = `PGPASSWORD=${process.env.PGPASSWORD} pg_dump --no-owner --no-acl -h ${process.env.PGHOST} -U ${process.env.PGUSER} -d ${process.env.PGDATABASE} -F p > "${filename}"`;

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error && error.message && error.message.includes('server version mismatch')) {
        console.log('Skipping backup due to version mismatch - continuing app execution');
        resolve(filename);
      } else if (error) {
        console.error('Backup failed:', error);
        resolve(filename); // Still resolve to avoid blocking app startup
      } else {
        console.log(`Backup created at ${filename}`);
        resolve(filename);
      }
    });
  });
}

// Trigger immediate backup
backupDatabase();

// Schedule daily backups
setInterval(backupDatabase, 24 * 60 * 60 * 1000);

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
// Restore function
export async function restoreDatabase(timestamp: string) {
  // Validate timestamp to prevent command injection
  if (!/^[0-9a-zA-Z-_]+$/.test(timestamp)) {
    throw new Error('Invalid timestamp format. Only alphanumeric characters, hyphens, and underscores are allowed.');
  }

  const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.sql`);
  if (!fs.existsSync(backupFile)) {
    throw new Error(`Backup file ${backupFile} not found`);
  }

  // Use spawn instead of exec to prevent command injection
  const { spawn } = require('child_process');
  
  return new Promise((resolve, reject) => {
    const psql = spawn('psql', [
      '-h', process.env.PGHOST!,
      '-U', process.env.PGUSER!,
      '-d', process.env.PGDATABASE!,
      '-f', backupFile
    ], {
      env: {
        ...process.env,
        PGPASSWORD: process.env.PGPASSWORD
      }
    });

    let stderr = '';
    psql.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    psql.on('close', (code) => {
      if (code !== 0) {
        console.error('Restore failed:', stderr);
        reject(new Error(`psql exited with code ${code}: ${stderr}`));
        return;
      }
      console.log(`Restore completed from ${backupFile}`);
      resolve(true);
    });

    psql.on('error', (error) => {
      console.error('Restore failed:', error);
      reject(error);
    });
  });
}