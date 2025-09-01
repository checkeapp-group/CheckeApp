import mysql2 from 'mysql2';
import { drizzle } from 'drizzle-orm/mysql2';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_DB_PORT = 3306;
const DEFAULT_DB_CONNECTION_LIMIT = 5;
const pool = mysql2.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || DEFAULT_DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || DEFAULT_DB_CONNECTION_LIMIT,
});

export const db: ReturnType<typeof drizzle> = drizzle(pool);
