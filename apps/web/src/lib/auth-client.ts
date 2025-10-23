import { createAuthClient } from 'better-auth/react';

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';

export const authClient = createAuthClient({
  baseURL: `${serverUrl}/api/auth`,
  fetchOptions: {
    onError: (error) => {
      console.error('Auth error:', error);
    },
  },
});
