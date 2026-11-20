# @syahakato/react-drawer

Primitive drawer dan bottom sheet React yang composable, dengan state terkontrol, snap points, nested stacking, dukungan keyboard, dan consumer hooks.

[English documentation](./README.md) · [Sumber Storybook Bahasa Indonesia](./src/docs/Drawer.id.mdx)

## Persyaratan

- React dan React DOM `^19.0.0`
- Aplikasi React yang berjalan di sisi klien

Paket ini menyediakan behavior dan primitive aksesibel, bukan tema visual. Atur layout, warna, dan animasi buka/tutup sendiri lewat `className` dan `style`. Theme Tailwind dan utility animasi di `.storybook/globals.css` hanya untuk contoh Storybook, tidak ikut dipaketkan sebagai styling consumer.

## Instalasi

```sh
npm install @syahakato/react-drawer
```

## Contoh cepat

```tsx
import { Drawer } from "@syahakato/react-drawer";

export function AccountDrawer() {
  return (
    <Drawer.Root side="right">
      <Drawer.Trigger className="rounded bg-black px-4 py-2 text-white">Buka akun</Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="fixed inset-y-0 right-0 w-80 overflow-y-auto bg-white p-6 shadow-xl">
          <Drawer.Title className="text-lg font-semibold">Akun</Drawer.Title>
          <Drawer.Description className="mt-1 text-sm text-gray-600">Kelola pengaturan akun.</Drawer.Description>
          <Drawer.Close className="mt-6 rounded border px-3 py-2">Tutup</Drawer.Close>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```

Untuk bottom sheet, gunakan `side="bottom"`, tentukan snap points, lalu tampilkan `Drawer.Handle`:

```tsx
<Drawer.Root side="bottom" snapPoints={[0.4, 0.9]} defaultActiveSnapPoint={0.4}>
  <Drawer.Trigger>Buka sheet</Drawer.Trigger>
  <Drawer.Portal>
    <Drawer.Overlay className="fixed inset-0 bg-black/40" />
    <Drawer.Content className="fixed inset-x-0 bottom-0 w-full rounded-t-2xl bg-white">
      <Drawer.Handle aria-label="Ubah ukuran sheet" className="mx-auto my-3 h-1 w-12 rounded-full bg-gray-300" />
      <Drawer.Title>Filter</Drawer.Title>
      <Drawer.Description>Pilih filter yang ingin diterapkan.</Drawer.Description>
      <Drawer.Close>Selesai</Drawer.Close>
    </Drawer.Content>
  </Drawer.Portal>
</Drawer.Root>;
```

Snap point adalah pecahan dari viewport (`0.4` berarti 40%). Nilainya harus lebih dari `0` dan paling tinggi `1`. Pada drawer bawah nilai ini mengatur tinggi; pada drawer kiri/kanan nilai ini mengatur lebar. Drag melewati setengah snap point terkecil akan menutup drawer.

## State dan hooks

Root dapat menggunakan state internal atau dikontrol oleh consumer:

```tsx
import { useState } from "react";
import { Drawer } from "@syahakato/react-drawer";

export function ControlledDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <Drawer.Root open={open} onOpenChange={setOpen} side="right">
      <Drawer.Trigger>Buka preferensi</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="fixed inset-y-0 right-0 w-80 bg-white p-6">
          <Drawer.Title>Preferensi</Drawer.Title>
          <Drawer.Close>Tutup</Drawer.Close>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```

Gunakan consumer hooks dari komponen yang dirender di dalam `Drawer.Root` yang sesuai:

```tsx
import { useDrawer, useDrawerSnap } from "@syahakato/react-drawer";

function DrawerStatus() {
  const drawer = useDrawer();
  const snap = useDrawerSnap();

  return (
    <output {...drawer.dataAttributes}>
      {drawer.open ? "Terbuka" : "Tertutup"} · {drawer.side} · snap {snap.activeSnapPoint}
    </output>
  );
}
```

