import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { eq, type SQLWrapper, sql } from 'drizzle-orm';
import { db } from '../db';
import * as schema from './../db/schema/auth';

// Better Auth configuration with Google provider
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'mysql',
    schema,
  }),
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET || 'default_secret_key',
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  trustedOrigins: [process.env.CORS_ORIGIN || 'http://localhost:3001', 'http://localhost:3000'],
  emailAndPassword: {
    enabled: false,
  },
  events: {
    onSignUp: async (user: { id: string | SQLWrapper; email: string }) => {
      const userCountResult = await db.select({ count: sql<number>`count(*)` }).from(schema.user);
      const userCount = userCountResult[0].count;

      if (userCount === 1) {
        await db
          .update(schema.user)
          .set({ isAdmin: true, isVerified: true, termsAccepted: true })
          .where(eq(schema.user.id, user.id));
        console.log(`[Auth] Primer usuario ${user.email} ha sido promovido a Administrador.`);
      }
    },
  },
  session: {},
  advanced: {
    defaultCookieAttributes: {
      sameSite: 'none',
      secure: true,
      httpOnly: true,
    },
  },
});

export default auth;
