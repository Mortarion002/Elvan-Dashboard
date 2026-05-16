import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, LockKeyhole } from "lucide-react";

import { signInWithGoogle } from "@/app/auth-actions";
import { auth } from "@/auth";
import {
  getAllowedEmailDomains,
  isAllowedEmail,
  isGoogleAuthConfigured,
} from "@/lib/authPolicy";
import styles from "./page.module.css";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  AccessDenied: "That Google account is not allowed for this Elvan workspace.",
  Configuration: "Google sign-in is not configured yet. Add the Auth.js Google variables in Vercel.",
  OAuthSignin: "Google sign-in could not start. Please try again.",
  OAuthCallback: "Google sign-in could not finish. Please try again.",
  OAuthAccountNotLinked: "Use the same Google account you used before.",
};

export const metadata = {
  title: "Sign in - Elvan",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  if (isAllowedEmail(session?.user?.email)) {
    redirect("/reddit");
  }

  const params = await searchParams;
  const error = params?.error ? errorMessages[params.error] ?? errorMessages.AccessDenied : null;
  const allowedDomains = getAllowedEmailDomains();
  const googleConfigured = isGoogleAuthConfigured();

  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="login-title">
        <Link className={styles.brand} href="/" aria-label="Elvan home">
          <Image src="/brand/elvan-icon-light.png" alt="" width={36} height={36} priority />
          <span>Elvan</span>
        </Link>

        <div className={styles.heading}>
          <div className={styles.badge}>
            <LockKeyhole size={15} aria-hidden="true" />
            <span>Company access only</span>
          </div>
          <h1 id="login-title">Sign in to Elvan</h1>
          <p>
            Use your Elvan Google account. Access is limited to{" "}
            {allowedDomains.map((domain) => `@${domain}`).join(" or ")}.
          </p>
        </div>

        {error ? <div className={styles.error}>{error}</div> : null}

        <form action={signInWithGoogle}>
          <button className={styles.googleButton} type="submit" disabled={!googleConfigured}>
            <span className={styles.googleMark} aria-hidden="true">
              G
            </span>
            <span>Continue with Google</span>
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        </form>

        {!googleConfigured ? (
          <p className={styles.setupNote}>
            Required variables: AUTH_SECRET, AUTH_GOOGLE_ID, and AUTH_GOOGLE_SECRET.
          </p>
        ) : null}
      </section>
    </main>
  );
}
