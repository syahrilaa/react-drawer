import * as React from "react";
import { useCallbackRef } from "./use-callback-ref";

interface UsePointerDragOptions<Element extends HTMLElement> {
  disabled?: boolean;
  onDragStart?: (event: React.PointerEvent<Element>) => void;
  onDrag?: (event: React.PointerEvent<Element>) => void;
  onDragEnd?: (event: React.PointerEvent<Element>, cancelled: boolean) => void;
}

export const usePointerDrag = <Element extends HTMLElement = HTMLElement>({
  disabled = false,
  onDragStart,
  onDrag,
  onDragEnd,
}: UsePointerDragOptions<Element>) => {
  const activePointerIdRef = React.useRef<number | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const onDragStartRef = useCallbackRef(onDragStart);
  const onDragRef = useCallbackRef(onDrag);
  const onDragEndRef = useCallbackRef(onDragEnd);

  const onPointerDown: React.PointerEventHandler<Element> = (event) => {
    if (disabled || event.button !== 0 || activePointerIdRef.current !== null) return;
    event.preventDefault();
    activePointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    onDragStartRef(event);
  };

  const onPointerMove: React.PointerEventHandler<Element> = (event) => {
    if (activePointerIdRef.current !== event.pointerId) return;
    onDragRef(event);
  };

  const finishDrag = (event: React.PointerEvent<Element>, cancelled: boolean) => {
    if (activePointerIdRef.current !== event.pointerId) return;
    activePointerIdRef.current = null;
    setIsDragging(false);
    onDragEndRef(event, cancelled);
  };

  const onPointerUp: React.PointerEventHandler<Element> = (event) => finishDrag(event, false);
  const onPointerCancel: React.PointerEventHandler<Element> = (event) => finishDrag(event, true);

  React.useEffect(() => {
    if (!disabled) return;
    activePointerIdRef.current = null;
    setIsDragging(false);
  }, [disabled]);

  return {
    isDragging,
    dragProps: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
  };
};
