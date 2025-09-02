import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const port = 3306;
const pool = mysql.createPool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT) || port,
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? 'password',
  database: process.env.DB_NAME ?? 'factchecker_db',
});

export { createVerificationRecord } from '@/db/services/verifications/verificationService';
export { updateVerificationStatus } from '@/db/services/verifications/verificationService';

// Cliente Drizzle
export const db = drizzle(pool);
