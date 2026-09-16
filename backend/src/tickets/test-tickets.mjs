/**
 * Teste funcional ponta a ponta da Fase 4
 */
async function testarFase4() {
  const baseUrl = 'http://localhost:3001/api/v1';

  console.log('🚀 Iniciando testes funcionais da Fase 4 (Tickets)...\n');

  // 1. Cadastrar usuário Comum (se não existir) e Técnico
  const emailComum = `comum_${Date.now()}@helpdesk.com`;
  const resComum = await fetch(`${baseUrl}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nome: 'Usuário Comum',
      email: emailComum,
      senha: 'SenhaForte@123',
      perfil: 'COMUM',
    }),
  });
  console.log('1. Registro de usuário comum:', resComum.status);

  // Login Comum
  const loginComumRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: emailComum,
      senha: 'SenhaForte@123',
    }),
  });
  const { access_token: tokenComum } = await loginComumRes.json();
  console.log('2. Login usuário comum: OK');

  // Login Técnico (usuário criado na Fase 2)
  const loginTecnicoRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'igor@helpdesk.com',
      senha: 'Senha@123',
    }),
  });
  const { access_token: tokenTecnico } = await loginTecnicoRes.json();
  console.log('3. Login técnico: OK');

  // 4. Usuário Comum abre chamado normal
  console.log('\n4. Usuário Comum abrindo chamado de Hardware...');
  const resTicketNormal = await fetch(`${baseUrl}/tickets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenComum}`,
    },
    body: JSON.stringify({
      titulo: 'Mouse óptico parou de responder',
      descricao:
        'O mouse óptico USB parou de funcionar na minha estação. Testei em outras portas USB e não acende a luz.',
    }),
  });
  const ticketNormal = await resTicketNormal.json();
  console.log('Chamado Normal criado:');
  console.log({
    id: ticketNormal.id,
    categoria: ticketNormal.categoria,
    prioridade: ticketNormal.prioridade,
    risco_seguranca: ticketNormal.risco_seguranca,
    status: ticketNormal.status,
  });

  // 5. Usuário Comum abre chamado com risco de segurança (Phishing)
  console.log('\n5. Usuário Comum abrindo chamado crítico de Phishing...');
  const resTicketCritico = await fetch(`${baseUrl}/tickets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenComum}`,
    },
    body: JSON.stringify({
      titulo: 'Cliquei em link de e-mail suspeito de senha',
      descricao:
        'Recebi um e-mail do banco solicitando recadastramento com urgência. Cliquei no link e digitei minha senha corporativa. Suspeito de golpe e phishing.',
    }),
  });
  const ticketCritico = await resTicketCritico.json();
  console.log('Chamado Crítico criado:');
  console.log({
    id: ticketCritico.id,
    categoria: ticketCritico.categoria,
    prioridade: ticketCritico.prioridade,
    risco_seguranca: ticketCritico.risco_seguranca,
    status: ticketCritico.status,
  });

  // 6. Teste de RBAC na listagem:
  // Usuário Comum deve ver apenas os seus chamados
  const resListComum = await fetch(`${baseUrl}/tickets`, {
    headers: { Authorization: `Bearer ${tokenComum}` },
  });
  const listComum = await resListComum.json();
  console.log(
    `\n6. Usuário comum listou: ${listComum.length} chamados (deve ser 2).`,
  );

  // Técnico deve ver todos os chamados
  const resListTecnico = await fetch(`${baseUrl}/tickets`, {
    headers: { Authorization: `Bearer ${tokenTecnico}` },
  });
  const listTecnico = await resListTecnico.json();
  console.log(`7. Técnico listou: ${listTecnico.length} chamados.`);

  // 8. Teste de RBAC no PATCH de status:
  // Usuário Comum tenta mudar o status (deve retornar 403 Forbidden)
  console.log(
    '\n8. Testando bloqueio de RBAC para usuário comum alterando status...',
  );
  const resForbidden = await fetch(
    `${baseUrl}/tickets/${ticketNormal.id}/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenComum}`,
      },
      body: JSON.stringify({ status: 'EM_ATENDIMENTO' }),
    },
  );
  console.log(
    `Status retornado para Usuário Comum (esperado 403): ${resForbidden.status}`,
  );

  // 9. Técnico altera status para EM_ATENDIMENTO e depois RESOLVIDO
  console.log('\n9. Técnico alterando status com auditoria...');
  const resPatch1 = await fetch(
    `${baseUrl}/tickets/${ticketNormal.id}/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenTecnico}`,
      },
      body: JSON.stringify({ status: 'EM_ATENDIMENTO' }),
    },
  );
  console.log(`Técnico alterou para EM_ATENDIMENTO: ${resPatch1.status}`);

  const resPatch2 = await fetch(
    `${baseUrl}/tickets/${ticketNormal.id}/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenTecnico}`,
      },
      body: JSON.stringify({ status: 'RESOLVIDO' }),
    },
  );
  console.log(`Técnico alterou para RESOLVIDO: ${resPatch2.status}`);

  // 10. Técnico adiciona interação
  console.log('\n10. Técnico adicionando interação...');
  const resInteracao = await fetch(
    `${baseUrl}/tickets/${ticketNormal.id}/interactions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenTecnico}`,
      },
      body: JSON.stringify({
        mensagem:
          'Mouse substituído por um novo modelo USB. Chamado finalizado.',
      }),
    },
  );
  console.log(`Interação adicionada: ${resInteracao.status}`);

  // 11. Verificar auditoria e detalhes completos do chamado
  console.log('\n11. Verificando trilha de auditoria completa no chamado...');
  const resDetalhes = await fetch(`${baseUrl}/tickets/${ticketNormal.id}`, {
    headers: { Authorization: `Bearer ${tokenTecnico}` },
  });
  const detalhes = await resDetalhes.json();
  console.log('Status final:', detalhes.status);
  console.log('Total de logs de auditoria:', detalhes.logs_auditoria.length);
  detalhes.logs_auditoria.forEach((log, idx) => {
    console.log(
      `  Log #${idx + 1}: ${log.acao} por ${log.usuario.nome} ->`,
      JSON.stringify(log.detalhes),
    );
  });
  console.log('Total de interações:', detalhes.interacoes.length);

  console.log('\n🎉 Todos os testes da Fase 4 foram executados com sucesso!');
}

testarFase4().catch((err) => {
  console.error('Erro nos testes:', err);
  process.exit(1);
});
