'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { insforge } from '@/lib/insforge'
import { useAuth } from '@/context/AuthContext'

function AuthContent() {
  const router = useRouter()
  const { user, loading: authLoading, signOut, refresh } = useAuth()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/explore'
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [switchingAccount, setSwitchingAccount] = useState(false)

  // Email verification state — set after register or unverified login
  const [verifyEmail, setVerifyEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const clearDemo = () => { document.cookie = 'purematch_demo=; path=/; max-age=0' }

  useEffect(() => { clearDemo() }, [])

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  const isRealSession = !!user && user.id !== 'demo-user'

  const handleSwitchAccount = async () => {
    setSwitchingAccount(true)
    await signOut()
    router.refresh()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await insforge.auth.signInWithPassword({ email: form.email, password: form.password })
    if (error) {
      // InsForge returns this message when email is not verified
      const needsVerify = /verif|confirm|not verified/i.test(error.message)
      if (needsVerify) {
        setVerifyEmail(form.email)
        setResendCooldown(60)
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }
    clearDemo()
    await refresh()
    router.push(next)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { data, error } = await insforge.auth.signUp({
      email: form.email,
      password: form.password,
      name: form.name,
    }) as any
    if (error) { setError(error.message); setLoading(false); return }

    const registeredUser = data?.user ?? data
    const userId = registeredUser?.id

    if (userId) {
      await (insforge.database.from('users').upsert({
        id: userId,
        name: form.name || form.email.split('@')[0],
        email: form.email,
        phone: null,
        zone: null,
        rut: null,
        avatar_url: null,
      }) as any).catch(() => {})
    }

    // If email is not yet verified, show the verification step
    if (registeredUser?.emailVerified === false) {
      setVerifyEmail(form.email)
      setResendCooldown(60)
      setLoading(false)
      return
    }

    // Email already verified (e.g. autoConfirm is on) — go straight to onboarding
    clearDemo()
    await refresh()
    router.push('/onboarding/user')
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await insforge.auth.verifyEmail({ email: verifyEmail, otp })
    if (error) { setError(error.message); setLoading(false); return }
    clearDemo()
    await refresh()
    // After verifying, go to onboarding if came from register, otherwise to `next`
    router.push(tab === 'register' ? '/onboarding/user' : next)
  }

  const handleResend = async () => {
    setError('')
    const { error } = await insforge.auth.resendVerificationEmail({ email: verifyEmail })
    if (error) { setError(error.message); return }
    setResendCooldown(60)
  }

  const handleOAuth = (provider: 'google' | 'facebook') => {
    clearDemo()
    insforge.auth.signInWithOAuth({
      provider,
      redirectTo: `${window.location.origin}${next}`,
    })
  }

  // ── Email verification screen ────────────────────────────────────────────────
  if (verifyEmail) {
    return (
      <div className="bg-[#fcf9f8] min-h-screen flex flex-col">
        <header className="px-4 h-[60px] flex items-center border-b border-[#c3c8c1]/60 bg-[#fcf9f8]/95 backdrop-blur-sm sticky top-0 z-40">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/isotipo.svg" alt="PureMatch" width={32} height={32} className="rounded-full" />
            <span className="font-serif font-bold text-[#061b0e] text-[15px] tracking-tight">PureMatch</span>
          </Link>
        </header>

        <main className="flex-grow flex flex-col items-center px-5 py-10">
          <div className="w-full max-w-md">
            <header className="mb-8 text-center">
              <div className="w-14 h-14 rounded-full bg-[#e8f5e9] flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[28px] text-[#2e7d32]" style={{ fontVariationSettings: "'FILL' 1" }}>mark_email_unread</span>
              </div>
              <h1 className="font-serif font-bold text-[#061b0e] text-2xl tracking-tight mb-2">Verifica tu email</h1>
              <p className="text-[#737973] text-sm">
                Enviamos un código de 6 dígitos a<br />
                <span className="font-semibold text-[#061b0e]">{verifyEmail}</span>
              </p>
            </header>

            {error && (
              <div className="bg-[#ffdad6] text-[#93000a] text-[12px] px-4 py-3 rounded-xl mb-4 flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] mt-0.5">error</span>
                {error}
              </div>
            )}

            <div className="bg-white border border-[#e4e2e1] rounded-2xl p-6 shadow-[0_2px_12px_rgba(6,27,14,0.04)]">
              <form onSubmit={handleVerify} className="flex flex-col gap-4">
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold tracking-[0.1em] text-[#737973] mb-1.5 ml-1">CÓDIGO DE VERIFICACIÓN</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    required
                    className="w-full bg-[#fcf9f8] border border-[#c3c8c1] rounded-xl px-4 py-3 text-[20px] text-[#1b1c1c] text-center tracking-[0.3em] placeholder:text-[#a0a5a0] placeholder:tracking-[0.3em] focus:outline-none focus:border-[#061b0e] transition-colors font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full bg-[#061b0e] text-white text-[12px] font-bold tracking-[0.08em] py-3.5 rounded-full mt-1 hover:bg-[#1b3022] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading
                    ? <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>VERIFICANDO...</>
                    : 'CONFIRMAR CÓDIGO'}
                </button>
              </form>

              <div className="text-center mt-5">
                <p className="text-[11px] text-[#737973] mb-2">¿No recibiste el código?</p>
                <button
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  className="text-[11px] font-bold text-[#061b0e] underline disabled:text-[#a0a5a0] disabled:no-underline transition-colors"
                >
                  {resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : 'Reenviar código'}
                </button>
              </div>
            </div>

            <button
              onClick={() => { setVerifyEmail(''); setOtp(''); setError('') }}
              className="flex items-center gap-1.5 text-[11px] text-[#737973] mt-5 mx-auto hover:text-[#1b1c1c] transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              Volver al inicio de sesión
            </button>
          </div>
        </main>
      </div>
    )
  }

  // ── Normal login / register screen ──────────────────────────────────────────
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

          {/* Active session banner */}
          {!authLoading && isRealSession && (
            <div className="bg-white border border-[#e4e2e1] rounded-2xl p-5 mb-6 flex flex-col gap-3 shadow-[0_2px_12px_rgba(6,27,14,0.04)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#061b0e] text-white flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
                </div>
                <div className="min-w-0 flex-grow">
                  <p className="text-[10px] font-bold tracking-[0.1em] text-[#737973]">SESIÓN ACTIVA</p>
                  <p className="text-sm font-semibold text-[#061b0e] truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  href={next}
                  className="w-full bg-[#061b0e] text-white text-[11px] font-bold tracking-[0.08em] py-2.5 rounded-full hover:bg-[#1b3022] transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  IR A LA APP
                </Link>
                <button
                  onClick={handleSwitchAccount}
                  disabled={switchingAccount}
                  className="w-full border border-[#c3c8c1] text-[#737973] text-[11px] font-bold tracking-[0.08em] py-2.5 rounded-full hover:border-[#061b0e] hover:text-[#061b0e] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {switchingAccount
                    ? <><span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>CERRANDO SESIÓN...</>
                    : <><span className="material-symbols-outlined text-[14px]">logout</span>CERRAR SESIÓN Y ENTRAR CON OTRA CUENTA</>}
                </button>
              </div>
            </div>
          )}

          {/* Tabs */}
          {!isRealSession && (
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
          )}

          {error && !isRealSession && (
            <div className="bg-[#ffdad6] text-[#93000a] text-[12px] px-4 py-3 rounded-xl mb-4 flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] mt-0.5">error</span>
              {error}
            </div>
          )}

          {/* Form card */}
          {!isRealSession && (
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

            {/* OAuth buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button onClick={() => handleOAuth('google')} className="flex items-center justify-center gap-2 border border-[#c3c8c1] text-[#1b1c1c] text-[11px] font-bold tracking-[0.08em] py-3 rounded-full hover:border-[#061b0e] hover:bg-[#f0eded] transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                GOOGLE
              </button>
              <button onClick={() => handleOAuth('facebook')} className="flex items-center justify-center gap-2 border border-[#c3c8c1] text-[#1b1c1c] text-[11px] font-bold tracking-[0.08em] py-3 rounded-full hover:border-[#1877f2] hover:bg-[#f0eded] transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                FACEBOOK
              </button>
            </div>
          </div>
          )}

          {!isRealSession && (
          <p className="text-[10px] text-[#a0a5a0] text-center mt-6 leading-relaxed">
            Al continuar aceptas los{' '}
            <Link href="/terms" className="underline hover:text-[#061b0e]">términos de uso</Link>
            {' '}y la{' '}
            <Link href="/privacy" className="underline hover:text-[#061b0e]">política de privacidad</Link>.<br/>
            Datos protegidos con cifrado SSL.
          </p>
          )}
        </div>
      </main>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="bg-[#fcf9f8] min-h-screen flex items-center justify-center"><span className="material-symbols-outlined text-5xl text-[#c3c8c1] animate-spin">progress_activity</span></div>}>
      <AuthContent />
    </Suspense>
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
