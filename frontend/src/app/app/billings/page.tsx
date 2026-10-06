"use client"

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { Loader2, DollarSign, Search } from "lucide-react";

export default function BillingsPage() {
  const [billings, setBillings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState<any>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Payment Form
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("pix");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBillings();
  }, []);

  async function fetchBillings() {
    setLoading(true);
    try {
      const response = await api.get('/billing');
      setBillings(response.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openPaymentModal(billing: any) {
    setSelectedBilling(billing);
    setAmount(billing.totalAmount);
    setMethod("pix");
    setNotes("");
    setIsModalOpen(true);
  }

  async function handleRegisterPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBilling) return;
    
    setSubmitting(true);
    try {
      await api.post(`/billing/${selectedBilling.id}/payments`, {
        amount: Number(amount),
        paymentMethod: method,
        paymentDate: new Date().toISOString(),
        notes: notes || "Pagamento manual registrado pelo painel"
      });
      setIsModalOpen(false);
      fetchBillings(); // Atualiza a lista
    } catch (err) {
      alert("Erro ao registrar pagamento.");
    } finally {
      setSubmitting(false);
    }
  }

  // Apply local filters
  const filteredBillings = billings.filter((b) => {
    const tenantName = (b.tenant?.name || "").toLowerCase();
    const matchesSearch = tenantName.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cobranças & Faturas</h1>
          <p className="text-muted-foreground text-sm">Visualize as faturas geradas e registre pagamentos manuais</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 mb-6 flex gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar por inquilino..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:border-primary text-foreground"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:border-primary"
        >
          <option value="">Todos os Status</option>
          <option value="pending">Pendentes</option>
          <option value="overdue">Atrasados</option>
          <option value="paid">Pagos</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 font-semibold text-sm text-muted-foreground">Inquilino / Referência</th>
                <th className="px-6 py-4 font-semibold text-sm text-muted-foreground">Vencimento</th>
                <th className="px-6 py-4 font-semibold text-sm text-muted-foreground">Valor Original</th>
                <th className="px-6 py-4 font-semibold text-sm text-muted-foreground">Valor Atual (c/ Multa)</th>
                <th className="px-6 py-4 font-semibold text-sm text-muted-foreground">Status</th>
                <th className="px-6 py-4 font-semibold text-sm text-muted-foreground text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {filteredBillings.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">
                  {searchTerm || statusFilter
                    ? "Nenhuma fatura encontrada para os filtros aplicados."
                    : "Nenhuma fatura encontrada no período. O CRON gera faturas no dia do vencimento."}
                </td></tr>
              ) : (
                filteredBillings.map(b => (
                  <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{b.tenant?.name || 'Desconhecido'}</p>
                      <p className="text-xs text-muted-foreground">Ref: {b.referenceMonth}</p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{new Date(b.dueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-muted-foreground">R$ {Number(b.amount).toFixed(2)}</td>
                    <td className="px-6 py-4 font-bold text-foreground">R$ {Number(b.totalAmount).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      {b.status === 'paid' && <span className="bg-green-500/10 text-green-600 px-2 py-1 rounded-full text-xs font-bold">PAGO</span>}
                      {b.status === 'pending' && <span className="bg-blue-500/10 text-blue-600 px-2 py-1 rounded-full text-xs font-bold">AGUARDANDO</span>}
                      {b.status === 'overdue' && <span className="bg-red-500/10 text-red-600 px-2 py-1 rounded-full text-xs font-bold animate-pulse">ATRASADO</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {b.status !== 'paid' ? (
                        <button 
                          onClick={() => openPaymentModal(b)}
                          className="text-primary hover:underline text-sm font-medium flex items-center justify-end w-full"
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Baixar Manual
                        </button>
                      ) : (
                        <span className="text-muted-foreground text-sm flex items-center justify-end w-full">Finalizado</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL PAGAMENTO */}
      {isModalOpen && selectedBilling && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-sm p-6 shadow-xl relative">
            <h2 className="text-xl font-bold mb-4">Registrar Pagamento</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Baixa manual da fatura de <strong>{selectedBilling.tenant?.name}</strong>.
            </p>
            <form onSubmit={handleRegisterPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Valor Pago (R$)</label>
                <input type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Método</label>
                <select required value={method} onChange={e => setMethod(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:border-primary">
                  <option value="pix">PIX</option>
                  <option value="boleto">Boleto</option>
                  <option value="credit_card">Cartão de Crédito</option>
                  <option value="money">Dinheiro</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-md font-medium hover:bg-muted text-foreground transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={submitting} className="bg-primary hover:opacity-90 text-primary-foreground px-4 py-2 rounded-md font-medium disabled:opacity-50 transition-opacity flex items-center">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar Baixa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
