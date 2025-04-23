import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createProjectsTable() {
  try {
    console.log('Creating projects table...');
    const res = await pool.query(`
      CREATE TABLE IF NOT EXISTS "projects" (
        "id" SERIAL PRIMARY KEY NOT NULL,
        "createdBy" INTEGER,
        "createdAt" TIMESTAMP DEFAULT now() NOT NULL,
        "updatedAt" TIMESTAMP,
        "name" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "location" TEXT NOT NULL,
        "gallery" TEXT[] NOT NULL,
        "unitTypes" TEXT[] NOT NULL,
        "developerInfo" TEXT NOT NULL
      );
    `);
    console.log('Projects table created successfully!');
    return res;
  } catch (error) {
    console.error('Error creating projects table:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

createProjectsTable()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed:', err);
    process.exit(1);
  });