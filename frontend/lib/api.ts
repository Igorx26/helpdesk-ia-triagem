import type { Chamado, StatusChamado, Usuario } from "./types";

// --- Tipos internos ----------------------------------------------------------

/** Formato de erro retornado pela API do backend. */
interface ApiErrorResponse {
  message?: string;
  statusCode?: number;
}

/** Resposta paginada da API de listagem de usuários. */
export interface PaginatedUsersResponse {
  data: Usuario[];
  total: number;
}

/** Payload de criação ou edição de usuário. */
export interface UserPayload {
  nome: string;
  email: string;
  perfil: "COMUM" | "TECNICO" | "ADMIN";
  senha?: string;
}

/** Payload de atualização do perfil próprio do usuário autenticado. */
export interface UpdateMePayload {
  nome: string;
  email: string;
  senha?: string;
}

// --- Utilitário de autenticação ----------------------------------------------

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return { "Content-Type": "application/json" };
  const token = localStorage.getItem("helpdesk_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/** Extrai a mensagem de erro de uma resposta JSON da API. */
async function extractApiError(res: Response, fallback: string): Promise<never> {
  const body: ApiErrorResponse = await res.json().catch(() => ({}));
  throw new Error(body.message ?? fallback);
}

// --- Endpoints de autenticação -----------------------------------------------

export async function loginApi(
  email: string,
  senha: string,
): Promise<{ access_token: string; usuario: Usuario }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });

  if (!res.ok) {
    await extractApiError(res, "Credenciais inválidas.");
  }

  return res.json() as Promise<{ access_token: string; usuario: Usuario }>;
}

export async function getMeApi(): Promise<Usuario> {
  const res = await fetch(`${API_BASE}/users/me`, { headers: getAuthHeaders() });

  if (!res.ok) throw new Error("Sessão expirada ou não autenticado.");

  return res.json() as Promise<Usuario>;
}

// --- Endpoints de chamados ---------------------------------------------------

export async function getTicketsApi(): Promise<Chamado[]> {
  const res = await fetch(`${API_BASE}/tickets`, { headers: getAuthHeaders() });

  if (!res.ok) await extractApiError(res, "Falha ao carregar lista de chamados.");

  return res.json() as Promise<Chamado[]>;
}

export async function getTicketByIdApi(id: string): Promise<Chamado> {
  const res = await fetch(`${API_BASE}/tickets/${id}`, { headers: getAuthHeaders() });

  if (!res.ok) await extractApiError(res, "Falha ao carregar detalhes do chamado.");

  return res.json() as Promise<Chamado>;
}

export async function createTicketApi(titulo: string, descricao: string): Promise<Chamado> {
  const res = await fetch(`${API_BASE}/tickets`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ titulo, descricao }),
  });

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error(
        "Muitos chamados abertos em um curto período. Por favor, aguarde alguns minutos e tente novamente.",
      );
    }
    await extractApiError(res, "Falha ao abrir chamado.");
  }

  return res.json() as Promise<Chamado>;
}

export async function updateTicketStatusApi(id: string, status: StatusChamado): Promise<Chamado> {
  const res = await fetch(`${API_BASE}/tickets/${id}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  if (!res.ok) await extractApiError(res, "Falha ao alterar status do chamado.");

  return res.json() as Promise<Chamado>;
}

export async function addInteractionApi(id: string, mensagem: string): Promise<void> {
  const res = await fetch(`${API_BASE}/tickets/${id}/interactions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ mensagem }),
  });

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error("Você está enviando mensagens muito rápido. Por favor, aguarde um pouco.");
    }
    await extractApiError(res, "Falha ao enviar mensagem.");
  }
}

// --- Endpoints de gestão de usuários -----------------------------------------

export async function getUsersApi(
  page: number = 1,
  limit: number = 10,
  search: string = "",
): Promise<PaginatedUsersResponse> {
  const res = await fetch(
    `${API_BASE}/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
    { headers: getAuthHeaders() },
  );

  if (!res.ok) throw new Error("Falha ao carregar usuários.");

  return res.json() as Promise<PaginatedUsersResponse>;
}

export async function createUserApi(data: UserPayload): Promise<Usuario> {
  const res = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) await extractApiError(res, "Falha ao criar usuário.");

  return res.json() as Promise<Usuario>;
}

export async function updateUserApi(id: string, data: UserPayload): Promise<Usuario> {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) await extractApiError(res, "Falha ao atualizar usuário.");

  return res.json() as Promise<Usuario>;
}

export async function deleteUserApi(id: string): Promise<true> {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) await extractApiError(res, "Falha ao excluir usuário.");

  return true;
}

export async function updateMeApi(data: UpdateMePayload): Promise<Usuario> {
  const res = await fetch(`${API_BASE}/users/me`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) await extractApiError(res, "Falha ao atualizar perfil.");

  return res.json() as Promise<Usuario>;
}