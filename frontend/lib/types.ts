export type PerfilUsuario = "COMUM" | "TECNICO";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  criado_em?: string;
}

export type StatusChamado = "NOVO" | "EM_ATENDIMENTO" | "AGUARDANDO_USUARIO" | "ESCALONADO" | "RESOLVIDO";

export type CategoriaChamado = "Hardware" | "Software" | "Rede" | "Seguranca";
export type PrioridadeChamado = "Baixa" | "Media" | "Alta" | "Critica";

export interface Interacao {
  id: string;
  id_chamado: string;
  id_autor: string;
  mensagem: string;
  criado_em: string;
  autor: {
    id: string;
    nome: string;
    email: string;
    perfil: PerfilUsuario;
  };
}

export interface LogAuditoria {
  id: string;
  id_chamado: string;
  id_usuario: string;
  acao: string;
  detalhes: Record<string, any>;
  criado_em: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    perfil: PerfilUsuario;
  };
}

export interface Chamado {
  id: string;
  id_solicitante: string;
  titulo: string;
  descricao: string;
  categoria: CategoriaChamado;
  prioridade: PrioridadeChamado;
  risco_seguranca: boolean;
  status: StatusChamado;
  criado_em: string;
  atualizado_em: string;
  solicitante: {
    id: string;
    nome: string;
    email: string;
    perfil: PerfilUsuario;
  };
  interacoes?: Interacao[];
  logs_auditoria?: LogAuditoria[];
}
