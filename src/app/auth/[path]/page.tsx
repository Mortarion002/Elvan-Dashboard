import { AuthView } from "@neondatabase/auth/react";

import styles from "./page.module.css";

export const dynamicParams = false;

export const metadata = {
  title: "Sign in - Elvan",
};

export default async function AuthPage({ params }: { params: Promise<{ path: string }> }) {
  const { path } = await params;

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.header}>
          <span className={styles.badge}>Company access only</span>
          <h1>Elvan Dashboard</h1>
          <p>Use an Elvan email address to continue.</p>
        </div>
        <AuthView path={path} redirectTo="/reddit" />
      </section>
    </main>
  );
}
