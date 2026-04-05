import { newDb } from 'pg-mem';
import pg from 'pg';

const db = newDb();
const adapter = db.adapters.createPg();

const Pool = pg.Pool;
const pool = new Pool({ Client: adapter.Client, database: 'test' });

const client = await pool.connect();
const res = await client.query('select 1 as value');
console.log(res.rows);
client.release();
await pool.end();
