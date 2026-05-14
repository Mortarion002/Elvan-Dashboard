"use client";

import Image from "next/image";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  Check,
  Layers,
  Lock,
  Mail,
  Target,
  User,
  X as XIcon,
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
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className={styles.landing} data-theme="dark" id="top">
      <Nav onSignIn={() => setShowLogin(true)} />
      <Hero onGetStarted={() => setShowLogin(true)} />
      <DashboardPreview />
      <Features />
      <Footer onSignIn={() => setShowLogin(true)} />
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}

function Nav({ onSignIn }: { onSignIn: () => void }) {
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
          <button className={`${styles.btnGhost} ${styles.btnSm}`} onClick={onSignIn} type="button">
            Sign In
          </button>
          <button
            className={`${styles.btnPrimary} ${styles.btnSm}`}
            onClick={onSignIn}
            type="button"
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}

function Hero({ onGetStarted }: { onGetStarted: () => void }) {
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
          <button className={`${styles.btnPrimary} ${styles.btnLg}`} onClick={onGetStarted} type="button">
            <span>Get Started</span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
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

function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const loadingTimer = useRef<number | null>(null);

  function clearLoadingTimer() {
    if (loadingTimer.current !== null) {
      window.clearTimeout(loadingTimer.current);
      loadingTimer.current = null;
    }
  }

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      clearLoadingTimer();
    };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    clearLoadingTimer();
    loadingTimer.current = window.setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  }

  function switchMode() {
    clearLoadingTimer();
    setMode((current) => (current === "signin" ? "signup" : "signin"));
    setLoading(false);
    setError("");
    setSuccess(false);
  }

  function resetAndClose() {
    clearLoadingTimer();
    setEmail("");
    setPassword("");
    setName("");
    setError("");
    setSuccess(false);
    setMode("signin");
    setLoading(false);
    onClose();
  }

  return (
    <div
      className={`${styles.modalOverlay} ${isOpen ? styles.modalOpen : ""}`}
      onClick={resetAndClose}
      aria-hidden={!isOpen}
    >
      <div className={styles.modalCard} onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <button className={styles.modalClose} onClick={resetAndClose} type="button" aria-label="Close">
          <XIcon size={18} aria-hidden="true" />
        </button>

        <div className={styles.modalHeader}>
          <div className={styles.modalLogo}>
            <Image
              src="/brand/elvan-icon-light.png"
              alt=""
              width={36}
              height={36}
              className={styles.darkOnly}
            />
            <Image
              src="/brand/elvan-icon-dark.png"
              alt=""
              width={36}
              height={36}
              className={styles.lightOnly}
            />
          </div>
          <h2 className={styles.modalTitle}>
            {success ? "You're in!" : mode === "signin" ? "Welcome back" : "Create your account"}
          </h2>
          <p className={styles.modalSubtitle}>
            {success
              ? "Redirecting to your dashboard..."
              : mode === "signin"
                ? "Sign in to your Elvan dashboard"
                : "Get started with Elvan"}
          </p>
        </div>

        {success ? (
          <div className={styles.successState}>
            <div className={styles.successIcon}>
              <Check size={28} strokeWidth={2.5} aria-hidden="true" />
            </div>
          </div>
        ) : (
          <>
            <form className={styles.modalForm} onSubmit={handleSubmit}>
              {mode === "signup" && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="lg-name">
                    Name
                  </label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>
                      <User size={16} strokeWidth={1.5} aria-hidden="true" />
                    </span>
                    <input
                      id="lg-name"
                      type="text"
                      className={styles.formInput}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Your name"
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="lg-email">
                  Email
                </label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>
                    <Mail size={16} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <input
                    id="lg-email"
                    type="email"
                    className={styles.formInput}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <div className={styles.formLabelRow}>
                  <label className={styles.formLabel} htmlFor="lg-pass">
                    Password
                  </label>
                  {mode === "signin" && (
                    <button type="button" className={styles.formLinkBtn}>
                      Forgot?
                    </button>
                  )}
                </div>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>
                    <Lock size={16} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <input
                    id="lg-pass"
                    type="password"
                    className={styles.formInput}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Password"
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  />
                </div>
              </div>

              {error ? <div className={styles.formError}>{error}</div> : null}

              <button type="submit" className={`${styles.btnPrimary} ${styles.btnFull}`} disabled={loading}>
                {loading ? (
                  <span className={styles.btnLoading}>
                    <span className={styles.spinner} />
                    {mode === "signin" ? "Signing in..." : "Creating account..."}
                  </span>
                ) : (
                  <span>{mode === "signin" ? "Sign In" : "Create Account"}</span>
                )}
              </button>
            </form>

            <div className={styles.modalToggle}>
              <span>{mode === "signin" ? "Don't have an account?" : "Already have an account?"}</span>
              <button type="button" className={styles.formLinkBtn} onClick={switchMode}>
                {mode === "signin" ? "Sign up" : "Sign in"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Footer({ onSignIn }: { onSignIn: () => void }) {
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
          <button className={styles.footerLink} onClick={onSignIn} type="button">
            Sign In
          </button>
          <a className={styles.footerLink} href="https://amankumar002u.tech" target="_blank" rel="noopener noreferrer">
            By Aman Kumar
          </a>
        </div>
      </div>
    </footer>
  );
}
