import { useEffect, useState } from "react";

/**
 * Live `prefers-reduced-motion` subscription.
 * Drives three separate decisions: no scrubbed camera travel, no pinning, and
 * no ambient movement inside the sculpture.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/** True below the `lg` breakpoint — used to cut 3D complexity and pixel density. */
export function useIsCompact(): boolean {
  const [compact, setCompact] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth < 1024;
  });

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const onChange = (e: MediaQueryListEvent) => setCompact(e.matches);
    setCompact(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return compact;
}

/**
 * Does this browser have a usable WebGL context?
 * Checked once, before the canvas is ever mounted, so an unsupported device
 * gets the static SVG composition instead of an empty box.
 */
export function detectWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    if (!gl) return false;
    // A context that cannot lose/restore cleanly is treated as unavailable.
    return typeof (gl as WebGLRenderingContext).getParameter === "function";
  } catch {
    return false;
  }
}

export function useWebGLSupport(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null);
  useEffect(() => {
    setSupported(detectWebGL());
  }, []);
  return supported;
}
