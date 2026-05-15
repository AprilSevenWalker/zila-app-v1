import { Suspense } from "react";

import { ConnectMoneyFlow } from "@/components/payments/ConnectMoneyFlow";

export default function ConnectAccountPage() {
  return (
    <Suspense fallback={null}>
      <ConnectMoneyFlow />
    </Suspense>
  );
}
