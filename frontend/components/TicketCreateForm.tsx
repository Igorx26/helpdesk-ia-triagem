"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input, Textarea } from "./ui/Input";
import { Sparkles, ShieldAlert, Send, CheckCircle2 } from "lucide-react";
import { Chamado } from "@/lib/types";

interface TicketCreateFormProps {
  onTicketCreated: (ticket: Chamado) => void;
  isSubmitting: boolean;
  onSubmitTicket: (titulo: string, descricao: string) => Promise<Chamado>;
}

export function TicketCreateForm({ onTicketCreated, isSubmitting, onSubmitTicket }: TicketCreateFormProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [lastCreated, setLastCreated] = useState<Chamado | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !descricao.trim()) return;

    setErrorMessage(null);
    try {
      const ticket = await onSubmitTicket(titulo, descricao);
      setLastCreated(ticket);
      setTitulo("");
      setDescricao("");
      onTicketCreated(ticket);
    } catch (err: any) {
      setErrorMessage(err.message || "Falha ao processar abertura de chamado");
    }
  };

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-900 to-[#1E40AF] text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <CardTitle className="text-white text-base">Abrir Novo Chamado de Suporte</CardTitle>
        </div>
        <CardDescription className="text-blue-100 text-xs">
          Formulário simplificado: informe apenas o que está acontecendo. Nossa IA categoriza, prioriza e analisa riscos
          de segurança em tempo real.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        {lastCreated && (
          <div
            className={`mb-6 p-4 rounded-xl border flex items-start gap-3 transition-all ${
              lastCreated.risco_seguranca
                ? "bg-red-50 border-red-200 text-red-900"
                : "bg-emerald-50 border-emerald-200 text-emerald-900"
            }`}
          >
            {lastCreated.risco_seguranca ? (
              <ShieldAlert className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
            )}
            <div className="text-xs space-y-1">
              <p className="font-semibold text-sm">Chamado aberto com sucesso! #{lastCreated.id.substring(0, 8)}</p>
              <p>
                <strong>Triagem da IA:</strong> Categoria{" "}
                <span className="font-mono font-bold uppercase">{lastCreated.categoria}</span> | Prioridade{" "}
                <span className="font-mono font-bold uppercase">{lastCreated.prioridade}</span>
              </p>
              {lastCreated.risco_seguranca && (
                <p className="font-bold text-[#DC2626]">
                  ⚠️ Protocolo de Incidente Crítico ativado: ameaça cibernética identificada e priorizada para resposta
                  imediata.
                </p>
              )}
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">{errorMessage}</div>
        )}

        {/* Minimalist form strictly requiring ONLY Title and Description */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="ticket-title" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Título do Problema <span className="text-red-500">*</span>
            </label>
            <Input
              id="ticket-title"
              placeholder="Ex: Não consigo acessar a pasta compartilhada da contabilidade"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              disabled={isSubmitting}
              required
              maxLength={150}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="ticket-desc" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Descrição Detalhada do Ocorrido <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="ticket-desc"
              rows={4}
              placeholder="Descreva o que ocorreu, mensagens de erro que apareceram ou se recebeu algum link suspeito..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              disabled={isSubmitting}
              required
              minLength={10}
            />
            <p className="text-[11px] text-slate-400">
              Mínimo de 10 caracteres. A IA analisará o texto para direcionar ao setor correto.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Triagem com Gemini LLM ativada</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={!titulo.trim() || !descricao.trim()}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              Enviar Chamado
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
