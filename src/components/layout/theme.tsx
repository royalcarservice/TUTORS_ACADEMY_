"use client";

import { useCallback, useSyncExternalStore, useState } from "react";
import { Moon, Sun } from "lucide-react";

/* --------------------------------------------------------------------------
   Theme — REAL dark/light with persistence and NO flash of wrong theme.

   · preference stored in localStorage("ta-theme")
   · default = prefers-color-scheme when no stored choice
   · <ThemePrepaint/> emits a tiny synchronous inline script in <head> that
     applies the attribute BEFORE first paint (prevents flash).
   · applies data-theme to <html>; tokens do the rest (no conditional logic).
   ------------------------------------------------------------------------ */

export type Theme = "dark" | "light";
const KEY = "ta-theme";

const PREPAINT = `(function(){try{var s=localStorage.getItem("${KEY}");var t=s||(window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`;

/** Place in <head> (or as early as possible) to avoid a flash of wrong theme. */
export function ThemePrepaint() {
  return <script dangerouslySetInnerHTML={{ __html: PREPAINT }} />;
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof document !== "undefined"
      ? ((document.documentElement.getAttribute("data-theme") as Theme) || "dark")
      : "dark",
  );

  const toggle = useCallback(() => {
    setTheme((t) => {
      const next: Theme = t === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem(KEY, next);
      } catch {}
      return next;
    });
  }, []);

  return { theme, toggle };
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  /* Hydration-safe (Phase 3 · Step 6): the server cannot know the stored or
     preferred theme, so both server and first client paint render a neutral
     toggle; the real icon/label resolve after mount. Same box, no shift. */
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const light = theme === "light";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mounted ? (light ? "Switch to dark theme" : "Switch to light theme") : "Toggle theme"}
      aria-pressed={mounted ? light : undefined}
      style={{
        minHeight: "var(--ta-target-min)",
        minWidth: "var(--ta-target-min)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "var(--ta-radius-2)",
        border: "1px solid var(--ta-border-subtle)",
        background: "transparent",
        color: "var(--ta-text-primary)",
        cursor: "pointer",
      }}
    >
      {mounted ? (
        light ? <Moon aria-hidden size={20} strokeWidth={1.5} /> : <Sun aria-hidden size={20} strokeWidth={1.5} />
      ) : (
        <span aria-hidden style={{ width: 20, height: 20, display: "inline-block" }} />
      )}
    </button>
  );
}
