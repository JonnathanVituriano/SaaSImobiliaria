"use client"

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { Save, Info, CheckCircle, X } from "lucide-react";

const STORAGE_KEY = "imob_settings";

interface SettingsData {
  finePercent: string;
  dailyInterest: string;
  whatsappToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  billingMode: "disabled" | "supervised" | "autonomous";
}

const defaultSettings: SettingsData = {
  finePercent: "2.0",
  dailyInterest: "0.033",
  whatsappToken: "",
  phoneNumberId: "",
  businessAccountId: "",
  billingMode: "disabled",
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(false);

  const [finePercent, setFinePercent] = useState(defaultSettings.finePercent);
  const [dailyInterest, setDailyInterest] = useState(defaultSettings.dailyInterest);
  const [whatsappToken, setWhatsappToken] = useState(defaultSettings.whatsappToken);
  const [phoneNumberId, setPhoneNumberId] = useState(defaultSettings.phoneNumberId);
  const [businessAccountId, setBusinessAccountId] = useState(defaultSettings.businessAccountId);
  const [billingMode, setBillingMode] = useState<SettingsData["billingMode"]>(defaultSettings.billingMode);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: SettingsData = JSON.parse(stored);
        setFinePercent(parsed.finePercent ?? defaultSettings.finePercent);
        setDailyInterest(parsed.dailyInterest ?? defaultSettings.dailyInterest);
        setWhatsappToken(parsed.whatsappToken ?? defaultSettings.whatsappToken);
        setPhoneNumberId(parsed.phoneNumberId ?? defaultSettings.phoneNumberId);
        setBusinessAccountId(parsed.businessAccountId ?? defaultSettings.businessAccountId);
        setBillingMode(parsed.billingMode ?? defaultSettings.billingMode);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Simulate a brief save delay
    await new Promise((r) => setTimeout(r, 500));

    const data: SettingsData = {
      finePercent,
      dailyInterest,
      whatsappToken,
      phoneNumberId,
      businessAccountId,
      billingMode,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setLoading(false);
    setToast(true);
    setTimeout(() => setToast(false), 4000);
  }

  return (
    <div className="p-6 max-w-4xl">
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium">Configurações salvas com sucesso!</span>
          <button onClick={() => setToast(false)} className="ml-2 hover:opacity-70 transition-opacity">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground text-sm">Gerencie os parâmetros da sua imobiliária e integrações</p>
      </div>

      {/* Info banner */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Configurações salvas localmente. Em breve será integrado com a API.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm p-6">
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Parâmetros de Cobrança */}
          <div className="space-y-4 border-b border-border pb-6">
            <h2 className="text-lg font-semibold text-foreground">Parâmetros de Cobrança</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Multa por Atraso (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={finePercent}
                  onChange={(e) => setFinePercent(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Juros ao Dia (%)</label>
                <input
                  type="number"
                  step="0.001"
                  value={dailyInterest}
                  onChange={(e) => setDailyInterest(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Modo de Cobrança */}
          <div className="space-y-4 border-b border-border pb-6">
            <h2 className="text-lg font-semibold text-foreground">Modo de Cobrança</h2>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="billingMode"
                  value="disabled"
                  checked={billingMode === "disabled"}
                  onChange={() => setBillingMode("disabled")}
                  className="mt-1 accent-primary"
                />
                <div>
                  <p className="font-medium text-foreground">Modo 1 — Desativado</p>
                  <p className="text-sm text-muted-foreground">Nenhuma cobrança automática será enviada.</p>
                </div>
              </label>
              <label className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="billingMode"
                  value="supervised"
                  checked={billingMode === "supervised"}
                  onChange={() => setBillingMode("supervised")}
                  className="mt-1 accent-primary"
                />
                <div>
                  <p className="font-medium text-foreground">Modo 2 — Supervisionado</p>
                  <p className="text-sm text-muted-foreground">Cobranças são geradas mas requerem aprovação manual antes do envio.</p>
                </div>
              </label>
              <label className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="billingMode"
                  value="autonomous"
                  checked={billingMode === "autonomous"}
                  onChange={() => setBillingMode("autonomous")}
                  className="mt-1 accent-primary"
                />
                <div>
                  <p className="font-medium text-foreground">Modo 3 — Autônomo</p>
                  <p className="text-sm text-muted-foreground">Cobranças são geradas e enviadas automaticamente sem intervenção.</p>
                </div>
              </label>
            </div>
          </div>

          {/* WhatsApp Cloud API */}
          <div className="space-y-4 border-b border-border pb-6">
            <h2 className="text-lg font-semibold text-foreground">WhatsApp Cloud API</h2>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Access Token</label>
              <input
                type="password"
                placeholder="EAAB..."
                value={whatsappToken}
                onChange={(e) => setWhatsappToken(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Phone Number ID</label>
                <input
                  type="text"
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Business Account ID</label>
                <input
                  type="text"
                  value={businessAccountId}
                  onChange={(e) => setBusinessAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              disabled={loading}
              type="submit"
              className="bg-primary hover:opacity-90 text-primary-foreground px-4 py-2 rounded-md font-medium flex items-center transition-opacity disabled:opacity-50"
            >
              <Save className="h-5 w-5 mr-2" />
              {loading ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
