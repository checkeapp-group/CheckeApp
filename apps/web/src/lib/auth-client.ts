import { createAuthClient } from 'better-auth/react';

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';

// Better Auth client configuration with Google OAuth provider
export const authClient = createAuthClient({
  baseURL: `${serverUrl}/api/auth`,
  fetchOptions: {
    onError: (error) => {
      console.error('Auth error:', error);
    },
  },
});
