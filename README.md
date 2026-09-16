# Helpdesk de TI com Triagem Inteligente

> Projeto acadêmico de Análise e Desenvolvimento de Sistemas — Igor Martins Silva

Sistema corporativo de Helpdesk que elimina a fricção técnica do usuário final ao delegar a categorização e priorização de chamados a uma Inteligência Artificial (Google Gemini). Ao mesmo tempo, atua como barreira de segurança, identificando ameaças cibernéticas em tempo real durante a abertura do chamado.

---

## Funcionalidades Principais

| Funcionalidade                     | Descrição                                                                                                                            |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Formulário Minimalista**         | O colaborador preenche apenas **Título** e **Descrição**. A IA define categoria, prioridade e risco automaticamente.                 |
| **Triagem por IA (NLP)**           | Toda descrição é obrigatoriamente analisada pelo Gemini antes de ser salva na fila.                                                  |
| **Protocolo de Incidente Crítico** | Se a IA detectar phishing, ransomware ou credenciais comprometidas, prioridade é forçada para `Critica` e `risco_seguranca = true`.  |
| **RBAC (Perfis)**                  | `COMUM`: visualiza e interage apenas nos próprios chamados. `TECNICO`: visualiza a fila global e altera o ciclo de vida dos tickets. |
| **Ciclo de Vida do Ticket**        | `NOVO` → `EM_ATENDIMENTO` → `AGUARDANDO_USUARIO` → `ESCALONADO` → `RESOLVIDO`                                                        |
| **Trilha de Auditoria Imutável**   | Cada transição de status é registrada com autor, timestamp e estados anterior/novo.                                                  |

---

## Stack Tecnológica

```
helpdesk_com_ia/
├── backend/       # NestJS · Node.js · TypeScript · Prisma ORM · PostgreSQL
└── frontend/      # Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4
```

| Camada                      | Tecnologia                             | Versão |
| --------------------------- | -------------------------------------- | ------ |
| **Frontend**                | Next.js (App Router)                   | 16.x   |
| **Frontend UI**             | Tailwind CSS v4 + Lucide Icons         | 4.x    |
| **Backend**                 | NestJS                                 | 10.x   |
| **ORM**                     | Prisma                                 | 5.x    |
| **Banco de Dados**          | PostgreSQL                             | 14+    |
| **Autenticação**            | JWT + Passport.js + bcrypt             | —      |
| **Inteligência Artificial** | Google Gemini API (`gemini-3.8-flash`) | —      |
| **Linguagem**               | TypeScript (full-stack)                | 5.x    |

---

## Paleta de Cores (Design System)

| Token         | Cor        | Hex                                                         | Uso                       |
| ------------- | ---------- | ----------------------------------------------------------- | ------------------------- |
| Base          | Slate 100  | `#F1F5F9`                                                   | Fundo geral das telas     |
| Primary       | Blue 800   | `#1E40AF`                                                   | Header, botões principais |
| Accent        | Orange 600 | `#EA580C`                                                   | Ações de destaque         |
| 🟢 Verde      | `#16A34A`  | Status `RESOLVIDO`, sucesso                                 |
| 🔵 Azul Claro | `#0284C7`  | Status `NOVO`                                               |
| 🟡 Amarelo    | `#D97706`  | `EM_ATENDIMENTO`, `AGUARDANDO_USUARIO`, prioridade `MEDIA`  |
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

### 3. Backend (NestJS — porta 3001)

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

# JWT — troque por um secret forte em produção
JWT_SECRET=seu_secret_jwt_aqui

# Google Gemini
GEMINI_API_KEY=sua_chave_gemini_aqui

# Servidor
PORT=3001
NODE_ENV=development
```

**3.3 Execute as migrations do banco e gere o Prisma Client:**

```bash
# Use sempre o Prisma local do projeto (não o global)
.\node_modules\.bin\prisma migrate deploy
.\node_modules\.bin\prisma generate
```

**3.4 Inicie o servidor em modo desenvolvimento:**

```bash
npm run start:dev
```

✅ Backend disponível em: `http://localhost:3001/api/v1`

---

### 4. Frontend (Next.js — porta 3000)

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

✅ Frontend disponível em: `http://localhost:3000`

---

## Estrutura do Projeto

