'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { insforge } from '@/lib/insforge'

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/explore'
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
    router.push(next)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await insforge.auth.signUp({
      email: form.email,
      password: form.password,
      name: form.name,
    })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/onboarding/user')
  }

  const handleGoogle = () =>
    insforge.auth.signInWithOAuth({
      provider: 'google',
      redirectTo: `${window.location.origin}${next}`,
    })

  return (
    <div className="bg-[#fcf9f8] min-h-screen flex flex-col">
      {/* Top bar lite — isotipo only, links home */}
      <header className="px-4 h-[60px] flex items-center justify-between border-b border-[#c3c8c1]/60 bg-[#fcf9f8]/95 backdrop-blur-sm sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/isotipo.svg" alt="PureMatch" width={32} height={32} className="rounded-full" />
          <span className="font-serif font-bold text-[#061b0e] text-[15px] tracking-tight">PureMatch</span>
        </Link>
        <Link href="/api/demo" className="text-[10px] font-bold tracking-[0.1em] text-[#775a19] bg-[#fed488]/30 border border-[#fed488]/60 px-3 py-1.5 rounded-full hover:bg-[#fed488]/50 transition-colors">
          MODO DEMO
        </Link>
      </header>

      <main className="flex-grow flex flex-col items-center px-5 py-10">
        <div className="w-full max-w-md">

          {/* Brand block */}
          <header className="mb-8 text-center">
            <h1 className="font-serif font-bold text-[#061b0e] text-3xl tracking-tight mb-1">Bienvenido</h1>
            <p className="text-[#737973] text-sm">Registro digital de linaje canino</p>
          </header>

          {/* Tabs */}
          <div className="bg-white border border-[#e4e2e1] rounded-full p-1 mb-6 flex">
            {(['login', 'register'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError('') }}
                className={`flex-1 py-2.5 rounded-full text-[11px] font-bold tracking-[0.08em] transition-all ${
                  tab === t ? 'bg-[#061b0e] text-white' : 'text-[#737973] hover:text-[#1b1c1c]'
                }`}
              >
                {t === 'login' ? 'INGRESAR' : 'REGISTRARSE'}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-[#ffdad6] text-[#93000a] text-[12px] px-4 py-3 rounded-xl mb-4 flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] mt-0.5">error</span>
              {error}
            </div>
          )}

          {/* Form card */}
          <div className="bg-white border border-[#e4e2e1] rounded-2xl p-6 shadow-[0_2px_12px_rgba(6,27,14,0.04)]">
            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <Field label="EMAIL" type="email" required value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} placeholder="ejemplo@criador.com" />
                <Field
                  label="CONTRASEÑA"
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={v => setForm(p => ({ ...p, password: v }))}
                  placeholder="••••••••"
                  rightIcon={showPass ? 'visibility_off' : 'visibility'}
                  onRightIconClick={() => setShowPass(s => !s)}
                />
                <button type="submit" disabled={loading} className="w-full bg-[#061b0e] text-white text-[12px] font-bold tracking-[0.08em] py-3.5 rounded-full mt-2 hover:bg-[#1b3022] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading ? <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>INGRESANDO...</> : 'INGRESAR'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <Field label="NOMBRE COMPLETO" type="text" required value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} placeholder="Ej. Alejandro von West" />
                <Field label="EMAIL" type="email" required value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} placeholder="ejemplo@criador.com" />
                <Field label="CONTRASEÑA" type="password" required minLength={6} value={form.password} onChange={v => setForm(p => ({ ...p, password: v }))} placeholder="Mínimo 6 caracteres" />
                <button type="submit" disabled={loading} className="w-full bg-[#061b0e] text-white text-[12px] font-bold tracking-[0.08em] py-3.5 rounded-full mt-2 hover:bg-[#1b3022] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading ? <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>CREANDO CUENTA...</> : 'CREAR CUENTA'}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="relative flex items-center my-6">
              <div className="flex-grow border-t border-[#e4e2e1]" />
              <span className="flex-shrink mx-3 text-[9px] font-bold tracking-[0.12em] text-[#a0a5a0]">O CONTINÚA CON</span>
              <div className="flex-grow border-t border-[#e4e2e1]" />
            </div>

            {/* Google button */}
            <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 border border-[#c3c8c1] text-[#1b1c1c] text-[12px] font-bold tracking-[0.08em] py-3 rounded-full hover:border-[#061b0e] hover:bg-[#f0eded] transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              GOOGLE
            </button>
          </div>

          <p className="text-[10px] text-[#a0a5a0] text-center mt-6 leading-relaxed">
            Al continuar aceptas la política de privacidad.<br/>
            Datos protegidos con cifrado SSL.
          </p>
        </div>
      </main>
    </div>
  )
}

function Field({
  label, type, value, onChange, placeholder, required, minLength, rightIcon, onRightIconClick,
}: {
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  minLength?: number
  rightIcon?: string
  onRightIconClick?: () => void
}) {
  return (
    <div className="flex flex-col">
      <label className="text-[10px] font-bold tracking-[0.1em] text-[#737973] mb-1.5 ml-1">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          className="w-full bg-[#fcf9f8] border border-[#c3c8c1] rounded-xl px-4 py-3 text-[14px] text-[#1b1c1c] placeholder:text-[#a0a5a0] focus:outline-none focus:border-[#061b0e] transition-colors"
        />
        {rightIcon && (
          <button type="button" onClick={onRightIconClick} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737973] hover:text-[#1b1c1c] transition-colors">
            <span className="material-symbols-outlined text-[18px]">{rightIcon}</span>
          </button>
        )}
      </div>
    </div>
  )
}
