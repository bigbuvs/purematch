'use client'
import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

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
      <header className="bg-surface flex justify-between items-center px-6 py-4 w-full fixed top-0 z-50 border-b border-outline-variant">
        <div className="w-16" />
        <h1 className="text-xl font-serif font-black text-primary tracking-tight">PureMatch</h1>
        <Link href="/auth" className="font-label-caps text-[10px] text-outline hover:text-primary transition-colors">
          INGRESAR
        </Link>
      </header>

      <main className="flex-grow pt-[72px] pb-[80px] px-4 md:px-16 max-w-[1280px] mx-auto w-full flex flex-col gap-20">

        {/* Hero */}
        <section className="flex flex-col gap-8 pt-10">
          <div className="flex flex-col gap-6 text-center">
            <p className="font-label-caps text-label-caps text-on-surface-variant tracking-widest">REGISTRO DIGITAL DE LINAJE CANINO</p>
            <h2 className="font-serif font-bold text-4xl sm:text-5xl text-primary max-w-[720px] mx-auto leading-tight">
              Donde los perros con pedigree encuentran su mejor match.
            </h2>
            <p className="font-body-md text-on-surface-variant text-base max-w-[560px] mx-auto">
              Solo perfiles verificados. Solo criadores de confianza. La plataforma exclusiva para líneas genéticas de élite en Chile.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth" className="bg-primary text-on-primary font-label-caps text-label-caps h-12 px-8 flex justify-center items-center gap-2 hover:bg-primary-container transition-colors">
                REGISTRA TU PERRO
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
              <Link href="/explore" className="border border-outline-variant text-on-surface font-label-caps text-label-caps h-12 px-8 flex justify-center items-center gap-2 hover:bg-surface-container transition-colors">
                VER EJEMPLARES
              </Link>
            </div>
          </div>

          {/* Hero visual — no external images */}
          <div className="w-full aspect-[16/7] rounded-xl overflow-hidden border border-outline-variant bg-surface-container flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-[#fed488]/20" />
            <div className="relative z-10 flex flex-col items-center gap-4 text-center px-4">
              <div className="flex gap-6">
                {['pets', 'verified', 'handshake'].map(icon => (
                  <div key={icon} className="w-16 h-16 rounded-full bg-surface-container-low border border-outline-variant flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                  </div>
                ))}
              </div>
              <p className="font-label-caps text-[10px] text-outline tracking-widest">LÍNEAS VERIFICADAS · CONTACTOS EXCLUSIVOS · CHILE</p>
            </div>
          </div>
        </section>

        {/* Pillars */}
        <section className="flex flex-col gap-6">
          <h3 className="font-headline-md text-headline-md text-primary text-center">Estándares de Élite</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: 'verified',  title: 'Validado',   desc: 'Cada linaje es verificado mediante certificaciones de salud y registros de la Kennel Club de Chile.', iconBg: 'bg-[#e9c176] text-[#261900]' },
              { icon: 'shield',    title: 'Seguro',     desc: 'Entorno blindado, diseñado exclusivamente para proteger a criadores y propietarios de alto nivel.',    iconBg: 'bg-surface-container-highest text-primary' },
              { icon: 'handshake', title: 'Confiable',  desc: 'La red más exclusiva de criadores comprometidos con la excelencia genética en Chile.',                 iconBg: 'bg-surface-container-highest text-primary' },
            ].map(({ icon, title, desc, iconBg }) => (
              <div key={title} className="bg-surface-container-low border border-outline-variant rounded-xl p-8 flex flex-col gap-4 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow">
                <div className={`${iconBg} w-12 h-12 rounded-full flex items-center justify-center`}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                </div>
                <h4 className="font-headline-sm text-primary text-lg font-semibold">{title}</h4>
                <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Steps */}
        <section className="flex flex-col gap-6 max-w-[640px] mx-auto w-full">
          <h3 className="font-headline-md text-headline-md text-primary text-center">Cómo funciona</h3>
          <div className="flex flex-col relative">
            <div className="absolute left-6 top-6 bottom-6 w-px bg-primary/15" />
            {[
              { n: '1', title: 'Registro de perfil', desc: 'Sube los datos básicos y certificados de tu ejemplar.' },
              { n: '2', title: 'Auditoría',           desc: 'Nuestro equipo valida la documentación en 24–48 horas hábiles.' },
              { n: '3', title: 'Búsqueda',            desc: 'Filtra por raza, sexo y zona. Explora perfiles verificados.' },
              { n: '4', title: 'Match y contacto',    desc: 'Envía una solicitud. Si hay interés mutuo, desbloquea el contacto.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="relative z-10 flex gap-4 items-start py-5">
                <div className="flex-shrink-0 w-12 h-12 bg-primary text-on-primary flex items-center justify-center font-serif font-bold text-lg">
                  {n}
                </div>
                <div className="pt-2">
                  <h4 className="font-headline-sm text-primary font-semibold mb-1">{title}</h4>
                  <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA bottom */}
        <section className="text-center py-10 bg-surface-container-low border border-outline-variant rounded-xl px-8 flex flex-col gap-4 items-center">
          <span className="material-symbols-outlined text-[#775a19] text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
          <h3 className="font-headline-sm text-primary text-2xl font-semibold">¿Tienes un ejemplar de pedigree?</h3>
          <p className="font-body-md text-on-surface-variant text-sm max-w-md leading-relaxed">
            Únete a la red más exclusiva de criadores caninos de Chile. Registro gratuito, sin compromisos.
          </p>
          <Link href="/auth" className="bg-primary text-on-primary font-label-caps text-label-caps h-12 px-10 flex items-center gap-2 hover:bg-primary-container transition-colors">
            COMENZAR AHORA
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </section>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center bg-surface pb-safe border-t border-outline-variant md:hidden h-[64px]">
        {[
          { href: '/explore', icon: 'search',     label: 'Explorar'  },
          { href: '/auth',    icon: 'add_circle',  label: 'Registrar' },
          { href: '/auth',    icon: 'handshake',   label: 'Matches'   },
          { href: '/auth',    icon: 'person',      label: 'Perfil'    },
        ].map(({ href, icon, label }) => (
          <Link key={label} href={href} className="flex flex-col items-center justify-center text-outline pt-2 pb-2 w-full hover:text-primary transition-colors font-label-caps text-[9px] gap-1">
            <span className="material-symbols-outlined text-xl">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
