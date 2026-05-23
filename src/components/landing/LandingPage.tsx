"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  Layers,
  Target,
  type LucideIcon,
} from "lucide-react";

import styles from "./LandingPage.module.css";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    icon: Activity,
    title: "Live Monitoring",
    description: "Near real-time signal tracking across all sources with 15-second refresh cycles.",
  },
  {
    icon: Target,
    title: "Hot Lead Detection",
    description: "AI-scored buying signals surfaced and prioritized automatically.",
  },
  {
    icon: Layers,
    title: "Source Aggregation",
    description: "Reddit, Product Hunt, Hacker News, and X in one unified inbox.",
  },
];

const SOURCES = ["Reddit", "Product Hunt", "Hacker News", "X"];

export function LandingPage() {
  return (
    <div className={styles.landing} data-theme="dark" id="top">
      <Nav />
      <Hero />
      <DashboardPreview />
      <Features />
      <Footer />
    </div>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ""}`}>
      <div className={styles.navInner}>
        <a className={styles.navLogo} href="#top" aria-label="Elvan home">
          <Image
            src="/brand/elvan-icon-light.png"
            alt=""
            width={28}
            height={28}
            className={`${styles.navIcon} ${styles.darkOnly}`}
            priority
          />
          <Image
            src="/brand/elvan-icon-dark.png"
            alt=""
            width={28}
            height={28}
            className={`${styles.navIcon} ${styles.lightOnly}`}
            priority
          />
          <span className={styles.navWordmark}>Elvan</span>
        </a>
        <div className={styles.navActions}>
          <Link className={`${styles.btnGhost} ${styles.btnSm}`} href="/auth/sign-in">
            Sign In
          </Link>
          <Link className={`${styles.btnPrimary} ${styles.btnSm}`} href="/auth/sign-in">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroGlow} />
      <div className={`${styles.heroContent} ${styles.animUp}`}>
        <div className={styles.heroBadge}>
          <span className={styles.statusDot} />
          <span>AI Signal Observability</span>
        </div>
        <h1 className={styles.heroTitle}>
          Every signal.
          <br />
          One dashboard.
        </h1>
        <p className={styles.heroSubtitle}>
          Unified observability for your production AI systems. Monitor Reddit, Product Hunt,
          Hacker News, and X - all in real time.
        </p>
        <div className={styles.heroActions}>
          <Link className={`${styles.btnPrimary} ${styles.btnLg}`} href="/auth/sign-in">
            <span>Get Started</span>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <div className={styles.heroSources}>
          {SOURCES.map((source) => (
            <span className={styles.heroSourcePill} key={source}>
              {source}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <section className={`${styles.previewSection} ${styles.animUp}`} style={{ animationDelay: "0.15s" }}>
      <div className={styles.previewContainer}>
        <div className={styles.previewFrame}>
          <div className={styles.previewChrome}>
            <div className={styles.previewDots} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className={styles.previewUrl}>elvan-dashboard.vercel.app</div>
          </div>
          <div className={styles.previewBody}>
            <Image
              src="/landing/dashboard-preview-dark.png"
              alt="Elvan dashboard"
              width={1440}
              height={1000}
              className={`${styles.previewImg} ${styles.darkOnly}`}
              sizes="(max-width: 1088px) calc(100vw - 48px), 1040px"
            />
            <Image
              src="/landing/dashboard-preview-light.png"
              alt="Elvan dashboard"
              width={1440}
              height={1000}
              className={`${styles.previewImg} ${styles.lightOnly}`}
              sizes="(max-width: 1088px) calc(100vw - 48px), 1040px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className={styles.featuresSection}>
      <div className={styles.featuresInner}>
        <span className={styles.sectionLabel}>Capabilities</span>
        <h2 className={styles.sectionTitle}>Built for signal operators</h2>
        <div className={styles.featuresGrid}>
          {FEATURES.map((feature, index) => (
            <FeatureCard feature={feature} index={index} key={feature.title} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const Icon = feature.icon;

  return (
    <div className={`${styles.featureCard} ${styles.animUp}`} style={{ animationDelay: `${0.05 + 0.08 * index}s` }}>
      <div className={styles.featureIconWrap}>
        <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
      </div>
      <h3 className={styles.featureTitle}>{feature.title}</h3>
      <p className={styles.featureDesc}>{feature.description}</p>
    </div>
  );
}

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerLeft}>
          <a className={styles.footerLogo} href="#top" aria-label="Elvan home">
            <Image
              src="/brand/elvan-icon-light.png"
              alt=""
              width={18}
              height={18}
              className={styles.darkOnly}
            />
            <Image
              src="/brand/elvan-icon-dark.png"
              alt=""
              width={18}
              height={18}
              className={styles.lightOnly}
            />
            <span>Elvan</span>
          </a>
          <span className={styles.footerCopy}>&copy; 2026 Elvan</span>
        </div>
        <div className={styles.footerRight}>
          <a className={styles.footerCredit} href="https://amankumar002u.tech" target="_blank" rel="noopener noreferrer">
            Made by Aman Kumar
          </a>
        </div>
      </div>
    </footer>
  );
}
