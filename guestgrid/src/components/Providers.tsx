"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1e293b",
            color: "#f8fafc",
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
            border: "1px solid #334155",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#f8fafc",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#f8fafc",
            },
          },
        }}
      />
      {children}
    </SessionProvider>
  );
}
