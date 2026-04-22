import styles from './IntentTag.module.css';
import { Intent } from '@/data/mockData';

interface IntentTagProps {
  intent: Intent;
  color: string;
}

export function IntentTag({ intent, color }: IntentTagProps) {
  return (
    <span className={styles.tag}>
      <span className={styles.dot} style={{ background: color }} />
      {intent}
    </span>
  );
}
