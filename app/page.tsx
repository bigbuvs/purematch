'use client'
import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const stats = [
  { value: '100%', label: 'Perfiles verificados' },
  { value: 'KCC',  label: 'Registro oficial Chile' },
  { value: '48h',  label: 'Tiempo de validación' },
]

const pillars = [
  {
    icon: 'verified',
    title: 'Linaje Verificado',
    desc: 'Cada ejemplar es validado con certificados KCC y registros de salud antes de aparecer en la plataforma.',
    accent: 'bg-secondary-container text-on-secondary-container',
  },
  {
    icon: 'shield_lock',
    title: 'Entorno Seguro',
    desc: 'Datos encriptados y contacto protegido. Solo criadores verificados acceden a información de contacto.',
    accent: 'bg-surface-container-highest text-primary',
  },
  {
    icon: 'workspace_premium',
    title: 'Red de Élite',
    desc: 'La comunidad más exclusiva de criadores comprometidos con la excelencia genética en Chile.',
    accent: 'bg-surface-container-highest text-primary',
  },
]

export default function LandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) router.replace('/explore')
  }, [user, loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <span className="material-symbols-outlined text-outline animate-spin text-3xl">progress_activity</span>
      </div>
    )
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">

      {/* Header */}
      <header className="bg-surface/90 backdrop-blur-sm border-b border-outline-variant flex justify-between items-center px-6 h-[60px] w-full fixed top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
        </div>
        <h1 className="font-serif font-black text-lg text-primary tracking-widest uppercase">PureMatch</h1>
        <Link href="/auth" className="font-label-caps text-[11px] tracking-[0.1em] text-on-surface-variant hover:text-primary transition-colors">
          INGRESAR
        </Link>
      </header>

      <main className="flex-grow pt-[60px] flex flex-col">

        {/* Hero */}
        <section className="relative min-h-[92dvh] flex flex-col items-center justify-center px-6 py-16 overflow-hidden">
          {/* Background texture */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-outline-variant to-transparent" />

          <div className="relative z-10 flex flex-col items-center text-center gap-6 max-w-[640px] mx-auto">
            <div className="inline-flex items-center gap-2 bg-secondary-container/50 border border-secondary-container px-4 py-1.5 rounded-full">
              <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <span className="font-label-caps text-[10px] text-on-secondary-container tracking-[0.12em]">SOLO PERFILES VERIFICADOS · CHILE</span>
            </div>

            <h2 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl text-primary leading-[1.1] tracking-tight">
              El linaje de tu perro<br />
              <span className="text-secondary">merece el mejor match.</span>
            </h2>

            <p className="font-body-md text-on-surface-variant text-base sm:text-lg max-w-[480px] leading-relaxed">
              La plataforma exclusiva para criadores y propietarios de perros con pedigree en Chile. Registro verificado, contacto protegido.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link href="/auth" className="bg-primary text-on-primary font-label-caps text-[12px] tracking-[0.1em] h-12 px-8 flex justify-center items-center gap-2 hover:bg-primary-container hover:text-on-primary-container transition-all">
                REGISTRA TU PERRO
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
              <Link href="/explore" className="border border-outline-variant text-on-surface font-label-caps text-[12px] tracking-[0.1em] h-12 px-8 flex justify-center items-center gap-2 hover:bg-surface-container transition-colors">
                VER EJEMPLARES
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex divide-x divide-outline-variant border border-outline-variant bg-surface w-full sm:w-auto sm:rounded-full overflow-hidden mt-4">
              {stats.map(s => (
                <div key={s.label} className="flex-1 sm:flex-none flex flex-col items-center py-3 px-6 gap-0.5">
                  <span className="font-serif font-bold text-lg text-primary">{s.value}</span>
                  <span className="font-label-caps text-[9px] text-outline tracking-[0.1em] text-center">{s.label.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll cue */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-outline animate-bounce">
            <span className="material-symbols-outlined text-xl">keyboard_arrow_down</span>
          </div>
        </section>

        {/* Pillars */}
        <section className="px-6 py-20 max-w-[1100px] mx-auto w-full">
          <div className="text-center mb-12">
            <p className="font-label-caps text-[10px] text-outline tracking-[0.15em] mb-3">POR QUÉ PUREMATCH</p>
            <h3 className="font-serif font-bold text-3xl text-primary">Estándares de Élite</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {pillars.map(({ icon, title, desc, accent }) => (
              <div key={title} className="bg-surface-container-low border border-outline-variant rounded-xl p-8 flex flex-col gap-5 hover:shadow-[0_8px_32px_rgba(6,27,14,0.08)] transition-shadow group">
                <div className={`${accent} w-11 h-11 rounded-full flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                </div>
                <div>
                  <h4 className="font-serif font-semibold text-primary text-lg mb-2">{title}</h4>
                  <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="bg-surface-container-low border-y border-outline-variant px-6 py-20">
          <div className="max-w-[560px] mx-auto">
            <div className="text-center mb-12">
              <p className="font-label-caps text-[10px] text-outline tracking-[0.15em] mb-3">EL PROCESO</p>
              <h3 className="font-serif font-bold text-3xl text-primary">Cómo funciona</h3>
            </div>
            <div className="flex flex-col gap-0">
              {[
                { n: '01', title: 'Crea tu perfil',    desc: 'Registra tu cuenta y sube los datos básicos de tu ejemplar.' },
                { n: '02', title: 'Documentación',     desc: 'Adjunta pedigree KCC, certificados de salud y fotos del perro.' },
                { n: '03', title: 'Validación 48h',    desc: 'Nuestro equipo revisa y aprueba tu perfil en 48 horas hábiles.' },
                { n: '04', title: 'Encuentra tu match',desc: 'Explora perfiles verificados y envía solicitudes de contacto.' },
              ].map(({ n, title, desc }, i, arr) => (
                <div key={n} className="flex gap-5 relative">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-primary text-on-primary flex items-center justify-center font-serif font-bold text-sm flex-shrink-0 rounded-full">
                      {n}
                    </div>
                    {i < arr.length - 1 && <div className="w-[1px] flex-grow bg-outline-variant my-1" />}
                  </div>
                  <div className="pb-8">
                    <h4 className="font-serif font-semibold text-primary mb-1">{title}</h4>
                    <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="px-6 py-20 text-center flex flex-col items-center gap-6 max-w-[560px] mx-auto">
          <div className="w-14 h-14 bg-secondary-container rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-on-secondary-container text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
          </div>
          <div>
            <h3 className="font-serif font-bold text-3xl text-primary mb-3">¿Listo para empezar?</h3>
            <p className="font-body-md text-on-surface-variant text-base leading-relaxed">
              Registro gratuito. Sin compromisos. Solo criadores verificados.
            </p>
          </div>
          <Link href="/auth" className="bg-primary text-on-primary font-label-caps text-[12px] tracking-[0.1em] h-12 px-10 flex items-center gap-2 hover:bg-primary-container hover:text-on-primary-container transition-all">
            CREAR CUENTA GRATIS
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
          <p className="font-label-caps text-[9px] text-outline tracking-[0.1em]">PLATAFORMA PRIVADA · DATOS PROTEGIDOS · CHILE</p>
        </section>

      </main>
    </div>
  )
}
