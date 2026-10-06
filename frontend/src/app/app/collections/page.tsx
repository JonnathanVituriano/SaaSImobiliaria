"use client"

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Loader2, CheckCircle, Smartphone } from "lucide-react";

export default function CollectionsPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    setLoading(true);
    try {
      const response = await api.get('/collections/messages');
      setMessages(response.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: string) {
    try {
      await api.post(`/collections/messages/${id}/approve`);
      fetchMessages(); // Refresh da lista
    } catch (err) {
      alert("Erro ao aprovar a mensagem.");
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Régua / WhatsApp</h1>
          <p className="text-muted-foreground text-sm">Controle de disparos e aprovação de cobranças</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col justify-center items-center text-center">
          <Smartphone className="h-8 w-8 text-primary mb-2" />
          <h3 className="font-semibold">Modo de Operação</h3>
          <p className="text-sm text-muted-foreground mt-1">Supervisionado (Requer Aprovação)</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col justify-center items-center text-center col-span-2">
          <h3 className="font-semibold text-lg text-secondary">Atenção Financeiro</h3>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            As mensagens abaixo foram geradas pelo robô durante a madrugada porque as faturas venceram. 
            Revise os textos e clique em <strong>Aprovar</strong> para enviá-las pelo WhatsApp oficial da imobiliária.
          </p>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 font-semibold text-sm text-muted-foreground w-1/4">Inquilino</th>
                <th className="px-6 py-4 font-semibold text-sm text-muted-foreground">Prévia da Mensagem</th>
                <th className="px-6 py-4 font-semibold text-sm text-muted-foreground w-32">Status</th>
                <th className="px-6 py-4 font-semibold text-sm text-muted-foreground w-32 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 ? (
                <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Nenhuma mensagem na fila de disparo.</td></tr>
              ) : (
                messages.map(msg => (
                  <tr key={msg.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{msg.tenant?.name || 'Desconhecido'}</p>
                      <p className="text-xs text-muted-foreground">{msg.tenant?.whatsapp}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="bg-muted p-3 rounded-lg text-sm text-muted-foreground italic border-l-4 border-primary">
                        "{msg.messageBody}"
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {msg.status === 'pending_approval' && <span className="bg-orange-500/10 text-orange-600 px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap">AGUARDANDO APROVAÇÃO</span>}
                      {msg.status === 'pending' && <span className="bg-blue-500/10 text-blue-600 px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap">NA FILA DE ENVIO</span>}
                      {msg.status === 'sent' && <span className="bg-green-500/10 text-green-600 px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap">ENVIADO</span>}
                      {msg.status === 'failed' && <span className="bg-red-500/10 text-red-600 px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap">FALHA</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {msg.status === 'pending_approval' ? (
                        <button 
                          onClick={() => handleApprove(msg.id)}
                          className="text-white bg-secondary hover:bg-secondary/90 px-3 py-1.5 rounded-md text-sm font-medium flex items-center justify-center w-full shadow-sm transition-colors"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprovar
                        </button>
                      ) : (
                        <span className="text-muted-foreground text-xs text-center block w-full">Aprovada</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

