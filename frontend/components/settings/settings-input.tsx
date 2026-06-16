// frontend/components/settings/settings-input.tsx
import { Input } from "@/components/ui/input";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
}

export default function SettingsInput({ label, description, ...props }: Props) {
  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm font-medium">{label}</label>

        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>

      <Input {...props} />
    </div>
  );
}
