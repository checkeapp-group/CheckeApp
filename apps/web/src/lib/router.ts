import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  AUTH: {
    SIGN_IN: '/login?mode=signin',
    SIGN_UP: '/login?mode=signup',
  },
  API: {
    AUTH: '/api/auth',
    RPC: '/api/rpc',
  },
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RouteValue = (typeof ROUTES)[RouteKey];

// Hook personalizado para navegación segura
export function useAppRouter() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const navigate = useCallback(
    (route: string, options?: { replace?: boolean }) => {
      if (!(isReady && router)) {
        console.warn('Router not ready, navigation skipped');
        return Promise.resolve();
      }

      try {
        if (options?.replace) {
          return router.replace(route);
        }
        return router.push(route);
      } catch (error) {
        console.error('Navigation error:', error);
        return Promise.reject(error);
      }
    },
    [router, isReady]
  );

  const navigateToRoute = useCallback(
    (routeKey: keyof typeof ROUTES, options?: { replace?: boolean }) => {
      const route = ROUTES[routeKey];
      if (typeof route === 'string') {
        return navigate(route, options);
      }
      console.error('Invalid route key:', routeKey);
      return Promise.resolve();
    },
    [navigate]
  );

  return {
    navigate,
    navigateToRoute,
    isReady,
    router,
    // Métodos de conveniencia
    goHome: () => navigate(ROUTES.HOME),
    goDashboard: () => navigate(ROUTES.DASHBOARD),
    goLogin: () => navigate(ROUTES.LOGIN),
    goBack: () => isReady && router?.back(),
    refresh: () => isReady && router?.refresh(),
  };
}

// Utilidad para validar rutas
export function isValidRoute(path: string): boolean {
  const allRoutes = Object.values(ROUTES).flat();
  return allRoutes.some(
    (route) => typeof route === 'string' && (route === path || path.startsWith(route))
  );
}

// Utilidad para generar URLs con parámetros
export function buildUrl(baseRoute: string, params?: Record<string, string>): string {
  if (!params) {
    return baseRoute;
  }

  const url = new URL(baseRoute, 'http://localhost');
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url.pathname + url.search;
}

// Middleware de navegación con autenticación
export function createAuthGuard(
  isAuthenticated: boolean,
  publicRoutes: string[] = [ROUTES.LOGIN, ROUTES.HOME]
) {
  return (targetRoute: string): string => {
    const isPublicRoute = publicRoutes.some(
      (route) => targetRoute === route || targetRoute.startsWith(route)
    );

    if (!(isAuthenticated || isPublicRoute)) {
      return ROUTES.LOGIN;
    }

    if (isAuthenticated && targetRoute === ROUTES.LOGIN) {
      return ROUTES.DASHBOARD;
    }

    return targetRoute;
  };
}