- `useDrawer()` menyediakan `open`, `setOpen`, `side`, `modal`, state stack/presence, snap, drag, serta `dataAttributes`.
- `useDrawerSnap()` menyediakan `activeSnapPoint`, `snapPoints`, `setActiveSnapPoint`, `isDragging`, dan `dataAttributes` terkait snap.
- Kedua hook melempar error jika dipanggil di luar provider drawer.
- Pada nested drawer, hook membaca root terdekat. `createDrawerScope()` tersedia jika memerlukan scope context eksplisit; teruskan `__scopeDrawer` yang dikembalikan ke root, primitive di dalamnya, dan hook.

## Komponen

| Komponen                              | Kegunaan                                                               |
| ------------------------------------- | ---------------------------------------------------------------------- |
| `Drawer.Root`                         | State, behavior modal, sisi, dan konfigurasi snap point.               |
| `Drawer.Trigger`                      | Membuka drawer dan mengatur state ARIA dialog.                         |
| `Drawer.Portal`                       | Merender drawer melalui portal; menerima `container` dan `forceMount`. |
| `Drawer.Overlay`                      | Backdrop modal opsional; klik backdrop menutup drawer teratas.         |
| `Drawer.Content`                      | Konten dialog, pengelolaan fokus, interaksi luar, dan Escape.          |
| `Drawer.Close`                        | Menutup drawer yang sesuai.                                            |
| `Drawer.Title` / `Drawer.Description` | Nama dan deskripsi aksesibel untuk dialog.                             |
| `Drawer.Handle`                       | Kontrol snap point melalui drag atau keyboard.                         |

`Drawer.Root` menerima `open`, `defaultOpen`, `onOpenChange`, `modal`, `side`, `snapPoints`, `activeSnapPoint`, `defaultActiveSnapPoint`, dan `onActiveSnapPointChange`. `Drawer.Content` juga menerima `onEscapeKeyDown`, `onInteractOutside`, `asChild`, dan `forceMount`.

## Behavior dan aksesibilitas

- Drawer modal mengelola fokus, membatasi navigasi Tab, dan mengembalikan fokus setelah ditutup.
- Escape menutup drawer teratas. Interaksi pointer di luar konten menutup drawer kecuali dibatalkan lewat `onInteractOutside`.
- Root yang nested memakai stack provider otomatis. Hanya drawer teratas yang interaktif.
- Handle mendukung tombol panah: Atas/Bawah untuk bottom sheet dan Kiri/Kanan untuk drawer samping.
- Sediakan `Drawer.Title` yang terlihat; `Drawer.Description` opsional tetapi disarankan.
- Sediakan indikator fokus yang terlihat dan pastikan konten tetap bisa di-scroll pada viewport kecil.

## Pengembangan

```sh
bun install --frozen-lockfile
bun run check
bun run build
bun run storybook
```

Build showcase statis dengan `bun run build-storybook`. Storybook menyediakan halaman dokumentasi Bahasa Indonesia dan English secara terpisah.

## Release maintainer dan hosting Storybook

Workflow GitHub Actions di `.github/workflows/release.yml` berjalan saat tag dengan pola `v*` di-push. Perbarui versi package di `package.json`, commit perubahan, lalu push tag dengan versi yang sama (contoh: `v0.1.1`). Workflow akan memeriksa kecocokan tag dan versi, memvalidasi build Storybook, publish ke npm, lalu membuat GitHub Release dengan release notes otomatis.

Untuk publish npm pertama kali, publish package satu kali dari akun maintainer dengan `npm login` dan `npm publish --access public`. Setelah itu, atur **Trusted Publisher** pada pengaturan package npm: GitHub Actions, repository `syahrilaa/react-drawer`, workflow `release.yml`, dan izinkan `npm publish`. Release berikutnya menggunakan OIDC tanpa menyimpan npm token.

Untuk hosting Storybook, import repository GitHub ini sebagai project Vercel. File [`vercel.json`](./vercel.json) mengatur instalasi Bun, perintah `bun run build-storybook`, dan output `storybook-static`. Atur versi Node.js Vercel ke 24 dan branch production ke `main`; integrasi Git Vercel akan membuat preview untuk pull request dan deployment production dari `main`.

## Lisensi

MIT
