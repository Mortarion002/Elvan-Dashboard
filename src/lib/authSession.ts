import "server-only";

import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/server";
import { isAllowedEmail } from "@/lib/authPolicy";

export type InternalUser = {
  email: string;
  name: string | null;
};

export async function getCurrentInternalUser(): Promise<InternalUser | null> {
  const { data: session } = await auth.getSession();
  const email = session?.user?.email ?? null;

  if (!email || !isAllowedEmail(email)) {
    return null;
  }

  return {
    email,
    name: session?.user?.name ?? null,
  };
}

export async function requireInternalUser(): Promise<InternalUser> {
  const user = await getCurrentInternalUser();
  if (!user) {
    redirect("/unauthorized");
  }

  return user;
}
