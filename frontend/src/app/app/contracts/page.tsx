"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import {
  Plus,
  FileText,
  X,
  Loader2,
  Trash2,
} from "lucide-react"

interface Tenant {
  id: string
  name: string
  cpf?: string
}

interface Property {
  id: string
  ownerId: string
  type: string
  addressStreet: string
  addressNumber?: string
  addressCity: string
  addressState: string
  status: string
}

interface Contract {
  id: string
  propertyId: string
  tenantId: string
  ownerId: string
  rentAmount: number
  dueDay: number
  startDate: string
  endDate: string
  status: string
  tenant?: { name: string; cpf?: string }
  property?: { addressStreet: string; addressNumber?: string }
}

const statusBadge = (status: string) => {
  switch (status) {
    case "active":
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
          Ativo
        </span>
      )
    case "terminated":
      return (
        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
          Rescindido
        </span>
      )
    case "expired":
      return (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
          Expirado
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
          {status}
        </span>
      )
  }
}

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)

const emptyForm = {
  propertyId: "",
  tenantId: "",
  ownerId: "",
  rentAmount: "",
  dueDay: "",
  startDate: "",
  endDate: "",
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const fetchContracts = async () => {
    try {
      const res = await api.get("/contracts")
      setContracts(res.data.data ?? res.data)
    } catch (err) {
      console.error("Erro ao buscar contratos:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchProperties = async () => {
    try {
      const res = await api.get("/properties")
      setProperties(res.data.data ?? res.data)
    } catch (err) {
      console.error("Erro ao buscar imóveis:", err)
    }
  }

  const fetchTenants = async () => {
    try {
      const res = await api.get("/tenants")
      setTenants(res.data.data ?? res.data)
    } catch (err) {
      console.error("Erro ao buscar inquilinos:", err)
    }
  }

  useEffect(() => {
    fetchContracts()
    fetchProperties()
    fetchTenants()
  }, [])

  const availableProperties = properties.filter(
    (p) => p.status === "available"
  )

  const handlePropertyChange = (propertyId: string) => {
    const selected = properties.find((p) => p.id === propertyId)
    setForm({
      ...form,
      propertyId,
      ownerId: selected?.ownerId ?? "",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        propertyId: form.propertyId,
        tenantId: form.tenantId,
        ownerId: form.ownerId,
        rentAmount: Number(form.rentAmount),
        dueDay: Number(form.dueDay),
        startDate: form.startDate,
        endDate: form.endDate,
      }
      await api.post("/contracts", payload)
      setModalOpen(false)
      setForm(emptyForm)
      fetchContracts()
      fetchProperties()
    } catch (err) {
      console.error("Erro ao criar contrato:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleTerminate = async (id: string) => {
    if (!confirm("Deseja realmente rescindir este contrato?")) return
    try {
      await api.delete(`/contracts/${id}`)
      fetchContracts()
      fetchProperties()
    } catch (err) {
      console.error("Erro ao rescindir contrato:", err)
    }
  }

  const formatDate = (iso: string) => {
    if (!iso) return "—"
    return new Date(iso).toLocaleDateString("pt-BR")
  }

  return (
    <div className="space-y-6" suppressHydrationWarning>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contratos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os contratos de locação
          </p>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm)
            setModalOpen(true)
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
        >
          <Plus className="h-4 w-4" />
          Novo Contrato
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : contracts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <FileText className="h-10 w-10 mb-2" />
            <p>Nenhum contrato encontrado</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Inquilino
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Imóvel
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Aluguel
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Vencimento
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Período
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
              {contracts.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition"
                >
                  <td className="px-4 py-3 text-foreground">
                    {c.tenant?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {c.property?.addressStreet ?? "—"}
                    {c.property?.addressNumber
                      ? `, ${c.property.addressNumber}`
                      : ""}
                  </td>
                  <td className="px-4 py-3 text-foreground font-medium">
                    {formatBRL(c.rentAmount)}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    Dia {c.dueDay}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {formatDate(c.startDate)} — {formatDate(c.endDate)}
                  </td>
                  <td className="px-4 py-3">{statusBadge(c.status)}</td>
                  <td className="px-4 py-3 text-right">
                    {c.status === "active" && (
                      <button
                        onClick={() => handleTerminate(c.id)}
                        className="inline-flex items-center gap-1 rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Rescindir
                      </button>
                    )}
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
                Novo Contrato
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Property select */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Imóvel *
                </label>
                <select
                  required
                  value={form.propertyId}
                  onChange={(e) => handlePropertyChange(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecione um imóvel disponível</option>
                  {availableProperties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.addressStreet}
                      {p.addressNumber ? `, ${p.addressNumber}` : ""} —{" "}
                      {p.addressCity}/{p.addressState}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tenant select */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Inquilino *
                </label>
                <select
                  required
                  value={form.tenantId}
                  onChange={(e) =>
                    setForm({ ...form, tenantId: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecione um inquilino</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} {t.cpf ? `(${t.cpf})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rent Amount */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Valor do Aluguel (R$) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step="0.01"
                  value={form.rentAmount}
                  onChange={(e) =>
                    setForm({ ...form, rentAmount: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="1500.00"
                />
              </div>

              {/* Due Day */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Dia de Vencimento *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={31}
                  value={form.dueDay}
                  onChange={(e) =>
                    setForm({ ...form, dueDay: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="10"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Início *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Fim *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.endDate}
                    onChange={(e) =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Hidden ownerId info */}
              {form.ownerId && (
                <p className="text-xs text-muted-foreground">
                  Proprietário será definido automaticamente pelo imóvel
                  selecionado.
                </p>
              )}

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
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
