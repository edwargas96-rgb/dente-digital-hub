// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only; auto-detecta o alvo — Vercel em produção), VITE_* env injection,
//     @ path alias, React/TanStack dedupe, error logger plugins, and sandbox detection.
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
//
// Observação: este é o único pacote com o nome "lovable" que permanece no projeto.
// Ele é apenas uma configuração de build (empacota o Nitro para o deploy) e NÃO
// conecta a nenhum serviço do Lovable em runtime — o app continua independente
// (Supabase próprio + hospedagem própria na Vercel).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redireciona o server entry do TanStack Start para src/server.ts (nosso wrapper de erro no SSR).
    server: { entry: "server" },
  },
});
