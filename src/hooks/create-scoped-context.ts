import * as React from "react";

export type DrawerScope = Record<string, React.Context<unknown>[]> | undefined;
type DrawerScopeHook = (scope?: DrawerScope) => Record<string, DrawerScope>;

type CreateDrawerScope = (() => DrawerScopeHook) & {
  scopeName: string;
};

type DrawerContextProvider<ContextValue extends object> = React.FC<
  ContextValue & {
    scope?: DrawerScope;
    children: React.ReactNode;
  }
>;

interface UseDrawerContext<ContextValue extends object> {
  (consumerName: string, scope?: DrawerScope): ContextValue;
  (consumerName: string, scope: DrawerScope, options: { optional: true }): ContextValue | undefined;
}

interface CreateDrawerContext {
  <ContextValue extends object>(
    name: string,
  ): readonly [DrawerContextProvider<ContextValue>, UseDrawerContext<ContextValue>];
  <ContextValue extends object>(
    name: string,
    defaultContext: ContextValue,
  ): readonly [DrawerContextProvider<ContextValue>, (consumerName: string, scope?: DrawerScope) => ContextValue];
}

const getScopedContext = <T>(
  scope: DrawerScope,
  scopeName: string,
  index: number,
): React.Context<T | undefined> | undefined => {
  return scope?.[scopeName]?.[index] as React.Context<T | undefined> | undefined;
};

export const createDrawerContextScope = (scopeName: string): readonly [CreateDrawerContext, CreateDrawerScope] => {
  let defaultContexts: (object | undefined)[] = [];

  const createDrawerContext: CreateDrawerContext = <ContextValue extends object>(
    name: string,
    defaultContext?: ContextValue,
  ) => {
    const BaseContext = React.createContext<ContextValue | undefined>(defaultContext);
    BaseContext.displayName = `${name}Context`;

    const index = defaultContexts.length;
    defaultContexts = [...defaultContexts, defaultContext];

    // biome-ignore lint/correctness/noComponentHookFactories: Each provider is bound to its own scoped context.
    const Provider: DrawerContextProvider<ContextValue> = (props) => {
      const { scope, children, ...value } = props;
      const Context = getScopedContext(scope, scopeName, index) as React.Context<ContextValue | undefined> | undefined;
      // biome-ignore lint/correctness/useExhaustiveDependencies: dynamic context value object
      const contextValue = React.useMemo(() => value as ContextValue, [...Object.values(value)]);

      return React.createElement(Context ?? BaseContext, { value: contextValue }, children);
    };

    Provider.displayName = `${name}Provider`;

    // biome-ignore lint/correctness/noComponentHookFactories: Each hook closes over its context and scope index.
    const useDrawerContext = ((
      consumerName: string,
      scope?: DrawerScope,
      options: { optional?: boolean } = {},
    ): ContextValue | undefined => {
      const Context = scope?.[scopeName]?.[index] as React.Context<ContextValue | undefined> | undefined;
      const context = React.useContext(Context ?? BaseContext);

      if (context !== undefined) return context;
      if (defaultContext !== undefined) return defaultContext;
      if (options.optional) return undefined;

      throw new Error(`\`${consumerName}\` must be used within \`${name}\``);
    }) as UseDrawerContext<ContextValue>;

    return [Provider, useDrawerContext] as const;
  };

  const createScope: CreateDrawerScope = () => {
    const scopeContexts = defaultContexts.map((defaultContext) =>
      React.createContext(defaultContext),
    ) as React.Context<unknown>[];

    return (scope) => {
      const contexts = scope?.[scopeName] ?? scopeContexts;

      return React.useMemo(() => {
        return { [`__scope${scopeName}`]: { ...scope, [scopeName]: contexts } };
      }, [scope, contexts]);
    };
  };

  createScope.scopeName = scopeName;
  return [createDrawerContext, createScope] as const;
};
