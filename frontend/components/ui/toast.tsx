// frontend/components/ui/toast.tsx
"use client";

interface Props {
  title: string;
  description?: string;
  type?: "success" | "error";
}

export default function Toast({ title, description, type = "success" }: Props) {
  return (
    <div
      className={`rounded-xl border p-4 shadow-lg ${
        type === "success" ? "border-green-500/20" : "border-red-500/20"
      }`}
    >
      <h4 className="font-medium">{title}</h4>

      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
