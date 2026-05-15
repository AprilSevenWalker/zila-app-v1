import { Suspense } from "react";

import { AppShell } from "@/components/ui/AppShell";
import { SendMoneyScreen } from "@/components/payments/SendMoneyScreen";

export default function MakePaymentPage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <SendMoneyScreen />
      </Suspense>
    </AppShell>
  );
}
