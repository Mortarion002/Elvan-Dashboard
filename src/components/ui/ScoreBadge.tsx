import styles from './ScoreBadge.module.css';

interface ScoreBadgeProps {
  score: number;
}

export function ScoreBadge({ score }: ScoreBadgeProps) {
  let variant = 'low';
  if (score >= 8) variant = 'high';
  else if (score >= 5) variant = 'mid';

  const cls = {
    high: styles.high,
    mid: styles.mid,
    low: styles.low
  }[variant];

  return (
    <span className={`${styles.badge} ${cls}`}>
      {score}
    </span>
  );
}
