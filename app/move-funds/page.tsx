import { Suspense } from "react";

import { ReserveFlowScreen } from "@/components/actions/ReserveFlowScreen";

export default function MoveFundsPage() {
  return (
    <Suspense fallback={null}>
      <ReserveFlowScreen />
    </Suspense>
  );
}
