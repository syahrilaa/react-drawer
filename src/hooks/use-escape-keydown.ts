import * as React from "react";
import { useCallbackRef } from "./use-callback-ref";

export const useEscapeKeydown = (onEscapeKeyDown: (event: KeyboardEvent) => void, enabled = true): void => {
  const handleEscapeKeyDown = useCallbackRef(onEscapeKeyDown);

  React.useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleEscapeKeyDown(event);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled, handleEscapeKeyDown]);
};
