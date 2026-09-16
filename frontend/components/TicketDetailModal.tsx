"use client";

import React, { useState } from "react";
import { Chamado, StatusChamado } from "@/lib/types";
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
  CheckCircle2,
} from "lucide-react";

interface TicketDetailModalProps {
  ticket: Chamado;
  onClose: () => void;
  isTecnico: boolean;
  onUpdateStatus: (id: string, status: StatusChamado) => Promise<any>;
  onAddInteraction: (id: string, mensagem: string) => Promise<any>;
}

export function TicketDetailModal({
  ticket,
  onClose,
  isTecnico,
  onUpdateStatus,
  onAddInteraction,
}: TicketDetailModalProps) {
  const [novaMensagem, setNovaMensagem] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "auditoria">("chat");

  const statusList: { key: StatusChamado; label: string }[] = [
    { key: "NOVO", label: "Novo" },
    { key: "EM_ATENDIMENTO", label: "Em Atendimento" },
    { key: "AGUARDANDO_USUARIO", label: "Aguardando Usuário" },
    { key: "ESCALONADO", label: "Escalonado" },
    { key: "RESOLVIDO", label: "Resolvido" },
  ];

  const handleStatusChange = async (newStatus: StatusChamado) => {
    if (newStatus === ticket.status) return;
    setIsUpdatingStatus(true);
    try {
      await onUpdateStatus(ticket.id, newStatus);
    } catch (err: any) {
      alert(err.message || "Erro ao mudar status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaMensagem.trim()) return;

    setIsSendingMessage(true);
    try {
      await onAddInteraction(ticket.id, novaMensagem);
      setNovaMensagem("");
    } catch (err: any) {
      alert(err.message || "Erro ao enviar mensagem");
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-slate-400 font-bold">#{ticket.id.substring(0, 8)}</span>
              <SecurityRiskBadge hasRisk={ticket.risco_seguranca} />
              <CategoryBadge categoria={ticket.categoria} />
              <PriorityBadge prioridade={ticket.prioridade} />
              <StatusBadge status={ticket.status} />
            </div>

            <h2 className="text-xl font-bold text-slate-900 leading-tight">{ticket.titulo}</h2>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Solicitante: <strong>{ticket.solicitante.nome}</strong> ({ticket.solicitante.email})
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Aberto em: {new Date(ticket.criado_em).toLocaleString("pt-BR")}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Security Alert Banner if Critical */}
          {ticket.risco_seguranca && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-[#DC2626] shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <h4 className="font-bold text-sm text-[#DC2626]">Alerta Crítico de Segurança da Informação</h4>
                <p>
                  A Inteligência Artificial identificou indícios de ataque cibernético (como phishing, vazamento de
                  credenciais ou link malicioso) na descrição deste chamado.
                </p>
                <p className="font-semibold text-red-800">
                  Prioridade escalada para MÁXIMA automaticamente pelo sistema de triagem.
                </p>
              </div>
            </div>
          )}

          {/* Description Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Relato Original do Incidente</h4>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
              {ticket.descricao}
            </div>
          </div>

          {/* Technical Operations Bar (Only for TECNICO) */}
          {isTecnico && (
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                  Painel Operacional do Técnico (Transição de Status)
                </span>
                <span className="text-[11px] text-blue-800">Todas as mudanças gravam log imutável de auditoria</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {statusList.map((st) => {
                  const isCurrent = ticket.status === st.key;
                  return (
                    <button
                      key={st.key}
                      onClick={() => handleStatusChange(st.key)}
                      disabled={isUpdatingStatus || isCurrent}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-[#1E40AF] text-white shadow-xs cursor-default ring-2 ring-blue-400/30"
                          : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400"
                      }`}
                    >
                      {st.label} {isCurrent && "✓"}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tabs for Interactions vs Audit Logs */}
          <div className="space-y-4">
            <div className="flex border-b border-slate-200 gap-6">
              <button
                onClick={() => setActiveTab("chat")}
                className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === "chat"
                    ? "border-[#1E40AF] text-[#1E40AF]"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Interações & Atendimento ({ticket.interacoes?.length || 0})
              </button>

              <button
                onClick={() => setActiveTab("auditoria")}
                className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === "auditoria"
                    ? "border-[#1E40AF] text-[#1E40AF]"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <History className="w-4 h-4" />
                Trilha de Auditoria ({ticket.logs_auditoria?.length || 0})
              </button>
            </div>

            {/* TAB: Interactions (Chat) */}
            {activeTab === "chat" && (
              <div className="space-y-4">
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {!ticket.interacoes || ticket.interacoes.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">
                      Nenhuma resposta ou interação registrada ainda neste chamado.
                    </p>
                  ) : (
                    ticket.interacoes.map((interacao) => {
                      const isAuthorTecnico = interacao.autor.perfil === "TECNICO";

                      return (
                        <div
                          key={interacao.id}
                          className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                            isAuthorTecnico
                              ? "bg-blue-50/50 border-blue-200 text-blue-950"
                              : "bg-slate-50 border-slate-200 text-slate-800"
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold">
                            <span className="flex items-center gap-1.5">
                              <span>{interacao.autor.nome}</span>
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                                  isAuthorTecnico ? "bg-blue-200/60 text-blue-800" : "bg-slate-200 text-slate-700"
                                }`}
                              >
                                {interacao.autor.perfil}
                              </span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {new Date(interacao.criado_em).toLocaleString("pt-BR")}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed whitespace-pre-wrap">{interacao.mensagem}</p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Add interaction form */}
                <form onSubmit={handleSendMessage} className="space-y-2 pt-2">
                  <Textarea
                    placeholder="Escreva uma resposta ou atualização sobre este chamado..."
                    rows={2}
                    value={novaMensagem}
                    onChange={(e) => setNovaMensagem(e.target.value)}
                    disabled={isSendingMessage}
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size="sm"
                      variant="primary"
                      isLoading={isSendingMessage}
                      disabled={!novaMensagem.trim()}
                      className="gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Enviar Resposta
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: Audit Logs */}
            {activeTab === "auditoria" && (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {!ticket.logs_auditoria || ticket.logs_auditoria.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Nenhum registro de auditoria disponível.</p>
                ) : (
                  ticket.logs_auditoria.map((log, idx) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#1E40AF]" />
                          {log.acao} por <strong>{log.usuario.nome}</strong> ({log.usuario.perfil})
                        </span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          {new Date(log.criado_em).toLocaleString("pt-BR")}
                        </span>
                      </div>

                      <div className="text-slate-600 bg-white p-2 rounded border border-slate-200/80 font-mono text-[11px]">
                        {log.detalhes?.de && log.detalhes?.para ? (
                          <div className="flex items-center gap-2">
                            <span>
                              De: <strong className="text-slate-800">{log.detalhes.de}</strong>
                            </span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span>
                              Para: <strong className="text-[#1E40AF]">{log.detalhes.para}</strong>
                            </span>
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

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
