"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  FileText,
  Loader2,
} from "lucide-react"

interface DashboardSummary {
  operational: {
    totalProperties: number
    totalActiveContracts: number
    totalTenants: number
  }
  financial: {
    expectedMonthly: number
    receivedMonthly: number
    overdueTotalAmount: number
    overdueCount: number
  }
  currentMonth: string
  recentPayments: {
    id: string
    amount: number
    method: string
    date: string
    tenant: string
  }[]
}

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get("/dashboard/summary")
        setData(res.data)
      } catch (err) {
        console.error("Erro ao buscar resumo do dashboard:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchSummary()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <AlertTriangle className="h-10 w-10 mb-2" />
        <p>Erro ao carregar dados do dashboard</p>
      </div>
    )
  }

  const cards = [
    {
      title: "Receita Prevista",
      value: formatBRL(data.financial.expectedMonthly),
      subtitle: data.currentMonth,
      icon: DollarSign,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Receita Recebida",
      value: formatBRL(data.financial.receivedMonthly),
      subtitle: data.currentMonth,
      icon: TrendingUp,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Inadimplência",
      value: formatBRL(data.financial.overdueTotalAmount),
      subtitle: `${data.financial.overdueCount} pagamento(s) em atraso`,
      icon: AlertTriangle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
    {
      title: "Contratos Ativos",
      value: String(data.operational.totalActiveContracts),
      subtitle: `${data.operational.totalProperties} imóveis · ${data.operational.totalTenants} inquilinos`,
      icon: FileText,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ]

  const formatDate = (iso: string) => {
    if (!iso) return "—"
    return new Date(iso).toLocaleDateString("pt-BR")
  }

  return (
    <div className="p-6 space-y-6" suppressHydrationWarning>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral — {data.currentMonth}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-lg border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">
                {card.title}
              </p>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.iconBg}`}
              >
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {card.subtitle}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Payments */}
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">
            Pagamentos Recentes
          </h2>
        </div>
        {data.recentPayments && data.recentPayments.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">
                  Inquilino
                </th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">
                  Valor
                </th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">
                  Método
                </th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">
                  Data
                </th>
              </tr>
            </thead>
            <tbody>
              {data.recentPayments.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50 transition"
                >
                  <td className="px-5 py-3 text-foreground">{p.tenant}</td>
                  <td className="px-5 py-3 text-foreground font-medium">
                    {formatBRL(p.amount)}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {p.method}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {formatDate(p.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <DollarSign className="h-8 w-8 mb-2" />
            <p className="text-sm">Nenhum pagamento recente</p>
          </div>
        )}
      </div>

      {/* Chart Placeholder */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">
          Evolução de Receita
        </h2>
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <p className="text-sm">Gráfico em desenvolvimento</p>
        </div>
      </div>
    </div>
  )
}
