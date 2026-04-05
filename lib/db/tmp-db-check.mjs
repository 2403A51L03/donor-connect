import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

try {
  const client = await pool.connect();
  const tables = await client.query('SELECT table_name FROM information_schema.tables WHERE table_schema = $1 ORDER BY table_name', ['public']);
  console.log('tables:', tables.rows);
  const donors = await client.query('SELECT id, name, email, city, created_at FROM donors ORDER BY created_at LIMIT 5');
  console.log('donors:', donors.rows);
  client.release();
} catch (err) {
  console.error('ERROR', err);
} finally {
  await pool.end();
}
