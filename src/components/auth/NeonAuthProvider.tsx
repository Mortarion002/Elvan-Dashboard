"use client";

import { NeonAuthUIProvider } from "@neondatabase/auth/react";
import "@neondatabase/auth/ui/css";

import { authClient } from "@/lib/auth/client";

export function NeonAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <NeonAuthUIProvider
      authClient={authClient as never}
      redirectTo="/reddit"
      social={{ providers: ["google"] }}
      credentials={false}
    >
      {children}
    </NeonAuthUIProvider>
  );
}
