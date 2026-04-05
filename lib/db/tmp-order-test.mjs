import { newDb } from 'pg-mem';
import pg from 'pg';
import fs from 'fs';
import path from 'path';

const sql = fs.readFileSync(path.resolve('./drizzle/0000_lyrical_natasha_romanoff.sql'), 'utf8');
const db = newDb();
const adapter = db.adapters.createPg();
const pool = new pg.Pool({ Client: adapter.Client, database: 'postgres' });

const client = await pool.connect();
try {
  await client.query(sql);
  await client.query('INSERT INTO donors (name,blood_type,phone,email,city,is_available) VALUES ($1,$2,$3,$4,$5,$6)', ['d', 'O+', '123', 'a@b.com', 'x', true]);
  const res = await client.query('select id,name,blood_type,phone,email,city,address,is_available,last_donation_date,created_at from donors order by "donors"."created_at"');
  console.log(res.rows);
} finally {
  client.release();
  await pool.end();
}
