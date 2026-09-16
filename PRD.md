# Product Requirements Document (PRD)

**Projeto:** Helpdesk de TI com Triagem Inteligente
**Autor/Grupo:** Igor Martins Silva
**Natureza:** Projeto acadêmico de desenvolvimento de software (Análise e Desenvolvimento de Sistemas).

## 1. Visão Geral e Objetivo
A plataforma é um sistema corporativo de Helpdesk projetado para agilizar a resolução de problemas de infraestrutura de TI. O objetivo principal é remover a fricção do usuário final, que não precisa categorizar tecnicamente seu problema, delegando essa função a uma Inteligência Artificial. Simultaneamente, o sistema atua como uma barreira de segurança, identificando ameaças e incidentes cibernéticos em tempo real durante a abertura do chamado.

## 2. Atores do Sistema (Perfis)
O sistema opera com Controle de Acesso Baseado em Perfis (RBAC) estrito. Existem dois atores principais:
*   **Usuário Comum:** Colaborador que relata os incidentes. Tem permissão de leitura restrita, podendo visualizar apenas o histórico e andamento dos seus próprios chamados.
*   **Técnico:** Membro da equipe de suporte/infraestrutura. Possui privilégios elevados para visualizar a fila global de chamados e alterar os estados operacionais dos tickets.

## 3. Requisitos Funcionais (Regras de Negócio Inegociáveis)
*   **Formulário Minimalista:** A interface de abertura de chamados deve exigir do colaborador exclusivamente o preenchimento de "Título" e "Descrição".
*   **Processamento Obrigatório de IA (NLP):** O sistema não permite a inserção direta de chamados na fila. Todo texto submetido passa por uma análise prévia via API de modelo de linguagem, que define a *Categoria* e a *Prioridade*.
*   **Protocolo de Incidente Crítico:** Caso a IA identifique padrões de ataques (ex: phishing, ransomware, links maliciosos ou senhas comprometidas) na descrição, o sistema deve sobreescrever regras normais, forçando a prioridade para máxima ("Crítica") e ativando uma flag de risco de segurança.
*   **Ciclo de Vida do Chamado:** O fluxo de atendimento deve transitar obrigatoriamente pelos seguintes estados granulares: NOVO, EM ATENDIMENTO, AGUARDANDO USUÁRIO, ESCALONADO e RESOLVIDO. Apenas perfis Técnicos podem mudar esses estados operacionais.
*   **Imutabilidade de Auditoria:** Todas as transições de status (quem assumiu, quando alterou, quando resolveu) devem ser registradas em uma trilha de log (auditoria) imutável, visando transparência total da operação.

## 4. Requisitos Não Funcionais (Escopo do Produto)
*   **Experiência do Usuário (UX):** A interface deve ser limpa, responsiva e de rápido carregamento, priorizando a usabilidade para usuários não técnicos.
*   **Segurança da Informação:** O backend deve atuar como um proxy seguro para as requisições de IA, garantindo que prompts e chaves de API nunca sejam expostos no frontend.