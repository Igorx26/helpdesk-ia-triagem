export type CategoriaIA = 'Hardware' | 'Software' | 'Rede' | 'Seguranca';
export type PrioridadeIA = 'Baixa' | 'Media' | 'Alta' | 'Critica';

/**
 * Formato JSON estrito retornado pela IA, conforme definido no TECH_SPEC.md seção 3.
 */
export interface AiAnalysisResult {
  categoria: CategoriaIA;
  prioridade: PrioridadeIA;
  risco_seguranca: boolean;
}
