# @syahakato/react-drawer

A composable React drawer and bottom-sheet primitive with controlled state, snap points, nested stacking, keyboard support, and consumer hooks.

[Dokumentasi Bahasa Indonesia](./README.id.md) · [Storybook source](./src/docs/Drawer.en.mdx)

## Requirements

- React and React DOM `^19.0.0`
- A client-side React environment

The package provides behavior and accessible primitives, not a visual theme. Apply your own layout, colors, and open/close animations with `className` and `style`. The Tailwind theme and animation utilities in `.storybook/globals.css` are for the Storybook examples and are not shipped as consumer styles.

## Installation

```sh
npm install @syahakato/react-drawer
```

## Quick start

```tsx
import { Drawer } from "@syahakato/react-drawer";

export function AccountDrawer() {
  return (
    <Drawer.Root side="right">
      <Drawer.Trigger className="rounded bg-black px-4 py-2 text-white">Open account</Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="fixed inset-y-0 right-0 w-80 overflow-y-auto bg-white p-6 shadow-xl">
          <Drawer.Title className="text-lg font-semibold">Account</Drawer.Title>
          <Drawer.Description className="mt-1 text-sm text-gray-600">Manage your account settings.</Drawer.Description>
          <Drawer.Close className="mt-6 rounded border px-3 py-2">Close</Drawer.Close>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```

For a bottom sheet, set `side="bottom"`, provide snap points, and render a `Drawer.Handle`:

```tsx
<Drawer.Root side="bottom" snapPoints={[0.4, 0.9]} defaultActiveSnapPoint={0.4}>
  <Drawer.Trigger>Open sheet</Drawer.Trigger>
  <Drawer.Portal>
    <Drawer.Overlay className="fixed inset-0 bg-black/40" />
    <Drawer.Content className="fixed inset-x-0 bottom-0 w-full rounded-t-2xl bg-white">
      <Drawer.Handle aria-label="Resize sheet" className="mx-auto my-3 h-1 w-12 rounded-full bg-gray-300" />
      <Drawer.Title>Filters</Drawer.Title>
      <Drawer.Description>Choose the filters to apply.</Drawer.Description>
      <Drawer.Close>Done</Drawer.Close>
    </Drawer.Content>
  </Drawer.Portal>
</Drawer.Root>;
```

Snap points are fractions of the viewport (`0.4` means 40%). Values must be greater than `0` and at most `1`. For a bottom drawer they set its height; for left/right drawers they set its width. Dragging below half the smallest snap point closes the drawer.

## State and hooks

The root can be uncontrolled or controlled:

```tsx
import { useState } from "react";
import { Drawer } from "@syahakato/react-drawer";

export function ControlledDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <Drawer.Root open={open} onOpenChange={setOpen} side="right">
      <Drawer.Trigger>Open preferences</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="fixed inset-y-0 right-0 w-80 bg-white p-6">
          <Drawer.Title>Preferences</Drawer.Title>
          <Drawer.Close>Close</Drawer.Close>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```

Use consumer hooks from a component rendered inside the matching `Drawer.Root`:

```tsx
import { useDrawer, useDrawerSnap } from "@syahakato/react-drawer";

function DrawerStatus() {
  const drawer = useDrawer();
  const snap = useDrawerSnap();

  return (
    <output {...drawer.dataAttributes}>
      {drawer.open ? "Open" : "Closed"} · {drawer.side} · snap {snap.activeSnapPoint}
    </output>
  );
}
```

- `useDrawer()` returns `open`, `setOpen`, `side`, `modal`, stack/presence state, snap state, drag state, and `dataAttributes`.
- `useDrawerSnap()` returns `activeSnapPoint`, `snapPoints`, `setActiveSnapPoint`, `isDragging`, and snap-related `dataAttributes`.
- Both hooks throw if called outside a drawer provider.
- In nested drawers, hooks resolve to the nearest root. `createDrawerScope()` is available when an explicit context scope is needed; pass the returned `__scopeDrawer` to the root, its primitives, and the hook.

## Components

| Component                             | Purpose                                                                     |
| ------------------------------------- | --------------------------------------------------------------------------- |
| `Drawer.Root`                         | State, modal behavior, side, and snap-point configuration.                  |
| `Drawer.Trigger`                      | Opens the drawer and exposes expanded/dialog ARIA state.                    |
| `Drawer.Portal`                       | Renders drawer content in a portal; accepts `container` and `forceMount`.   |
| `Drawer.Overlay`                      | Optional modal backdrop; clicking it closes the topmost drawer.             |
| `Drawer.Content`                      | Dialog content, focus management, outside interaction, and Escape handling. |
| `Drawer.Close`                        | Closes the matching drawer.                                                 |
| `Drawer.Title` / `Drawer.Description` | Accessible dialog name and description.                                     |
| `Drawer.Handle`                       | Drag/keyboard snap-point control.                                           |

`Drawer.Root` supports `open`, `defaultOpen`, `onOpenChange`, `modal`, `side`, `snapPoints`, `activeSnapPoint`, `defaultActiveSnapPoint`, and `onActiveSnapPointChange`. `Drawer.Content` also supports `onEscapeKeyDown`, `onInteractOutside`, `asChild`, and `forceMount`.

## Behavior and accessibility

- Modal drawers manage focus, trap Tab navigation, and restore focus after closing.
- Escape closes the topmost drawer. Outside pointer interaction closes it unless prevented with `onInteractOutside`.
- Nested roots share an automatic stack provider. Only the topmost drawer is interactive.
- The handle supports arrow keys: Up/Down for bottom sheets and Left/Right for side drawers.
- Use a visible `Drawer.Title`; `Drawer.Description` is optional but recommended.
- Supply visible focus styles and ensure the content remains scrollable on small viewports.

## Development

```sh
bun install --frozen-lockfile
bun run check
bun run build
bun run storybook
```

Build the static showcase with `bun run build-storybook`. Storybook has separate English and Indonesian documentation pages.

## Maintainer release and Storybook hosting

The GitHub Actions workflow in `.github/workflows/release.yml` is triggered by tags matching `v*`. Update the package version in `package.json`, commit it, and push a matching tag (for example, `v0.1.1`). The workflow checks the tag/version match, validates the Storybook build, publishes to npm, and creates a GitHub Release with generated notes.

For the first npm release, publish the package once from a maintainer account with `npm login` and `npm publish --access public`. Then configure **Trusted Publisher** in the npm package settings for GitHub Actions, repository `syahrilaa/react-drawer`, workflow `release.yml`, and allow `npm publish`. Later tagged releases use OIDC and do not need a saved npm token.

To host Storybook, import this GitHub repository as a Vercel project. The root [`vercel.json`](./vercel.json) configures Bun installation, `bun run build-storybook`, and the `storybook-static` output. Set Vercel's Node.js version to 24 and use `main` as the production branch; Vercel Git integration then provides preview deployments for pull requests and production deployments from `main`.

## License

MIT
