import { Suspense } from "react";
import UsersClient from "./users-client";

// Admin dashboard for managing users and verification status
export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UsersClient />
    </Suspense>
  );
}
