import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
// biome-ignore lint/performance/noNamespaceImport: <F>
import * as authSchema from './schema/auth';
// biome-ignore lint/performance/noNamespaceImport: <F>
import * as factCheckerSchema from './schema/schema';

const pool = mysql.createPool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER ?? 'user',
  password: process.env.DB_PASSWORD ?? 'password',
  database: process.env.DB_NAME ?? 'FactCheckerProject',
});

const combinedSchema = {
  ...authSchema,
  ...factCheckerSchema,
};

export const db = drizzle(pool, { schema: combinedSchema, mode: 'default' });