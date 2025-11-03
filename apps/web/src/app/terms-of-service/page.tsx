import { Suspense } from "react";
import TermsOfServiceClient from "./terms-of-service-client";

export default function TermsOfServicePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TermsOfServiceClient />
    </Suspense>
  );
}
