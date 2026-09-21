"use client";

import React, { useState, useMemo } from "react";
import { Chamado, StatusChamado } from "@/lib/types";
import { StatusBadge, PriorityBadge, SecurityRiskBadge, CategoryBadge } from "./ui/Badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/Card";
import { Button } from "./ui/Button";
import { ShieldAlert, Search, Filter, Clock, ChevronRight, Inbox, CalendarDays } from "lucide-react";

interface TicketListProps {
  tickets: Chamado[];
  isLoading: boolean;
  onSelectTicket: (id: string) => void;
  selectedTicketId?: string;
  isTecnico: boolean;
}

// Mapeamento de status → label padronizado (Title Case)
const STATUS_CONFIG: { key: StatusChamado | "ALL"; label: string }[] = [
  { key: "ALL", label: "Todos" },
  { key: "NOVO", label: "Novo" },
  { key: "EM_ATENDIMENTO", label: "Em Atendimento" },
  { key: "AGUARDANDO_USUARIO", label: "Aguardando Usuário" },
  { key: "ESCALONADO", label: "Escalonado" },
  { key: "RESOLVIDO", label: "Resolvido" },
];

export function TicketList({ tickets, isLoading, onSelectTicket, selectedTicketId, isTecnico }: TicketListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Contagem por status para exibir ao lado dos botões de filtro
  const countByStatus = useMemo(() => {
    const counts: Record<string, number> = { ALL: tickets.length };
    for (const t of tickets) {
      counts[t.status] = (counts[t.status] ?? 0) + 1;
    }
    return counts;
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // Filtro de texto
      const matchesSearch =
        ticket.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.solicitante.nome.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de status
      const matchesStatus = statusFilter === "ALL" || ticket.status === statusFilter;

      // Filtro de data — compara apenas a parte da data (YYYY-MM-DD)
      const ticketDate = ticket.criado_em.substring(0, 10); // "YYYY-MM-DD"
      const matchesFrom = !dateFrom || ticketDate >= dateFrom;
      const matchesTo = !dateTo || ticketDate <= dateTo;

      return matchesSearch && matchesStatus && matchesFrom && matchesTo;
    });
  }, [tickets, searchTerm, statusFilter, dateFrom, dateTo]);

  // Exibe o aviso apenas para ameaças que NÃO estão resolvidas
  const activeSecurityIncidents = tickets.filter((t) => t.risco_seguranca && t.status !== "RESOLVIDO");

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-100">
        {/* Título + badge de ameaças ativas */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <span>{isTecnico ? "Fila Global de Chamados" : "Meus Chamados"}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal">
                {filteredTickets.length} total
              </span>
            </CardTitle>
            <CardDescription className="text-xs">
              {isTecnico
                ? "Painel operacional com ordenação prioritária por ameaças cibernéticas."
                : "Acompanhe o andamento das suas solicitações de suporte em tempo real."}
            </CardDescription>
          </div>

          {/* Aviso de ameaça crítica — some quando todas as ameaças estão resolvidas */}
          {activeSecurityIncidents.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-100/80 border border-red-300 text-red-800 text-xs font-semibold">
              <ShieldAlert className="w-4 h-4 text-[#DC2626]" />
              <span>
                {activeSecurityIncidents.length}{" "}
                {activeSecurityIncidents.length === 1 ? "Ameaça Crítica" : "Ameaças Críticas"}
              </span>
            </div>
          )}
        </div>

        {/* Linha 1 de filtros: busca + filtro de data */}
        <div className="pt-3 flex flex-col sm:flex-row gap-2">
          {/* Busca por texto */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Pesquisar por título, relato ou solicitante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
            />
          </div>

          {/* Filtro por data */}
          <div className="flex items-center gap-1.5 shrink-0">
            <CalendarDays className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              title="Data inicial"
              className="h-9 px-2 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E40AF] text-slate-700 cursor-pointer"
            />
            <span className="text-xs text-slate-400">até</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              title="Data final"
              className="h-9 px-2 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E40AF] text-slate-700 cursor-pointer"
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                }}
                className="h-9 px-2 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                title="Limpar filtro de data"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Linha 2 de filtros: botões de status com contagem */}
        <div className="pt-2 flex items-center gap-1.5 overflow-x-auto pb-1">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />
          {STATUS_CONFIG.map(({ key, label }) => {
            const count = countByStatus[key] ?? 0;
            const isActive = statusFilter === key;
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isActive ? "bg-[#1E40AF] text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {label}
                {key !== "ALL" && (
                  <span
                    className={`ml-1.5 px-1 py-0.5 rounded text-[10px] font-semibold ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E40AF]" />
            Carregando chamados...
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
            <Inbox className="w-8 h-8 text-slate-300" />
            <span>Nenhum chamado encontrado com os filtros selecionados.</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTickets.map((ticket) => {
              const isSelected = ticket.id === selectedTicketId;
              const hasSecurityThreat = ticket.risco_seguranca;

              return (
                <div
                  key={ticket.id}
                  onClick={() => onSelectTicket(ticket.id)}
                  className={`p-4 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 ${
                    isSelected ? "bg-blue-50/70 border-l-4 border-[#1E40AF]" : ""
                  } ${
                    hasSecurityThreat && !isSelected && ticket.status !== "RESOLVIDO"
                      ? "border-l-4 border-l-[#DC2626] bg-red-50/20"
                      : ""
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <SecurityRiskBadge hasRisk={hasSecurityThreat} />
                      <CategoryBadge categoria={ticket.categoria} />
                      <PriorityBadge prioridade={ticket.prioridade} />
                      <StatusBadge status={ticket.status} />
                    </div>

                    <h4 className="font-semibold text-sm text-slate-900 truncate">{ticket.titulo}</h4>

                    <p className="text-xs text-slate-500 line-clamp-2">{ticket.descricao}</p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                      <span>
                        Por: <strong className="text-slate-600 font-medium">{ticket.solicitante.nome}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(ticket.criado_em).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center sm:self-center shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-[#1E40AF] hover:text-[#1D4ED8] gap-1 p-1 h-auto"
                    >
                      <span>Ver detalhes</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