```
helpdesk_com_ia/
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Modelos: Usuario, Chamado, Interacao, LogsAuditoria
│   └── src/
│       ├── ai/                    # AiModule + AiService (integração Gemini)
│       ├── auth/                  # AuthModule, JWT Strategy, Guards, Decorators
│       ├── prisma/                # PrismaModule (singleton global)
│       ├── tickets/               # TicketsModule (core business + RBAC)
│       ├── users/                 # UsersModule (registro + /users/me)
│       ├── app.module.ts
│       └── main.ts
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx             # RootLayout com AuthProvider
│   │   ├── page.tsx               # Página principal
│   │   └── globals.css            # Design system / variáveis CSS
│   ├── components/
│   │   ├── ui/                    # Badge, Button, Card, Input
│   │   ├── LoginForm.tsx
│   │   ├── Navbar.tsx
│   │   ├── TicketCreateForm.tsx   # Formulário minimalista (apenas Título + Descrição)
│   │   ├── TicketDetailModal.tsx  # Detalhes + auditoria + interações
│   │   └── TicketList.tsx         # Fila com filtros e destaque de risco
│   ├── context/
│   │   └── AuthContext.tsx        # useAuth hook + gerenciamento de JWT
│   ├── hooks/
│   │   └── useTickets.ts          # Hook customizado de chamados
│   └── lib/
│       ├── api.ts                 # Cliente HTTP tipado para o backend
│       ├── types.ts               # Interfaces TypeScript (Chamado, Usuario, etc.)
│       └── utils.ts               # Função cn() (clsx + tailwind-merge)
│
├── PRD.md                         # Product Requirements Document
├── TECH_SPEC.md                   # Especificação Técnica
├── TASKS.md                       # Plano de execução (checklist)
└── README.md                      # Este arquivo
```

---

## API — Endpoints Principais

| Método  | Rota                               | Perfil      | Descrição                                 |
| ------- | ---------------------------------- | ----------- | ----------------------------------------- |
| `POST`  | `/api/v1/users/register`           | Público     | Cadastro de novo usuário                  |
| `POST`  | `/api/v1/auth/login`               | Público     | Login — retorna `access_token` JWT        |
| `GET`   | `/api/v1/users/me`                 | Autenticado | Dados do usuário logado                   |
| `POST`  | `/api/v1/tickets`                  | Autenticado | Abre chamado (aciona IA obrigatoriamente) |
| `GET`   | `/api/v1/tickets`                  | Autenticado | Lista chamados (filtrada por perfil RBAC) |
| `GET`   | `/api/v1/tickets/:id`              | Autenticado | Detalhes + interações + auditoria         |
| `PATCH` | `/api/v1/tickets/:id/status`       | `TECNICO`   | Altera status e grava log de auditoria    |
| `POST`  | `/api/v1/tickets/:id/interactions` | Autenticado | Adiciona mensagem/interação               |

---

## Fluxo de Triagem por IA

```
Usuário preenche Título + Descrição
        ↓
POST /api/v1/tickets
        ↓
TicketsService → AiService.analisarChamado(titulo, descricao)
        ↓
Google Gemini API (gemini-3.8-flash)
        ↓ (responseSchema estrito)
{ categoria, prioridade, risco_seguranca }
        ↓
Protocolo de Incidente Crítico?
  ✅ Sim → força prioridade = "Critica", risco_seguranca = true
  ❌ Não → usa resultado da IA diretamente
        ↓
Salva no PostgreSQL + registra LogsAuditoria
        ↓
Retorna chamado criado para o frontend
```

---

## Segurança

- **Senhas**: jamais armazenadas em texto plano — hash gerado com `bcrypt` (12 rounds)
- **JWT**: tokens com expiração de 8h assinados com `JWT_SECRET`
- **API Key da IA**: exclusivamente no backend, nunca exposta ao frontend
- **Validação**: `ValidationPipe` global com `whitelist: true` e `forbidNonWhitelisted: true`
- **RBAC**: `RolesGuard` + decorator `@Roles()` bloqueiam endpoints sensíveis para perfil `COMUM`
- **Resposta genérica**: erros de autenticação retornam mensagem única para evitar enumeração de usuários

---

_Desenvolvido por Igor Martins Silva como projeto acadêmico do curso de Análise e Desenvolvimento de Sistemas._
