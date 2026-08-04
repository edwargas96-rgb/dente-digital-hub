# Lab Connect

Crie um aplicativo web chamado LAB PIGATTO — um portal para um laboratório de prótese dentária receber e acompanhar ordens de serviço enviadas pelas clínicas parceiras. TODA a interface deve ser em português do Brasil.

Use Supabase para autenticação (e-mail e senha), banco de dados (Postgres) e armazenamento de arquivos (Storage). Aplique Row Level Security.

── PERFIS DE USUÁRIO ──

1) Clínica (cliente): abre e acompanha apenas as PRÓPRIAS ordens, anexa arquivos e fotos, escreve observações e comentários na ordem.

2) Laboratório (admin): vê TODAS as ordens de todas as clínicas, atualiza o status, cadastra clínicas e edita os catálogos do sistema.

Regra de acesso (RLS): a clínica só enxerga ordens da sua própria clínica; o laboratório enxerga tudo.

── BANCO DE DADOS ──

- profiles: id (=auth.uid), role ('clinica' | 'laboratorio'), clinic_id (nullable), nome_completo.

- clinics: id, nome, responsavel, telefone, email, endereco, documento (CNPJ/CPF), ativo (bool).

- orders: id, numero (sequencial automático, ex. OS-0001), clinic_id, created_by, paciente, dentista, item, elementos (array de números de dente FDI), sob_implante (bool), implante, scanbody, material, cor, data_entrega (date), observacoes (text), status, created_at.

- order_files: id, order_id, tipo ('arquivo' | 'foto'), storage_path, nome_arquivo, tamanho.

- order_events: id, order_id, status, comentario, autor, created_at (linha do tempo/histórico da ordem).

- catálogos editáveis pelo laboratório: item_types, materials, implant_systems, scanbodies, tooth_shades (cada um: id, nome, ativo).

── TELAS ──

- /login: e-mail e senha. Após login, redireciona conforme o perfil.

- Dashboard: 

   • Clínica: lista das suas ordens com status e prazo, botão "Nova ordem".

   • Laboratório: cards com contadores (Novas, Em produção, Prontas, Atrasadas) + lista de todas as ordens.

- /nova-ordem: formulário de abertura da ordem (detalhado abaixo).

- /ordens/:id: detalhe da ordem — todos os dados, anexos e fotos, campo de comentários, e a linha do tempo de status. O laboratório pode mudar o status por aqui.

- /calendario: visão de calendário mensal com as ordens posicionadas na data de entrega; ordens atrasadas em vermelho, próximas do prazo em âmbar.

- /clinicas (só laboratório): cadastrar/editar clínicas e criar o acesso delas.

- /configuracoes (só laboratório): gerenciar os catálogos (tipos de item, materiais, implantes, scanbodies, cores).

── FORMULÁRIO DE NOVA ORDEM (tela principal) ──

Campos, na ordem:

- Nº da ordem: gerado automaticamente (somente leitura).

- Paciente (texto, obrigatório).

- Clínica: preenchida automaticamente pela conta logada (somente leitura).

- Dentista responsável (texto).

- Item / tipo de trabalho (select vindo do catálogo item_types: Coroa, Ponte, Faceta, Provisório, Placa, Protocolo, Inlay/Onlay…).

- Elemento (dente): ODONTOGRAMA CLICÁVEL — dois arcos com a notação FDI de adulto. Ao clicar num dente, ele fica selecionado (destacado em teal). Permite selecionar mais de um dente (ex.: ponte). 

   Arco superior: 18 17 16 15 14 13 12 11 | 21 22 23 24 25 26 27 28

   Arco inferior: 48 47 46 45 44 43 42 41 | 31 32 33 34 35 36 37 38

   Cada dente é um botão pequeno com um ícone de dente e o número FDI embaixo. Mostrar os selecionados em um resumo (ex.: "Elementos: 11, 21").

- Sob implante? (toggle Sim/Não). Se "Sim", mostrar:

   • Sistema de implante (select do catálogo implant_systems).

   • Scanbody (select do catálogo scanbodies ou texto livre).

- Material (select do catálogo materials).

- Cor / escala VITA (select do catálogo tooth_shades).

- Arquivos da ordem: upload para o Supabase Storage (aceitar .stl, .ply, .zip, .pdf). Permitir vários arquivos.

- Fotos: upload de imagens para o Supabase Storage, com miniatura/pré-visualização e opção de remover.

- Data de entrega: seletor de calendário (date picker), obrigatório.

- Observações: textarea.

- Botão "Enviar ordem": salva a ordem com status inicial "Recebida", cria o primeiro registro em order_events e leva para o detalhe da ordem.

── STATUS DA ORDEM ──

Fluxo: Recebida → Em análise → Em produção → Em prova → Pronta → Enviada/Entregue. Cada mudança de status feita pelo laboratório grava um registro em order_events (linha do tempo). Mostrar o status como um selo colorido.

── DESIGN ──

Estilo clínico, preciso e profissional (área odontológica), NÃO genérico. 

- Cores: fundo porcelana (#EEF1F3), superfícies brancas, texto slate escuro (#16232B), cinza para secundário (#5C6B73), cor principal teal clínico (#0D6E6C) com hover mais escuro (#0A5655). Status: verde para entregue, âmbar para próximo do prazo, vermelho para atrasado.

- Tipografia: títulos em "Space Grotesk", corpo/UI em "IBM Plex Sans", e números/IDs/dentes/datas em "IBM Plex Mono".

- Layout com sidebar à esquerda (navegação) e conteúdo em cards limpos, cantos suaves, sombras discretas. 

- Totalmente responsivo (a recepção da clínica vai tirar e enviar fotos pelo celular). Foco visível no teclado e bom contraste.

- Elemento de destaque (assinatura visual): o odontograma clicável — capriche nele.

Comece construindo esse escopo. Deixe os catálogos já populados com opções comuns (materiais: Zircônia, Dissilicato, Metalocerâmica, PMMA; sistemas de implante: Neodent, Straumann, Nobel Biocare, Zimmer, Conexão, S.I.N.; cores VITA: A1, A2, A3, A3.5, B1, B2, C1, D2).

## Stack

- **Frontend:** TanStack Start (React 19) + Vite + Tailwind CSS.
- **Backend:** Supabase (Postgres, Auth por e-mail/senha e Storage) com Row Level Security.

## Variáveis de ambiente

Crie um arquivo `.env` na raiz com as credenciais do seu projeto Supabase:

```sh
VITE_SUPABASE_URL="https://SEU-PROJETO.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
# Equivalentes sem VITE_ são usadas no SSR:
SUPABASE_URL="https://SEU-PROJETO.supabase.co"
SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
```

## Desenvolvimento local

Requer Node.js. As dependências usam Bun (há `bunfig.toml`), mas `npm` também funciona.

```sh
git clone <this-repository-url>
cd dente-digital-hub
bun install   # ou: npm install
bun run dev   # ou: npm run dev
```

## Deploy (Vercel)

1. Importe o repositório na [Vercel](https://vercel.com/new).
2. Configure as variáveis de ambiente acima nas *Project Settings → Environment Variables*.
3. A Vercel roda `vite build`; o alvo de servidor (Nitro) é detectado automaticamente.

## Banco de dados

As migrations ficam em `supabase/migrations/`. Aplique-as no seu projeto com a
[CLI do Supabase](https://supabase.com/docs/guides/local-development) (`supabase db push`)
ou pelo SQL Editor do painel.
