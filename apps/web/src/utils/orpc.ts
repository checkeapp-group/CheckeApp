import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';
import { QueryCache, QueryClient } from '@tanstack/react-query';
import type { AppRouterClient } from 'server';
import { toast } from 'sonner';

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
console.log(`[oRPC Client] Initializing with server URL: ${serverUrl}`);

if (!serverUrl) {
  console.error(
    '[oRPC Client] CRITICAL: NEXT_PUBLIC_SERVER_URL is not defined! API calls will fail.'
  );
  toast.error('Error de configuración: La URL del servidor no está definida.', {
    duration: Number.POSITIVE_INFINITY,
  });
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(`Error: ${error.message}`, {
        action: {
          label: 'retry',
          onClick: () => {
            queryClient.invalidateQueries();
          },
        },
      });
    },
  }),
});

export const link = new RPCLink({
  url: `${serverUrl}/rpc`,
  fetch(url, options) {
    return fetch(url, {
      ...options,
      credentials: 'include',
    });
  },
});

export const client: AppRouterClient = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
