'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [showPass, setShowPass] = useState(false)

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex flex-col items-center relative">
      <main className="w-full max-w-md px-8 py-16 flex flex-col items-center">
        {/* Logo */}
        <header className="mb-16 text-center">
          <h1 className="font-serif font-bold text-xl text-primary tracking-widest uppercase mb-2">PureMatch</h1>
          <p className="font-label-caps text-label-caps text-on-surface-variant">Registro Digital de Linaje Canino</p>
        </header>

        <div className="w-full">
          {/* Tabs */}
          <div className="flex border-b border-outline-variant mb-8">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-2 font-label-caps text-label-caps text-center transition-colors ${tab === 'login' ? 'border-b-2 border-primary text-primary' : 'text-outline hover:text-primary'}`}
            >
              INGRESAR
            </button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 py-2 font-label-caps text-label-caps text-center transition-colors ${tab === 'register' ? 'border-b-2 border-primary text-primary' : 'text-outline hover:text-primary'}`}
            >
              REGISTRARSE
            </button>
          </div>

          {tab === 'login' ? (
            <form className="space-y-4 mb-8">
              <div className="flex flex-col">
                <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 ml-1" htmlFor="email">EMAIL</label>
                <input className="bg-surface-container-low border-b border-primary border-t-0 border-l-0 border-r-0 focus:ring-0 focus:border-primary px-4 py-3 placeholder:text-outline-variant text-body-md transition-all" id="email" name="email" placeholder="ejemplo@criador.com" type="email" />
              </div>
              <div className="flex flex-col">
                <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 ml-1" htmlFor="password">CONTRASEÑA</label>
                <div className="relative">
                  <input className="w-full bg-surface-container-low border-b border-primary border-t-0 border-l-0 border-r-0 focus:ring-0 focus:border-primary px-4 py-3 placeholder:text-outline-variant text-body-md transition-all" id="password" name="password" placeholder="••••••••" type={showPass ? 'text' : 'password'} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline text-lg cursor-pointer">
                    {showPass ? 'visibility_off' : 'visibility'}
                  </button>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <a className="font-metadata text-primary text-xs underline decoration-primary/30 underline-offset-4 hover:decoration-primary transition-all" href="#">¿Olvidaste tu contraseña?</a>
              </div>
              <Link href="/explore" className="w-full bg-primary text-on-primary font-label-caps text-label-caps py-4 mt-2 hover:bg-primary-container transition-colors duration-300 block text-center">
                INGRESAR
              </Link>
            </form>
          ) : (
            <form className="space-y-4 mb-8">
              <div className="flex flex-col">
                <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 ml-1">NOMBRE COMPLETO</label>
                <input className="bg-surface-container-low border-b border-primary border-t-0 border-l-0 border-r-0 focus:ring-0 focus:border-primary px-4 py-3 placeholder:text-outline-variant text-body-md" placeholder="Ej. Alejandro von West" type="text" />
              </div>
              <div className="flex flex-col">
                <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 ml-1">EMAIL</label>
                <input className="bg-surface-container-low border-b border-primary border-t-0 border-l-0 border-r-0 focus:ring-0 focus:border-primary px-4 py-3 placeholder:text-outline-variant text-body-md" placeholder="ejemplo@criador.com" type="email" />
              </div>
              <div className="flex flex-col">
                <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 ml-1">CONTRASEÑA</label>
                <input className="bg-surface-container-low border-b border-primary border-t-0 border-l-0 border-r-0 focus:ring-0 focus:border-primary px-4 py-3 placeholder:text-outline-variant text-body-md" placeholder="••••••••" type="password" />
              </div>
              <div className="flex items-start gap-3 py-2">
                <input className="mt-1 text-primary focus:ring-primary border-outline" id="terms" type="checkbox" />
                <label className="font-metadata text-xs text-on-surface-variant" htmlFor="terms">Acepto los términos y condiciones de la membresía de PureMatch Registry.</label>
              </div>
              <Link href="/onboarding/user" className="w-full bg-primary text-on-primary font-label-caps text-label-caps py-4 hover:bg-primary-container transition-colors duration-300 block text-center">
                CREAR CUENTA
              </Link>
            </form>
          )}

          {/* Divider */}
          <div className="relative flex items-center mb-8">
            <div className="flex-grow border-t border-outline-variant" />
            <span className="flex-shrink mx-4 font-label-caps text-[10px] text-outline">O CONTINÚA CON</span>
            <div className="flex-grow border-t border-outline-variant" />
          </div>

          {/* Google */}
          <button className="w-full flex items-center justify-center gap-3 border border-primary text-primary font-label-caps text-label-caps py-4 hover:bg-surface-container-highest transition-colors duration-300">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="currentColor" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" />
            </svg>
            GOOGLE
          </button>
        </div>

        <footer className="mt-auto pt-8 flex flex-col items-center">
          <div className="w-12 h-px bg-outline-variant mb-4" />
          <p className="font-metadata text-[10px] text-outline text-center leading-relaxed">
            PLATAFORMA DE REGISTRO PRIVADO.<br />DATOS PROTEGIDOS POR CRIPTOGRAFÍA.
          </p>
        </footer>
      </main>
    </div>
  )
}
