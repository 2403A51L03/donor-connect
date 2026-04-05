import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

const dbFile = ':memory:';
const sqlite = new Database(dbFile);
const drizzleDb = drizzle(sqlite);

const donorsTable = sqliteTable('donors', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
});

const createTableSql = `CREATE TABLE donors (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL);`;
sqlite.exec(createTableSql);

const result = await drizzleDb.insert(donorsTable).values({name:'donor1'}).returning();
console.log(result);
const rows = await drizzleDb.select().from(donorsTable).all();
console.log(rows);
