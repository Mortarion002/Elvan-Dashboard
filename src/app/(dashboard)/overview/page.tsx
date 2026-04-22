import styles from './Overview.module.css';
import { signals, overviewCompetitors } from '@/data/mockData';
import { SourcePill } from '@/components/ui/SourcePill';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { UrgencyChip } from '@/components/ui/UrgencyChip';
import { IntentTag } from '@/components/ui/IntentTag';

export default function OverviewPage() {
  const trendData = [
    { day: "Mon", height: "45%" },
    { day: "Tue", height: "60%" },
    { day: "Wed", height: "40%" },
    { day: "Thu", height: "85%", active: true },
    { day: "Fri", height: "55%" },
    { day: "Sat", height: "35%" },
    { day: "Sun", height: "30%" }
  ];

  return (
    <div className={styles.content}>
      {/* PAGE HEAD */}
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Overview</h1>
          <div className={styles.pageSub}>
            Your AI signal pipeline at a glance.
            <span className={styles.liveDot}>Live · 4s ago</span>
          </div>
        </div>
        <div className={styles.actions}>
          <button className={`${styles.btn} ${styles.primary}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            New tracker
          </button>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className={styles.statsStrip}>
        <div className={styles.stripCard}>
          <div className={styles.stripIcon} style={{ background: "var(--green-soft)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"><path d="M2 12h4l2-7 4 14 2-7h8"/></svg>
          </div>
          <div>
            <div className={styles.num}>1,284</div>
            <div className={styles.lbl}>Signals this week</div>
          </div>
        </div>
        <div className={styles.stripCard}>
          <div className={styles.stripIcon} style={{ background: "rgba(239,68,68,.1)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round"><path d="M12 2c1 3 3 4 3 7a3 3 0 0 1-6 0c0-1 .5-2 1-3-2 1-4 4-4 7a6 6 0 0 0 12 0c0-4-3-7-6-11Z"/></svg>
          </div>
          <div>
            <div className={styles.num} style={{ color: "#fca5a5" }}>24</div>
            <div className={styles.lbl}>Hot leads</div>
          </div>
        </div>
        <div className={styles.stripCard}>
          <div className={styles.stripIcon} style={{ background: "rgba(245,158,11,.1)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
          </div>
          <div>
            <div className={styles.num} style={{ color: "#fcd34d" }}>18</div>
            <div className={styles.lbl}>Auto-replied</div>
          </div>
        </div>
        <div className={styles.stripCard}>
          <div className={styles.stripIcon} style={{ background: "rgba(106,114,132,.1)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9aa3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          </div>
          <div>
            <div className={styles.num} style={{ color: "#9aa3b8" }}>3</div>
            <div className={styles.lbl}>Active trackers</div>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className={styles.grid}>
        <div className={styles.col}>
          {/* Trend Chart */}
          <div className={`${styles.card} ${styles.chartCard}`}>
            <div className={styles.cardHead}>
              <div>
                <h3 className={styles.cardTitle}>Trend (7d)</h3>
                <div className={styles.cardSub}>Signal volume up 14% WoW</div>
              </div>
            </div>
            <div className={styles.barChart}>
              {trendData.map((d) => (
                <div className={styles.bCol} key={d.day}>
                  <div 
                    className={styles.bVal} 
                    style={{ 
                      height: d.height, 
                      ...(d.active ? { background: "var(--green)", boxShadow: "0 0 16px rgba(34,197,94,.4)" } : {}) 
                    }}
                  />
                  <div className={styles.bLbl} style={d.active ? { color: "var(--text)" } : {}}>
                    {d.day}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Donut Chart */}
          <div className={`${styles.card} ${styles.chartCard}`}>
            <div className={styles.cardHead}>
              <div>
                <h3 className={styles.cardTitle}>Top Sources</h3>
                <div className={styles.cardSub}>Distribution by volume</div>
              </div>
            </div>
            <div className={styles.donutWrap}>
              <div className={styles.donut}>
                <svg viewBox="0 0 36 36" className={styles.circularChart}>
                  <path className={styles.circleBg} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className={styles.circle} stroke="#22c55e" strokeDasharray="45, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className={styles.circle} stroke="#16a34a" strokeDasharray="30, 100" strokeDashoffset="-45" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className={styles.circle} stroke="#15803d" strokeDasharray="25, 100" strokeDashoffset="-75" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className={styles.donutCenter}>
                  <div className={styles.dNum}>1.2k</div>
                  <div className={styles.dLbl}>Total</div>
                </div>
              </div>
              <div className={styles.donutLegend}>
                <div className={styles.legItem}>
                  <div className={styles.legDot} style={{ background: "#22c55e" }}></div>
                  <span className={styles.legLbl}>Reddit</span>
                  <span className={styles.legVal}>45%</span>
                </div>
                <div className={styles.legItem}>
                  <div className={styles.legDot} style={{ background: "#16a34a" }}></div>
                  <span className={styles.legLbl}>HackerNews</span>
                  <span className={styles.legVal}>30%</span>
                </div>
                <div className={styles.legItem}>
                  <div className={styles.legDot} style={{ background: "#15803d" }}></div>
                  <span className={styles.legLbl}>Product Hunt</span>
                  <span className={styles.legVal}>25%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.col2}>
          {/* Latest Signals Table */}
          <div className={`${styles.card} ${styles.tableCard}`}>
            <div className={styles.cardHead}>
              <div>
                <h3 className={styles.cardTitle}>Latest Signals</h3>
                <div className={styles.cardSub}>Filtered by 'Buying Intent'</div>
              </div>
              <button className={`${styles.btn} ${styles.smallBtn}`}>View all →</button>
            </div>
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: "35%" }}>Signal</th>
                    <th>Source</th>
                    <th style={{ width: "70px" }}>Score</th>
                    <th>Intent</th>
                    <th>Urgency</th>
                  </tr>
                </thead>
                <tbody>
                  {signals.map((s, i) => (
                    <tr key={i}>
                      <td className={styles.tTitle}>
                        {s.title}
                        <span className={styles.sub}>{s.sub}</span>
                      </td>
                      <td><SourcePill src={s.src} /></td>
                      <td><ScoreBadge score={s.score} /></td>
                      <td><IntentTag intent={s.intent} color={s.intentColor} /></td>
                      <td><UrgencyChip urgency={s.urgency} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Competitor Mentions List */}
          <div className={`${styles.card} ${styles.compCard}`}>
            <div className={styles.cardHead}>
              <div>
                <h3 className={styles.cardTitle}>Competitor Mentions</h3>
                <div className={styles.cardSub}>Rolling 30 days</div>
              </div>
              <button className={`${styles.btn} ${styles.smallBtn}`}>Full report →</button>
            </div>
            <div className={styles.compList}>
              {overviewCompetitors.map((c, i) => (
                <div className={styles.cRow} key={i}>
                  <div className={styles.cLogo} style={{ background: c.bg || c.color, color: c.bg ? "#fff" : "transparent" }}>
                    {!c.bg ? <span style={{ color: "#fff" }}>{c.initials}</span> : null}
                    {c.bg && c.initials === "T" && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: c.color }}>
                        <path d="M12 2L2 22h20L12 2z"/>
                      </svg>
                    )}
                  </div>
                  <div className={styles.cName}>{c.name}</div>
                  <div className={styles.cVol}>{c.mentions}</div>
                  <div className={styles.cBarWrap}>
                    <div className={styles.cBarBg}>
                      <div className={styles.cBarFill} style={{ width: `${c.pct}%`, background: c.color }} />
                    </div>
                  </div>
                  <div className={`${styles.cTrend} ${c.down ? styles.down : styles.up}`}>
                    {c.down ? "↓" : "↑"} {c.delta}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
