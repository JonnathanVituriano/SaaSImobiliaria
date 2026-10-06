"use client"

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { Loader2, Plus, Search, Pencil, UserCheck, X } from "lucide-react";

interface Owner {
  id: string;
  name: string;
  cpfCnpj: string;
  email?: string;
  phone?: string;
  bankPixKey?: string;
  isActive: boolean;
  createdAt: string;
}

function maskCpfCnpj(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 11) {
    // CPF: 000.000.000-00
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  // CNPJ: 00.000.000/0000-00
  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }
  return digits
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

function unmask(value: string): string {
  return value.replace(/\D/g, "");
}

function formatCpfCnpjDisplay(raw: string): string {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  return maskCpfCnpj(digits);
}

function formatPhoneDisplay(raw: string): string {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  return maskPhone(digits);
}

export default function OwnersPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formCpfCnpj, setFormCpfCnpj] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formPixKey, setFormPixKey] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOwners();
  }, []);

  async function fetchOwners() {
    setLoading(true);
    try {
      const response = await api.get("/owners");
      setOwners(response.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingOwner(null);
    setFormName("");
    setFormCpfCnpj("");
    setFormEmail("");
    setFormPhone("");
    setFormPixKey("");
    setIsModalOpen(true);
  }

  function openEditModal(owner: Owner) {
    setEditingOwner(owner);
    setFormName(owner.name);
    setFormCpfCnpj(maskCpfCnpj(owner.cpfCnpj || ""));
    setFormEmail(owner.email || "");
    setFormPhone(maskPhone(owner.phone || ""));
    setFormPixKey(owner.bankPixKey || "");
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      name: formName,
      cpfCnpj: unmask(formCpfCnpj),
      email: formEmail || undefined,
      phone: unmask(formPhone) || undefined,
      bankPixKey: formPixKey || undefined,
    };

    try {
      if (editingOwner) {
        await api.patch(`/owners/${editingOwner.id}`, payload);
      } else {
        await api.post("/owners", payload);
      }
      setIsModalOpen(false);
      fetchOwners();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Erro ao salvar proprietário.");
    } finally {
      setSubmitting(false);
    }
  }

  const filteredOwners = owners.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Proprietários</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie os proprietários dos imóveis cadastrados
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-primary hover:opacity-90 text-primary-foreground px-4 py-2 rounded-md font-medium flex items-center transition-opacity"
        >
          <Plus className="h-5 w-5 mr-2" />
          Novo Proprietário
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:border-primary text-foreground"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 font-semibold text-sm text-muted-foreground">Nome</th>
                <th className="px-6 py-4 font-semibold text-sm text-muted-foreground">CPF/CNPJ</th>
                <th className="px-6 py-4 font-semibold text-sm text-muted-foreground">Email</th>
                <th className="px-6 py-4 font-semibold text-sm text-muted-foreground">Telefone</th>
                <th className="px-6 py-4 font-semibold text-sm text-muted-foreground">Chave PIX</th>
                <th className="px-6 py-4 font-semibold text-sm text-muted-foreground text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredOwners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">
                    {search ? "Nenhum proprietário encontrado para esta busca." : "Nenhum proprietário cadastrado."}
                  </td>
                </tr>
              ) : (
                filteredOwners.map((owner) => (
                  <tr
                    key={owner.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <UserCheck className="h-4 w-4 text-primary mr-2" />
                        <span className="font-medium text-foreground">{owner.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-mono text-sm">
                      {formatCpfCnpjDisplay(owner.cpfCnpj)}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{owner.email || "—"}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {owner.phone ? formatPhoneDisplay(owner.phone) : "—"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">{owner.bankPixKey || "—"}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEditModal(owner)}
                        className="text-primary hover:underline text-sm font-medium inline-flex items-center"
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL CRIAR/EDITAR */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-card border border-border rounded-xl w-full max-w-md p-6 shadow-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold mb-1 text-foreground">
              {editingOwner ? "Editar Proprietário" : "Novo Proprietário"}
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              {editingOwner ? "Atualize os dados do proprietário." : "Preencha os dados para cadastrar."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nome *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Nome completo"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">CPF/CNPJ *</label>
                <input
                  type="text"
                  required
                  value={formCpfCnpj}
                  onChange={(e) => {
                    const raw = unmask(e.target.value).slice(0, 14);
                    setFormCpfCnpj(maskCpfCnpj(raw));
                  }}
                  placeholder="000.000.000-00"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Telefone</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => {
                    const raw = unmask(e.target.value).slice(0, 11);
                    setFormPhone(maskPhone(raw));
                  }}
                  placeholder="(00) 00000-0000"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Chave PIX</label>
                <input
                  type="text"
                  value={formPixKey}
                  onChange={(e) => setFormPixKey(e.target.value)}
                  placeholder="CPF, e-mail, telefone ou chave aleatória"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-md font-medium hover:bg-muted text-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary hover:opacity-90 text-primary-foreground px-4 py-2 rounded-md font-medium disabled:opacity-50 transition-opacity flex items-center"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingOwner ? (
                    "Salvar Alterações"
                  ) : (
                    "Cadastrar"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
