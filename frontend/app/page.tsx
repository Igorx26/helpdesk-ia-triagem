"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTickets } from "@/hooks/useTickets";
import { Navbar } from "@/components/Navbar";
import { LoginForm } from "@/components/LoginForm";
import { TicketCreateForm } from "@/components/TicketCreateForm";
import { TicketList } from "@/components/TicketList";
import { TicketDetailModal } from "@/components/TicketDetailModal";
import type { PerfilUsuario } from "@/lib/types";
import { Shield, PlusCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

// --- Constantes --------------------------------------------------------------

/** Perfis com acesso privilegiado à visão técnica global de chamados. */
const PERFIS_PRIVILEGIADOS: ReadonlySet<PerfilUsuario> = new Set(["TECNICO", "ADMIN"]);

// --- Componente --------------------------------------------------------------

export default function HomePage() {
  const { user, isLoading: authLoading } = useAuth();
  const {
    tickets,
    selectedTicket,
    setSelectedTicket,
    isLoading: ticketsLoading,
    isSubmitting,
    fetchTickets,
    selectTicket,
    createTicket,
    updateStatus,
    addInteraction,
  } = useTickets();

  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);

  // --- Estado de carregamento da sessão ---
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#1E40AF] border-t-transparent animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Carregando Helpdesk...</span>
        </div>
      </div>
    );
  }

  // --- Usuário não autenticado: exibe tela de login ---
  if (!user) {
    return <LoginForm />;
  }

  const isTecnico: boolean = PERFIS_PRIVILEGIADOS.has(user.perfil);

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Barra de controle superior */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>{isTecnico ? "Console Operacional de Suporte" : "Portal do Colaborador"}</span>
              {isTecnico && (
                <span className="text-xs px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 font-medium border border-purple-200">
                  Visão Técnica Global
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500">
              {isTecnico
                ? "Monitore e altere o ciclo de vida dos chamados com registro de auditoria."
                : "Abra incidentes com triagem automática de inteligência artificial."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTickets}
              disabled={ticketsLoading}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${ticketsLoading ? "animate-spin" : ""}`} />
              Atualizar Fila
            </Button>

            <Button
              variant={showCreateForm ? "outline" : "accent"}
              size="sm"
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="gap-1.5 text-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              {showCreateForm ? "Ocultar Formulário" : "Novo Chamado"}
            </Button>
          </div>
        </div>

        {/* Layout empilhado verticalmente */}
        <div className="flex flex-col gap-6">
          {/* Formulário de criação */}
          {showCreateForm && (
            <div className="w-full max-w-4xl mx-auto">
              <TicketCreateForm
                onSubmitTicket={createTicket}
                isSubmitting={isSubmitting}
                onTicketCreated={() => {
                  fetchTickets();
                  setShowCreateForm(false);
                }}
              />
            </div>
          )}

          {/* Fila de chamados */}
          <div className="w-full">
            <TicketList
              tickets={tickets}
              isLoading={ticketsLoading}
              onSelectTicket={selectTicket}
              selectedTicketId={selectedTicket?.id}
              isTecnico={isTecnico}
            />
          </div>
        </div>
      </main>

      {/* Modal de detalhes e interações do chamado */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          isTecnico={isTecnico}
          onClose={() => setSelectedTicket(null)}
          onUpdateStatus={updateStatus}
          onAddInteraction={addInteraction}
        />
      )}
    </div>
  );
}