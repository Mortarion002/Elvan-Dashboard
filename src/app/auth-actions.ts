"use server";

import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/server";

export async function signOutCurrentUser() {
  await auth.signOut();
  redirect("/");
}
