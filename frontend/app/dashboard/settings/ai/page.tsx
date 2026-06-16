// frontend/app/dashboard/settings/ai/page.tsx
"use client";

import { useEffect, useState } from "react";

import { settingsSdk } from "@/lib/sdk/settings-sdk";

export default function AISettingsPage() {
  const [temperature, setTemperature] = useState(0.7);

  const [model, setModel] = useState("gpt-4");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await settingsSdk.getAISettings();

        if (data?.data) {
          setTemperature(data.data.temperature || 0.7);
          setModel(data.data.model || "gpt-4");
        }
      } catch (error) {
        console.error(error);
      }
    };

    load();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);

      await settingsSdk.updateAISettings({
        temperature,
        model,
      });

      alert("AI settings updated");
    } catch (error) {
      console.error(error);

      alert("Failed to update AI settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Configuration</h1>

        <p className="text-sm text-muted-foreground mt-1">
          Configure AI behavior
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-5">
        <div>
          <label htmlFor="model" className="text-sm font-medium">
            AI Model
          </label>

          <select
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2 bg-background"
          >
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-4o">GPT-4o</option>
          </select>
        </div>

        <div>
          <label htmlFor="temperature" className="text-sm font-medium">
            Temperature
          </label>

          <input
            id="temperature"
            type="number"
            min={0}
            max={1}
            step={0.1}
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="mt-1 w-full rounded-md border px-3 py-2 bg-background"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
