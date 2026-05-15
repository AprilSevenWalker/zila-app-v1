import { Suspense } from "react";

import { WalletOnChainScreen } from "@/components/wallet/WalletOnChainScreen";
import { AppShell } from "@/components/ui/AppShell";

export default function WalletPage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <WalletOnChainScreen />
      </Suspense>
    </AppShell>
  );
}
