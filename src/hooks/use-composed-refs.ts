import * as React from "react";

export const useComposedRefs = <Element>(
  ...refs: Array<React.Ref<Element> | undefined>
): React.RefCallback<Element> => {
  return React.useCallback(
    (node: Element | null) => {
      for (const ref of refs) {
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }
    },
    [refs],
  );
};
