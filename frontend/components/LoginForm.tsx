"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Bot, Shield, User, Lock, Mail, AlertCircle } from "lucide-react";

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      await login(email, senha);
    } catch (err: any) {
      setErrorMsg("E-mail ou senha incorretos.");
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
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-[#F1F5F9]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1E40AF] text-white shadow-lg shadow-blue-900/20 mb-2">
            <Bot className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Helpdesk Corporativo de TI</h2>
          <p className="text-sm text-slate-500">Triagem autônoma por IA com detecção de ameaças cibernéticas</p>
        </div>

        <Card className="shadow-md border-slate-200">
          <CardHeader>
            <CardTitle>Acessar Plataforma</CardTitle>
            <CardDescription>
              Entre com suas credenciais corporativas para continuar.
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
              </div>

              <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
                Entrar no Sistema
              </Button>
            </CardContent>
          </form>

          {process.env.NEXT_PUBLIC_ENV !== "production" && (
            <CardFooter className="flex flex-col space-y-3 pt-2 border-t border-slate-100">
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
          )}
        </Card>
      </div>
    </div>
  );
}
