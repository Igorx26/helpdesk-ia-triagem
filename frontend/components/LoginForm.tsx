"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Bot, Shield, User, Lock, Mail, AlertCircle } from "lucide-react";

export function LoginForm() {
  const { login, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState<"COMUM" | "TECNICO">("COMUM");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        if (!nome) throw new Error("Informe seu nome.");
        if (senha.length < 8) throw new Error("A senha deve ter no mínimo 8 caracteres.");
        await register(nome, email, senha, perfil);
      } else {
        await login(email, senha);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Ocorreu um erro ao processar sua solicitação.");
    } finally {
      setIsLoading(false);
    }
  };

  const fillQuickDemo = (role: "COMUM" | "TECNICO") => {
    if (role === "TECNICO") {
      setEmail("igor@helpdesk.com");
      setSenha("Senha@123");
    } else {
      setEmail("usuario@empresa.com");
      setSenha("SenhaForte@123");
    }
    setIsRegisterMode(false);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-[#F1F5F9]">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1E40AF] text-white shadow-lg shadow-blue-900/20 mb-2">
            <Bot className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Helpdesk Corporativo de TI</h2>
          <p className="text-sm text-slate-500">Triagem autônoma por IA com detecção de ameaças cibernéticas</p>
        </div>

        <Card className="shadow-md border-slate-200">
          <CardHeader>
            <CardTitle>{isRegisterMode ? "Criar Nova Conta" : "Acessar Plataforma"}</CardTitle>
            <CardDescription>
              {isRegisterMode
                ? "Preencha seus dados para solicitar chamados ou atuar na equipe."
                : "Entre com suas credenciais corporativas para continuar."}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {isRegisterMode && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Nome Completo</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <Input
                      className="pl-9"
                      placeholder="Ex: João da Silva"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">E-mail Corporativo</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    type="email"
                    className="pl-9"
                    placeholder="seu.email@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Senha</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    type="password"
                    className="pl-9"
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                  />
                </div>
                {isRegisterMode && <span className="text-[11px] text-slate-500">Mínimo de 8 caracteres.</span>}
              </div>

              {isRegisterMode && (
                <div className="space-y-1 pt-1">
                  <label className="text-xs font-semibold text-slate-700">Perfil de Acesso</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPerfil("COMUM")}
                      className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        perfil === "COMUM"
                          ? "border-[#1E40AF] bg-blue-50/60 text-[#1E40AF] font-bold"
                          : "border-slate-200 hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      Usuário Comum
                    </button>
                    <button
                      type="button"
                      onClick={() => setPerfil("TECNICO")}
                      className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        perfil === "TECNICO"
                          ? "border-[#1E40AF] bg-blue-50/60 text-[#1E40AF] font-bold"
                          : "border-slate-200 hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      Técnico de TI
                    </button>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
                {isRegisterMode ? "Cadastrar e Entrar" : "Entrar no Sistema"}
              </Button>
            </CardContent>
          </form>

          <CardFooter className="flex flex-col space-y-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setErrorMsg(null);
              }}
              className="text-xs text-[#1E40AF] hover:underline font-medium"
            >
              {isRegisterMode ? "Já possui cadastro? Clique para entrar" : "Não possui conta? Cadastre-se aqui"}
            </button>

            {/* Quick Demo credentials for fast testing */}
            <div className="w-full pt-2">
              <p className="text-[11px] text-slate-400 text-center uppercase tracking-wider mb-2">
                Acesso Rápido para Demonstração
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => fillQuickDemo("TECNICO")} className="text-xs py-1">
                  <Shield className="w-3 h-3 text-[#1E40AF] mr-1" />
                  Conta Técnico
                </Button>
                <Button variant="outline" size="sm" onClick={() => fillQuickDemo("COMUM")} className="text-xs py-1">
                  <User className="w-3 h-3 text-slate-600 mr-1" />
                  Conta Usuário
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
