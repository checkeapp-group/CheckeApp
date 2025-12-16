import { Suspense } from "react";
import NotFoundClient from "./not-found-client";

// Custom 404 error page component
export default function NotFoundPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotFoundClient />
    </Suspense>
  );
}
