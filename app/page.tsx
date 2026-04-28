import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <header className="bg-[#FDFCF9] flex justify-between items-center px-6 py-4 w-full fixed top-0 z-50 border-b border-[#E5E2D9]">
        <button className="text-[#1B3022] hover:bg-stone-100 p-2 -ml-2 rounded-full transition-colors">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h1 className="text-xl font-serif font-black text-[#1B3022] tracking-tight">PureMatch</h1>
        <Link href="/auth" className="h-8 w-8 rounded-full overflow-hidden border border-[#E5E2D9] block">
          <img alt="Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3__Q0ufMoiHHoD02iIxQDRsx7Qxt1dT8I0otM87enCrU97qiYA0pQfWYz5V2S65nznkt7j4pvn3JZtNF-R3MmS0lk9OaRwZEG2WwlTgA4-mrLJTHF1olArxWkXNnZIp4QRvCrtERfAkfxZu6-Mc932U8U_okSKc4MPV4xLTx2DiK2BFrHkQHtKr6DOxfgUCvDi6x2wkNusa145B7eMCGgE1TFUCMQC6bVSsKUZAJm2r_kGeOw-pWrBvyD9j7tTca1fiFdbHwgy8X0" />
        </Link>
      </header>

      <main className="flex-grow pt-[80px] pb-[100px] px-4 md:px-16 max-w-[1280px] mx-auto w-full flex flex-col gap-20">
        {/* Hero */}
        <section className="flex flex-col gap-8 pt-8">
          <div className="flex flex-col gap-6 text-center sm:text-left sm:items-start">
            <h2 className="font-display-lg text-display-lg text-primary max-w-[800px]">
              La plataforma donde los perros con pedigree encuentran su mejor match.
            </h2>
            <Link href="/auth" className="bg-primary-container text-on-primary font-label-caps text-label-caps h-12 px-8 rounded-full flex justify-center items-center gap-2 hover:bg-primary transition-colors shadow-sm w-full sm:w-auto">
              Registra tu perro
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          <div className="w-full aspect-[4/5] sm:aspect-video rounded-xl overflow-hidden border border-outline-variant shadow-[0_4px_20px_rgba(0,0,0,0.05)] relative bg-surface-container">
            <img className="w-full h-full object-cover" alt="Pedigree dog" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCjiZpgrUlAFjaer3vHMMWgzNkg3MezFwu5DwaWxZsP1wyw2E-ukXtQW3ZAjLJDCYKpSfV2m_fZFcYFBWhy2Z5a3aDzmRQe-r5m870zQ6mlpYI0GI1DN0gcc9tckmPjZZwE7GNeObslycCM67qayPqyan4GEvYgKI_zDuOMKXJ8qIqLp7GlQqpLpjftSuwLtMjv6ixhz8UuaYBFzcMblJIwlnMvOYW3zfjvaYnHsoxBKqgGY_S7AtH1tmym1KyDnks5UEIa-1E1j4P" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent pointer-events-none" />
          </div>
        </section>

        {/* Pillars */}
        <section className="flex flex-col gap-6">
          <h3 className="font-headline-md text-headline-md text-primary">Estándares de Élite</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: 'verified', title: 'Validado', desc: 'Cada linaje es rigurosamente verificado mediante certificaciones de salud y registros oficiales.', iconBg: 'bg-[#e9c176] text-[#261900]' },
              { icon: 'shield', title: 'Seguro', desc: 'Un entorno blindado, diseñado exclusivamente para proteger a criadores y propietarios de alto nivel.', iconBg: 'bg-surface-container-highest text-primary' },
              { icon: 'handshake', title: 'Confiable', desc: 'Únase a la red más exclusiva de criadores comprometidos con la excelencia genética.', iconBg: 'bg-surface-container-highest text-primary' },
            ].map(({ icon, title, desc, iconBg }) => (
              <div key={title} className="bg-surface-container-low border border-outline-variant rounded-xl p-8 flex flex-col gap-4 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow">
                <div className={`${iconBg} w-12 h-12 rounded-full flex items-center justify-center`}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                </div>
                <h4 className="font-headline-sm text-headline-sm text-primary">{title}</h4>
                <p className="font-body-md text-body-md text-on-surface-variant">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Steps */}
        <section className="flex flex-col gap-6">
          <h3 className="font-headline-md text-headline-md text-primary">Cómo funciona</h3>
          <div className="flex flex-col gap-6 relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-primary/10" />
            {[
              { n: '1', title: 'Registro de Perfil', desc: 'Sube los datos básicos y certificados de tu ejemplar.' },
              { n: '2', title: 'Auditoría', desc: 'Nuestro equipo valida la autenticidad de la documentación en 24–48h.' },
              { n: '3', title: 'Búsqueda', desc: 'Filtra por linaje, salud y compatibilidad.' },
              { n: '4', title: 'Acuerdo', desc: 'Conecta con el criador y formaliza el vínculo.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="relative z-10 flex gap-4 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-primary text-on-primary flex items-center justify-center font-serif text-lg">{n}</div>
                <div className="pt-1">
                  <h4 className="font-headline-sm text-primary text-lg mb-1">{title}</h4>
                  <p className="text-sm text-on-surface-variant">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center bg-[#FDFCF9] pb-safe border-t border-[#E5E2D9] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:hidden h-[72px]">
        {[
          { href: '/explore', icon: 'search', label: 'Explore' },
          { href: '/onboarding/user', icon: 'add_circle', label: 'Onboard' },
          { href: '/matches', icon: 'handshake', label: 'Matches' },
          { href: '/profile', icon: 'person', label: 'Profile' },
        ].map(({ href, icon, label }) => (
          <Link key={href} href={href} className="flex flex-col items-center justify-center text-stone-400 pt-2 pb-2 w-full hover:text-[#1B3022] transition-colors font-serif text-[10px] font-semibold uppercase tracking-widest gap-1">
            <span className="material-symbols-outlined">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
