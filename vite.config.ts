import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Configuração de build própria do projeto.
// - vite-tsconfig-paths resolve o alias "@/*" do tsconfig.
// - tanstackStart({ target: "vercel" }) faz o build de servidor no formato de
//   saída da Vercel (Build Output API), necessário para o SSR responder às rotas.
//   Em outros hosts, troque o target (ex.: "node-server", "netlify", "cloudflare-module").
export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart({ target: "vercel" }),
    viteReact(),
  ],
});
