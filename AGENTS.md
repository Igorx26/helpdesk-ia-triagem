# Diretrizes para Agentes de Codificação de IA (Antigravity/Claude/Codex/etc)

## 1. Stack Tecnológica Obrigatória

*   **Frontend:** Next.js (App Router), React, Tailwind CSS, shadcn/ui.
*   **Backend:** NestJS, TypeScript.
*   **Banco de Dados:** PostgreSQL, ORM Prisma.
*   **IA:** Integração com a API do Google Gemini. 
*   **Regra de Estabilidade:** O sistema DEVE manter um array de fallback com múltiplos modelos (`gemini-3.5-flash-lite`, `gemini-3.8-flash`, `gemini-3.7-flash`), priorizando sempre o 3.5-flash-lite por questões de velocidade e menor taxa de erro. Não remova o fallback.

## 2. Padrões de Código
*   Uso mandatório de **TypeScript** rigoroso em todo o sistema. Sem exceções (`any` deve ser evitado).
*   **Componentes de UI:** Modularize a UI dentro da pasta `components/`. Utilize os utilitários de `cn` (clsx + tailwind-merge) para compor estilos condicionais do Tailwind CSS.
*   **Módulos do NestJS:** Mantenha separação de responsabilidades restrita. O contexto da aplicação é separado por domínios (`auth`, `users`, `tickets`, `ai`, `prisma`).

## 3. Segurança Inegociável
*   **NUNCA** exponha chaves secretas ou tokens de API no frontend (Next.js). Toda chamada de IA deve ser processada no servidor (NestJS).
*   **NUNCA** crie rotas de cadastro abertas (Public Registration). A arquitetura é estritamente **Invite-Only**. Apenas a role `ADMIN` tem acesso a criação/exclusão total, e a role `TECNICO` possui acesso limitado de criação.
*   Senhas trafegam criptografadas (`bcrypt`). As requisições trafegam protegidas via `JWT`, e as rotas são restritas por perfil RBAC (`Guards` do NestJS).
*   O backend impõe Throttling (Rate Limiting de 5 req/hora na rota de abertura de chamados) prevenindo DDoS na infraestrutura do LLM.

## 4. Estilos Visualmente Codificados
Siga a paleta especificada em `TECH_SPEC.md` para qualquer alteração visual.
Mantenha os formulários minimalistas. A responsabilidade cognitiva sobre categorização do incidente **pertence à Inteligência Artificial**, não ao usuário final.

## 5. Auditoria de Alterações
Se houver solicitação de alteração nos modelos do banco de dados (Prisma):
1. Altere o `schema.prisma`.
2. Gere os artefatos locais.
3. Não crie commits sem informar ou obter autorização caso a alteração afete tabelas core (`Chamado`, `Usuario`).

## 6. Comandos Customizados
Quando eu digitar um comando começando com barra (`/`), execute a seguinte ação:
- `/review [caminhos_dos_arquivos...]`: Leia as regras em `strict-typescript-review.md` e o `AGENTS.md`, e aplique a refatoração rigorosa em todos os arquivos e pastas indicados, salvando-os no disco.