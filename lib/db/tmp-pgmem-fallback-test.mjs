import { newDb } from 'pg-mem';
import pg from 'pg';
import fs from 'fs';
import path from 'path';

const sql = fs.readFileSync(path.resolve('./drizzle/0000_lyrical_natasha_romanoff.sql'), 'utf8');
const db = newDb();
const adapter = db.adapters.createPg();
const pool = new pg.Pool({ Client: adapter.Client, database: 'postgres' });

const client = await pool.connect();
await client.query(sql);
await client.query('INSERT INTO donors (name, blood_type, phone, email, city, is_available) VALUES ($1,$2,$3,$4,$5,$6)', ['donor1','O+','123','donor1@donor.com','City',true]);
const res = await client.query('SELECT * FROM donors');
console.log('rows', res.rows);
client.release();
await pool.end();
