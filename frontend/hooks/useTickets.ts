"use client";

import { useState, useEffect, useCallback } from "react";
import type { Chamado, StatusChamado } from "@/lib/types";
import { getTicketsApi, createTicketApi, updateTicketStatusApi, addInteractionApi, getTicketByIdApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

// --- Hook --------------------------------------------------------------------

export function useTickets() {
  const { user, token } = useAuth();

  const [tickets, setTickets] = useState<Chamado[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Chamado | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Busca a lista completa de chamados
  const fetchTickets = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTicketsApi();
      setTickets(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar chamados";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Dispara fetch automaticamente quando o token/usuário ficam disponíveis
  useEffect(() => {
    if (user && token) {
      // O Promise.resolve() joga a execução para a fila de microtasks,
      // evitando o erro de "setState síncrono" dentro do effect.
      Promise.resolve().then(() => {
        void fetchTickets();
      });
    } else {
      // Também evitamos a chamada síncrona direta aqui
      Promise.resolve().then(() => {
        setTickets([]);
        setIsLoading(false);
      });
    }
  }, [user, token, fetchTickets]);

  // Carrega o detalhe completo de um chamado (com interações e logs de auditoria)
  const selectTicket = async (id: string): Promise<void> => {
    setIsLoading(true);
    try {
      const data = await getTicketByIdApi(id);
      setSelectedTicket(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar detalhes";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Cria um novo chamado e o insere no topo da lista local
  const createTicket = async (titulo: string, descricao: string): Promise<Chamado> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const novoChamado = await createTicketApi(titulo, descricao);
      setTickets((prev) => [novoChamado, ...prev]);
      return novoChamado;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao criar chamado";
      setError(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Atualiza o status de um chamado e recarrega os detalhes com auditoria
  const updateStatus = async (id: string, status: StatusChamado): Promise<Chamado> => {
    try {
      const updated = await updateTicketStatusApi(id, status);
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: updated.status } : t)));
      if (selectedTicket && selectedTicket.id === id) {
        await selectTicket(id);
      }
      return updated;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar status";
      setError(message);
      throw err;
    }
  };

  // Adiciona uma interação ao chamado e recarrega os detalhes
  const addInteraction = async (id: string, mensagem: string): Promise<void> => {
    try {
      await addInteractionApi(id, mensagem);
      if (selectedTicket && selectedTicket.id === id) {
        await selectTicket(id);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao enviar mensagem";
      setError(message);
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
