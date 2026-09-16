"use client";

import { useState, useEffect, useCallback } from "react";
import { Chamado, StatusChamado } from "@/lib/types";
import { getTicketsApi, createTicketApi, updateTicketStatusApi, addInteractionApi, getTicketByIdApi } from "@/lib/api";

export function useTickets() {
  const [tickets, setTickets] = useState<Chamado[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Chamado | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTicketsApi();
      setTickets(data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar chamados");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const selectTicket = async (id: string) => {
    setIsLoading(true);
    try {
      const data = await getTicketByIdApi(id);
      setSelectedTicket(data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar detalhes");
    } finally {
      setIsLoading(false);
    }
  };

  const createTicket = async (titulo: string, descricao: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const novoChamado = await createTicketApi(titulo, descricao);
      setTickets((prev) => [novoChamado, ...prev]);
      return novoChamado;
    } catch (err: any) {
      setError(err.message || "Erro ao criar chamado");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: StatusChamado) => {
    try {
      const updated = await updateTicketStatusApi(id, status);
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: updated.status } : t)));
      if (selectedTicket && selectedTicket.id === id) {
        // recarrega detalhes com auditoria atualizada
        await selectTicket(id);
      }
      return updated;
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar status");
      throw err;
    }
  };

  const addInteraction = async (id: string, mensagem: string) => {
    try {
      await addInteractionApi(id, mensagem);
      if (selectedTicket && selectedTicket.id === id) {
        await selectTicket(id);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao enviar mensagem");
      throw err;
    }
  };

  return {
    tickets,
    selectedTicket,
    setSelectedTicket,
    isLoading,
    isSubmitting,
    error,
    fetchTickets,
    selectTicket,
    createTicket,
    updateStatus,
    addInteraction,
  };
}
