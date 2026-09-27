# Helpdesk de TI Corporativo com Triagem Inteligente (IA)

Um sistema de Helpdesk moderno, desenvolvido para simplificar o suporte técnico corporativo e acelerar o tempo de resposta a incidentes. Com o auxílio de uma Inteligência Artificial integrada, a complexidade técnica é abstraída do usuário final, enquanto a equipe de TI obtém métricas automáticas de prioridade e risco.

---

## 🤖 Desenvolvimento Assistido por IA (AI-Assisted Engineering)

Este projeto foi desenvolvido utilizando uma abordagem vanguardista de engenharia de software, onde atuei como **Arquiteto de Software e Product Manager**, orquestrando **Agentes Autônomos de Codificação (Antigravity e Gemini API)** para a execução e implementação do código.

O fluxo de desenvolvimento consistiu nas seguintes etapas operacionais:

- **Engenharia de Requisitos & System Design:** Toda a regra de negócio, modelagem de banco de dados relacional (Prisma), matriz de privilégios de segurança (RBAC com perfis `Admin`, `Técnico` e `Comum`) e a arquitetura distribuída do sistema foram elaboradas estruturalmente por mim, e minuciosamente documentadas nos arquivos de Especificação (`PRD.md` e `TECH_SPEC.md`).
- **Contexto de IA Restrito (Knowledge Base Prompting):** Os arquivos `.md` presentes na raiz do repositório funcionaram como a base central de conhecimento de projeto, criando barreiras semânticas e regras estritas que guiaram a IA de codificação a gerar a interface (Next.js) e arquitetar a infraestrutura da API (NestJS) exatamente conforme o escopo planejado.
- **Auditoria, Segurança e Refatoração:** A integração assíncrona, a construção dos layouts reativos e, principalmente, as travas de segurança de rede (como a imposição do Rate Limit de 5 req/hora contra floodings) foram rigorosamente auditadas, corrigidas e lapidadas em iterações humanas.

> **Resultado:** Esta metodologia aplicada demonstra, na prática, o poder de fundir o planejamento de produto e a visão sistêmica humana com a velocidade de execução paralela das inteligências artificiais, construindo softwares corporativos escaláveis (Production-Ready) com governança técnica absoluta.

---

## Diferenciais e Funcionalidades

- **Abertura Minimalista de Chamados:** O colaborador escreve o que está acontecendo como se estivesse mandando uma mensagem de chat. Nenhuma necessidade de selecionar sistemas, categorias obscuras ou prioridades subjetivas.
- **Triagem Ativa por IA (Gemini API):** O modelo Processamento de Linguagem Natural classifica automaticamente a Categoria (Hardware, Software, Rede, Segurança) e define a Prioridade (Baixa a Crítica).
- **Detecção Cibernética em Tempo Real:** O sistema analisa a descrição do usuário em busca de links, e-mails de phishing relatados, falhas de senha ou comportamento anômalo, ativando alertas de risco de segurança automaticamente.
- **Painel de Controle e Auditoria:** Uma visão global com controle de papéis (`ADMIN`, `TECNICO`, `COMUM`). Histórico imutável de quem alterou qual status em cada ticket.
- **Arquitetura Invite-Only e Defesa de Borda:** Inexistência de rotas de registros abertos, proteção de endpoints via `Guards` do NestJS e limitação severa de tráfego (Rate Limiting via `Throttler`) no ambiente de envio de prompts de IA para inibir sobrecargas maliciosas.

---

## Stack Tecnológica

| Componente           | Tecnologia                          |
| -------------------- | ----------------------------------- |
| **Frontend**         | React, Next.js (App Router)         |
| **Estilização**      | Tailwind CSS, `shadcn/ui`, Lucide Icons |
| **Backend**          | NestJS, TypeScript, JWT (Auth)      |
| **Banco de Dados**   | PostgreSQL                          |
| **ORM**              | Prisma                              |
| **Inteligência Art.**| Google Gemini API (`gemini-3.8-flash`) |

---

## Design System & Status do Sistema

