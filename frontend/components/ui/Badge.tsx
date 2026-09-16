import React from "react";
import { cn } from "@/lib/utils";
import { StatusChamado, PrioridadeChamado } from "@/lib/types";
import { ShieldAlert, ShieldCheck } from "lucide-react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "status" | "prioridade" | "risco" | "categoria" | "perfil";
  value?: string;
}

export function StatusBadge({ status }: { status: StatusChamado }) {
  const configs: Record<StatusChamado, { label: string; bg: string; text: string; border: string }> = {
    NOVO: {
      label: "Novo",
      bg: "bg-[#0284C7]/10",
      text: "text-[#0284C7]",
      border: "border-[#0284C7]/30",
    },
    EM_ATENDIMENTO: {
      label: "Em Atendimento",
      bg: "bg-[#D97706]/10",
      text: "text-[#D97706]",
      border: "border-[#D97706]/30",
    },
    AGUARDANDO_USUARIO: {
      label: "Aguardando Usuário",
      bg: "bg-[#D97706]/10",
      text: "text-[#D97706]",
      border: "border-[#D97706]/30",
    },
    ESCALONADO: {
      label: "Escalonado",
      bg: "bg-[#7E22CE]/10",
      text: "text-[#7E22CE]",
      border: "border-[#7E22CE]/30",
    },
    RESOLVIDO: {
      label: "Resolvido",
      bg: "bg-[#16A34A]/10",
      text: "text-[#16A34A]",
      border: "border-[#16A34A]/30",
    },
  };

  const cfg = configs[status] || configs.NOVO;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors",
        cfg.bg,
        cfg.text,
        cfg.border,
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", cfg.text.replace("text-", "bg-"))} />
      {cfg.label}
    </span>
  );
}

export function PriorityBadge({ prioridade }: { prioridade: PrioridadeChamado }) {
  const configs: Record<PrioridadeChamado, { label: string; bg: string; text: string; border: string }> = {
    Baixa: {
      label: "Baixa",
      bg: "bg-slate-200/60",
      text: "text-slate-700",
      border: "border-slate-300",
    },
    Media: {
      label: "Média",
      bg: "bg-[#D97706]/10",
      text: "text-[#D97706]",
      border: "border-[#D97706]/30",
    },
    Alta: {
      label: "Alta",
      bg: "bg-[#DC2626]/10",
      text: "text-[#DC2626]",
      border: "border-[#DC2626]/30",
    },
    Critica: {
      label: "Crítica",
      bg: "bg-[#DC2626]/20",
      text: "text-[#DC2626]",
      border: "border-[#DC2626]/40 font-bold",
    },
  };

  const cfg = configs[prioridade] || configs.Media;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border",
        cfg.bg,
        cfg.text,
        cfg.border,
      )}
    >
      {cfg.label}
    </span>
  );
}

export function SecurityRiskBadge({ hasRisk }: { hasRisk: boolean }) {
  if (hasRisk) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#DC2626] text-white shadow-sm animate-pulse">
        <ShieldAlert className="w-3.5 h-3.5" />
        Ameaça de Segurança
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-normal text-slate-500 bg-slate-100 border border-slate-200">
      <ShieldCheck className="w-3 h-3 text-slate-400" />
      Normal
    </span>
  );
}

export function CategoryBadge({ categoria }: { categoria: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
      {categoria}
    </span>
  );
}
