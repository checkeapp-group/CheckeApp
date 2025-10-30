import { Suspense } from "react";
import PrivacyPolicyClient from "./privacy-policy-client";

export default function PrivacyPolicyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PrivacyPolicyClient />
    </Suspense>
  );
}
