# 🔐 Authentication Documentation

## Overview

The authentication system is built on the **Better Auth** library, which provides a robust solution for user and session management. Communication between the frontend and backend is fully type-safe thanks to **oRPC**.

### Authentication Flow

1. **User Interaction**: An unauthenticated user attempts to perform a protected action (e.g., submit text for verification) or visits a protected route.
2. **Guardian Activation**: The `AuthGuard` component or logic within a component (e.g., `TextInputForm`) detects the absence of an active session.
3. **Authentication Modal**: The `AuthModal` appears, allowing the user to choose between the `SignInForm` (log in) or `SignUpForm` (register).
4. **Backend Call**: These forms use the `useAuthNavigation` hook to call the `authClient`, which performs a `POST` request to the backend endpoints under `/api/auth/*`.
5. **Backend Processing**: The Better Auth handler (`/app/api/auth/[...all]/route.ts`) processes the request and interacts with the database through the `drizzleAdapter`.
6. **Session Management**: After a successful login, the backend sets a secure `httpOnly` session cookie. The frontend manages session state through the `authClient.useSession()` hook.

## 🛡️ User Verification Logic (Key Business Rule)

In addition to standard authentication, the system enforces a custom authorization layer using the **`is_verified`** field in the `user` table.

**This field is NOT managed by `better-auth`, but by application logic.**

- **Purpose**: Only users marked as `is_verified = true` by an administrator are allowed to create new fact verifications.
- **Backend Implementation**:

  - The oRPC procedure `startVerification` (`verificationRouter.ts`) explicitly checks the user’s `is_verified` status.
  - If the user is not verified, the procedure throws a `FORBIDDEN` error, preventing the creation of the verification.

- **Frontend Implementation**:

  - The `useAuth` hook (`/hooks/use-auth.ts`) retrieves this status by calling a dedicated endpoint (`/api/user/status`).
  - Components such as `TextInputForm.tsx` use this information to display a visual warning when the user’s account is pending verification.

## Key Components and Hooks

### Backend (`apps/server`)

- **Configuration (`/lib/auth.ts`)**: Defines the `drizzleAdapter`, session duration, and `better-auth` security settings.
- **API Endpoints (`/app/api/auth/[...all]/route.ts`)**: Exposes REST endpoints (`/api/auth/signin/email`, `/api/auth/signup/email`, etc.) automatically handled by `better-auth`.
- **oRPC Protection (`/lib/orpc.ts`)**: The `requireAuth` middleware is applied to `protectedProcedure`s to ensure only users with a valid session can access business logic endpoints.

### Frontend (`apps/web`)

- **Auth Client (`/lib/auth-client.ts`)**: The `better-auth/react` client configured to communicate with the backend.
- **`useAuth` (`/hooks/use-auth.ts`)**: The main hook combining `better-auth` session state with the application’s custom `is_verified` state.
- **`useAuthNavigation` (`/hooks/use-auth-navigation.ts`)**: A hook that abstracts `signIn`, `signUp`, and `signOut` actions, including user notifications.
- **`AuthGuard` (`/components/Auth/auth-guard.tsx`)**: A higher-order component that wraps protected pages. Instead of redirecting, it calls the `openAuthModal` function when the user is not authenticated.
