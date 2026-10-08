import { useEffect, useState, type RefObject } from "react";

/**
 * Should the canvas be rendering right now?
 *
 * Three independent reasons to stop: the canvas element has left the viewport,
 * the tab is hidden, or an opaque modal is covering the page. Returning false
 * switches React Three Fiber's frameloop to "never", so the GPU goes idle
 * instead of drawing frames nobody can see.
 */
export function useCanvasActive(
  ref: RefObject<HTMLElement | null>,
  occluded: boolean,
): boolean {
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(() =>
    typeof document === "undefined" ? true : !document.hidden,
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setInView(Boolean(entry?.isIntersecting));
      },
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  useEffect(() => {
    const onChange = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onChange);
    onChange();
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);

  return inView && tabVisible && !occluded;
}
