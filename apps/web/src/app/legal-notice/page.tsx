import { Suspense } from "react";
import LegalNoticeClient from "./legal-notice-client";

export default function LegalNoticePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LegalNoticeClient />
    </Suspense>
  );
}
