// frontend/app/dashboard/settings/profile/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userSdk, UserProfile } from "@/lib/sdk/user-sdk";

// WHY NO useEffect:
// The linter (correctly) rejects calling setState() synchronously inside
// useEffect, even with a dependency array. The standard React pattern for
// "initialise form state from async data" is:
//
//   1. Keep the form in a child component that receives the loaded data as props.
//   2. Pass `key={profile.id}` to the child — React remounts it when the key
//      changes, so useState(props.xxx) runs once with real data, not undefined.
//
// This eliminates the effect entirely. The parent only renders the form after
// data is available, so the form's useState() initializer always runs with
// the correct values.

/* ─── Editable form ─────────────────────────────────────────── */

function ProfileForm({
  profile,
  onSave,
  isSaving,
}: {
  profile: UserProfile;
  onSave: (values: { name: string; email: string }) => void;
  isSaving: boolean;
}) {
  // Safe: useState initializer runs once at mount.
  // The parent only renders <ProfileForm> after `profile` is defined,
  // so these values are always real data, never empty strings from undefined.
  const [name, setName] = useState(profile.name ?? "");
  const [email, setEmail] = useState(profile.email ?? "");

  return (
    <div className="rounded-xl border bg-card p-6 space-y-4">
      <div>
        <label htmlFor="name" className="text-sm font-medium">
          Full Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Enter your full name"
          title="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-md border px-3 py-2 bg-background text-foreground"
        />
      </div>

      <div>
        <label htmlFor="email" className="text-sm font-medium">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email address"
          title="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border px-3 py-2 bg-background text-foreground"
        />
      </div>

      <button
        onClick={() => onSave({ name, email })}
        disabled={isSaving}
        className="rounded-md bg-black dark:bg-white dark:text-black px-4 py-2 text-white text-sm font-medium disabled:opacity-60"
      >
        {isSaving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */

export default function ProfilePage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: userSdk.getProfile,
  });

  // The SDK returns { success: true, data: UserProfile }
  const profile = data?.data;

  const updateMutation = useMutation({
    mutationFn: userSdk.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const handleSave = async (values: { name: string; email: string }) => {
    try {
      await updateMutation.mutateAsync(values);
      alert("Profile updated");
    } catch {
      alert("Failed to update profile");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your personal information
        </p>
      </div>

      {isLoading && (
        <div className="text-sm text-muted-foreground">Loading profile…</div>
      )}

      {/* Only render the form once profile is available.
          The `key` ensures React remounts ProfileForm if the user somehow
          switches accounts without a full page reload. */}
      {profile && (
        <ProfileForm
          key={profile.id}
          profile={profile}
          onSave={handleSave}
          isSaving={updateMutation.isPending}
        />
      )}
    </div>
  );
}
