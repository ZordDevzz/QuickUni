import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function reset() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const schemas = [
    'public',
    'auth',
    'users',
    'academic',
    'course',
    'grade',
    'finance',
    'schedule',
    'communication',
    'system'
  ];

  try {
    console.log('Resetting database...');
    
    for (const schema of schemas) {
        console.log(`Dropping schema ${schema}...`);
        await pool.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    }

    console.log(`Creating schema public...`);
    await pool.query(`CREATE SCHEMA "public"`);
    
    await pool.query('GRANT ALL ON SCHEMA public TO public');

    console.log('Database reset successful.');
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    await pool.end();
  }
}

reset();
