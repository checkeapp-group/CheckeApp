import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/db/index';
import * as schema from '@/db/schema/auth';

const authInstance = betterAuth({
  adapter: drizzleAdapter(db, schema),
  baseURL: process.env.AUTH_BASE_URL ?? 'http://localhost:3000',
  secret: process.env.AUTH_SECRET! ?? 'default_secret',
  providers: [],
});

export default authInstance;
