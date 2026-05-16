import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { isAllowedEmail } from "@/lib/authPolicy";

type GoogleProfile = {
  email?: string | null;
  email_verified?: boolean | null;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    signIn({ account, profile, user }) {
      if (account?.provider !== "google") {
        return false;
      }

      const googleProfile = profile as GoogleProfile | undefined;
      const email = googleProfile?.email ?? user.email;

      return googleProfile?.email_verified === true && isAllowedEmail(email);
    },
    authorized({ auth }) {
      return isAllowedEmail(auth?.user?.email);
    },
  },
});
