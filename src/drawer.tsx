import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { COMPONENT_NAME } from "./constants";
import { createDrawerContextScope, type DrawerScope } from "./hooks/create-scoped-context";
import { useCallbackRef } from "./hooks/use-callback-ref";
import { useComposedRefs } from "./hooks/use-composed-refs";
import { useControllableState } from "./hooks/use-controllable-state";
import { type DrawerDragHandleProps, type DrawerSnapPoint, useDrawerDrag } from "./hooks/use-drawer-drag";
import { DrawerStackProvider, useDrawerStack, useHasDrawerStackProvider } from "./hooks/use-drawer-stack";
import { useEscapeKeydown } from "./hooks/use-escape-keydown";
import { usePresence } from "./hooks/use-motion";
import { getFocusableElements, useIsomorphicLayoutEffect } from "./utils";

type ScopedProps<Props> = Props & { __scopeDrawer?: DrawerScope };
export type DrawerSide = "right" | "left" | "bottom";

const [createDrawerContext, createDrawerScope] = createDrawerContextScope(COMPONENT_NAME.ROOT);
const useDrawerScope = createDrawerScope();

interface DrawerContextValue {
  open: boolean;
  modal: boolean;
  side: DrawerSide;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  overlayRef: React.RefObject<HTMLDivElement | null>;
  titleId: string;
  descriptionId: string;
  contentId: string;
  isTopmost: boolean;
  stackIndex: number;
  present: boolean;
  activeSnapPoint: DrawerSnapPoint;
  snapPoints: DrawerSnapPoint[];
  snapStyle?: React.CSSProperties;
  dragHandleProps: DrawerDragHandleProps;
  isDragging: boolean;
}

const [DrawerProvider, useDrawerContext] = createDrawerContext<DrawerContextValue>(COMPONENT_NAME.ROOT);

export interface DrawerRootProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  side?: DrawerSide;
  snapPoints?: DrawerSnapPoint[];
  activeSnapPoint?: DrawerSnapPoint;
  defaultActiveSnapPoint?: DrawerSnapPoint;
  onActiveSnapPointChange?: (snapPoint: DrawerSnapPoint) => void;
}

export const DrawerRootImplementation: React.FC<DrawerRootProps> = ({
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  modal = true,
  side = "right",
  snapPoints: snapPointsProp,
  activeSnapPoint: activeSnapPointProp,
  defaultActiveSnapPoint,
  onActiveSnapPointChange,
  __scopeDrawer,
}: ScopedProps<DrawerRootProps>) => {
  const { __scopeDrawer: scope } = useDrawerScope(__scopeDrawer);
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const drag = useDrawerDrag({
    open,
    side,
    snapPoints: snapPointsProp,
    activeSnapPoint: activeSnapPointProp,
    defaultActiveSnapPoint,
    onActiveSnapPointChange,
    onOpenChange: setOpen,
  });
  const { isTopmost, stackIndex } = useDrawerStack(open);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const present = usePresence(open, contentRef, overlayRef);
  const titleId = React.useId();
  const descriptionId = React.useId();
  const contentId = React.useId();

  return (
    <DrawerProvider
      scope={scope}
      open={open}
      modal={modal}
      side={side}
      setOpen={setOpen}
      triggerRef={triggerRef}
      contentRef={contentRef}
      overlayRef={overlayRef}
      titleId={titleId}
      descriptionId={descriptionId}
      contentId={contentId}
      isTopmost={isTopmost}
      stackIndex={stackIndex}
      present={present}
      activeSnapPoint={drag.activeSnapPoint}
      snapPoints={drag.snapPoints}
      snapStyle={drag.snapStyle}
      dragHandleProps={drag.dragHandleProps}
      isDragging={drag.isDragging}
    >
      {children}
    </DrawerProvider>
  );
};

export const DrawerRoot: React.FC<DrawerRootProps> = (props: ScopedProps<DrawerRootProps>) => {
  const isHasDrawerStack = useHasDrawerStackProvider();
  if (isHasDrawerStack) return <DrawerRootImplementation {...props} />;

  return (
    <DrawerStackProvider>
      <DrawerRootImplementation {...props} />
    </DrawerStackProvider>
  );
};
DrawerRoot.displayName = COMPONENT_NAME.ROOT;

export interface DrawerTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: React.RefObject<HTMLButtonElement>;
  __scopeDrawer?: DrawerScope;
  asChild?: boolean;
}

