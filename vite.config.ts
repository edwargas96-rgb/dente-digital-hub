import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Configuração de build própria do projeto.
// - vite-tsconfig-paths resolve o alias "@/*" do tsconfig.
// - tanstackStart usa src/server.ts como entry de SSR (nosso wrapper de erro).
// - O alvo de deploy (Nitro) é detectado automaticamente na Vercel; em outros
//   hosts, defina a variável de ambiente NITRO_PRESET (ex.: "vercel", "node-server").
export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart({
      server: { entry: "./src/server.ts" },
    }),
    viteReact(),
  ],
});
