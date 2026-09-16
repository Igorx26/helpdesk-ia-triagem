# Plano de Execução (TASKS)

## Fase 1: Setup Base e Banco de Dados

- [x] Inicializar o projeto NestJS (`backend`) e Next.js (`frontend`).
- [x] Configurar o Prisma no backend e conectar ao PostgreSQL.
- [x] Criar o `schema.prisma` com os modelos: Usuario, Chamado, Interacao e LogsAuditoria (conforme TECH_SPEC.md).
- [x] Gerar as migrations iniciais do banco de dados e o Prisma Client.

## Fase 2: Autenticação e Segurança (Backend)

- [x] Criar o `UsersModule` e serviço de criação de usuário com hash de senha (bcrypt).
- [x] Criar o `AuthModule` implementando login e geração de JWT.
- [x] Configurar os Guards do NestJS para rotas autenticadas e Role-Based Access Control (RBAC) para o perfil 'TECNICO'.

## Fase 3: Serviço de IA (Backend)

- [x] Criar o `AiModule` e `AiService`.
- [x] Implementar a função que envia a descrição do chamado para a API do LLM.
- [x] Garantir que o serviço faça o parse da resposta forçando o formato JSON estrito definido no TECH_SPEC.md.

## Fase 4: Core Business (Backend)

- [x] Criar o `TicketsModule` (Chamados).
- [x] Implementar rota POST para abertura de chamados (acionando o AiService antes de salvar no Prisma).
- [x] Implementar rota GET para listar chamados (filtrando por ID do usuário se for COMUM, ou todos se for TECNICO).
- [x] Implementar rota PATCH para mudança de status, garantindo o registro na tabela `LogsAuditoria`.

## Fase 5: Interface do Usuário (Frontend)

- [x] Configurar Tailwind e instalar componentes base do shadcn/ui.
- [x] Criar página e formulário de Login.
- [x] Criar painel de abertura de chamado (Título e Descrição).
- [x] Criar dashboard de visualização da fila de chamados com indicadores visuais para a coluna "Risco de Segurança".