export const DrawerTrigger: React.FC<DrawerTriggerProps> = ({ ref, __scopeDrawer, onClick, asChild, ...props }) => {
  const { __scopeDrawer: scope } = useDrawerScope(__scopeDrawer);
  const context = useDrawerContext(COMPONENT_NAME.TRIGGER, scope);
  const forwardedRef = useComposedRefs(ref, context.triggerRef);
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      {...props}
      ref={forwardedRef}
      type={props.type ?? "button"}
      aria-haspopup="dialog"
      aria-expanded={context.open}
      aria-controls={context.contentId}
      data-state={context.open ? "open" : "closed"}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        if (onClick) onClick(event);
        if (!event.defaultPrevented) context.setOpen(true);
      }}
    />
  );
};
DrawerTrigger.displayName = COMPONENT_NAME.TRIGGER;

export interface DrawerPortalProps {
  children: React.ReactNode;
  container?: Element | DocumentFragment | null;
  forceMount?: boolean;
  __scopeDrawer?: DrawerScope;
}

export const DrawerPortal: React.FC<DrawerPortalProps> = ({
  children,
  container,
  forceMount = false,
  __scopeDrawer,
}) => {
  const { __scopeDrawer: scope } = useDrawerScope(__scopeDrawer);
  const { present } = useDrawerContext(COMPONENT_NAME.PORTAL, scope);
  const [portalContainer, setPortalContainer] = React.useState<Element | DocumentFragment | null>(null);

  React.useEffect(() => {
    setPortalContainer(container ?? document.body);
  }, [container]);

  if ((!present && !forceMount) || !portalContainer) return null;
  return ReactDOM.createPortal(children, portalContainer);
};
DrawerPortal.displayName = COMPONENT_NAME.PORTAL;

export interface DrawerOverlayProps extends React.HTMLAttributes<HTMLSpanElement> {
  ref?: React.ForwardedRef<HTMLSpanElement>;
  __scopeDrawer?: DrawerScope;
  forceMount?: boolean;
}

export const DrawerOverlay: React.FC<DrawerOverlayProps> = ({
  ref,
  __scopeDrawer,
  forceMount = false,
  onClick,
  style,
  ...props
}) => {
  const { __scopeDrawer: scope } = useDrawerScope(__scopeDrawer);
  const context = useDrawerContext(COMPONENT_NAME.OVERLAY, scope);
  const overlayRef = useComposedRefs(ref, context.overlayRef);
  const { isTopmost, stackIndex } = context;

  if ((!context.present && !forceMount) || !context.modal) return null;

  const computedZIndex = style?.zIndex ?? 40 + Math.max(0, stackIndex) * 20;

  return (
    <span
      {...props}
      ref={overlayRef}
      aria-hidden="true"
      data-state={context.open ? "open" : "closed"}
      data-side={context.side}
      data-stack={stackIndex}
      data-topmost={isTopmost ? "true" : "false"}
      style={{
        zIndex: computedZIndex,
        ...style,
        pointerEvents: context.open && isTopmost ? (style?.pointerEvents ?? "auto") : "none",
      }}
      onClick={(event: React.MouseEvent<HTMLSpanElement>) => {
        if (onClick) onClick(event);
        if (context.open && !event.defaultPrevented && event.target === event.currentTarget && isTopmost) {
          context.setOpen(false);
        }
      }}
    />
  );
};
DrawerOverlay.displayName = COMPONENT_NAME.OVERLAY;

export interface DrawerContentProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.RefObject<HTMLDivElement>;
  __scopeDrawer?: DrawerScope;
  forceMount?: boolean;
  asChild?: boolean;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onInteractOutside?: (event: PointerEvent) => void;
}

