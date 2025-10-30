import { Suspense } from "react";
import CookiesPolicyClient from "./cookies-policy-client";

export default function CookiesPolicyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CookiesPolicyClient />
    </Suspense>
  );
}
