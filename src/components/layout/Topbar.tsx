import { LogOut } from "lucide-react";

import { signOutCurrentUser } from "@/app/auth-actions";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import styles from "./Topbar.module.css";

type TopbarProps = {
  userEmail: string;
  userName: string | null;
};

export function Topbar({ userEmail, userName }: TopbarProps) {
  const displayName = userName || userEmail;
  const initials = getInitials(displayName);

  return (
    <header className={styles.topbar}>
      <div className={styles.session}>
        <div className={styles.avatar} aria-hidden="true">
          {initials}
        </div>
        <div className={styles.identity}>
          <span className={styles.name}>{displayName}</span>
          <span className={styles.email}>{userEmail}</span>
        </div>
      </div>
      <ThemeToggle />
      <form action={signOutCurrentUser}>
        <button className={styles.signOutButton} type="submit" aria-label="Sign out" title="Sign out">
          <LogOut size={16} aria-hidden="true" />
          <span>Sign out</span>
        </button>
      </form>
    </header>
  );
}

function getInitials(value: string): string {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return value.slice(0, 2).toUpperCase();
}