export const DrawerContent: React.FC<DrawerContentProps> = ({
  ref,
  __scopeDrawer,
  forceMount = false,
  asChild = false,
  onEscapeKeyDown: onEscapeKeyDownProp,
  onInteractOutside,
  onKeyDown,
  style,
  ...props
}) => {
  const { __scopeDrawer: scope } = useDrawerScope(__scopeDrawer);
  const context = useDrawerContext(COMPONENT_NAME.CONTENT, scope);
  const { isTopmost, stackIndex, isDragging, snapStyle } = context;
  const contentRef = useComposedRefs(ref, context.contentRef);
  const Comp = asChild ? Slot : "div";
  const onInteractOutsideRef = useCallbackRef(onInteractOutside);
  const onEscapeKeyDownRef = useCallbackRef(onEscapeKeyDownProp);
  const previouslyFocusedElementRef = React.useRef<HTMLElement | null>(null);
  const hadTopmostFocusRef = React.useRef(false);

  useEscapeKeydown((event) => {
    if (!context.open || !isTopmost) return;
    if (onEscapeKeyDownRef) onEscapeKeyDownRef(event);
    if (event.defaultPrevented) return;
    event.preventDefault();
    context.setOpen(false);
  }, context.open && isTopmost);

  useIsomorphicLayoutEffect(() => {
    if (context.open && isTopmost) {
      if (!hadTopmostFocusRef.current) {
        previouslyFocusedElementRef.current =
          document.activeElement instanceof HTMLElement ? document.activeElement : null;
        hadTopmostFocusRef.current = true;
      }

      const content = context.contentRef.current;
      const focusable = getFocusableElements(content);
      (focusable[0] ?? content)?.focus({ preventScroll: true });
    } else if (!context.open && hadTopmostFocusRef.current) {
      if (previouslyFocusedElementRef.current?.isConnected) {
        previouslyFocusedElementRef.current.focus({ preventScroll: true });
      }
      previouslyFocusedElementRef.current = null;
      hadTopmostFocusRef.current = false;
    }
  }, [context.open, context.contentRef, isTopmost]);

  React.useEffect(() => {
    if (!context.open || !isTopmost) return;

    const handlePointerDown = (event: PointerEvent) => {
      const content = context.contentRef.current;
      const target = event.target;
      if (!content || !(target instanceof Node) || content.contains(target)) return;

      onInteractOutsideRef?.(event);
      if (!event.defaultPrevented) context.setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [context.open, context.contentRef, context.setOpen, isTopmost, onInteractOutsideRef]);

  if (!context.present && !forceMount) return null;

  const computedZIndex = style?.zIndex ?? 50 + Math.max(0, stackIndex) * 20;
  const hasSnap = context.snapPoints.length > 0;
  const snapTransition = hasSnap
    ? isDragging
      ? "none"
      : "transform 300ms cubic-bezier(0.2, 0.8, 0.2, 1), height 300ms cubic-bezier(0.2, 0.8, 0.2, 1)"
    : style?.transition;

  const mergedStyle: React.CSSProperties = {
    zIndex: computedZIndex,
    ...style,
    ...snapStyle,
    transition: snapTransition,
    pointerEvents: context.open && isTopmost ? (style?.pointerEvents ?? "auto") : "none",
  };

  return (
    <Comp
      {...props}
      id={props.id ?? context.contentId}
      ref={contentRef}
      role="dialog"
      aria-modal={context.modal && isTopmost ? true : undefined}
      aria-hidden={!context.open || !isTopmost || undefined}
      inert={!context.open || !isTopmost || undefined}
      aria-labelledby={context.titleId}
      aria-describedby={context.descriptionId}
      tabIndex={-1}
      data-state={context.open ? "open" : "closed"}
      data-side={context.side}
      data-stack-index={stackIndex}
      data-topmost={isTopmost ? "true" : "false"}
      data-snap-point={context.activeSnapPoint}
      data-dragging={isDragging ? "true" : "false"}
      style={mergedStyle}
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
        if (onKeyDown) onKeyDown(event);
        if (event.defaultPrevented || event.key !== "Tab" || !context.modal || !isTopmost) return;

        const focusable = getFocusableElements(event.currentTarget);
        if (focusable.length === 0) {
          event.preventDefault();
          event.currentTarget.focus();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const activeElement = document.activeElement;
        const focusIsOutside = !event.currentTarget.contains(activeElement);

        if ((event.shiftKey && (activeElement === first || focusIsOutside)) || activeElement === event.currentTarget) {
          event.preventDefault();
          (event.shiftKey ? last : first)?.focus();
        } else if (!event.shiftKey && (activeElement === last || focusIsOutside)) {
          event.preventDefault();
          first?.focus();
        }
      }}
    />
  );
};
DrawerContent.displayName = COMPONENT_NAME.CONTENT;

export interface DrawerHandleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: React.RefObject<HTMLButtonElement>;
  __scopeDrawer?: DrawerScope;
}

