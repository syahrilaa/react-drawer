import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const __dirname = import.meta.dirname;
const tsconfigPath = path.resolve(__dirname, "tsconfig.json");

const config = defineConfig(({ mode }) => ({
  plugins: [
    tailwindcss(),
    react({}),
    ...(mode === "library"
      ? [
          dts({
            include: ["src/**/*.{ts,tsx}"],
            bundleTypes: true,
            tsconfigPath,
          }),
        ]
      : []),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "Drawer",
      formats: ["es", "cjs"],
      fileName: (format) => {
        const ext = format === "cjs" ? ".js" : ".mjs";
        return `index${ext}`;
      },
    },
    rollupOptions: {
      platform: "browser",
      external: ["react", "react/jsx-runtime", "react-dom"],
    },
  },
  tsconfig: tsconfigPath,
}));

export default config;
