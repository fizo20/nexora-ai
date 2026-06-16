// frontend/components/upgrade/UpgradeModal.tsx
"use client";

interface Props {
  data: {
    currentPlan: string;
    upgradeTo: string;
  };
  onClose: () => void;
}

export default function UpgradeModal({ data, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-100 shadow-xl">
        <h2 className="text-xl font-bold">Upgrade Required</h2>

        <p className="mt-2 text-sm text-gray-600">
          You’ve reached the limit of your <strong>{data.currentPlan}</strong>{" "}
          plan.
        </p>

        <button
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded"
          onClick={() => {
            window.location.href = "/billing";
          }}
        >
          Upgrade to {data.upgradeTo}
        </button>

        <button className="mt-2 w-full text-sm text-gray-500" onClick={onClose}>
          Maybe later
        </button>
      </div>
    </div>
  );
}
