"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Usuario } from "@/lib/types";
import { getMeApi, loginApi, registerApi } from "@/lib/api";

interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (nome: string, email: string, senha: string, perfil: "COMUM" | "TECNICO") => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem("helpdesk_token");
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        setToken(storedToken);
        const userData = await getMeApi();
        setUser(userData);
      } catch (err) {
        console.error("Falha ao restaurar sessão:", err);
        localStorage.removeItem("helpdesk_token");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, senha: string) => {
    setIsLoading(true);
    try {
      const data = await loginApi(email, senha);
      localStorage.setItem("helpdesk_token", data.access_token);
      setToken(data.access_token);
      setUser(data.usuario);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (nome: string, email: string, senha: string, perfil: "COMUM" | "TECNICO") => {
    setIsLoading(true);
    try {
      await registerApi(nome, email, senha, perfil);
      // Auto login after registration
      await login(email, senha);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("helpdesk_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser utilizado dentro de um AuthProvider");
  }
  return context;
}
