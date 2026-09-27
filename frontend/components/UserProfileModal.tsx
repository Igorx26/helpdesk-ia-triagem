"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateMeApi } from "@/lib/api";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { X, User } from "lucide-react";

export function UserProfileModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, login } = useAuth(); // We might need to refetch user or update context, but refreshing page is easier, or context reload.
  
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setNome(user.nome);
      setEmail(user.email);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      const payload: any = { nome, email };
      if (senha) payload.senha = senha;
      
      await updateMeApi(payload);
      setMessage({ text: "Perfil atualizado com sucesso! Faça login novamente se alterou a senha.", type: "success" });
      setSenha("");
    } catch (error: any) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-[#1E40AF]" />
              Meu Perfil
            </h2>
            <p className="text-xs text-slate-500">Altere seus dados pessoais</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {message.text && (
            <div className={`p-3 mb-4 rounded text-sm font-medium ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nome</label>
              <Input required value={nome} onChange={(e) => setNome(e.target.value)} className="h-10 text-sm" placeholder="Nome completo" />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">E-mail</label>
              <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 text-sm" placeholder="email@empresa.com" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nova Senha <span className="text-slate-400 font-normal">(opcional)</span></label>
              <Input type="password" minLength={6} value={senha} onChange={(e) => setSenha(e.target.value)} className="h-10 text-sm" placeholder="Mínimo 6 caracteres" />
            </div>

            <Button type="submit" className="w-full mt-4 h-10 text-sm" isLoading={isSubmitting}>
              Salvar Alterações
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
