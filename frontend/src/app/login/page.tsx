"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { Building2, Loader2 } from "lucide-react"
import api from "@/lib/api"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await api.post('/auth/login', { email, password })
      
      const { accessToken, refreshToken, user } = response.data
      
      // Salva ambos os tokens
      Cookies.set('saas_token', accessToken, { expires: 1 })
      if (refreshToken) {
        Cookies.set('saas_refresh_token', refreshToken, { expires: 7 })
      }
      
      // Salva dados do usuário logado
      if (user) {
        Cookies.set('saas_user', JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }), { expires: 7 })
      }
      
      router.push('/app/dashboard')
    } catch (err: any) {
      const msg = err.response?.data?.message
      if (Array.isArray(msg)) {
        setError(msg.join(', '))
      } else {
        setError(msg || "Ocorreu um erro ao fazer login. Verifique suas credenciais.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Building2 className="mx-auto h-12 w-12 text-primary" />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          Entre na sua conta
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Imob<span className="text-secondary font-bold">SaaS</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-border">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-foreground">
                Email
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@saasimobiliaria.com"
                  className="appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">
                Senha
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm font-medium p-2 bg-red-500/10 rounded-md border border-red-500/20 text-center">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Entrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
