// frontend/app/dashboard/settings/api-keys/page.tsx
"use client";

import { useEffect, useState } from "react";

import { settingsSdk } from "@/lib/sdk/settings-sdk";

interface ApiKey {
  id: string;
  key: string;
  createdAt: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);

  const [loading, setLoading] = useState(false);

  const loadKeys = async () => {
    try {
      const data = await settingsSdk.getApiKeys();

      setKeys(data?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const generateKey = async () => {
    try {
      setLoading(true);

      await settingsSdk.generateApiKey();

      await loadKeys();
    } catch (error) {
      console.error(error);

      alert("Failed to generate API key");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">API Keys</h1>

        <p className="text-sm text-muted-foreground mt-1">
          Manage API access for integrations
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <button
          onClick={generateKey}
          disabled={loading}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
        >
          {loading ? "Generating..." : "Generate API Key"}
        </button>

        <div className="space-y-3">
          {keys.map((item) => (
            <div key={item.id} className="rounded-lg border p-4">
              <div className="font-mono text-sm break-all">{item.key}</div>

              <div className="text-xs text-muted-foreground mt-2">
                Created: {new Date(item.createdAt).toLocaleString()}
              </div>
            </div>
          ))}

          {!keys.length && (
            <div className="text-sm text-muted-foreground">
              No API keys found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
