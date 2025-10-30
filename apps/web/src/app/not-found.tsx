import { Suspense } from "react";
import NotFoundClient from "./not-found-client";

export default function NotFoundPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotFoundClient />
    </Suspense>
  );
}
