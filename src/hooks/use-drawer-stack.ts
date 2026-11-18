import * as React from "react";

interface DrawerStackContextValue {
  readonly stack: readonly string[];
  readonly register: (id: string) => () => void;
}

interface DrawerStackProviderProps {
  readonly children: React.ReactNode;
}

export interface DrawerStackItem {
  readonly isTopmost: boolean;
  readonly stackIndex: number;
}

const DrawerStackContext = React.createContext<DrawerStackContextValue | undefined>(undefined);
DrawerStackContext.displayName = "DrawerStackContext";

export const useHasDrawerStackProvider = (): boolean => React.useContext(DrawerStackContext) !== undefined;

export const DrawerStackProvider: React.FC<DrawerStackProviderProps> = ({ children }) => {
  const [stack, setStack] = React.useState<readonly string[]>([]);

  const register = React.useCallback((id: string) => {
    setStack((currentStack) => [...currentStack.filter((item) => item !== id), id]);
    return () => setStack((currentStack) => currentStack.filter((item) => item !== id));
  }, []);

  const value = React.useMemo(() => ({ stack, register }), [stack, register]);
  return React.createElement(DrawerStackContext.Provider, { value }, children);
};

export const useDrawerStack = (open: boolean): DrawerStackItem => {
  const context = React.useContext(DrawerStackContext);
  const id = React.useId();

  if (!context) {
    throw new Error("`useDrawerStack` must be used within `DrawerStackProvider`");
  }

  React.useEffect(() => {
    if (open) return context.register(id);
    return undefined;
  }, [context.register, id, open]);

  const stackIndex = context.stack.indexOf(id);
  return { stackIndex, isTopmost: stackIndex === context.stack.length - 1 && stackIndex !== -1 };
};
