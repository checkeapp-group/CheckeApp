import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: 'apps/server/src/db/schema/*.ts',
  out: './src/db/migrations',
  dialect: 'mysql',
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
});
