// src/utils/stripe-plan-map.ts
export const stripePriceToWorkspacePlan = (
  priceNickname?: string | null,
): "FREE" | "PRO" | "ENTERPRISE" => {
  switch (priceNickname) {
    case "PRO":
      return "PRO";
    case "ENTERPRISE":
      return "ENTERPRISE";
    default:
      return "FREE";
  }
};
