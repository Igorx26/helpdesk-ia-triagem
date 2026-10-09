"use client";

import { useState } from "react";
import type { Chamado, StatusChamado } from "@/lib/types";
import { StatusBadge, PriorityBadge, SecurityRiskBadge, CategoryBadge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Textarea } from "./ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/Card";
import {
  X,
  Clock,
  User,
  ShieldAlert,
  Send,
  History,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Lock,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TicketDetailModalProps {
  ticket: Chamado;
  onClose: () => void;
  isTecnico: boolean;
  onUpdateStatus: (id: string, status: StatusChamado) => Promise<void | Chamado>;
  onAddInteraction: (id: string, mensagem: string) => Promise<void>;
}

const STATUS_LIST: { key: StatusChamado; label: string }[] = [
  { key: "NOVO", label: "Novo" },
  { key: "EM_ATENDIMENTO", label: "Em Atendimento" },
  { key: "AGUARDANDO_USUARIO", label: "Aguardando Usuário" },
  { key: "ESCALONADO", label: "Escalonado" },
  { key: "RESOLVIDO", label: "Resolvido" },
];

export function TicketDetailModal({
  ticket,
  onClose,
  isTecnico,
  onUpdateStatus,
  onAddInteraction,
}: TicketDetailModalProps) {
  const [novaMensagem, setNovaMensagem] = useState<string>("");
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);
  const [pendingStatus, setPendingStatus] = useState<StatusChamado | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "auditoria">("chat");

  const handleStatusChange = async (newStatus: StatusChamado): Promise<void> => {
    if (newStatus === ticket.status || pendingStatus !== null) return;
    setPendingStatus(newStatus);
    try {
      await onUpdateStatus(ticket.id, newStatus);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao mudar status";
      alert(message);
    } finally {
      setPendingStatus(null);
    }
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!novaMensagem.trim()) return;
    setIsSendingMessage(true);
    try {
      await onAddInteraction(ticket.id, novaMensagem);
      setNovaMensagem("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao enviar mensagem";
      alert(message);
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-4xl min-w-0 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden sm:my-8 max-h-[95dvh] sm:max-h-[90vh] flex flex-col">
        <div className="shrink-0 p-4 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-start justify-between gap-3 sm:gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-slate-400 font-bold">#{ticket.id.substring(0, 8)}</span>
              <SecurityRiskBadge hasRisk={ticket.risco_seguranca} />
              <CategoryBadge categoria={ticket.categoria} />
              <PriorityBadge prioridade={ticket.prioridade} />
              <StatusBadge status={ticket.status} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight break-words">{ticket.titulo}</h2>
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1 sm:gap-x-4 sm:gap-y-1 text-xs text-slate-500">
              <span className="flex items-start sm:items-center gap-1.5 min-w-0 break-words break-all">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5 sm:mt-0" />
                Solicitante: <strong className="truncate max-w-[120px] sm:max-w-none">{ticket.solicitante.nome}</strong> <span className="break-all">({ticket.solicitante.email})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                Aberto em: {new Date(ticket.criado_em).toLocaleString("pt-BR")}
              </span>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fechar modal" className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4 sm:space-y-6">
          {ticket.risco_seguranca && (
            <div className="p-3 sm:p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-[#DC2626] shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <h4 className="font-bold text-sm text-[#DC2626]">Alerta Crítico de Segurança da Informação</h4>
                <p>A Inteligência Artificial identificou indícios de ataque cibernético (como phishing, vazamento de credenciais ou link malicioso) na descrição deste chamado.</p>
                <p className="font-semibold text-red-800">Prioridade escalada para MÁXIMA automaticamente pelo sistema de triagem.</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Relato Original do Incidente</h4>
            <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed break-words break-all">{ticket.descricao}</div>
          </div>

          {isTecnico && (
            <div className="p-3 sm:p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                  Painel Operacional do Técnico (Transição de Status)
                </span>
                <span className="text-[11px] text-blue-800">Todas as mudanças gravam log imutável de auditoria</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {STATUS_LIST.map((st) => {
                  const isCurrent = ticket.status === st.key;
                  const isPending = pendingStatus === st.key;
                  const isLocked = pendingStatus !== null;
                  return (
                    <button
                      key={st.key}
                      type="button"
                      onClick={() => void handleStatusChange(st.key)}
                      disabled={isLocked || isCurrent}
                      aria-busy={isPending}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-100 active:scale-95",
                        isCurrent
                          ? "bg-[#1E40AF] text-white shadow-xs cursor-default ring-2 ring-blue-400/30"
                          : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400",
                        isPending && "border-[#1E40AF] text-[#1E40AF] bg-blue-50",
                        isLocked && !isPending && !isCurrent && "opacity-50",
                        (isLocked || isCurrent) && "cursor-not-allowed active:scale-100",
                        isCurrent && "cursor-default"
                      )}
                    >
                      {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
                      {st.label} {isCurrent && "✓"}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex border-b border-slate-200 gap-4 sm:gap-6 overflow-x-auto scrollbar-hide">
              <button onClick={() => setActiveTab("chat")} className={`shrink-0 whitespace-nowrap pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${activeTab === "chat" ? "border-[#1E40AF] text-[#1E40AF]" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
                <MessageSquare className="w-4 h-4" />
                Interações e Atendimento ({ticket.interacoes?.length ?? 0})
              </button>
              <button onClick={() => setActiveTab("auditoria")} className={`shrink-0 whitespace-nowrap pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${activeTab === "auditoria" ? "border-[#1E40AF] text-[#1E40AF]" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
                <History className="w-4 h-4" />
                Trilha de Auditoria ({ticket.logs_auditoria?.length ?? 0})
              </button>
            </div>

            {activeTab === "chat" && (
              <div className="space-y-4">
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {!ticket.interacoes || ticket.interacoes.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">Nenhuma resposta ou interação registrada ainda neste chamado.</p>
                  ) : (
                    ticket.interacoes.map((interacao) => {
                      const isAuthorTecnico = interacao.autor.perfil === "TECNICO" || interacao.autor.perfil === "ADMIN";
                      return (
                        <div key={interacao.id} className={`p-3 sm:p-3.5 rounded-xl border text-xs space-y-1 ${isAuthorTecnico ? "bg-blue-50/50 border-blue-200 text-blue-950" : "bg-slate-50 border-slate-200 text-slate-800"}`}>
                          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 font-semibold">
                            <span className="flex items-center gap-1.5 min-w-0">
                              <span className="truncate">{interacao.autor.nome}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isAuthorTecnico ? "bg-blue-200/60 text-blue-800" : "bg-slate-200 text-slate-700"}`}>{interacao.autor.perfil}</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">{new Date(interacao.criado_em).toLocaleString("pt-BR")}</span>
                          </div>
                          <p className="text-xs leading-relaxed whitespace-pre-wrap break-words break-all">{interacao.mensagem}</p>
                        </div>
                      );
                    })
                  )}
                </div>
                {ticket.status === "RESOLVIDO" ? (
                  <div className="p-3 sm:p-4 rounded-xl bg-slate-100/80 border border-slate-200 text-slate-600 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                      <Lock className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="text-xs space-y-0.5">
                      <p className="font-semibold text-slate-800 flex flex-wrap items-center gap-1.5">
                        <span>Chamado Encerrado</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 font-medium">Resolvido</span>
                      </p>
                      <p className="text-slate-500 text-[11px] leading-relaxed">Este ticket foi concluído com sucesso e tornou-se imutável. Novas mensagens e alterações estão bloqueadas para preservação da auditoria.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="space-y-2 pt-2">
                    <Textarea placeholder="Escreva uma resposta ou atualização sobre este chamado..." rows={2} value={novaMensagem} onChange={(e) => setNovaMensagem(e.target.value)} disabled={isSendingMessage} />
                    <div className="flex justify-end">
                      <Button type="submit" size="sm" variant="primary" isLoading={isSendingMessage} disabled={!novaMensagem.trim()} className="w-full sm:w-auto gap-1.5">
                        <Send className="w-3.5 h-3.5" />
                        Enviar Resposta
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {activeTab === "auditoria" && (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {!ticket.logs_auditoria || ticket.logs_auditoria.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Nenhum registro de auditoria disponível.</p>
                ) : (
                  ticket.logs_auditoria.map((log) => (
                    <div key={log.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 text-xs space-y-1.5">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 font-semibold text-slate-700">
                        <span className="flex flex-wrap items-center gap-1.5 min-w-0">
                          <span className="shrink-0 w-2 h-2 rounded-full bg-[#1E40AF]" />
                          {log.acao} por <strong>{log.usuario.nome}</strong> ({log.usuario.perfil})
                        </span>
                        <span className="text-[11px] text-slate-400 font-normal">{new Date(log.criado_em).toLocaleString("pt-BR")}</span>
                      </div>
                      <div className="text-slate-600 bg-white p-2 rounded border border-slate-200/80 font-mono text-[11px]">
                        {log.detalhes?.de && log.detalhes?.para ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <span>De: <strong className="text-slate-800">{String(log.detalhes.de)}</strong></span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span>Para: <strong className="text-[#1E40AF]">{String(log.detalhes.para)}</strong></span>
                          </div>
                        ) : (
                          <pre className="overflow-x-auto">{JSON.stringify(log.detalhes, null, 2)}</pre>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </div>
  );
}