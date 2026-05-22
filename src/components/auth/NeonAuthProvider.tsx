"use client";

import { NeonAuthUIProvider } from "@neondatabase/auth/react";
import "@neondatabase/auth/ui/css";

import { authClient } from "@/lib/auth/client";

function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "";
}

export function NeonAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <NeonAuthUIProvider
      authClient={authClient as never}
      baseURL={getAppBaseUrl()}
      redirectTo="/reddit"
      social={{ providers: ["google"] }}
      credentials={false}
    >
      {children}
    </NeonAuthUIProvider>
  );
}
