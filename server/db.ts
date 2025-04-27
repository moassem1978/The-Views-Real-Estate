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
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = path.join(BACKUP_DIR, `backup-${timestamp}.sql`);

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
  const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.sql`);
  if (!fs.existsSync(backupFile)) {
    throw new Error(`Backup file ${backupFile} not found`);
  }

  const command = `PGPASSWORD=${process.env.PGPASSWORD} psql -h ${process.env.PGHOST} -U ${process.env.PGUSER} -d ${process.env.PGDATABASE} < "${backupFile}"`;

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Restore failed:', error);
        reject(error);
        return;
      }
      console.log(`Restore completed from ${backupFile}`);
      resolve(true);
    });
  });
}