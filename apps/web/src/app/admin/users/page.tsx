import { Suspense } from "react";
import UsersClient from "./users-client";

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UsersClient />
    </Suspense>
  );
}
