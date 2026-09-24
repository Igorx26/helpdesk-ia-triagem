import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
  SchemaType,
} from '@google/generative-ai';
import type {
  AiAnalysisResult,
  CategoriaIA,
  PrioridadeIA,
} from './interfaces/ai-analysis.interface.js';

/**
 * Categorias e prioridades válidas conforme TECH_SPEC.md seção 3.
 * Usadas para validar e sanitizar o output da IA antes de persistir.
 */
const CATEGORIAS_VALIDAS: CategoriaIA[] = [
  'Hardware',
  'Software',
  'Rede',
  'Seguranca',
];
const PRIORIDADES_VALIDAS: PrioridadeIA[] = [
  'Baixa',
  'Media',
  'Alta',
  'Critica',
];

/**
 * Termos que ativam automaticamente o Protocolo de Incidente Crítico (PRD seção 3).
 * A IA já identifica esses padrões, mas esta lista serve como camada adicional de segurança.
 */
const PALAVRAS_CHAVE_SEGURANCA = [
  // Malware e Ransomware
  'ransomware',
  'malware',
  'vírus',
  'virus',
  'trojan',
  'cavalo de troia',
  'spyware',
  'criptografado',
  '.locked',
  'sequestro de dados',
  'resgate',
  'bitcoin',

  // Engenharia Social e Phishing
  'phishing',
  'golpe',
  'engenharia social',
  'link malicioso',
  'link suspeito',
  'email falso',
  'e-mail falso',
  'pediu minha senha',
  'pedindo senha',
  'solicitou senha',

  // Acessos e Credenciais Comprometidas
  'vazamento',
  'vazaram',
  'senha comprometida',
  'senha exposta',
  'credencial vazada',
  'acesso não autorizado',
  'acesso nao autorizado',
  'acesso indevido',
  'login desconhecido',
  'invasão',
  'invasao',
  'invadido',
  'hack',
  'hacker',
  'hackeado',
  'logaram na minha conta',

  // Vulnerabilidades e Ataques de Infraestrutura
  'ataque',
  'exploit',
  'vulnerabilidade',
  'brecha de segurança',
  'ddos',
  'backdoor',
  'banco de dados exposto',
  'dados sensíveis',
  'lgpd',
];

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly genAI: GoogleGenerativeAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY') ?? '';
    if (!apiKey) {
      this.logger.warn(
        '⚠️  GEMINI_API_KEY não configurada. O AiService usará o fallback de segurança.',
      );
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Analisa a descrição de um chamado de TI e retorna categoria, prioridade e flag de risco.
   * Implementa o "Processamento Obrigatório de IA (NLP)" e o "Protocolo de Incidente Crítico"
   * definidos no PRD.md seção 3.
   */
  async analisarChamado(
    titulo: string,
    descricao: string,
  ): Promise<AiAnalysisResult> {
    // Fila de modelos: tenta o principal primeiro, depois os de backup em caso de 503
    const MODELOS_TENTATIVA = [
      'gemini-3.8-flash',
      'gemini-3.7-flash',
      'gemini-3.5-flash-lite',
    ];

    const prompt = this.buildPrompt(titulo, descricao);

    for (const modelName of MODELOS_TENTATIVA) {
      try {
        this.logger.debug(`Tentando análise de IA com o modelo: ${modelName}`);

        const model = this.genAI.getGenerativeModel({
          model: modelName,
          // Structured output: força retorno exclusivamente no formato JSON estrito
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: SchemaType.OBJECT,
              properties: {
                categoria: {
                  type: SchemaType.STRING,
                  format: 'enum',
                  enum: ['Hardware', 'Software', 'Rede', 'Seguranca'],
                  description:
                    'Categoria técnica do chamado de TI. Use "Seguranca" para ameaças cibernéticas.',
                },
                prioridade: {
                  type: SchemaType.STRING,
                  format: 'enum',
                  enum: ['Baixa', 'Media', 'Alta', 'Critica'],
                  description:
                    'Nível de urgência: Baixa (informacional), Media (impacto parcial), Alta (impacto significativo), Critica (ameaça de segurança ou sistema totalmente inoperante).',
                },
                risco_seguranca: {
                  type: SchemaType.BOOLEAN,
                  description:
                    'true APENAS se identificar padrões de phishing, ransomware, malware, links maliciosos, senhas comprometidas, acessos não autorizados ou qualquer ameaça cibernética.',
                },
              },
              required: ['categoria', 'prioridade', 'risco_seguranca'],
            },
          },
          // Configurações de segurança - permite análise de conteúdo relacionado a ataques
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
          ],
        });

        const requestPromise = model.generateContent(prompt);

        // Cria um cronômetro fatal de 8 segundos
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(`Timeout de 15s estourado no modelo ${modelName}`),
              ),
            15000,
          ),
        );

        // O Node.js executa ambas simultaneamente. A que terminar primeiro (a resposta ou o cronômetro) vence.
        const result = (await Promise.race([
          requestPromise,
          timeoutPromise,
        ])) as any;
        const rawText = result.response.text();

        this.logger.debug(`Resposta bruta da IA (${modelName}): ${rawText}`);

        const parsed = JSON.parse(rawText) as Partial<AiAnalysisResult>;
        return this.validarEAplicarProtocoloCritico(parsed, descricao);
      } catch (error) {
        this.logger.warn(
          `Falha na análise com ${modelName}: ${error instanceof Error ? error.message : String(error)}`,
        );
        // O loop continua para o próximo modelo do array
      }
    }

    // Fallback seguro: acionado apenas se TODOS os modelos do array falharem
    this.logger.error(
      `Todos os modelos de IA falharam. Acionando fallback de segurança para o chamado: "${titulo}"`,
    );
    return this.fallbackSeguro(titulo, descricao);
  }

  /**
   * Constrói o prompt de análise com instruções claras para o modelo.
   */
  private buildPrompt(titulo: string, descricao: string): string {
    return `
Você é um sistema especialista em triagem de chamados de suporte técnico de TI.
Analise o chamado abaixo e classifique-o com precisão.

## CHAMADO
**Título:** ${titulo}
**Descrição:** ${descricao}

## INSTRUÇÕES DE CLASSIFICAÇÃO

### CATEGORIA (escolha exatamente uma):
- **Hardware**: Problemas físicos (computador, impressora, monitor, teclado, mouse, HD, memória RAM, nobreak)
- **Software**: Problemas com programas, sistemas operacionais, drivers, atualizações, erros de aplicativos, licenças
- **Rede**: Problemas de conectividade, internet, VPN, Wi-Fi, rede interna, DNS, firewall de rede
- **Seguranca**: Ameaças cibernéticas, phishing, ransomware, malware, vírus, acessos suspeitos, senhas comprometidas, links maliciosos, violações de dados

### PRIORIDADE (escolha exatamente uma):
- **Critica**: Sistema crítico completamente inoperante, ameaça de segurança ativa, perda de dados em andamento, ataque em curso
- **Alta**: Impacto significativo na produtividade, múltiplos usuários afetados, risco de perda de dados
- **Media**: Impacto parcial, existe alternativa de trabalho, afeta um único usuário com impacto moderado
- **Baixa**: Informacional, melhoria, dúvida, problema cosmético, impacto mínimo

### PROTOCOLO DE INCIDENTE CRÍTICO:
Se identificar QUALQUER sinal de ameaça cibernética (phishing, ransomware, malware, vírus, acesso não autorizado, senhas comprometidas, links suspeitos, criptografia de arquivos por terceiros):
- **OBRIGATÓRIO**: categoria = "Seguranca", prioridade = "Critica", risco_seguranca = true

Retorne APENAS o JSON com os campos: categoria, prioridade, risco_seguranca.
`.trim();
  }

  /**
   * Valida o output da IA contra os valores permitidos e aplica o Protocolo de Incidente Crítico
   * como camada de segurança adicional (PRD.md seção 3 - "regra inegociável").
   */
  private validarEAplicarProtocoloCritico(
    parsed: Partial<AiAnalysisResult>,
    descricao: string,
  ): AiAnalysisResult {
    const categoria: CategoriaIA = CATEGORIAS_VALIDAS.includes(
      parsed.categoria as CategoriaIA,
    )
      ? (parsed.categoria as CategoriaIA)
      : 'Software'; // fallback padrão

    let prioridade: PrioridadeIA = PRIORIDADES_VALIDAS.includes(
      parsed.prioridade as PrioridadeIA,
    )
      ? (parsed.prioridade as PrioridadeIA)
      : 'Media';

    let risco_seguranca: boolean = parsed.risco_seguranca === true;

    // Protocolo de Incidente Crítico — camada defensiva adicional
    // Se a descrição contém palavras-chave de segurança, garante a sobreescrita
    const descricaoLower = descricao.toLowerCase();
    const contemRiscoSeguranca = PALAVRAS_CHAVE_SEGURANCA.some((kw) =>
      descricaoLower.includes(kw),
    );

    if (risco_seguranca || contemRiscoSeguranca) {
      risco_seguranca = true;
      prioridade = 'Critica'; // "sobreescreve regras normais" conforme PRD.md
      this.logger.warn(
        `⚠️  PROTOCOLO DE INCIDENTE CRÍTICO ATIVADO — risco de segurança detectado`,
      );
    }

    return { categoria, prioridade, risco_seguranca };
  }

  /**
   * Retorno seguro em caso de falha total da API de IA.
   * Garante que o chamado seja criado mesmo sem resposta da IA,
   * com prioridade Alta para garantir atenção humana.
   */
  private fallbackSeguro(titulo: string, descricao: string): AiAnalysisResult {
    this.logger.warn(
      `Usando fallback de segurança para o chamado: "${titulo}"`,
    );

    // Mesmo no fallback, aplica a detecção de palavras-chave de segurança
    const descricaoLower = (titulo + ' ' + descricao).toLowerCase();
    const contemRisco = PALAVRAS_CHAVE_SEGURANCA.some((kw) =>
      descricaoLower.includes(kw),
    );

    if (contemRisco) {
      return {
        categoria: 'Seguranca',
        prioridade: 'Critica',
        risco_seguranca: true,
      };
    }

    return {
      categoria: 'Software',
      prioridade: 'Alta',
      risco_seguranca: false,
    };
  }
}
