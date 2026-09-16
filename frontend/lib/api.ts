import { Chamado, StatusChamado, Usuario } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return { "Content-Type": "application/json" };
  const token = localStorage.getItem("helpdesk_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function loginApi(email: string, senha: string): Promise<{ access_token: string; usuario: Usuario }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Credenciais inválidas.");
  }

  return res.json();
}

export async function registerApi(
  nome: string,
  email: string,
  senha: string,
  perfil: "COMUM" | "TECNICO",
): Promise<Usuario> {
  const res = await fetch(`${API_BASE}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, senha, perfil }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Erro ao cadastrar usuário.");
  }

  return res.json();
}

export async function getMeApi(): Promise<Usuario> {
  const res = await fetch(`${API_BASE}/users/me`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Sessão expirada ou não autenticado.");
  }

  return res.json();
}

export async function getTicketsApi(): Promise<Chamado[]> {
  const res = await fetch(`${API_BASE}/tickets`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Falha ao carregar lista de chamados.");
  }

  return res.json();
}

export async function getTicketByIdApi(id: string): Promise<Chamado> {
  const res = await fetch(`${API_BASE}/tickets/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Falha ao carregar detalhes do chamado.");
  }

  return res.json();
}

export async function createTicketApi(titulo: string, descricao: string): Promise<Chamado> {
  const res = await fetch(`${API_BASE}/tickets`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ titulo, descricao }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Falha ao abrir chamado.");
  }

  return res.json();
}

export async function updateTicketStatusApi(id: string, status: StatusChamado): Promise<Chamado> {
  const res = await fetch(`${API_BASE}/tickets/${id}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Falha ao alterar status do chamado.");
  }

  return res.json();
}

export async function addInteractionApi(id: string, mensagem: string) {
  const res = await fetch(`${API_BASE}/tickets/${id}/interactions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ mensagem }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Falha ao enviar mensagem.");
  }

  return res.json();
}
