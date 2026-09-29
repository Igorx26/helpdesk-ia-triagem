"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/Button";
import { Bot, LogOut, User as UserIcon, Shield, Users, Settings } from "lucide-react";
import { UserManagementModal } from "./UserManagementModal";
import { UserProfileModal } from "./UserProfileModal";
import type { PerfilUsuario } from "@/lib/types";

// --- Constantes --------------------------------------------------------------

/** Perfis com acesso ao painel de gestão de usuários. */
const PERFIS_COM_GESTAO: ReadonlySet<PerfilUsuario> = new Set(["TECNICO", "ADMIN"]);

// --- Componente --------------------------------------------------------------

export function Navbar() {
  const { user, logout } = useAuth();
  const [isManageModalOpen, setIsManageModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  if (!user) return null;

  const isAdmin: boolean = user.perfil === "ADMIN";
  const isTecnico: boolean = user.perfil === "TECNICO";
  const isComum: boolean = user.perfil === "COMUM";
  const canManageUsers: boolean = PERFIS_COM_GESTAO.has(user.perfil);

  return (
    <>
      <header className="bg-[#1E40AF] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight">Helpdesk TI</h1>
              <p className="text-xs text-blue-200">Triagem Inteligente &amp; Auditoria</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isComum && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsProfileModalOpen(true)}
                className="text-white hover:bg-white/10 hover:text-white gap-1.5"
                title="Meu Perfil"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Meu Perfil</span>
              </Button>
            )}

            {canManageUsers && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsManageModalOpen(true)}
                className="text-white hover:bg-white/10 hover:text-white gap-1.5"
                title="Gerenciar Usuários"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Gerenciar</span>
              </Button>
            )}

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs">
              {isAdmin ? (
                <Shield className="w-3.5 h-3.5 text-red-300" />
              ) : isTecnico ? (
                <Shield className="w-3.5 h-3.5 text-amber-300" />
              ) : (
                <UserIcon className="w-3.5 h-3.5 text-blue-200" />
              )}
              <span className="font-semibold">{user.nome}</span>
              <span className="opacity-60">|</span>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                  isAdmin ? "bg-red-400/20 text-red-200" : isTecnico ? "bg-amber-400/20 text-amber-200" : "bg-blue-400/20 text-blue-200"
                }`}
              >
                {user.perfil}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-white hover:bg-white/10 hover:text-white gap-1.5"
              title="Sair da sessão"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <UserManagementModal isOpen={isManageModalOpen} onClose={() => setIsManageModalOpen(false)} />
      <UserProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </>
  );
}