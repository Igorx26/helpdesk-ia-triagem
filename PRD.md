# Product Requirements Document (PRD)

**Projeto:** Helpdesk de TI com Triagem Inteligente
**Autor/Grupo:** Igor Martins Silva
**Natureza:** Projeto acadêmico de desenvolvimento de software (Análise e Desenvolvimento de Sistemas).

## 1. Visão Geral e Objetivo
A plataforma é um sistema corporativo de Helpdesk projetado para agilizar a resolução de problemas de infraestrutura de TI. O objetivo principal é remover a fricção do usuário final, que não precisa categorizar tecnicamente seu problema, delegando essa função a uma Inteligência Artificial. Simultaneamente, o sistema atua como uma barreira de segurança, identificando ameaças e incidentes cibernéticos em tempo real durante a abertura do chamado.

## 2. Atores do Sistema (Perfis) e Acesso Invite-Only
O sistema opera com Controle de Acesso Baseado em Perfis (RBAC) estrito e utiliza uma arquitetura **Invite-Only**, onde **não existe cadastro público** (registro aberto). Novas contas só podem ser provisionadas internamente por usuários com privilégios adequados. Existem três atores principais na matriz de privilégios:
*   **Usuário Comum:** Colaborador que relata os incidentes. Tem permissão de leitura restrita, podendo visualizar apenas o histórico e andamento dos seus próprios chamados. Não possui acesso a nenhuma ferramenta de gestão ou criação de novos perfis, podendo alterar apenas os dados (nome/senha) da sua própria conta.
*   **Técnico:** Membro da equipe de suporte/infraestrutura. Possui privilégios para visualizar a fila global de chamados, alterar os estados operacionais dos tickets e cadastrar/alterar **apenas** novas contas de perfil "Comum" no sistema.
*   **Administrador (ADMIN):** Superusuário com controle e visibilidade global sobre o sistema. Além de realizar as funções do técnico sobre a fila de chamados, é o único capaz de realizar a gestão completa de usuários: criando perfis de qualquer nível, alterando privilégios e deletando contas do sistema.

## 3. Requisitos Funcionais (Regras de Negócio Inegociáveis)
*   **Formulário Minimalista:** A interface de abertura de chamados exige do colaborador exclusivamente o preenchimento de "Título" e "Descrição". Seu layout é renderizado em coluna unificada, garantindo fácil acessibilidade.
*   **Processamento Obrigatório de IA (NLP):** O sistema não permite a inserção direta de chamados na fila sem passar pela rede neural. Todo texto submetido passa por uma análise via API do Google Gemini, que infere e cataloga a *Categoria* e a *Prioridade*.
*   **Protocolo de Incidente Crítico:** Caso a IA identifique padrões de ataques (ex: phishing, ransomware, links maliciosos ou senhas comprometidas) na descrição, o sistema sobreescreve regras normais, forçando a prioridade para máxima ("Crítica") e ativando uma flag de risco de segurança visual para a equipe operacional.
*   **Ciclo de Vida do Chamado:** O fluxo de atendimento deve transitar obrigatoriamente pelos seguintes estados granulares: NOVO, EM ATENDIMENTO, AGUARDANDO USUÁRIO, ESCALONADO e RESOLVIDO. Apenas perfis Técnicos/Admin podem alterar o ciclo de vida operacional.
*   **Imutabilidade de Auditoria:** Todas as transições de status (quem assumiu, quando alterou, quando resolveu) devem ser registradas em uma trilha de log (auditoria) imutável, visando transparência total da operação.

## 4. Requisitos Não Funcionais (Escopo do Produto)
*   **Experiência do Usuário (UX):** A interface deve ser limpa, responsiva e de rápido carregamento, priorizando a usabilidade para usuários não técnicos e com feedbacks claros em casos de falhas de autenticação. Elementos de desenvolvimento são dinamicamente ocultados em ambiente de produção (variavéis de ambiente).
*   **Segurança da Informação (Rate Limiting e Defesa de API):** O sistema exige autenticação robusta para ações gerenciais. O backend aplica limites estritos de requisição (ex: máximo de 5 chamados por hora/IP) e atua como um proxy seguro, garantindo que prompts da inteligência e chaves de API nunca alcancem o frontend.
