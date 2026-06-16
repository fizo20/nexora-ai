// frontend/services/workspaceService.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const switchWorkspace = async (workspaceId: string) => {
  const tempToken = localStorage.getItem("tempToken");

  if (!tempToken) {
    throw new Error("No temp token found");
  }

  const res = await fetch(`${API_URL}/api/workspaces/switch/${workspaceId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tempToken}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Workspace switch failed");
  }

  const accessToken = data?.data?.accessToken;

  if (!accessToken) {
    throw new Error("No access token returned");
  }

  localStorage.setItem("accessToken", accessToken);

  return data;
};
/* export const switchWorkspace = async (workspaceId: string) => {
  const tempToken = localStorage.getItem("tempToken");

  if (!tempToken) {
    throw new Error("No temp token found");
  }

  const res = await fetch(
    `http://localhost:4000/api/workspaces/switch/${workspaceId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tempToken}`,
      },
    },
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Workspace switch failed");
  }

  const accessToken = data?.data?.accessToken;

  if (!accessToken) {
    throw new Error("No access token returned");
  }

  localStorage.setItem("accessToken", accessToken);

  return data;
}; */
