import { Suspense } from "react";

import { AskZilaScreen } from "@/components/ask/AskZilaScreen";

export default function AskPage() {
  return (
    <Suspense fallback={null}>
      <AskZilaScreen />
    </Suspense>
  );
}
