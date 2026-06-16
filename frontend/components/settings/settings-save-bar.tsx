// frontend/components/settings/settings-save-bar.tsx
"use client";

import { Button } from "@/components/ui/button";

interface Props {
  saving?: boolean;
  onSave: () => void;
}

export default function SettingsSaveBar({ saving, onSave }: Props) {
  return (
    <div className="sticky bottom-4 flex justify-end">
      <div className="rounded-xl border bg-background p-3 shadow-lg">
        <Button onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
