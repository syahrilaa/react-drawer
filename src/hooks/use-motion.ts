import * as React from "react";

export const getMaxTime = (value: string): number => {
  return Math.max(
    0,
    ...value.split(",").map((time) => {
      const amount = Number.parseFloat(time.trim());
      if (!Number.isFinite(amount)) return 0;
      return time.includes("ms") ? amount : amount * 1000;
    }),
  );
};

export const getExitDuration = (element: HTMLElement | null): number => {
  if (!element) return 0;
  const style = window.getComputedStyle(element);
  return Math.max(
    getMaxTime(style.transitionDuration) + getMaxTime(style.transitionDelay),
    getMaxTime(style.animationDuration) + getMaxTime(style.animationDelay),
  );
};

export const usePresence = (
  open: boolean,
  contentRef: React.RefObject<HTMLElement | null>,
  overlayRef: React.RefObject<HTMLElement | null>,
): boolean => {
  const [isPresent, setIsPresent] = React.useState(open);

  React.useEffect(() => {
    if (open) {
      setIsPresent(true);
      return;
    }
    if (!isPresent) return;

    const exitDuration = Math.max(getExitDuration(contentRef.current), getExitDuration(overlayRef.current));
    if (exitDuration === 0) {
      setIsPresent(false);
      return;
    }

    const timeout = window.setTimeout(() => setIsPresent(false), exitDuration + 50);
    return () => window.clearTimeout(timeout);
  }, [open, isPresent, contentRef, overlayRef]);

  return open || isPresent;
};
