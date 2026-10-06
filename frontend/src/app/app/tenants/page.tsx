"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import {
  Plus,
  Search,
  Edit,
  Users,
  X,
  Loader2,
} from "lucide-react"

interface Tenant {
  id: string
  name: string
  cpf: string
  email?: string
  phone?: string
}

// Mask functions
const formatCPF = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ""
  if (digits.length <= 7)
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

const stripMask = (value: string): string => value.replace(/\D/g, "")

const emptyForm = {
  name: "",
  cpf: "",
  email: "",
  phone: "",
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const fetchTenants = async () => {
    try {
      const res = await api.get("/tenants")
      setTenants(res.data.data ?? res.data)
    } catch (err) {
      console.error("Erro ao buscar inquilinos:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTenants()
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (t: Tenant) => {
    setEditingId(t.id)
    setForm({
      name: t.name,
      cpf: formatCPF(t.cpf),
      email: t.email ?? "",
      phone: t.phone ? formatPhone(t.phone) : "",
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        cpf: stripMask(form.cpf),
        whatsapp: stripMask(form.phone),
      }
      if (form.email) payload.email = form.email

      if (editingId) {
        await api.patch(`/tenants/${editingId}`, payload)
      } else {
        await api.post("/tenants", payload)
      }

      setModalOpen(false)
      setForm(emptyForm)
      setEditingId(null)
      fetchTenants()
    } catch (err) {
      console.error("Erro ao salvar inquilino:", err)
    } finally {
      setSaving(false)
    }
  }

  const filtered = tenants.filter((t) => {
    const term = search.toLowerCase()
    return (
      t.name.toLowerCase().includes(term) ||
      t.cpf.toLowerCase().includes(term)
    )
  })

  return (
    <div className="space-y-6" suppressHydrationWarning>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inquilinos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os inquilinos cadastrados
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
        >
          <Plus className="h-4 w-4" />
          Novo Inquilino
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nome ou CPF..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Users className="h-10 w-10 mb-2" />
            <p>Nenhum inquilino encontrado</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Nome
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  CPF
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  E-mail
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Telefone
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition"
                >
                  <td className="px-4 py-3 text-foreground font-medium">
                    {t.name}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {formatCPF(t.cpf)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {t.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {t.phone ? formatPhone(t.phone) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(t)}
                      className="inline-flex items-center gap-1 rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:opacity-80 transition"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-card border border-border p-6 shadow-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                {editingId ? "Editar Inquilino" : "Novo Inquilino"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Nome completo"
                />
              </div>

              {/* CPF */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  CPF *
                </label>
                <input
                  type="text"
                  required
                  value={form.cpf}
                  onChange={(e) =>
                    setForm({ ...form, cpf: formatCPF(e.target.value) })
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="email@exemplo.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Telefone
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: formatPhone(e.target.value) })
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingId ? "Salvar" : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
