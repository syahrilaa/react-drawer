import * as React from "react";
import { useCallbackRef } from "./use-callback-ref";

type SetState<Value> = React.Dispatch<React.SetStateAction<Value>>;

interface ControllableStateOptions<Value> {
  value?: Value;
  defaultValue: Value;
  onChange?: (value: Value) => void;
}

export const useControllableState = <Value>({
  value: controlledValue,
  defaultValue,
  onChange,
}: ControllableStateOptions<Value>): readonly [Value, SetState<Value>] => {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;
  const onChangeRef = useCallbackRef(onChange);
  const previousUncontrolledValue = React.useRef(uncontrolledValue);

  React.useEffect(() => {
    if (!isControlled && !Object.is(previousUncontrolledValue.current, uncontrolledValue)) {
      onChangeRef(uncontrolledValue);
    }

    previousUncontrolledValue.current = uncontrolledValue;
  }, [isControlled, onChangeRef, uncontrolledValue]);

  const setValue = React.useCallback<SetState<Value>>(
    (nextValue) => {
      if (isControlled) {
        const resolvedValue =
          typeof nextValue === "function" ? (nextValue as (previousValue: Value) => Value)(value) : nextValue;
        if (!Object.is(value, resolvedValue)) onChangeRef(resolvedValue);
        return;
      }

      setUncontrolledValue(nextValue);
    },
    [isControlled, onChangeRef, value],
  );

  return [value, setValue] as const;
};
