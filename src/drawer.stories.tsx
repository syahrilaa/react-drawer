import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Drawer, type DrawerSide, type DrawerSnapPoint, useDrawer, useDrawerSnap } from "./drawer";

interface PlaygroundProps {
  side: DrawerSide;
  snapPoint: DrawerSnapPoint;
}

const SNAP_POINTS: DrawerSnapPoint[] = [0.4, 0.9];

const slideAnimation: Record<DrawerSide, string> = {
  bottom: "data-[state=open]:animate-slide-in-from-bottom-full data-[state=closed]:animate-slide-out-to-bottom-full",
  left: "data-[state=open]:animate-slide-in-from-left-full data-[state=closed]:animate-slide-out-to-left-full",
  right: "data-[state=open]:animate-slide-in-from-right-full data-[state=closed]:animate-slide-out-to-right-full",
};

const meta = {
  title: "Components/Drawer",
  parameters: {
    layout: "centered",
  },
  argTypes: {
    side: {
      control: "inline-radio",
      options: ["bottom", "left", "right"],
    },
    snapPoint: {
      control: "inline-radio",
      options: SNAP_POINTS,
      if: { arg: "side", eq: "bottom" },
    },
  },
} satisfies Meta<PlaygroundProps>;

export default meta;
type Story = StoryObj<PlaygroundProps>;

