// frontend/app/layout.tsx
//
// RealtimeProvider removed from root layout.
// It was mounting the socket on ALL pages including /login and /register,
// causing hundreds of CORS-rejected polling retries on public pages.
// RealtimeProvider is now only mounted inside app/dashboard/layout.tsx
// where the socket connection is actually needed.

import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/providers/auth-provider";
import { WorkspaceProvider } from "@/providers/workspace-provider";
import { ReactQueryProvider } from "@/providers/react-query-provider";
import { ToastProvider } from "@/providers/toast-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Nexora AI",
  description: "AI Workspace Intelligence",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider>
          <AuthProvider>
            <WorkspaceProvider>
              <ReactQueryProvider>
                <ToastProvider>{children}</ToastProvider>
              </ReactQueryProvider>
            </WorkspaceProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