export const DrawerHandle: React.FC<DrawerHandleProps> = ({
  ref,
  __scopeDrawer,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onKeyDown,
  style,
  ...props
}) => {
  const { __scopeDrawer: scope } = useDrawerScope(__scopeDrawer);
  const context = useDrawerContext(COMPONENT_NAME.HANDLE, scope);

  return (
    <button
      {...props}
      ref={ref}
      type={props.type ?? "button"}
      role="slider"
      aria-label={props["aria-label"] ?? "Resize drawer"}
      aria-disabled={context.snapPoints.length === 0 || undefined}
      aria-orientation={context.side === "bottom" ? "vertical" : "horizontal"}
      aria-valuemin={context.snapPoints.length > 0 ? context.snapPoints[0] : undefined}
      aria-valuemax={context.snapPoints.length > 0 ? context.snapPoints[context.snapPoints.length - 1] : undefined}
      aria-valuenow={context.snapPoints.length > 0 ? context.activeSnapPoint : undefined}
      data-state={context.open ? "open" : "closed"}
      data-side={context.side}
      data-snap-point={context.activeSnapPoint}
      style={{
        touchAction: "none",
        userSelect: "none",
        ...style,
      }}
      {...context.dragHandleProps}
      onPointerDown={(event: React.PointerEvent<HTMLButtonElement>) => {
        if (onPointerDown) onPointerDown(event);
        if (!event.defaultPrevented) context.dragHandleProps.onPointerDown(event);
      }}
      onPointerMove={(event: React.PointerEvent<HTMLButtonElement>) => {
        if (onPointerMove) onPointerMove(event);
        if (!event.defaultPrevented) context.dragHandleProps.onPointerMove(event);
      }}
      onPointerUp={(event: React.PointerEvent<HTMLButtonElement>) => {
        if (onPointerUp) onPointerUp(event);
        if (!event.defaultPrevented) context.dragHandleProps.onPointerUp(event);
      }}
      onPointerCancel={(event: React.PointerEvent<HTMLButtonElement>) => {
        if (onPointerCancel) onPointerCancel(event);
        if (!event.defaultPrevented) context.dragHandleProps.onPointerCancel(event);
      }}
      onKeyDown={(event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (onKeyDown) onKeyDown(event);
        if (!event.defaultPrevented) context.dragHandleProps.onKeyDown(event);
      }}
    />
  );
};
DrawerHandle.displayName = COMPONENT_NAME.HANDLE;

export interface DrawerCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: React.RefObject<HTMLButtonElement>;
  __scopeDrawer?: DrawerScope;
  asChild?: boolean;
}

export const DrawerClose: React.FC<DrawerCloseProps> = ({ ref, __scopeDrawer, onClick, asChild, ...props }) => {
  const { __scopeDrawer: scope } = useDrawerScope(__scopeDrawer);
  const context = useDrawerContext(COMPONENT_NAME.CLOSE, scope);
  const forwardedRef = useComposedRefs(ref, context.triggerRef);
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      {...props}
      ref={forwardedRef}
      type={props.type ?? "button"}
      data-state={context.open ? "open" : "closed"}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        if (onClick) onClick(event);
        if (!event.defaultPrevented) context.setOpen(false);
      }}
    />
  );
};
DrawerClose.displayName = COMPONENT_NAME.CLOSE;

export interface DrawerTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  ref?: React.RefObject<HTMLHeadingElement>;
  __scopeDrawer?: DrawerScope;
  asChild?: boolean;
}

export const DrawerTitle: React.FC<DrawerTitleProps> = ({ ref, __scopeDrawer, asChild = false, ...props }) => {
  const { __scopeDrawer: scope } = useDrawerScope(__scopeDrawer);
  const { titleId } = useDrawerContext(COMPONENT_NAME.TITLE, scope);
  const Comp = asChild ? Slot : "h1";
  return <Comp {...props} id={props.id ?? titleId} />;
};
DrawerTitle.displayName = COMPONENT_NAME.TITLE;

export interface DrawerDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  ref?: React.RefObject<HTMLHeadingElement>;
  __scopeDrawer?: DrawerScope;
}

export const DrawerDescription: React.FC<DrawerDescriptionProps> = ({ ref, __scopeDrawer, ...props }) => {
  const { __scopeDrawer: scope } = useDrawerScope(__scopeDrawer);
  const { descriptionId } = useDrawerContext(COMPONENT_NAME.DESCRIPTION, scope);
  return <p {...props} id={props.id ?? descriptionId} />;
};
DrawerDescription.displayName = COMPONENT_NAME.DESCRIPTION;

export const Drawer = Object.assign(DrawerRoot, {
  Root: DrawerRoot,
  Trigger: DrawerTrigger,
  Portal: DrawerPortal,
  Overlay: DrawerOverlay,
  Content: DrawerContent,
  Close: DrawerClose,
  Title: DrawerTitle,
  Description: DrawerDescription,
  Handle: DrawerHandle,
});

export type { DrawerDragHandleProps, DrawerSnapPoint } from "./hooks/use-drawer-drag";
export { DrawerStackProvider } from "./hooks/use-drawer-stack";
