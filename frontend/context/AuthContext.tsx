"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Usuario } from "@/lib/types";
import { getMeApi, loginApi } from "@/lib/api";

interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  // isLoading is ONLY for the initial hydration (checking local storage)
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
    const data = await loginApi(email, senha);
    localStorage.setItem("helpdesk_token", data.access_token);
    setToken(data.access_token);
    setUser(data.usuario);
  };

  const logout = () => {
    localStorage.removeItem("helpdesk_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser utilizado dentro de um AuthProvider");
  }
  return context;
}
