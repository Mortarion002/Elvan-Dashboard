import styles from './UrgencyChip.module.css';

interface UrgencyChipProps {
  urgency: 'high' | 'med' | 'mid' | 'low'; // Data uses both 'med' and 'mid'
}

export function UrgencyChip({ urgency }: UrgencyChipProps) {
  const normalizedUrgency = urgency === 'med' ? 'mid' : urgency;
  
  const cls = {
    high: styles.high,
    mid: styles.mid,
    low: styles.low
  }[normalizedUrgency];

  const label = normalizedUrgency === 'high' ? 'High' : normalizedUrgency === 'mid' ? 'Medium' : 'Low';

  return (
    <span className={`${styles.urg} ${cls}`}>
      <span className={styles.bar}>
        <span></span>
        <span></span>
        <span></span>
      </span>
      {label}
    </span>
  );
}
