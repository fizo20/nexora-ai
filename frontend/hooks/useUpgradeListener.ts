// frontend/hooks/useUpgradeListener.ts
import { useEffect } from "react";

type UpgradeData = {
  currentPlan: "FREE" | "PRO" | "ENTERPRISE";
  upgradeTo: "PRO" | "ENTERPRISE";
};

export const useUpgradeListener = (onUpgrade: (data: UpgradeData) => void) => {
  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<UpgradeData>;
      onUpgrade(customEvent.detail);
    };

    window.addEventListener("upgrade_required", handler);

    return () => {
      window.removeEventListener("upgrade_required", handler);
    };
  }, [onUpgrade]);
};
