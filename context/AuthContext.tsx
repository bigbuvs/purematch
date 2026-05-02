'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { insforge } from '@/lib/insforge'

interface User {
  id: string
  email: string
  name?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user_metadata?: { name?: string; avatar_url?: string; [key: string]: any }
  created_at?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signOut: async () => {},
  refresh: async () => {},
})

const DEMO_USER: User = {
  id: 'demo-user',
  email: 'demo@purematch.cl',
  name: 'Demo User',
  profile: { name: 'Vista Previa', avatar_url: null },
  user_metadata: { name: 'Vista Previa' },
  createdAt: new Date().toISOString(),
  created_at: new Date().toISOString(),
}

const hasCookie = (name: string) => {
  if (typeof document === 'undefined') return false
  return document.cookie.split(';').some(c => c.trim().startsWith(`${name}=`))
}

const withTimeout = <T,>(p: Promise<T>, ms: number): Promise<T> =>
  Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ])

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    if (hasCookie('purematch_demo')) {
      setUser(DEMO_USER)
      return
    }
    if (!hasCookie('insforge_csrf_token')) {
      setUser(null)
      return
    }
    try {
      const { data } = await withTimeout(insforge.auth.getCurrentUser(), 5000)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const u = (data as any)?.user ?? data ?? null
      setUser(u as User | null)
    } catch {
      setUser(null)
    }
  }

  useEffect(() => {
    const load = async () => {
      await refresh()
      setLoading(false)
    }
    load()
  }, [])

  const signOut = async () => {
    // Clear demo cookie
    document.cookie = 'purematch_demo=; path=/; max-age=0'
    try {
      await withTimeout(insforge.auth.signOut(), 5000)
    } catch {}
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
