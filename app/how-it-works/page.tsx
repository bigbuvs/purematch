import Link from 'next/link'

const STEPS = [
  {
    number: '01',
    icon: 'app_registration',
    title: 'Crea tu cuenta y registra a tu ejemplar',
    desc: 'Regístrate en menos de 2 minutos. Luego completa el perfil de tu perro: raza, edad, sexo, zona y fotos.',
    detail: 'Es importante que la información sea precisa — esto garantiza que los criadores encuentren el match correcto.',
  },
  {
    number: '02',
    icon: 'verified',
    title: 'Validación por el equipo PureMatch',
    desc: 'Nuestro equipo revisa el registro de pedigree ante el Kennel Club de Chile (KCC) en un plazo de 24 a 72 horas hábiles.',
    detail: 'Recibirás un correo cuando tu perfil sea verificado. Perros sin pedigree KCC pueden aparecer con perfil básico, sin el badge de verificación.',
  },
  {
    number: '03',
    icon: 'search',
    title: 'Explora y filtra ejemplares',
    desc: 'Usa los filtros de raza, sexo y sector para encontrar candidatos compatibles. Puedes ver fotos y datos del ejemplar sin costo.',
    detail: 'La búsqueda es libre para todos los usuarios registrados.',
  },
  {
    number: '04',
    icon: 'favorite',
    title: 'Envía o recibe una solicitud de match',
    desc: 'Cuando encuentres un ejemplar interesante, envía una solicitud. El otro criador recibirá una notificación y podrá aceptar o rechazar.',
    detail: 'El match se confirma solo cuando ambas partes aceptan. Puedes seguir el estado desde "Mis matches".',
  },
  {
    number: '05',
    icon: 'lock_open',
    title: 'Desbloquea el contacto directo',
    desc: 'Una vez que hay match mutuo, se habilita el acceso al contacto completo del criador: nombre, teléfono y correo electrónico.',
    detail: 'El desbloqueo tiene un costo único por match. Esto financia la validación de pedigrees y el mantenimiento de la plataforma.',
  },
  {
    number: '06',
    icon: 'handshake',
    title: 'Coordina directamente con el criador',
    desc: 'Con el contacto desbloqueado, coordinan los detalles de la cruza directamente, sin intermediarios.',
    detail: 'PureMatch no interviene en el acuerdo ni en condiciones económicas de la cruza.',
  },
]

const FAQS = [
  {
    q: '¿Cuánto tiempo tarda la validación?',
    a: 'Entre 24 y 72 horas hábiles. Si tu perro tiene pedigree KCC vigente, el proceso es más rápido. Te avisamos por correo al confirmar.',
  },
  {
    q: '¿Qué pasa si mi perro no tiene pedigree KCC?',
    a: 'Puedes crear un perfil básico y explorar la plataforma, pero el badge de verificación solo se otorga a ejemplares con registro KCC vigente. Recomendamos tramitarlo antes de registrarte.',
  },
  {
    q: '¿Cuánto cuesta desbloquear un contacto?',
    a: 'El precio varía según el plan vigente. Puedes ver las tarifas actualizadas en el panel de matches o contactándonos.',
  },
  {
    q: '¿Puedo cancelar una solicitud enviada?',
    a: 'Sí, desde "Mis matches → Enviadas" puedes retirar una solicitud pendiente en cualquier momento.',
  },
  {
    q: '¿Puedo registrar más de un perro?',
    a: 'Sí, puedes tener múltiples perfiles de ejemplares bajo una misma cuenta.',
  },
]

