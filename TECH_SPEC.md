# Technical Specification (TECH_SPEC)

**Projeto:** Helpdesk de TI com Triagem Inteligente
**Stack Principal:** NextJS (Frontend), NestJS (Backend), PostgreSQL (Database), Prisma (ORM).

## 1. Arquitetura do Sistema
O sistema utilizará um ecossistema unificado em TypeScript para facilitar o compartilhamento de tipagens de ponta a ponta.
*   **Frontend (Next.js):** Interface web renderizada no cliente/servidor. Estilização baseada em Tailwind CSS e componentes acessíveis providos pela biblioteca `shadcn/ui`.
*   **Backend (NestJS / Node.js):** API RESTful modular. Será responsável por orquestrar o roteamento seguro, aplicar a lógica de negócios e realizar a comunicação com APIs externas de IA.
*   **Banco de Dados (PostgreSQL):** Banco de dados relacional. A comunicação será intermediada pelo ORM Prisma, garantindo a execução segura de consultas e facilitando a modelagem.

## 2. Camada de Segurança e Acesso
As proteções abaixo devem ser ativamente codificadas pelo agente:
*   **Autenticação JWT:** A proteção de rotas restritas exige a validação de tokens JWT (JSON Web Token).
*   **RBAC (Role-Based Access Control):** Uso de `Guards` do NestJS para separar os perfis "Comum" e "Técnico", bloqueando acessos indevidos a endpoints de mudança de status operacionais.
*   **Criptografia:** Obrigatoriedade do uso da biblioteca `bcrypt` para gerar o hash de credenciais (senhas) antes de qualquer persistência no banco de dados.
*   **Sanitização e Validação:** Implementação de `ValidationPipes` globais no NestJS (utilizando `class-validator` e `class-transformer`) para interceptar requisições, prevenindo ataques XSS (Cross-Site Scripting) e garantindo a defesa do banco contra Injeções de SQL.

## 3. Integração de Inteligência Artificial
*   **Módulo Isolado:** A lógica da IA deve residir exclusivamente no backend, em um serviço dedicado (ex: `AiService`), para que as chaves da API não sejam expostas.
*   **Ação de Interceptação:** A IA atua durante o POST de criação de um chamado. O backend envia a descrição para um LLM.
*   **Output Estrito:** A chamada da API da IA deve utilizar prompts (ou functions/structured outputs) que forcem o retorno **exclusivamente** no seguinte formato JSON estrito:
    ```json
    {
      "categoria": "Hardware | Software | Rede | Seguranca",
      "prioridade": "Baixa | Media | Alta | Critica",
      "risco_seguranca": true | false
    }
    ```

## 4. Design System e Identidade Visual
A configuração do Tailwind CSS (`tailwind.config.ts`) e os componentes visuais devem seguir estritamente esta paleta:

**Cores Globais do Sistema:**
*   `Base` (Fundo das telas): #F1F5F9
*   `Primary` (Botões principais, Header): #1E40AF
*   `Accent` (Ações de destaque, Alertas secundários): #EA580C

**Mapeamento de Cores para Badges (Status e Prioridade):**
*   🟢 **Verde (#16A34A):** Status `RESOLVIDO` e notificações de sucesso.
*   🔵 **Azul Claro (#0284C7):** Status `NOVO`.
*   🟡 **Amarelo/Laranja (#D97706):** Status `EM_ATENDIMENTO`, `AGUARDANDO_USUARIO` e Prioridade `MEDIA`.
*   🟣 **Roxo (#7E22CE):** Status `ESCALONADO` (destaca visualmente a transferência de nível técnico).
*   🔴 **Vermelho (#DC2626):** Prioridades `ALTA` e `CRITICA`, badges da flag `risco_seguranca` e erros do sistema.

## 5. Modelagem do Banco de Dados (Prisma Schema)
A geração de tabelas e relações no PostgreSQL deve respeitar as chaves primárias via UUID (Universally Unique Identifiers) para inibir varreduras de identificadores. O agente deve basear a construção do `schema.prisma` nas seguintes definições:

**Model: Usuario**
*   `id`: String (UUID, default uuid) - Chave primária.
*   `nome`: String (100) - Nome do colaborador.
*   `email`: String (150) - Único.
*   `senha_hash`: String (255) - Senha criptografada.
*   `perfil`: String (20) - Valores permitidos: 'COMUM', 'TECNICO'.
*   *Relações:* 1:N com Chamado (abre), 1:N com Interacao, 1:N com LogsAuditoria.

**Model: Chamado**
*   `id`: String (UUID, default uuid) - Identificador público seguro.
*   `id_solicitante`: String (UUID) - Foreign Key para Usuario.
*   `titulo`: String (150).
*   `descricao`: Text - Relato do incidente.
*   `categoria`: String (50) - Preenchimento da IA.
*   `prioridade`: String (20) - Preenchimento da IA.
*   `risco_seguranca`: Boolean (default false) - Sinalizador de ameaça da IA.
*   `status`: String (50) - Valores: 'NOVO', 'EM_ATENDIMENTO', 'AGUARDANDO_USUARIO', 'ESCALONADO', 'RESOLVIDO'.
*   *Relações:* 1:N com Interacao, 1:N com LogsAuditoria.

**Model: Interacao**
*   `id`: String (UUID, default uuid).
*   `id_chamado`: String (UUID) - Foreign Key para Chamado.
*   `id_autor`: String (UUID) - Foreign Key para Usuario (quem respondeu).
*   `mensagem`: Text - Conteúdo da resposta.
*   `criado_em`: DateTime (default now).

**Model: LogsAuditoria**
*   `id`: String (UUID, default uuid).
*   `id_chamado`: String (UUID) - Foreign Key para Chamado afetado.
*   `id_usuario`: String (UUID) - Foreign Key para Usuario responsável.
*   `acao`: String (100) - Ex: "Mudança de Status".
*   `detalhes`: Json (Jsonb) - Guarda o estado modificado (ex: `{ "de": "NOVO", "para": "EM_ATENDIMENTO" }`).
*   `criado_em`: DateTime (default now).