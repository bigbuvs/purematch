'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { insforge } from '@/lib/insforge'

interface User {
  id: string
  email: string
  name?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile?: { name?: string; avatar_url?: string | null; [key: string]: any }
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
  name: 'Vista Previa',
  profile: { name: 'Vista Previa', avatar_url: null },
  user_metadata: { name: 'Vista Previa' },
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
    // Real session takes priority — always handle inside this block, never fall through to demo
    if (hasCookie('insforge_csrf_token')) {
      document.cookie = 'purematch_demo=; path=/; max-age=0'
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await withTimeout(insforge.auth.getCurrentUser() as Promise<any>, 5000)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const u = (data as any)?.user ?? data ?? null
        if (u) {
          // Load profile row from users table so pages get name/avatar/zone
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: profile } = await (insforge.database.from('users').select('*').eq('id', u.id).single() as any)
            setUser({ ...(u as User), profile: profile ?? undefined })
          } catch {
            setUser(u as User)
          }
        } else {
          setUser(null)
        }
      } catch {
        // Timeout or network error: treat as unauthenticated, not demo
        setUser(null)
      }
      return
    }
    // Only reach here when there is no real session cookie at all
    if (hasCookie('purematch_demo')) {
      setUser(DEMO_USER)
      return
    }
    setUser(null)
  }

  useEffect(() => {
    const load = async () => {
      await refresh()
      setLoading(false)
    }
    load()

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const signOut = async () => {
    document.cookie = 'purematch_demo=; path=/; max-age=0'
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await withTimeout(insforge.auth.signOut() as Promise<any>, 5000)
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
