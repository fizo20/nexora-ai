// frontend/components/settings/settings-switch.tsx
"use client";

interface Props {
  title: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

export default function SettingsSwitch({
  title,
  description,
  checked,
  onChange,
}: Props) {
  return (
    <div className="flex items-start justify-between rounded-lg border p-4">
      <div>
        <h4 className="text-sm font-medium">{title}</h4>

        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>

      <button
        type="button"
        title={title}
        aria-label={`Toggle ${title}`}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${
          checked ? "bg-blue-600" : "bg-muted"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
