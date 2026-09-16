"use client";

import React, { useState } from "react";
import { Chamado, StatusChamado } from "@/lib/types";
import { StatusBadge, PriorityBadge, SecurityRiskBadge, CategoryBadge } from "./ui/Badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/Card";
import { Button } from "./ui/Button";
import { ShieldAlert, Search, Filter, Clock, ChevronRight, Inbox } from "lucide-react";

interface TicketListProps {
  tickets: Chamado[];
  isLoading: boolean;
  onSelectTicket: (id: string) => void;
  selectedTicketId?: string;
  isTecnico: boolean;
}

export function TicketList({ tickets, isLoading, onSelectTicket, selectedTicketId, isTecnico }: TicketListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.solicitante.nome.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const securityIncidentsCount = tickets.filter((t) => t.risco_seguranca).length;

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-100">
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

          {securityIncidentsCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-100/80 border border-red-300 text-red-800 text-xs font-semibold">
              <ShieldAlert className="w-4 h-4 text-[#DC2626]" />
              <span>
                {securityIncidentsCount} {securityIncidentsCount === 1 ? "Ameaça Crítica" : "Ameaças Críticas"}
              </span>
            </div>
          )}
        </div>

        {/* Filters and search */}
        <div className="pt-3 flex flex-col sm:flex-row gap-2">
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

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />
            {(["ALL", "NOVO", "EM_ATENDIMENTO", "AGUARDANDO_USUARIO", "ESCALONADO", "RESOLVIDO"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === st ? "bg-[#1E40AF] text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {st === "ALL" ? "Todos" : st.replace("_", " ")}
              </button>
            ))}
          </div>
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
                  } ${hasSecurityThreat && !isSelected ? "border-l-4 border-l-[#DC2626] bg-red-50/20" : ""}`}
                >
                  {/* Main Ticket Info */}
                  <div className="space-y-1.5 flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Security Risk Flag Highlight Column */}
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

                  {/* Actions / Details Arrow */}
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
