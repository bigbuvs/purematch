'use client'
import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const HERO_IMG = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1920&q=80'

const featuredDogs = [
  {
    name: 'Arya von Westwood',
    breed: 'Border Collie',
    age: '2 años',
    sex: 'Hembra',
    zone: 'Providencia, RM',
    img: 'https://images.unsplash.com/photo-1503256207526-0d5523f31580?auto=format&fit=crop&w=600&h=600&q=80',
    kcc: 'KCC-2024-BC-00892',
  },
  {
    name: 'Thor of Golden Peak',
    breed: 'Golden Retriever',
    age: '3 años',
    sex: 'Macho',
    zone: 'Las Condes, RM',
    img: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&h=600&q=80',
    kcc: 'KCC-2023-GR-01147',
  },
  {
    name: 'Luna von Schwarzwald',
    breed: 'German Shepherd',
    age: '4 años',
    sex: 'Hembra',
    zone: 'Vitacura, RM',
    img: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=600&h=600&q=80',
    kcc: 'KCC-2022-GS-00634',
  },
]

const breeds = [
  { name: 'Border Collie',     img: 'https://images.unsplash.com/photo-1503256207526-0d5523f31580?auto=format&fit=crop&w=400&h=300&q=80' },
  { name: 'Golden Retriever',  img: 'https://images.unsplash.com/photo-1534361960057-19f4434a78d9?auto=format&fit=crop&w=400&h=300&q=80' },
  { name: 'Husky Siberiano',   img: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=400&h=300&q=80' },
  { name: 'German Shepherd',   img: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=400&h=300&q=80' },
]

export default function LandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) router.replace('/explore')
  }, [user, loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#061b0e] flex items-center justify-center">
        <span className="font-serif font-black text-2xl text-[#fed488] tracking-widest">PUREMATCH</span>
      </div>
    )
  }

  return (
    <div className="bg-[#fcf9f8] text-[#1b1c1c] min-h-screen flex flex-col overflow-x-hidden">

      {/* ── HEADER ── */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 md:px-12 h-[64px] bg-[#fcf9f8]/90 backdrop-blur-md border-b border-[#c3c8c1]/50">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#061b0e] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
        </div>
        <span className="font-serif font-black text-[18px] text-[#061b0e] tracking-[0.2em] uppercase">PureMatch</span>
        <Link href="/auth" className="font-label-caps text-[10px] tracking-[0.15em] text-[#434843] hover:text-[#061b0e] transition-colors">
          INGRESAR
        </Link>
      </header>

      <main className="flex-grow pt-[64px]">

        {/* ── HERO ── */}
        <section className="relative min-h-[100dvh] flex flex-col">
          {/* Background image */}
          <div className="absolute inset-0">
            <img
              src={HERO_IMG}
              alt="PureMatch"
              className="w-full h-full object-cover"
              loading="eager"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#061b0e]/90 via-[#061b0e]/70 to-[#061b0e]/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#061b0e]/60 via-transparent to-transparent" />
          </div>

          {/* Hero content */}
          <div className="relative z-10 flex flex-col justify-center flex-grow px-6 md:px-16 lg:px-24 py-16 max-w-[1280px] mx-auto w-full">
            <div className="max-w-[620px]">
              <div className="inline-flex items-center gap-2 border border-[#fed488]/40 bg-[#fed488]/10 px-4 py-1.5 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#fed488]" />
                <span className="font-label-caps text-[10px] text-[#fed488] tracking-[0.15em]">SOLO PERFILES VERIFICADOS · CHILE</span>
              </div>

              <h2 className="font-serif font-bold text-[44px] sm:text-[56px] lg:text-[68px] text-white leading-[1.05] tracking-tight mb-6">
                El linaje de tu perro<br />
                merece el mejor<br />
                <span className="text-[#fed488]">match.</span>
              </h2>

              <p className="font-body-md text-white/70 text-base sm:text-lg max-w-[460px] leading-relaxed mb-8">
                La plataforma exclusiva para criadores y propietarios de perros con pedigree en Chile. Registro verificado, contacto protegido.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/auth" className="bg-[#fed488] text-[#261900] font-label-caps text-[11px] tracking-[0.12em] h-12 px-8 flex justify-center items-center gap-2 hover:bg-[#e9c176] transition-colors">
                  REGISTRA TU PERRO
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
                <Link href="/explore" className="border border-white/30 text-white font-label-caps text-[11px] tracking-[0.12em] h-12 px-8 flex justify-center items-center gap-2 hover:bg-white/10 transition-colors">
                  VER EJEMPLARES
                </Link>
              </div>
            </div>
          </div>

          {/* Stats strip at bottom */}
          <div className="relative z-10 border-t border-white/10 bg-[#061b0e]/70 backdrop-blur-sm">
            <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-3 divide-x divide-white/10">
              {[
                { value: '100%', label: 'Perfiles verificados' },
                { value: 'KCC',  label: 'Registro oficial Chile' },
                { value: '48h',  label: 'Tiempo de validación' },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center py-5 gap-1">
                  <span className="font-serif font-bold text-xl sm:text-2xl text-[#fed488]">{s.value}</span>
                  <span className="font-label-caps text-[9px] text-white/50 tracking-[0.1em] text-center">{s.label.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURED PROFILES ── */}
        <section className="px-6 md:px-12 py-20 max-w-[1280px] mx-auto w-full">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="font-label-caps text-[10px] text-[#737973] tracking-[0.15em] mb-2">EJEMPLARES VERIFICADOS</p>
              <h3 className="font-serif font-bold text-3xl sm:text-4xl text-[#061b0e]">Perfiles Destacados</h3>
            </div>
            <Link href="/explore" className="hidden sm:flex items-center gap-1.5 font-label-caps text-[10px] text-[#061b0e] tracking-[0.1em] border-b border-[#061b0e] pb-0.5 hover:text-[#775a19] hover:border-[#775a19] transition-colors">
              VER TODOS
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredDogs.map(dog => (
              <Link key={dog.name} href="/auth" className="group block">
                <div className="bg-white border border-[#c3c8c1] rounded-2xl overflow-hidden hover:shadow-[0_12px_40px_rgba(6,27,14,0.12)] transition-all duration-300">
                  {/* Photo */}
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img
                      src={dog.img}
                      alt={dog.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Verified badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#061b0e]/80 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="material-symbols-outlined text-[#fed488] text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                      <span className="font-label-caps text-[9px] text-white tracking-[0.1em]">VERIFICADO</span>
                    </div>
                    {/* Sex badge */}
                    <div className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center ${dog.sex === 'Macho' ? 'bg-[#061b0e]' : 'bg-[#775a19]'}`}>
                      <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {dog.sex === 'Macho' ? 'male' : 'female'}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-serif font-semibold text-[#061b0e] text-lg leading-tight">{dog.name}</h4>
                    </div>
                    <p className="font-body-md text-[#434843] text-sm font-medium">{dog.breed}</p>
                    <p className="font-metadata text-xs text-[#737973] mt-0.5">{dog.age}</p>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#f0eded]">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[#737973] text-xs">location_on</span>
                        <span className="font-metadata text-xs text-[#737973]">{dog.zone}</span>
                      </div>
                      <span className="font-label-caps text-[9px] text-[#775a19] bg-[#fed488]/30 border border-[#fed488] px-2 py-0.5 rounded-full tracking-[0.08em]">KCC</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex justify-center mt-8 sm:hidden">
            <Link href="/explore" className="flex items-center gap-1.5 font-label-caps text-[11px] text-[#061b0e] tracking-[0.1em] border border-[#061b0e] px-6 py-3 hover:bg-[#061b0e] hover:text-white transition-colors">
              VER TODOS LOS PERFILES
            </Link>
          </div>
        </section>

        {/* ── BREEDS GRID ── */}
        <section className="bg-[#061b0e] px-6 md:px-12 py-20">
          <div className="max-w-[1280px] mx-auto">
            <div className="text-center mb-12">
              <p className="font-label-caps text-[10px] text-[#fed488]/70 tracking-[0.15em] mb-3">RAZAS EN LA PLATAFORMA</p>
              <h3 className="font-serif font-bold text-3xl sm:text-4xl text-white">Líneas de Élite</h3>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {breeds.map(b => (
                <Link key={b.name} href="/auth" className="group relative aspect-square rounded-xl overflow-hidden">
                  <img src={b.img} alt={b.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#061b0e]/90 via-[#061b0e]/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="font-serif font-semibold text-white text-base leading-tight">{b.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── PILLARS ── */}
        <section className="px-6 md:px-12 py-20 max-w-[1280px] mx-auto w-full">
          <div className="text-center mb-12">
            <p className="font-label-caps text-[10px] text-[#737973] tracking-[0.15em] mb-3">POR QUÉ PUREMATCH</p>
            <h3 className="font-serif font-bold text-3xl sm:text-4xl text-[#061b0e]">Estándares de Élite</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: 'verified',
                title: 'Linaje Verificado',
                desc: 'Cada ejemplar es validado con pedigree KCC y certificados de salud antes de aparecer en la plataforma.',
                bg: 'bg-[#fed488]/20 border-[#fed488]/40',
                iconBg: 'bg-[#fed488] text-[#261900]',
              },
              {
                icon: 'shield_lock',
                title: 'Entorno Seguro',
                desc: 'Datos encriptados y contacto protegido. Solo criadores verificados acceden a información de contacto.',
                bg: 'bg-[#f6f3f2] border-[#c3c8c1]',
                iconBg: 'bg-[#061b0e] text-white',
              },
              {
                icon: 'workspace_premium',
                title: 'Red de Élite',
                desc: 'La comunidad más exclusiva de criadores comprometidos con la excelencia genética canina en Chile.',
                bg: 'bg-[#f6f3f2] border-[#c3c8c1]',
                iconBg: 'bg-[#061b0e] text-white',
              },
            ].map(({ icon, title, desc, bg, iconBg }) => (
              <div key={title} className={`${bg} border rounded-2xl p-8 flex flex-col gap-5 hover:shadow-[0_8px_32px_rgba(6,27,14,0.08)] transition-shadow group`}>
                <div className={`${iconBg} w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0`}>
                  <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                </div>
                <div>
                  <h4 className="font-serif font-semibold text-[#061b0e] text-xl mb-2">{title}</h4>
                  <p className="font-body-md text-[#434843] text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="bg-[#f6f3f2] border-y border-[#c3c8c1] px-6 md:px-12 py-20">
          <div className="max-w-[800px] mx-auto">
            <div className="text-center mb-14">
              <p className="font-label-caps text-[10px] text-[#737973] tracking-[0.15em] mb-3">EL PROCESO</p>
              <h3 className="font-serif font-bold text-3xl sm:text-4xl text-[#061b0e]">Cómo funciona</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
              {[
                { n: '01', title: 'Crea tu perfil',     desc: 'Registra tu cuenta con email o Google. Toma menos de 2 minutos.' },
                { n: '02', title: 'Sube documentación',  desc: 'Adjunta pedigree KCC, certificados de salud y fotos de tu ejemplar.' },
                { n: '03', title: 'Validación en 48h',   desc: 'Nuestro equipo revisa y aprueba tu perfil en máximo 48 horas hábiles.' },
                { n: '04', title: 'Encuentra tu match',  desc: 'Explora perfiles verificados y envía solicitudes de contacto con un clic.' },
              ].map(({ n, title, desc }) => (
                <div key={n} className="flex gap-5">
                  <div className="w-12 h-12 bg-[#061b0e] text-white flex items-center justify-center font-serif font-bold text-sm flex-shrink-0 rounded-full">
                    {n}
                  </div>
                  <div className="pt-1">
                    <h4 className="font-serif font-semibold text-[#061b0e] text-lg mb-1.5">{title}</h4>
                    <p className="font-body-md text-sm text-[#434843] leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="relative px-6 md:px-12 py-24 overflow-hidden bg-[#061b0e]">
          {/* Background image subtle */}
          <div className="absolute inset-0 opacity-20">
            <img
              src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1920&q=60"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#061b0e]/80 to-[#061b0e]" />

          <div className="relative z-10 max-w-[560px] mx-auto text-center flex flex-col items-center gap-6">
            <div className="w-14 h-14 bg-[#fed488] rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-[#261900] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
            </div>
            <div>
              <h3 className="font-serif font-bold text-3xl sm:text-4xl text-white mb-3">¿Tienes un ejemplar<br />con pedigree?</h3>
              <p className="font-body-md text-white/60 text-base leading-relaxed">
                Únete a la red más exclusiva de criadores caninos de Chile. Registro gratuito, sin compromisos.
              </p>
            </div>
            <Link href="/auth" className="bg-[#fed488] text-[#261900] font-label-caps text-[11px] tracking-[0.12em] h-12 px-10 flex items-center gap-2 hover:bg-[#e9c176] transition-colors">
              CREAR CUENTA GRATIS
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
            <p className="font-label-caps text-[9px] text-white/30 tracking-[0.12em]">PLATAFORMA PRIVADA · DATOS PROTEGIDOS · CHILE</p>
          </div>
        </section>

      </main>
    </div>
  )
}
