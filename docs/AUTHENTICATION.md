# Authentication

This document explains the authentication process in the FactCheckerProject, which is handled by **Better Auth**.

## Overview

The authentication system is built on a client-server model, with the backend providing authentication endpoints and the frontend managing the user's session state.

### Key Features

- **Email and Password Authentication**: Standard email and password login.
- **Session Management**: Secure session handling with configurable expiration.
- **Protected Routes**: Middleware to protect routes that require authentication.
- **Type Safety**: End-to-end type safety between the client and server.

## Backend (`apps/server`)

The backend uses the `better-auth` library to handle authentication logic.

### Configuration (`apps/server/src/lib/auth.ts`)

- **Database Adapter**: `drizzleAdapter` connects Better Auth to the MySQL database using the schema defined in `apps/server/src/db/schema/auth.ts`.
- **Session**: Sessions are configured with a maximum age of 30 days.
- **Email and Password**: Email and password authentication is enabled, with email verification currently disabled.
- **Security**: A secret key is used to sign session tokens. Cross-origin requests are configured to allow communication with the frontend.

### API Endpoints (`apps/server/src/app/api/auth/[...all]/route.ts`)

Better Auth exposes several API endpoints under `/api/auth` for handling:

- Sign up
- Sign in
- Sign out
- Session management

## Frontend (`apps/web`)

The frontend uses the `better-auth/react` client to interact with the backend authentication service.

### Client Configuration (`apps/web/src/lib/auth-client.ts`)

The `createAuthClient` function initializes the authentication client, pointing to the backend's base URL.

### Authentication Hooks

- **`useAuth` (`apps/web/src/hooks/use-auth.ts`)**: A custom hook that provides the current user's authentication state (`user`, `isAuthenticated`, `isLoading`).
- **`useAuthNavigation` (`apps/web/src/hooks/use-auth-navigation.ts`)**: A hook that provides functions for signing in, signing up, and signing out, along with navigation logic.

### Protected Routes (`apps/web/src/components/Auth/auth-guard.tsx`)

The `AuthGuard` component is a higher-order component that wraps pages or layouts to protect them from unauthenticated access. It checks the user's session and redirects to the login page if they are not authenticated.

### UI Components

- **`AuthModal` (`apps/web/src/components/Auth/auth-modal.tsx`)**: A modal that contains the sign-in and sign-up forms.
- **`SignInForm` and `SignUpForm`**: Forms for user authentication, with validation handled by TanStack Form and Zod.
- **`UserMenu` (`apps/web/src/components/UserMenu.tsx`)**: A dropdown menu that displays the user's information and a sign-out button when authenticated.

## Authentication Flow

1. A user visits a protected page.
2. The `AuthGuard` component checks if the user is authenticated.
3. If not authenticated, the user is redirected to the `/login` page.
4. The user can choose to sign in or sign up.
5. Upon successful authentication, the backend issues a session token, which is stored securely in the browser.
6. The user is redirected to the originally requested page or the dashboard.
7. For subsequent requests to protected resources, the session token is sent to the backend for validation.
