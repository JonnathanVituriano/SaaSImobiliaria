"use client"

import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { 
  Building2, 
  Home, 
  Users, 
  FileText, 
  Wallet, 
  Settings, 
  Moon, 
  Sun,
  LayoutDashboard,
  Bell,
  MessageSquare,
  LogOut,
  UserCheck,
  Menu,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    Cookies.remove("saas_token");
    Cookies.remove("saas_refresh_token");
    Cookies.remove("saas_user");
    router.push("/login");
  };

  const navItems = [
    { href: "/app/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/app/properties", icon: Home, label: "Imóveis" },
    { href: "/app/tenants", icon: Users, label: "Inquilinos" },
    { href: "/app/owners", icon: UserCheck, label: "Proprietários" },
    { href: "/app/contracts", icon: FileText, label: "Contratos" },
    { href: "/app/billings", icon: Wallet, label: "Cobranças" },
    { href: "/app/collections", icon: MessageSquare, label: "Régua / Meta" },
  ];

  const SidebarContent = () => (
    <>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-150 ${
                active
                  ? 'bg-white/15 text-white font-medium shadow-sm'
                  : 'text-white/60 hover:bg-white/10 hover:text-white/90'
              }`}
            >
              <item.icon className={`h-5 w-5 mr-3 ${active ? 'text-white' : ''}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 flex flex-col space-y-1">
        <Link
          href="/app/settings"
          className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-150 ${
            pathname === '/app/settings'
              ? 'bg-white/15 text-white font-medium'
              : 'text-white/60 hover:bg-white/10 hover:text-white/90'
          }`}
        >
          <Settings className="h-5 w-5 mr-3" />
          Configurações
        </Link>
        <button 
          onClick={handleLogout}
          className="flex w-full items-center px-3 py-2.5 rounded-lg text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-150"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sair
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex" suppressHydrationWarning>
      {/* SIDEBAR — Desktop */}
      <aside className="w-64 hidden md:flex flex-col bg-gradient-to-b from-[#1e3a5f] to-[#152d4a]">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Building2 className="h-6 w-6 text-blue-300 mr-2" />
          <span className="font-bold text-lg text-white tracking-tight">Imob<span className="text-blue-300">SaaS</span></span>
        </div>
        <SidebarContent />
      </aside>

      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR — Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-[#1e3a5f] to-[#152d4a] flex flex-col transform transition-transform duration-200 ease-in-out md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
          <div className="flex items-center">
            <Building2 className="h-6 w-6 text-blue-300 mr-2" />
            <span className="font-bold text-lg text-white tracking-tight">Imob<span className="text-blue-300">SaaS</span></span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 text-white/60 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-muted-foreground hover:bg-muted rounded-md transition-colors md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Spacer for desktop */}
          <div className="hidden md:block" />

          <div className="flex items-center gap-3">
            <Link href="/app/settings" className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
              <Bell className="h-5 w-5" />
            </Link>
            
            {mounted && (
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
                title="Alternar Tema"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            )}

            <Link href="/app/settings" className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold hover:opacity-80 transition-opacity text-sm">
              J
            </Link>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto bg-background">
          {children}
        </div>
      </main>
    </div>
  );
}
