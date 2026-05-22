import Link from "next/link";

import styles from "./page.module.css";

export const metadata = {
  title: "Unauthorized - Elvan",
};

export default function UnauthorizedPage() {
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <span className={styles.badge}>Access blocked</span>
        <h1>This dashboard is only for Elvan accounts.</h1>
        <p>Sign in with an email ending in @getelvan.com or @elvan.com.</p>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/auth/sign-out">
            Sign out
          </Link>
          <Link className={styles.secondary} href="/auth/sign-in">
            Try another account
          </Link>
        </div>
      </section>
    </main>
  );
}
