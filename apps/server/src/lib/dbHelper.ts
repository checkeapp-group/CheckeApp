import dotenv from 'dotenv';
import { drizzle, type MySql2Database } from 'drizzle-orm/mysql2';
import mysql12 from 'mysql2/promise';
import type * as schema from '../db/schema/schema';

dotenv.config();

let pool: mysql12.Pool;
type DrizzleDB = MySql2Database<typeof schema>;

type DBConfig = {
  host: string;
  user: string;
  password: string;
  database: string;
  connectionLimit?: number;
  acquireTimeout?: number;
  timeout?: number;
  reconnect?: boolean;
}

let db: DrizzleDB;

export function initDB(): DrizzleDB {
  const config: DBConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'factchecker',
    connectionLimit: Number.parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
    acquireTimeout: Number.parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000', 10),
    timeout: Number.parseInt(process.env.DB_TIMEOUT || '60000', 10),
    reconnect: true,
  };

  pool = mysql12.createPool(config);
  db = drizzle(pool, { mode: 'default' });

  return db;
}

export function getDB(): DrizzleDB {
  if (!db) {
    db = initDB();
  }
  return db;
}

export async function getConnection(): Promise<mysql12.PoolConnection> {
  if (!pool) {
    initDB();
  }

  try {
    return await pool.getConnection();
  } catch (error) {
    throw new Error((error instanceof Error ? error.message : 'Unknown error'));
  }
}

export async function closeDB(): Promise<void> {
  try {
    if (pool) {
      await pool.end();
    }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
}

export async function executeQuery<T>(queryFn: (db: DrizzleDB) => Promise<T>): Promise<T> {
  try {
    const database = getDB();
    return await queryFn(database);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Connection lost')) {
        db = initDB();
        return await queryFn(db);
      }

      if (error.message.includes('timeout')) {
        throw new Error('Database query timeout');
      }
    }

    throw error;
  }
}

// Execute raw SQL query
export async function executeRawQuery<T>(sql: string, params: any[] = []): Promise<T[]> {
  const connection = await getConnection();

  try {
    const [rows] = await connection.execute(sql, params);
    return rows as T[];
  } catch (error) {
    console.error('Error executing raw SQL query:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Transaction wrapper
export async function withTransaction<T>(
  callback: (tx: mysql12.PoolConnection) => Promise<T>
): Promise<T> {
  let connection: mysql12.PoolConnection | null = null;

  try {
    connection = await getConnection();

    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();

    return result;
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Error during rollback:', rollbackError);
      }
    }
    console.error('Transaction failed:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
