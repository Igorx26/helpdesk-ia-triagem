"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Usuario } from "@/lib/types";
import { getMeApi, loginApi } from "@/lib/api";

// --- Tipos -------------------------------------------------------------------

interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  /** true somente durante a hidratação inicial (leitura do localStorage). */
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

// --- Contexto ----------------------------------------------------------------

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Provider ----------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser(): Promise<void> {
      const storedToken = localStorage.getItem("helpdesk_token");
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        setToken(storedToken);
        const userData = await getMeApi();
        setUser(userData);
      } catch (err: unknown) {
        console.error("Falha ao restaurar sessão:", err);
        localStorage.removeItem("helpdesk_token");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    void loadUser();
  }, []);

  const login = async (email: string, senha: string): Promise<void> => {
    const data = await loginApi(email, senha);
    localStorage.setItem("helpdesk_token", data.access_token);
    setToken(data.access_token);
    setUser(data.usuario);
  };

  const logout = (): void => {
    localStorage.removeItem("helpdesk_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// --- Hook de acesso ao contexto ----------------------------------------------

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser utilizado dentro de um AuthProvider");
  }
  return context;
}