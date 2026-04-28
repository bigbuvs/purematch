'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { insforge } from '@/lib/insforge'

export default function AuthPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await insforge.auth.signInWithPassword({ email: form.email, password: form.password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/explore')
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await insforge.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { name: form.name } },
    })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/onboarding/user')
  }

  const handleGoogle = () =>
    insforge.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/explore` },
    })

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex flex-col items-center">
      <main className="w-full max-w-md px-8 py-16 flex flex-col items-center">
        <header className="mb-16 text-center">
          <h1 className="font-serif font-bold text-xl text-primary tracking-widest uppercase mb-2">PureMatch</h1>
          <p className="font-label-caps text-label-caps text-on-surface-variant">Registro Digital de Linaje Canino</p>
        </header>

        <div className="w-full">
          <div className="flex border-b border-outline-variant mb-8">
            <button onClick={() => { setTab('login'); setError('') }} className={`flex-1 py-2 font-label-caps text-label-caps text-center transition-colors ${tab === 'login' ? 'border-b-2 border-primary text-primary' : 'text-outline hover:text-primary'}`}>INGRESAR</button>
            <button onClick={() => { setTab('register'); setError('') }} className={`flex-1 py-2 font-label-caps text-label-caps text-center transition-colors ${tab === 'register' ? 'border-b-2 border-primary text-primary' : 'text-outline hover:text-primary'}`}>REGISTRARSE</button>
          </div>

          {error && <div className="bg-error-container text-on-error-container font-metadata text-xs px-4 py-3 rounded-lg mb-4">{error}</div>}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4 mb-8">
              <div className="flex flex-col">
                <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 ml-1">EMAIL</label>
                <input className="bg-surface-container-low border-b border-primary border-t-0 border-l-0 border-r-0 focus:ring-0 px-4 py-3 placeholder:text-outline-variant text-body-md" placeholder="ejemplo@criador.com" type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="flex flex-col">
                <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 ml-1">CONTRASEÑA</label>
                <div className="relative">
                  <input className="w-full bg-surface-container-low border-b border-primary border-t-0 border-l-0 border-r-0 focus:ring-0 px-4 py-3 placeholder:text-outline-variant text-body-md" placeholder="••••••••" type={showPass ? 'text' : 'password'} required value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline text-lg">{showPass ? 'visibility_off' : 'visibility'}</button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-primary text-on-primary font-label-caps text-label-caps py-4 mt-2 hover:bg-primary-container transition-colors disabled:opacity-60">
                {loading ? 'INGRESANDO...' : 'INGRESAR'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4 mb-8">
              <div className="flex flex-col">
                <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 ml-1">NOMBRE COMPLETO</label>
                <input className="bg-surface-container-low border-b border-primary border-t-0 border-l-0 border-r-0 focus:ring-0 px-4 py-3 placeholder:text-outline-variant text-body-md" placeholder="Ej. Alejandro von West" type="text" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="flex flex-col">
                <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 ml-1">EMAIL</label>
                <input className="bg-surface-container-low border-b border-primary border-t-0 border-l-0 border-r-0 focus:ring-0 px-4 py-3 placeholder:text-outline-variant text-body-md" placeholder="ejemplo@criador.com" type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="flex flex-col">
                <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 ml-1">CONTRASEÑA</label>
                <input className="bg-surface-container-low border-b border-primary border-t-0 border-l-0 border-r-0 focus:ring-0 px-4 py-3 placeholder:text-outline-variant text-body-md" placeholder="••••••••" type="password" required minLength={6} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-primary text-on-primary font-label-caps text-label-caps py-4 hover:bg-primary-container transition-colors disabled:opacity-60">
                {loading ? 'CREANDO CUENTA...' : 'CREAR CUENTA'}
              </button>
            </form>
          )}

          <div className="relative flex items-center mb-8">
            <div className="flex-grow border-t border-outline-variant" />
            <span className="flex-shrink mx-4 font-label-caps text-[10px] text-outline">O CONTINÚA CON</span>
            <div className="flex-grow border-t border-outline-variant" />
          </div>

          <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 border border-primary text-primary font-label-caps text-label-caps py-4 hover:bg-surface-container-highest transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="currentColor"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"/>
            </svg>
            GOOGLE
          </button>
        </div>

        <footer className="mt-auto pt-8 flex flex-col items-center">
          <div className="w-12 h-px bg-outline-variant mb-4" />
          <p className="font-metadata text-[10px] text-outline text-center leading-relaxed">PLATAFORMA DE REGISTRO PRIVADO.<br/>DATOS PROTEGIDOS POR CRIPTOGRAFÍA.</p>
        </footer>
      </main>
    </div>
  )
}
