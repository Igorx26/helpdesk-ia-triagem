/**
 * Script de teste manual para o AiService com retry automático.
 * Executa: node --env-file=.env src/ai/test-ai.mjs
 */

import {
  GoogleGenerativeAI,
  SchemaType,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY não configurada no .env');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: 'gemini-3.5-flash-lite',
  generationConfig: {
    responseMimeType: 'application/json',
    responseSchema: {
      type: SchemaType.OBJECT,
      properties: {
        categoria: {
          type: SchemaType.STRING,
          format: 'enum',
          enum: ['Hardware', 'Software', 'Rede', 'Seguranca'],
        },
        prioridade: {
          type: SchemaType.STRING,
          format: 'enum',
          enum: ['Baixa', 'Media', 'Alta', 'Critica'],
        },
        risco_seguranca: { type: SchemaType.BOOLEAN },
      },
      required: ['categoria', 'prioridade', 'risco_seguranca'],
    },
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
  ],
});

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function testar(titulo, descricao, esperado, tentativas = 3) {
  console.log(`\n📋 Testando: "${titulo}"`);
  for (let i = 1; i <= tentativas; i++) {
    try {
      const result = await model.generateContent(
        `Analise o chamado de TI:\nTítulo: ${titulo}\nDescrição: ${descricao}\nRetorne JSON com categoria, prioridade e risco_seguranca.`,
      );
      const parsed = JSON.parse(result.response.text());
      console.log('   Resultado:', JSON.stringify(parsed));
      const ok =
        parsed.categoria === esperado.categoria &&
        parsed.prioridade === esperado.prioridade &&
        parsed.risco_seguranca === esperado.risco_seguranca;
      console.log(
        ok
          ? '   ✅ PASSOU'
          : `   ⚠️  Diferente do esperado: ${JSON.stringify(esperado)}`,
      );
      return parsed;
    } catch (err) {
      if (i < tentativas && err.status === 503) {
        console.log(
          `   ⏳ 503 - aguardando 3s antes da tentativa ${i + 1}/${tentativas}...`,
        );
        await sleep(3000);
      } else {
        throw err;
      }
    }
  }
}

console.log('🧪 Iniciando testes do AiService (gemini-3.5-flash)\n');

await testar(
  'Monitor não liga',
  'O monitor da minha estação de trabalho não liga mais. Já verifiquei o cabo e a tomada, ambos funcionam.',
  { categoria: 'Hardware', prioridade: 'Media', risco_seguranca: false },
);

await sleep(2000);

await testar(
  'Phishing recebido por e-mail',
  'Recebi um e-mail suspeito pedindo minha senha e número do cartão. O link parece falso e já cliquei nele. Pode ser um ataque de phishing.',
  { categoria: 'Seguranca', prioridade: 'Critica', risco_seguranca: true },
);

await sleep(2000);

await testar(
  'VPN não conecta',
  'Não consigo me conectar à VPN da empresa desde ontem. Outros colegas também estão com o mesmo problema.',
  { categoria: 'Rede', prioridade: 'Alta', risco_seguranca: false },
);

console.log('\n✅ Todos os testes concluídos.');
