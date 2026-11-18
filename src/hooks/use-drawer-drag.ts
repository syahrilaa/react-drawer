import * as React from "react";
import { useControllableState } from "./use-controllable-state";
import { usePointerDrag } from "./use-pointer-drag";

export type DrawerSnapPoint = number;

export interface DrawerDragHandleProps {
  onPointerDown: React.PointerEventHandler<HTMLButtonElement>;
  onPointerMove: React.PointerEventHandler<HTMLButtonElement>;
  onPointerUp: React.PointerEventHandler<HTMLButtonElement>;
  onPointerCancel: React.PointerEventHandler<HTMLButtonElement>;
  onKeyDown: React.KeyboardEventHandler<HTMLButtonElement>;
}

interface UseDrawerDragOptions {
  open: boolean;
  side: "right" | "left" | "bottom";
  snapPoints?: DrawerSnapPoint[];
  activeSnapPoint?: DrawerSnapPoint;
  defaultActiveSnapPoint?: DrawerSnapPoint;
  onActiveSnapPointChange?: (snapPoint: DrawerSnapPoint) => void;
  onOpenChange: (open: boolean) => void;
}

const normalizeSnapPoints = (snapPoints?: DrawerSnapPoint[]): DrawerSnapPoint[] => {
  if (!snapPoints) return [];
  return [...new Set(snapPoints.filter((point) => Number.isFinite(point) && point > 0 && point <= 1))].sort(
    (a, b) => a - b,
  );
};

export const useDrawerDrag = ({
  open,
  side,
  snapPoints: snapPointsProp,
  activeSnapPoint: activeSnapPointProp,
  defaultActiveSnapPoint,
  onActiveSnapPointChange,
  onOpenChange,
}: UseDrawerDragOptions) => {
  const snapPoints = React.useMemo(() => normalizeSnapPoints(snapPointsProp), [snapPointsProp]);
  const requestedInitialSnapPoint = defaultActiveSnapPoint ?? snapPoints[snapPoints.length - 1] ?? 1;
  const initialSnapPoint = snapPoints.length
    ? snapPoints.reduce(
        (closest, candidate) =>
          Math.abs(candidate - requestedInitialSnapPoint) < Math.abs(closest - requestedInitialSnapPoint)
            ? candidate
            : closest,
        snapPoints[0] ?? requestedInitialSnapPoint,
      )
    : requestedInitialSnapPoint;
  const [activeSnapPoint, setActiveSnapPoint] = useControllableState({
    value: activeSnapPointProp,
    defaultValue: initialSnapPoint,
    onChange: onActiveSnapPointChange,
  });
  const resolvedSnapPoint = snapPoints.includes(activeSnapPoint)
    ? activeSnapPoint
    : snapPoints.reduce(
        (closest, candidate) =>
          Math.abs(candidate - activeSnapPoint) < Math.abs(closest - activeSnapPoint) ? candidate : closest,
        snapPoints[0] ?? activeSnapPoint,
      );
  const [dragSnapPoint, setDragSnapPoint] = React.useState<number | null>(null);
  const dragStartRef = React.useRef<{ startCoordinate: number; startSnapPoint: number } | null>(null);
  const onOpenChangeRef = React.useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;

  const currentSnapPoint = dragSnapPoint ?? resolvedSnapPoint;
  const enabled = open && snapPoints.length > 0;
  const snapSize = side === "bottom" ? `${currentSnapPoint * 100}vh` : `${currentSnapPoint * 100}vw`;
  const style = enabled
    ? ({ "--drawer-snap-point": currentSnapPoint, "--drawer-snap-size": snapSize } as React.CSSProperties)
    : undefined;

  const getCoordinate = (event: React.PointerEvent<HTMLButtonElement>) =>
    side === "bottom" ? event.clientY : event.clientX;
  const getDirection = () => (side === "left" ? -1 : 1);
  const getViewportSize = () => (side === "bottom" ? window.innerHeight : window.innerWidth);

  const snapToNearestPoint = (point: number) => {
    const minimum = snapPoints[0];
    if (minimum !== undefined && point < minimum / 2) {
      onOpenChangeRef.current(false);
      return;
    }

    const nearest = snapPoints.reduce(
      (closest, candidate) => (Math.abs(candidate - point) < Math.abs(closest - point) ? candidate : closest),
      snapPoints[0] ?? 1,
    );
    setActiveSnapPoint(nearest);
  };

  const onDragStart = (event: React.PointerEvent<HTMLButtonElement>) => {
    dragStartRef.current = {
      startCoordinate: getCoordinate(event),
      startSnapPoint: resolvedSnapPoint,
    };
  };

  const onDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragStartRef.current;
    if (!drag) return;
    const delta = (getCoordinate(event) - drag.startCoordinate) * getDirection();
    const nextPoint = Math.max(0, Math.min(1, drag.startSnapPoint - delta / getViewportSize()));
    setDragSnapPoint(nextPoint);
  };

  const onDragEnd = (event: React.PointerEvent<HTMLButtonElement>, cancelled: boolean) => {
    const drag = dragStartRef.current;
    if (!drag) return;
    dragStartRef.current = null;
    if (cancelled) {
      setDragSnapPoint(null);
      return;
    }
    const delta = (getCoordinate(event) - drag.startCoordinate) * getDirection();
    const nextPoint = Math.max(0, Math.min(1, drag.startSnapPoint - delta / getViewportSize()));
    setDragSnapPoint(null);
    snapToNearestPoint(nextPoint);
  };

  const pointerDrag = usePointerDrag<HTMLButtonElement>({
    disabled: !enabled,
    onDragStart,
    onDrag,
    onDragEnd,
  });

  React.useEffect(() => {
    if (enabled) return;
    dragStartRef.current = null;
    setDragSnapPoint(null);
  }, [enabled]);

  const onKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (event) => {
    const increaseKey = side === "bottom" ? "ArrowUp" : "ArrowRight";
    const decreaseKey = side === "bottom" ? "ArrowDown" : "ArrowLeft";
    if (!enabled || (event.key !== increaseKey && event.key !== decreaseKey)) return;
    event.preventDefault();
    const currentIndex = snapPoints.indexOf(resolvedSnapPoint);
    const nextIndex = event.key === increaseKey ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0) onOpenChangeRef.current(false);
    else if (nextIndex < snapPoints.length) setActiveSnapPoint(snapPoints[nextIndex]);
  };

  return {
    activeSnapPoint: resolvedSnapPoint,
    dragHandleProps: {
      ...pointerDrag.dragProps,
      onKeyDown,
    } satisfies DrawerDragHandleProps,
    snapStyle: style,
    snapPoints,
    isDragging: pointerDrag.isDragging,
  };
};
