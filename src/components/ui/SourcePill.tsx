import styles from './SourcePill.module.css';
import { SignalSource } from '@/data/mockData';

interface SourcePillProps {
  src: SignalSource;
}

export function SourcePill({ src }: SourcePillProps) {
  const map = {
    x: { label: "X", cls: styles.x, letter: "X" },
    reddit: { label: "Reddit", cls: styles.reddit, letter: "R" },
    hn: { label: "Hacker News", cls: styles.hn, letter: "H" },
    ph: { label: "Product Hunt", cls: styles.ph, letter: "P" },
  };

  const data = map[src];

  return (
    <span className={styles.pill}>
      <span className={`${styles.icon} ${data.cls}`}>{data.letter}</span>
      {data.label}
    </span>
  );
}
