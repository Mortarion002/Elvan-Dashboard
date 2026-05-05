import { ThemeToggle } from "@/components/layout/ThemeToggle";
import styles from "./Topbar.module.css";

export function Topbar() {
  return (
    <header className={styles.topbar}>
      <ThemeToggle />
    </header>
  );
}
