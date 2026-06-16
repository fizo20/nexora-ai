// frontend/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

import { ThemeProvider } from "@/components/providers/ThemeProvider";

import { AuthProvider } from "@/providers/auth-provider";
import { WorkspaceProvider } from "@/providers/workspace-provider";
import { ReactQueryProvider } from "@/providers/react-query-provider";

import { ToastProvider } from "@/providers/toast-provider";

import { RealtimeProvider } from "@/providers/realtime-provider";

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
                <RealtimeProvider>
                  <ToastProvider>{children}</ToastProvider>
                </RealtimeProvider>
              </ReactQueryProvider>
            </WorkspaceProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
