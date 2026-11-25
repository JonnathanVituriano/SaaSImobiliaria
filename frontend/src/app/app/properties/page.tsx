"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import {
  Plus,
  Search,
  Edit,
  Home,
  X,
  Loader2,
} from "lucide-react"

interface Owner {
  id: string
  name: string
}

interface Property {
  id: string
  organizationId: string
  ownerId: string
  type: string
  description?: string
  addressStreet: string
  addressNumber?: string
  addressCity: string
  addressState: string
  addressNeighborhood?: string
  areaSqm?: number
  status: string
  isActive: boolean
  owner?: Owner
}

const propertyTypeOptions = [
  { value: "casa", label: "Casa" },
  { value: "apartamento", label: "Apartamento" },
  { value: "sala_comercial", label: "Sala Comercial" },
  { value: "terreno", label: "Terreno" },
]

const propertyTypeLabels: Record<string, string> = {
  casa: "Casa",
  apartamento: "Apartamento",
  sala_comercial: "Sala Comercial",
  terreno: "Terreno",
}

const statusBadge = (status: string) => {
  if (status === "rented") {
    return (
      <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
        Alugado
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
      Disponível
    </span>
  )
}

const emptyForm = {
  ownerId: "",
  type: "casa",
  addressStreet: "",
  addressNumber: "",
  addressCity: "",
  addressState: "",
  areaSqm: "",
  status: "available",
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [owners, setOwners] = useState<Owner[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const fetchProperties = async () => {
    try {
      const res = await api.get("/properties")
      setProperties(res.data.data ?? res.data)
    } catch (err) {
      console.error("Erro ao buscar imóveis:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchOwners = async () => {
    try {
      const res = await api.get("/owners")
      setOwners(res.data.data ?? res.data)
    } catch (err) {
      console.error("Erro ao buscar proprietários:", err)
    }
  }

  useEffect(() => {
    fetchProperties()
    fetchOwners()
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (p: Property) => {
    setEditingId(p.id)
    setForm({
      ownerId: p.ownerId,
      type: p.type,
      addressStreet: p.addressStreet,
      addressNumber: p.addressNumber ?? "",
      addressCity: p.addressCity,
      addressState: p.addressState,
      areaSqm: p.areaSqm != null ? String(p.areaSqm) : "",
      status: p.status,
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        ownerId: form.ownerId,
        type: form.type,
        addressStreet: form.addressStreet,
        addressCity: form.addressCity,
        addressState: form.addressState,
        status: form.status,
      }
      if (form.addressNumber) payload.addressNumber = form.addressNumber
      if (form.areaSqm) payload.areaSqm = Number(form.areaSqm)

      if (editingId) {
        await api.patch(`/properties/${editingId}`, payload)
      } else {
        await api.post("/properties", payload)
      }

      setModalOpen(false)
      setForm(emptyForm)
      setEditingId(null)
      fetchProperties()
    } catch (err: any) {
      console.error("Erro ao salvar imóvel:", err)
      const msg = err?.response?.data?.message
      alert(Array.isArray(msg) ? msg.join(", ") : msg || "Erro ao salvar imóvel.")
    } finally {
      setSaving(false)
    }
  }

  const filtered = properties.filter((p) =>
    p.addressStreet.toLowerCase().includes(search.toLowerCase())
  )

  const getOwnerName = (ownerId: string) => {
    const owner = owners.find((o) => o.id === ownerId)
    return owner?.name ?? "—"
  }

  return (
    <div className="p-6 space-y-6" suppressHydrationWarning>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Imóveis</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os imóveis cadastrados
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
        >
          <Plus className="h-4 w-4" />
          Novo Imóvel
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por endereço..."
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
            <Home className="h-10 w-10 mb-2" />
            <p>Nenhum imóvel encontrado</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Endereço
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Proprietário
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition"
                >
                  <td className="px-4 py-3 text-foreground">
                    {propertyTypeLabels[p.type] ?? p.type}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {p.addressStreet}
                    {p.addressNumber ? `, ${p.addressNumber}` : ""} —{" "}
                    {p.addressCity}/{p.addressState}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {(p as any).owner?.name ?? getOwnerName(p.ownerId)}
                  </td>
                  <td className="px-4 py-3">{statusBadge(p.status)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(p)}
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
                {editingId ? "Editar Imóvel" : "Novo Imóvel"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Owner select */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Proprietário *
                </label>
                <select
                  required
                  value={form.ownerId}
                  onChange={(e) =>
                    setForm({ ...form, ownerId: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecione um proprietário</option>
                  {owners.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Property type select */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Tipo *
                </label>
                <select
                  required
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {propertyTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Address Street */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Rua *
                </label>
                <input
                  type="text"
                  required
                  value={form.addressStreet}
                  onChange={(e) =>
                    setForm({ ...form, addressStreet: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Rua, Avenida..."
                />
              </div>

              {/* Address Number */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Número
                </label>
                <input
                  type="text"
                  value={form.addressNumber}
                  onChange={(e) =>
                    setForm({ ...form, addressNumber: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="123"
                />
              </div>

              {/* City and State */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.addressCity}
                    onChange={(e) =>
                      setForm({ ...form, addressCity: e.target.value })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Cidade"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Estado *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.addressState}
                    onChange={(e) =>
                      setForm({ ...form, addressState: e.target.value })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
              </div>

              {/* Area */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Área (m²)
                </label>
                <input
                  type="number"
                  value={form.areaSqm}
                  onChange={(e) =>
                    setForm({ ...form, areaSqm: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="100"
                  min={0}
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="available">Disponível</option>
                  <option value="rented">Alugado</option>
                </select>
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
