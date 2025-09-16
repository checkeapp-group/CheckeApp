import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/db/index';
import * as schema from '@/db/schema/auth';

const authInstance = betterAuth({
  adapter: drizzleAdapter(db, schema),
  baseURL: process.env.AUTH_BASE_URL ?? 'http://localhost:3000',
  secret: process.env.AUTH_SECRET! ?? 'default_secret',
  providers: [],
  session: {
    freshAge: 60 * 10,
    expiresIn: 60 * 60 * 24 * 7,
  },
  advanced: {
    cookiePrefix: 'factchecker-auth',
    crossSubDomainCookies: {
      domain: process.env.COOKIE_DOMAIN,
      enabled: false,
    },
  },
});

export default authInstance;
