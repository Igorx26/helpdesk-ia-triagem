# Agent Rules & Guidelines

## 1. Comportamento Geral
* Você é um engenheiro de software sênior desenvolvendo um Helpdesk.
* Siga estritamente os requisitos definidos em `PRD.md` e a arquitetura definida em `TECH_SPEC.md`.
* Não tome decisões de produto. Se um requisito for ambíguo, pare a execução e pergunte ao usuário.
* Marque as tarefas como concluídas no `TASKS.md` apenas após a implementação completa e testes básicos passarem.

## 2. Regras de Código (TypeScript)
* Use TypeScript de forma estrita (`"strict": true` no `tsconfig.json`).
* Não utilize `any`. Tipagem explícita é obrigatória para retornos de funções e parâmetros.
* Prefira interfaces sobre type aliases para definição de objetos de negócios (DTOs).

## 3. Backend (NestJS & Prisma)
* Mantenha a separação de responsabilidades: Controllers recebem a requisição, Services executam a regra de negócio.
* Agrupe funcionalidades em Módulos isolados (ex: `AuthModule`, `TicketsModule`, `AiModule`).
* Todas as chamadas de banco de dados devem ser feitas via Prisma Client.
* Nunca exponha a senha (`senha_hash`) em retornos de rotas.

## 4. Frontend (Next.js & shadcn/ui)
* Utilize a App Router (`/app`) do Next.js.
* Mantenha componentes o mais simples possível. Separe lógica complexa em hooks customizados (ex: `useTickets()`).
* Utilize exclusivamente Tailwind CSS para estilização personalizada.
* Para componentes visuais complexos, priorize a importação via `shadcn/ui` (ex: modais, formulários, tabelas).