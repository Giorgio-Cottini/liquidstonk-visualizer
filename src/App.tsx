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
