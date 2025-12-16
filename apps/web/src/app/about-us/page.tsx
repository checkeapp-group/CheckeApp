import { Suspense } from "react";
import AboutUsClient from "./about-us-client";

// About us page with project information and team details
export default function AboutUsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AboutUsClient />
    </Suspense>
  );
}