| Token         | Cor        | Hex                                                         | Uso                       |
| ------------- | ---------- | ----------------------------------------------------------- | ------------------------- |
| Base          | Slate 100  | `#F1F5F9`                                                   | Fundo geral das telas     |
| Primary       | Blue 800   | `#1E40AF`                                                   | Header, botões principais |
| Accent        | Orange 600 | `#EA580C`                                                   | Ações de destaque         |
| 🟢 Verde      | `#16A34A`  | Status `RESOLVIDO`, sucesso                                 |
| 🔵 Azul Claro | `#0284C7`  | Status `NOVO`                                               |
| 🟠 Amarelo    | `#D97706`  | `EM_ATENDIMENTO`, `AGUARDANDO_USUARIO`, prioridade `MEDIA`  |
| 🟣 Roxo       | `#7E22CE`  | Status `ESCALONADO`                                         |
| 🔴 Vermelho   | `#DC2626`  | Prioridades `ALTA`/`CRITICA`, flag `risco_seguranca`, erros |

---

## Pré-requisitos

- **Node.js** v20+ (recomendado: v24)
- **npm** v9+
- **PostgreSQL** v14+ rodando localmente
- **Chave de API do Google Gemini** ([obtenha gratuitamente em aistudio.google.com](https://aistudio.google.com))

---

## Como Rodar Localmente

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd helpdesk_com_ia
```

### 2. Configure o Banco de Dados

Crie o banco `helpdesk_db` no seu PostgreSQL local:

```sql
CREATE DATABASE helpdesk_db;
```

---

### 3. Backend (NestJS – porta 3001)

```bash
cd backend
```

**3.1 Instale as dependências:**

```bash
npm install
```

**3.2 Crie e configure o arquivo de variáveis de ambiente:**

```bash
# Copie o exemplo (ou crie manualmente o arquivo .env)
cp .env.example .env   # ou crie o .env com o conteúdo abaixo
```

Conteúdo do `backend/.env`:

```env
# Banco de dados PostgreSQL
DATABASE_URL="postgresql://SEU_USUARIO:SUA_SENHA@localhost:5432/helpdesk_db?schema=public"

# JWT – troque por um secret forte em produção
JWT_SECRET=seu_secret_jwt_aqui

# Google Gemini
GEMINI_API_KEY=sua_chave_gemini_aqui

# Servidor
PORT=3001
NODE_ENV=development

# Super Admin (Opcional - Usado no script de seed para injetar o ADMIN em produção)
SUPER_ADMIN_EMAIL=seu_email_admin_real@empresa.com
SUPER_ADMIN_PASSWORD=sua_senha_segura_de_producao
```

**3.3 Execute as migrations do banco e gere o Prisma Client:**

```bash
# Use sempre o Prisma local do projeto (não o global)
.\node_modules\.bin\prisma migrate deploy
.\node_modules\.bin\prisma generate
```

**3.4 Opcional: Popular base (Seed) de Superusuário ADMIN:**
*(O seed cria automaticamente a conta admin@empresa.com / admin123)*

```bash
npx prisma db seed
```

**3.5 Inicie o servidor em modo desenvolvimento:**

```bash
npm run start:dev
```

🚀 Backend disponível em: `http://localhost:3001/api/v1`

---

### 4. Frontend (Next.js – porta 3000)

Abra um **novo terminal**:

```bash
cd frontend
```

**4.1 Instale as dependências:**

```bash
npm install
```

**4.2 Verifique o arquivo de variáveis de ambiente:**

O arquivo `frontend/.env.local` deve conter:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

**4.3 Inicie o servidor de desenvolvimento:**

```bash
npm run dev
```

🌐 Frontend disponível em: `http://localhost:3000`

---

## Estrutura do Projeto

```
helpdesk_com_ia/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Modelos: Usuario, Chamado, Interacao, LogsAuditoria
│   │   └── seed.ts                # Inicializador de contas de superusuário (ADMIN)
│   ├── src/
│       ├── ai/                    # AiModule + AiService (integração Gemini)
│       ├── auth/                  # AuthModule, JWT Strategy, Guards, Decorators
│       ├── prisma/                # PrismaModule (singleton global)
│       ├── tickets/               # TicketsModule (core business + RBAC)
│       ├── users/                 # UsersModule (/users/me e endpoints RBAC Invite-Only)
│       ├── app.module.ts          # ThrottlerModule import (Rate Limiter global)
│       └── main.ts
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx             # RootLayout com AuthProvider
│   │   ├── page.tsx               # Página principal (Dashboard único vertical)
│   │   └── globals.css            # Design system / variáveis CSS
│   ├── components/
│   │   ├── ui/                    # Badge, Button, Card, Input
│   │   ├── LoginForm.tsx          # Autenticação com UX handling amigável
│   │   ├── Navbar.tsx             # Barra de navegação baseada em privilégios de conta
│   │   ├── TicketCreateForm.tsx   # Formulário minimalista + captura limitação de quota (429)
│   │   ├── TicketDetailModal.tsx  # Detalhes + auditoria + interações
│   │   ├── UserManagementModal.tsx# Dashboard administrativo para gestão Invite-Only (Tabela)
│   │   └── TicketList.tsx         # Fila com filtros e destaque de risco
│   ├── context/
│   │   └── AuthContext.tsx        # useAuth hook + gerenciamento assíncrono de JWT
│   ├── hooks/
│   │   └── useTickets.ts          # Hook customizado de estados reativos dos chamados
│   └── lib/
│       ├── api.ts                 # HTTP Fetch wrapper com captura tratada de exceções
│       ├── types.ts               # Interfaces TypeScript de domínio
│       └── utils.ts               # Função utilitária cn() (clsx + tailwind-merge)
│
├── PRD.md                         # Product Requirements Document
├── TECH_SPEC.md                   # Especificação Técnica e System Design
├── TASKS.md                       # Plano de execução estrito
└── README.md                      # Este documento
```

---

## API – Endpoints Principais

| Método  | Rota                               | Perfil Restrito       | Descrição                                 |
| ------- | ---------------------------------- | --------------------- | ----------------------------------------- |
| `POST`  | `/api/v1/auth/login`               | Público               | Autenticação – retorna `access_token` JWT   |
| `GET`   | `/api/v1/users/me`                 | Autenticado           | Dados da própria sessão logada              |
| `PATCH` | `/api/v1/users/me`                 | Autenticado           | Atualizar nome, e-mail e redefinir senha    |
| `POST`  | `/api/v1/users`                    | `TECNICO` ou `ADMIN`  | Criação Invite-Only de novas contas       |
| `GET`   | `/api/v1/users`                    | `TECNICO` ou `ADMIN`  | Tabela paginada do quadro de funcionários |
| `DELETE`| `/api/v1/users/:id`                | EXCLUSIVO `ADMIN`     | Desligamento/exclusão definitiva de contas  |
| `POST`  | `/api/v1/tickets`                  | Autenticado           | Abre chamado (aciona IA & Throttler limit)|
| `GET`   | `/api/v1/tickets`                  | Autenticado           | Lista chamados (Query filtrada por RBAC)  |
| `GET`   | `/api/v1/tickets/:id`              | Autenticado           | Detalhes + interações + trila de log      |
| `PATCH` | `/api/v1/tickets/:id/status`       | `TECNICO` ou `ADMIN`  | Transita ciclo de vida e grava log imutável |
| `POST`  | `/api/v1/tickets/:id/interactions` | Autenticado           | Adiciona mensagem/interação               |

---

## Fluxo de Triagem por IA

```text
Usuário relata Incidente (Sem jargões técnicos)
        ↓
POST /api/v1/tickets
        ↓
TicketsService → AiService.analisarChamado(titulo, descricao)
        ↓
Google Gemini API (gemini-3.8-flash)
        ↓ (Retorno garantido via responseSchema estrito)
{ categoria, prioridade, risco_seguranca }
        ↓
Protocolo de Incidente Crítico ativado?
  → Sim → Força Prioridade = "Critica" | Segurança = true (Alerta visual na fila)
  → Não → Confia e adota classificação da Inteligência
        ↓
Transação persistida no PostgreSQL + Inicialização da Trilha de Logs (Auditoria)
        ↓
Feedback instantâneo (Verde/Vermelho) no formulário Next.js
```

---

_Construído no fluxo da Engenharia de Software Moderna por Igor Martins Silva._
