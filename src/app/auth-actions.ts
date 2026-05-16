"use server";

import { redirect } from "next/navigation";

import { signIn, signOut } from "@/auth";
import { isGoogleAuthConfigured } from "@/lib/authPolicy";

export async function signInWithGoogle() {
  if (!isGoogleAuthConfigured()) {
    redirect("/login?error=Configuration");
  }

  await signIn("google", { redirectTo: "/reddit" });
}

export async function signOutCurrentUser() {
  await signOut({ redirectTo: "/" });
}
