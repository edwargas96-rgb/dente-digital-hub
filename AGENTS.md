# AGENTS

Projeto: **LAB PIGATTO** — portal de ordens de serviço para laboratório de
prótese dentária.

- Stack: TanStack Start (React 19) + Vite + Tailwind, backend Supabase
  (Postgres, Auth e Storage) com Row Level Security.
- Perfis de acesso: `clinica` (abre e acompanha as próprias ordens) e
  `laboratorio` (analisa todas as ordens e atualiza status; não cria ordens).
- Variáveis de ambiente necessárias: `VITE_SUPABASE_URL`,
  `VITE_SUPABASE_PUBLISHABLE_KEY` (e as equivalentes sem `VITE_` para SSR).