export default function HowItWorksPage() {
  return (
    <div className="bg-[#fcf9f8] min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="px-4 h-[60px] flex items-center justify-between border-b border-[#c3c8c1]/60 bg-[#fcf9f8]/95 backdrop-blur-sm sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/isotipo.svg" alt="PureMatch" width={32} height={32} className="rounded-full" />
          <span className="font-serif font-bold text-[#061b0e] text-[15px] tracking-tight">PureMatch</span>
        </Link>
        <Link href="/explore" className="text-[11px] font-bold tracking-[0.08em] text-[#061b0e] border border-[#061b0e] px-3.5 py-1.5 rounded-full hover:bg-[#061b0e] hover:text-white transition-colors">
          EXPLORAR
        </Link>
      </header>

      <main className="flex-grow max-w-[680px] mx-auto w-full px-4 py-10">

        {/* Hero */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-[#fed488]/20 border border-[#fed488]/50 text-[#775a19] text-[10px] font-bold tracking-[0.12em] px-3 py-1.5 rounded-full mb-4">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            CÓMO FUNCIONA
          </div>
          <h1 className="font-serif font-bold text-[#061b0e] text-3xl tracking-tight mb-3">
            El proceso, paso a paso
          </h1>
          <p className="text-[#737973] text-[15px] leading-relaxed">
            PureMatch es un registro digital de linaje canino que conecta criadores responsables. Así funciona el proceso de principio a fin.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mb-14">
          {/* vertical line */}
          <div className="absolute left-[19px] top-8 bottom-8 w-px bg-[#c3c8c1]/60 hidden sm:block" />

          <div className="flex flex-col gap-6">
            {STEPS.map((step) => (
              <div key={step.number} className="flex gap-5">
                {/* Number circle */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#061b0e] text-[#fed488] flex items-center justify-center relative z-10">
                  <span className="text-[11px] font-bold tracking-[0.08em]">{step.number}</span>
                </div>

                {/* Content */}
                <div className="flex-grow bg-white border border-[#e4e2e1] rounded-2xl px-5 py-4 shadow-[0_2px_8px_rgba(6,27,14,0.04)]">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="material-symbols-outlined text-[#fed488] text-[22px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>{step.icon}</span>
                    <h2 className="font-serif font-bold text-[#061b0e] text-[16px] leading-snug">{step.title}</h2>
                  </div>
                  <p className="text-[#1b1c1c] text-[13px] leading-relaxed mb-2">{step.desc}</p>
                  <p className="text-[#737973] text-[12px] leading-relaxed">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#c3c8c1]/60 mb-10" />

        {/* Tiempos de revisión */}
        <div className="bg-[#061b0e] rounded-2xl p-6 mb-10">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="material-symbols-outlined text-[#fed488] text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
            <h2 className="font-serif font-bold text-white text-[18px]">Tiempos de revisión</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Validación de pedigree',   value: '24 – 72 h hábiles' },
              { label: 'Respuesta a solicitudes',   value: 'Depende del criador' },
              { label: 'Desbloqueo de contacto',   value: 'Inmediato' },
              { label: 'Soporte por email',          value: '< 24 h hábiles' },
            ].map(item => (
              <div key={item.label} className="bg-white/10 rounded-xl px-4 py-3">
                <p className="text-[#fed488] text-[10px] font-bold tracking-[0.08em] mb-1">{item.value}</p>
                <p className="text-white/70 text-[11px]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-10">
          <h2 className="font-serif font-bold text-[#061b0e] text-[20px] mb-5">Preguntas frecuentes</h2>
          <div className="flex flex-col gap-3">
            {FAQS.map((faq) => (
              <div key={faq.q} className="bg-white border border-[#e4e2e1] rounded-2xl px-5 py-4">
                <p className="font-semibold text-[#061b0e] text-[13px] mb-1.5">{faq.q}</p>
                <p className="text-[#737973] text-[12px] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/auth" className="flex-1 flex items-center justify-center gap-2 bg-[#061b0e] text-white text-[12px] font-bold tracking-[0.08em] py-3.5 rounded-full hover:bg-[#1b3022] transition-colors">
            <span className="material-symbols-outlined text-[16px]">login</span>
            CREAR CUENTA
          </Link>
          <Link href="/contact" className="flex-1 flex items-center justify-center gap-2 border border-[#c3c8c1] text-[#061b0e] text-[12px] font-bold tracking-[0.08em] py-3.5 rounded-full hover:border-[#061b0e] hover:bg-[#f0eded] transition-colors">
            <span className="material-symbols-outlined text-[16px]">support_agent</span>
            CONTACTAR SOPORTE
          </Link>
        </div>

      </main>

      <footer className="border-t border-[#c3c8c1]/60 px-5 py-5 text-center">
        <p className="text-[10px] text-[#a0a5a0] tracking-[0.1em]">
          © {new Date().getFullYear()} PUREMATCH · CHILE · DATOS PROTEGIDOS SSL
        </p>
      </footer>
    </div>
  )
}
