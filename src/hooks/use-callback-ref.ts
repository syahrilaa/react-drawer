import * as React from "react";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

export const useCallbackRef = <Callback extends (...args: never[]) => unknown>(
  callback: Callback | undefined,
): Callback => {
  const callbackRef = React.useRef(callback);
  useIsomorphicLayoutEffect(() => {
    callbackRef.current = callback;
  });
  return React.useMemo(() => ((...args: never[]) => callbackRef.current?.(...args)) as Callback, []);
};
