"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUsersApi, createUserApi, updateUserApi, deleteUserApi } from "@/lib/api";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { X, Search, Edit2, Trash2, Shield, User, Users } from "lucide-react";

export function UserManagementModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState<"COMUM" | "TECNICO" | "ADMIN">("COMUM");

  const [message, setMessage] = useState({ text: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getUsersApi(page, 10, search);
      setUsers(data.data);
      setTotalUsers(data.total);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, page, search]);

  if (!isOpen || !currentUser) return null;
  const isTecnico = currentUser.perfil === "TECNICO";
  const isAdmin = currentUser.perfil === "ADMIN";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleCreateNew = () => {
    setIsEditing(false);
    setEditId("");
    setNome("");
    setEmail("");
    setSenha("");
    setPerfil("COMUM");
    setMessage({ text: "", type: "" });
  };

  const handleEdit = (u: any) => {
    setIsEditing(true);
    setEditId(u.id);
    setNome(u.nome);
    setEmail(u.email);
    setSenha("");
    setPerfil(u.perfil);
    setMessage({ text: "", type: "" });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      const payload: any = { nome, email };
      if (senha) payload.senha = senha;
      
      // Técnico force COMUM on create
      if (isTecnico && !isEditing) {
        payload.perfil = "COMUM";
      } else {
        payload.perfil = perfil;
      }

      if (isEditing) {
        await updateUserApi(editId, payload);
        setMessage({ text: "Usuário atualizado com sucesso!", type: "success" });
      } else {
        await createUserApi(payload);
        setMessage({ text: "Usuário criado com sucesso!", type: "success" });
        handleCreateNew(); // reset form
      }
      fetchUsers();
    } catch (error: any) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm("Tem certeza que deseja excluir este usuário? Esta ação é irreversível.")) return;
    try {
      await deleteUserApi(id);
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const totalPages = Math.ceil(totalUsers / 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#1E40AF]" />
              Gestão de Usuários
            </h2>
            <p className="text-xs text-slate-500">Adicione, edite ou remova usuários do sistema.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6">
          {/* List Section */}
          <div className="flex-1 flex flex-col gap-4 order-2 lg:order-1">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <Input
                  placeholder="Buscar por nome..."
                  className="pl-9 h-10 text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit" variant="outline" size="sm" className="h-10">Buscar</Button>
            </form>

            <div className="border border-slate-200 rounded-lg overflow-hidden flex-1">
              <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Usuário</th>
                    <th className="px-4 py-3 w-24">Perfil</th>
                    <th className="px-4 py-3 w-24 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={3} className="text-center py-8 text-slate-500">Carregando...</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-8 text-slate-500">Nenhum usuário encontrado.</td></tr>
                  ) : (
                    users.map((u) => {
                      const canEdit = isAdmin || (isTecnico && u.perfil === "COMUM");
                      return (
                        <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-900">{u.nome}</div>
                            <div className="text-xs text-slate-500">{u.email}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                              u.perfil === 'ADMIN' ? 'bg-red-100 text-red-700' :
                              u.perfil === 'TECNICO' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {u.perfil}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              {canEdit && (
                                <button onClick={() => handleEdit(u)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Alterar">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              )}
                              {isAdmin && u.id !== currentUser.id && (
                                <button onClick={() => handleDelete(u.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Excluir">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Página {page} de {totalPages}</span>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</Button>
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Próxima</Button>
                </div>
              </div>
            )}
          </div>

          {/* Form Section */}
          <div className="w-full lg:w-80 flex flex-col gap-4 order-1 lg:order-2">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-800 text-sm">{isEditing ? "Alterar Usuário" : "Novo Usuário"}</h3>
                {isEditing && (
                  <Button variant="ghost" size="sm" onClick={handleCreateNew} className="h-7 text-[10px] uppercase">
                    Cancelar
                  </Button>
                )}
              </div>

              {message.text && (
                <div className={`p-2.5 mb-4 rounded text-xs font-medium ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Nome</label>
                  <Input required value={nome} onChange={(e) => setNome(e.target.value)} className="h-9 text-sm" placeholder="Nome completo" />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">E-mail</label>
                  <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-9 text-sm" placeholder="email@empresa.com" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Senha {isEditing && <span className="text-slate-400 font-normal">(deixe em branco para não alterar)</span>}</label>
                  <Input type="password" required={!isEditing} minLength={6} value={senha} onChange={(e) => setSenha(e.target.value)} className="h-9 text-sm" placeholder="Mínimo 6 caracteres" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Perfil de Acesso</label>
                  {isAdmin ? (
                    <select
                      className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-950"
                      value={perfil}
                      onChange={(e) => setPerfil(e.target.value as any)}
                    >
                      <option value="COMUM">COMUM - Portal Restrito</option>
                      <option value="TECNICO">TÉCNICO - Visão Global</option>
                      <option value="ADMIN">ADMIN - Gestão Total</option>
                    </select>
                  ) : (
                    <div className="flex h-9 w-full rounded-md border border-slate-200 bg-slate-100 px-3 py-1 text-sm shadow-sm items-center text-slate-500 cursor-not-allowed">
                      COMUM (Fixo para Técnicos)
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full mt-2 h-9 text-sm" isLoading={isSubmitting}>
                  {isEditing ? "Salvar Alterações" : "Cadastrar Usuário"}
                </Button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