const DrawerConsumerState: React.FC = () => {
  const drawer = useDrawer();
  const snap = useDrawerSnap();

  return (
    <div {...drawer.dataAttributes} className="rounded-xl bg-slate-50 p-4 text-sm">
      <p className="font-medium">
        {drawer.side} drawer · {drawer.open ? "open" : "closed"} · {drawer.isTopmost ? "topmost" : "stacked"}
      </p>
      <p className="mt-1 text-slate-500">
        Snap point: {snap.activeSnapPoint} · {snap.isDragging ? "dragging" : "idle"}
      </p>
      {snap.snapPoints.length > 0 && (
        <div className="mt-3 flex gap-2">
          {snap.snapPoints.map((snapPoint) => (
            <button
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs hover:bg-slate-100"
              key={snapPoint}
              onClick={() => snap.setActiveSnapPoint(snapPoint)}
              type="button"
            >
              {Math.round(snapPoint * 100)}%
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const DrawerExample: React.FC<PlaygroundProps> = ({ side, snapPoint }) => {
  const [activeSnapPoint, setActiveSnapPoint] = React.useState(snapPoint);
  const isBottomSheet = side === "bottom";

  React.useEffect(() => {
    setActiveSnapPoint(snapPoint);
  }, [snapPoint]);

  return (
    <Drawer.Root
      side={side}
      snapPoints={isBottomSheet ? SNAP_POINTS : []}
      activeSnapPoint={isBottomSheet ? activeSnapPoint : undefined}
      onActiveSnapPointChange={setActiveSnapPoint}
    >
      <Drawer.Trigger className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950">
        Open {isBottomSheet ? "bottom sheet" : `${side} drawer`}
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-slate-950/40 opacity-0 transition-opacity duration-(--duration-normal) ease-expressive data-[state=open]:opacity-100 data-[state=closed]:delay-100" />
        <Drawer.Content
          className={`fixed flex flex-col overflow-y-auto bg-white text-slate-950 shadow-2xl outline-none ${slideAnimation[side]} ${
            isBottomSheet
              ? "inset-x-0 bottom-0 w-full rounded-t-3xl"
              : `inset-y-0 h-dvh w-full max-w-sm ${side === "left" ? "left-0 rounded-r-3xl" : "right-0 rounded-l-3xl"}`
          }`}
        >
          {isBottomSheet && (
            <Drawer.Handle
              aria-label="Resize bottom sheet"
              className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-slate-300"
            />
          )}
          <div className="flex items-start justify-between gap-4 px-6 pb-5 pt-6">
            <div>
              <Drawer.Title className="text-lg font-semibold tracking-tight">Share your workspace</Drawer.Title>
              <Drawer.Description className="mt-1 text-sm leading-6 text-slate-500">
                Invite teammates to collaborate on your next project.
              </Drawer.Description>
            </div>
            <Drawer.Close className="inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-slate-200 px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950">
              Close
            </Drawer.Close>
          </div>

          <div className="space-y-5 px-6 pb-6">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Email address</span>
              <input
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                placeholder="teammate@example.com"
                type="email"
              />
            </label>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Permission</p>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Can edit</p>
                  <p className="mt-0.5 text-xs text-slate-500">Invitee can make changes</p>
                </div>
                <span aria-hidden="true" className="text-slate-400">
                  ▾
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-medium">Workspace link</p>
              <p className="mt-1 truncate text-sm text-slate-500">workspace.example.com/design-system</p>
            </div>
            <DrawerConsumerState />
          </div>

          <div className="mt-auto flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
            <Drawer.Close className="h-10 rounded-full px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100">
              Cancel
            </Drawer.Close>
            <Drawer.Close className="h-10 rounded-full bg-slate-950 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-700">
              Send invite
            </Drawer.Close>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export const Playground: Story = {
  args: {
    side: "bottom",
    snapPoint: 0.4,
  },
  render: (args) => <DrawerExample {...args} />,
};

export const NestedDrawer: Story = {
  render: () => (
    <Drawer.Root side="right">
      <Drawer.Trigger className="h-11 rounded-full bg-slate-950 px-5 text-sm font-medium text-white hover:bg-slate-700">
        Open account settings
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-slate-950/40 opacity-0 transition-opacity duration-(--duration-normal) ease-expressive data-[state=open]:opacity-100" />
        <Drawer.Content
          className={`fixed inset-y-0 right-0 flex h-dvh w-[min(90vw,24rem)] flex-col overflow-y-auto rounded-l-3xl bg-white text-slate-950 shadow-2xl outline-none ${slideAnimation.right}`}
        >
          <div className="border-b border-slate-100 p-6">
            <Drawer.Title className="text-lg font-semibold">Account settings</Drawer.Title>
            <Drawer.Description className="mt-1 text-sm text-slate-500">
              Manage your profile and preferences.
            </Drawer.Description>
          </div>
          <div className="space-y-4 p-6">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-medium">Profile</p>
              <p className="mt-1 text-sm text-slate-500">Alex Morgan · alex@example.com</p>
            </div>
            <Drawer.Root side="bottom" snapPoints={[0.55, 0.85]} defaultActiveSnapPoint={0.55}>
              <Drawer.Trigger className="h-11 w-full rounded-xl border border-slate-200 px-4 text-left text-sm font-medium hover:bg-slate-50">
                Change region
              </Drawer.Trigger>
              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-slate-950/40 opacity-0 transition-opacity duration-(--duration-normal) ease-expressive data-[state=open]:opacity-100" />
                <Drawer.Content
                  className={`fixed inset-x-0 bottom-0 flex w-full flex-col overflow-y-auto rounded-t-3xl bg-white text-slate-950 shadow-2xl outline-none ${slideAnimation.bottom}`}
                >
                  <Drawer.Handle
                    aria-label="Resize region picker"
                    className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-slate-300"
                  />
                  <div className="p-6">
                    <Drawer.Title className="text-lg font-semibold">Choose your region</Drawer.Title>
                    <Drawer.Description className="mt-1 text-sm text-slate-500">
                      This nested bottom sheet is stacked above account settings.
                    </Drawer.Description>
                    <div className="mt-5 space-y-2">
                      {["United States", "United Kingdom", "Indonesia"].map((region) => (
                        <Drawer.Close
                          className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-left text-sm hover:bg-slate-50"
                          key={region}
                        >
                          {region}
                        </Drawer.Close>
                      ))}
                    </div>
                  </div>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>
          </div>
          <div className="mt-auto border-t border-slate-100 p-6">
            <Drawer.Close className="h-10 rounded-full border border-slate-200 px-4 text-sm font-medium hover:bg-slate-50">
              Close settings
            </Drawer.Close>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  ),
};

const NestedBottomSheetExample: React.FC = () => {
  const [parentSnapPoint, setParentSnapPoint] = React.useState<DrawerSnapPoint>(0.65);
  const [childSnapPoint, setChildSnapPoint] = React.useState<DrawerSnapPoint>(0.8);
  const [childOpen, setChildOpen] = React.useState(false);

  const handleChildOpenChange = React.useCallback(
    (open: boolean) => {
      setChildOpen(open);
      if (open) {
        if (childSnapPoint === 0.8) {
          setParentSnapPoint(0.9);
        } else if (childSnapPoint === 0.45) {
          setParentSnapPoint(0.65);
        }
      } else {
        setParentSnapPoint(0.65);
      }
    },
    [childSnapPoint],
  );
  const handleChildSnapPointChange = React.useCallback(
    (snapPoint: DrawerSnapPoint) => {
      setChildSnapPoint(snapPoint);
      if (childOpen) setParentSnapPoint(snapPoint === 0.8 ? 0.9 : 0.65);
    },
    [childOpen],
  );

  return (
    <Drawer.Root
      side="bottom"
      snapPoints={[0.65, 0.9]}
      activeSnapPoint={parentSnapPoint}
      onActiveSnapPointChange={setParentSnapPoint}
    >
      <Drawer.Trigger className="h-11 rounded-full bg-slate-950 px-5 text-sm font-medium text-white hover:bg-slate-700">
        Open filters
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-slate-950/40 opacity-0 transition-opacity duration-(--duration-normal) ease-expressive data-[state=open]:opacity-100" />
        <Drawer.Content
          className={`fixed inset-x-0 bottom-0 flex w-full flex-col overflow-y-auto rounded-t-3xl bg-white text-slate-950 shadow-2xl outline-none data-[topmost=false]:shadow-xl ${slideAnimation.bottom}`}
        >
          <Drawer.Handle
            aria-label="Resize filters sheet"
            className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-slate-300"
          />
          <div className="p-6">
            <Drawer.Title className="text-lg font-semibold">Search filters</Drawer.Title>
            <Drawer.Description className="mt-1 text-sm text-slate-500">
              Open a second sheet to refine the date range.
            </Drawer.Description>
            <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-200 p-4">
              <span className="text-sm font-medium">Date range</span>
              <Drawer.Root
                side="bottom"
                open={childOpen}
                onOpenChange={handleChildOpenChange}
                activeSnapPoint={childSnapPoint}
                onActiveSnapPointChange={handleChildSnapPointChange}
                snapPoints={[0.45, 0.8]}
                defaultActiveSnapPoint={0.8}
              >
                <Drawer.Trigger className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium hover:bg-slate-200">
                  Last 30 days
                </Drawer.Trigger>
                <Drawer.Portal>
                  <Drawer.Overlay className="fixed inset-0 bg-slate-950/40 opacity-0 transition-opacity duration-(--duration-normal) ease-expressive data-[state=open]:opacity-100" />
                  <Drawer.Content
                    className={`fixed inset-x-0 bottom-0 flex w-full flex-col overflow-y-auto rounded-t-3xl bg-white text-slate-950 shadow-2xl outline-none ${slideAnimation.bottom}`}
                  >
                    <Drawer.Handle
                      aria-label="Resize date range sheet"
                      className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-slate-300"
                    />
                    <div className="p-6">
                      <Drawer.Title className="text-lg font-semibold">Choose a date range</Drawer.Title>
                      <Drawer.Description className="mt-1 text-sm text-slate-500">
                        Pick a preset to update the search.
                      </Drawer.Description>
                      <div className="mt-5 space-y-2">
                        {["Last 7 days", "Last 30 days", "Last 90 days"].map((range) => (
                          <Drawer.Close
                            className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-left text-sm hover:bg-slate-50"
                            key={range}
                          >
                            {range}
                          </Drawer.Close>
                        ))}
                      </div>
                    </div>
                  </Drawer.Content>
                </Drawer.Portal>
              </Drawer.Root>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export const NestedBottomSheets: Story = {
  render: () => <NestedBottomSheetExample />,
};

export const StackedCards: Story = {
  render: () => (
    <Drawer.Root side="right">
      <Drawer.Trigger className="h-11 rounded-full bg-slate-950 px-5 text-sm font-medium text-white hover:bg-slate-700">
        Open project details
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-slate-950/40 opacity-0 transition-opacity duration-(--duration-normal) ease-expressive data-[state=open]:opacity-100" />
        <Drawer.Content
          className={`fixed inset-y-0 right-0 flex h-dvh w-[min(90vw,26rem)] flex-col overflow-y-auto rounded-l-3xl bg-white text-slate-950 shadow-2xl outline-none data-[stack-index=0]:data-[topmost=false]:-translate-x-8 translate-x-0 data-[stack-index=0]:data-[topmost=false]:scale-95 scale-100 transition-all duration-(--duration-normal) ease-expressive ${slideAnimation.right}`}
        >
          <div className="border-b border-slate-100 p-6">
            <Drawer.Title className="text-lg font-semibold">Project details</Drawer.Title>
            <Drawer.Description className="mt-1 text-sm text-slate-500">
              Design system refresh · Updated just now
            </Drawer.Description>
          </div>
          <div className="space-y-4 p-6">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-medium">Current status</p>
              <p className="mt-1 text-sm text-slate-500">In progress · 8 tasks remaining</p>
            </div>
            <Drawer.Root side="right">
              <Drawer.Trigger className="h-11 w-full rounded-xl bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-700">
                View task details
              </Drawer.Trigger>
              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-slate-950/40 opacity-0 transition-opacity duration-(--duration-normal) ease-expressive data-[state=open]:opacity-100" />
                <Drawer.Content
                  className={`fixed inset-y-0 right-0 flex h-dvh w-[min(90vw,26rem)] flex-col overflow-y-auto rounded-l-3xl bg-white text-slate-950 shadow-2xl outline-none ${slideAnimation.right}`}
                >
                  <div className="border-b border-slate-100 p-6">
                    <Drawer.Title className="text-lg font-semibold">Review empty states</Drawer.Title>
                    <Drawer.Description className="mt-1 text-sm text-slate-500">
                      Task 4 of 12 · Assigned to Alex
                    </Drawer.Description>
                  </div>
                  <div className="p-6">
                    <p className="text-sm leading-6 text-slate-600">
                      Check the empty states on mobile and desktop, then share the screenshots with the team.
                    </p>
                  </div>
                  <div className="mt-auto border-t border-slate-100 p-6">
                    <Drawer.Close className="h-10 rounded-full bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-700">
                      Back to project
                    </Drawer.Close>
                  </div>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>
          </div>
          <div className="mt-auto border-t border-slate-100 p-6">
            <Drawer.Close className="h-10 rounded-full border border-slate-200 px-4 text-sm font-medium hover:bg-slate-50">
              Close details
            </Drawer.Close>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  ),
};
