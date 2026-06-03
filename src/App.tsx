import { useState } from "react";
import { Text, Loader } from "@mantine/core";
import type { BacktestResult } from "./types";
import { parseBacktestResult, ParseError } from "./utils/parseResult";
import DropZone from "./components/DropZone";
import Dashboard from "./components/Dashboard";
import { useTheme } from "./context/ThemeContext";
import logo from "./utils/logo.png";
import s from "./App.module.css";

export default function App() {
  const { isDark, toggle } = useTheme();
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFile = (file: File) => {
    setError(null);
    setIsLoading(true);
    const reader = new FileReader();
    reader.onerror = () => {
      setError(
        `Failed to read file: ${reader.error?.message ?? "unknown error"}`,
      );
      setIsLoading(false);
    };
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== "string") {
          throw new Error("File contents are not text.");
        }
        let raw: unknown;
        try {
          raw = JSON.parse(text);
        } catch (err) {
          throw new Error(`Invalid JSON: ${(err as Error).message}`);
        }
        const parsed = parseBacktestResult(raw);
        setResult(parsed);
      } catch (err) {
        if (err instanceof ParseError) {
          setError(err.message);
        } else {
          setError((err as Error).message);
        }
        // Surface full details in console for debugging.
        // eslint-disable-next-line no-console
        console.error("[GioVisualizer] failed to load backtest:", err);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  if (!result) {
    return (
      <div className={s.landingWrap}>
        <div className={s.landingCard}>
          {isLoading ? (
            <div className={s.loadingWrap}>
              <img src={logo} alt="Liquid Stonks" className={s.logo} />
              <Loader />
              <Text size="sm" style={{ color: "var(--text-secondary)" }}>
                Parsing backtest results...
              </Text>
            </div>
          ) : (
            <>
              <img src={logo} alt="Liquid Stonks" className={s.logoLanding} />
              <Text fw={600} size="xl" style={{ color: "var(--text-primary)" }}>
                Liquid Stonks
              </Text>
              <Text
                size="sm"
                mt={4}
                mb="xl"
                style={{ color: "var(--text-secondary)" }}
              >
                Drop a backtest JSON to visualize results.
              </Text>
              <DropZone onFile={handleFile} />
              {error && <div className={s.errorText}>{error}</div>}
            </>
          )}
        </div>
        <LandingFooter />
      </div>
    );
  }

  return (
    <div className={s.page}>
      <header className={s.header}>
        <div className={s.headerLeft}>
          <img src={logo} alt="Liquid Stonks" className={s.logoSmall} />
          <Text fw={600} size="md" style={{ color: "var(--text-primary)" }}>
            Liquid Stonks
          </Text>
        </div>
        <div className={s.headerRight}>
          <button onClick={toggle} className={s.themeBtn}>
            {isDark ? "☀" : "🌙"}
          </button>
          <button className={s.loadBtn} onClick={() => setResult(null)}>
            Load another
          </button>
        </div>
      </header>
      <main className={s.content}>
        <Dashboard result={result} />
      </main>
    </div>
  );
}

const REPO_URL = "https://github.com/Giorgio-Cottini/liquidstonk-visualizer";
const NETLIFY_URL = "https://www.netlify.com";
const APP_VERSION = "v1.1";

function LandingFooter() {
  return (
    <footer className={s.footer}>
      <span className={s.versionChip}>{APP_VERSION}</span>
      <span className={s.footerDot} />
      <a
        className={s.footerLink}
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17 4.7 18 5 18 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5Z" />
        </svg>
        GitHub
      </a>
      <span className={s.footerDot} />
      <a
        className={s.footerLink}
        href={NETLIFY_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="#00C7B7" aria-hidden="true">
          <path d="M12 1.6 22.4 12 12 22.4 1.6 12 12 1.6Z" />
        </svg>
        Deploys on Netlify
      </a>
    </footer>
  );
}
