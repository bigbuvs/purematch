'use client'
import { useState } from 'react'
import Link from 'next/link'

const TOPICS = [
  { value: 'validacion',  label: 'Validación de pedigree' },
  { value: 'matches',     label: 'Problema con matches' },
  { value: 'pago',        label: 'Pagos y desbloqueos' },
  { value: 'cuenta',      label: 'Mi cuenta' },
  { value: 'otro',        label: 'Otro' },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // MVP: simply show success — wire to backend later
    await new Promise(r => setTimeout(r, 800))
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="bg-[#fcf9f8] min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="px-4 h-[60px] flex items-center justify-between border-b border-[#c3c8c1]/60 bg-[#fcf9f8]/95 backdrop-blur-sm sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/isotipo.svg" alt="PureMatch" width={32} height={32} className="rounded-full" />
          <span className="font-serif font-bold text-[#061b0e] text-[15px] tracking-tight">PureMatch</span>
        </Link>
        <Link href="/how-it-works" className="text-[11px] font-bold tracking-[0.08em] text-[#737973] hover:text-[#061b0e] transition-colors">
          Cómo funciona
        </Link>
      </header>

      <main className="flex-grow max-w-[560px] mx-auto w-full px-4 py-10">

        {/* Hero */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-[#fed488]/20 border border-[#fed488]/50 text-[#775a19] text-[10px] font-bold tracking-[0.12em] px-3 py-1.5 rounded-full mb-4">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
            SOPORTE
          </div>
          <h1 className="font-serif font-bold text-[#061b0e] text-3xl tracking-tight mb-3">Contáctanos</h1>
          <p className="text-[#737973] text-[14px] leading-relaxed">
            Respondemos en menos de 24 horas hábiles. Si tienes una consulta urgente sobre validación, escríbenos directamente.
          </p>
        </div>

        {/* Contact methods */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          <a
            href="mailto:hola@purematch.cl"
            className="flex items-center gap-3 bg-white border border-[#e4e2e1] rounded-2xl px-4 py-4 hover:border-[#061b0e] hover:shadow-[0_4px_16px_rgba(6,27,14,0.08)] transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-[#061b0e] flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[#fed488] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.08em] text-[#737973] mb-0.5">EMAIL</p>
              <p className="text-[13px] font-semibold text-[#061b0e] group-hover:underline">hola@purematch.cl</p>
            </div>
          </a>

          <a
            href="https://wa.me/56912345678?text=Hola%2C%20tengo%20una%20consulta%20sobre%20PureMatch"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white border border-[#e4e2e1] rounded-2xl px-4 py-4 hover:border-[#25d366] hover:shadow-[0_4px_16px_rgba(37,211,102,0.12)] transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-[#25d366] flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.08em] text-[#737973] mb-0.5">WHATSAPP</p>
              <p className="text-[13px] font-semibold text-[#061b0e] group-hover:underline">+56 9 1234 5678</p>
            </div>
          </a>
        </div>

        {/* Divider */}
        <div className="relative flex items-center mb-8">
          <div className="flex-grow border-t border-[#e4e2e1]" />
          <span className="mx-3 text-[9px] font-bold tracking-[0.12em] text-[#a0a5a0]">O ENVÍANOS UN MENSAJE</span>
          <div className="flex-grow border-t border-[#e4e2e1]" />
        </div>

        {/* Contact form */}
        {sent ? (
          <div className="bg-white border border-[#e4e2e1] rounded-2xl p-8 text-center shadow-[0_2px_12px_rgba(6,27,14,0.04)]">
            <div className="w-14 h-14 rounded-full bg-[#d4edda] flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[#1d6a35] text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h2 className="font-serif font-bold text-[#061b0e] text-xl mb-2">Mensaje enviado</h2>
            <p className="text-[#737973] text-[13px] mb-6 leading-relaxed">
              Recibimos tu consulta. Respondemos en menos de 24 horas hábiles al correo que indicaste.
            </p>
            <Link href="/" className="inline-flex items-center gap-2 text-[12px] font-bold tracking-[0.08em] text-[#061b0e] border border-[#061b0e] px-5 py-2.5 rounded-full hover:bg-[#061b0e] hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[16px]">home</span>
              VOLVER AL INICIO
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-[#e4e2e1] rounded-2xl p-6 shadow-[0_2px_12px_rgba(6,27,14,0.04)] flex flex-col gap-4">
            <Field label="NOMBRE" type="text" required value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} placeholder="Tu nombre completo" />
            <Field label="EMAIL" type="email" required value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} placeholder="tu@correo.com" />

            {/* Topic select */}
            <div className="flex flex-col">
              <label className="text-[10px] font-bold tracking-[0.1em] text-[#737973] mb-1.5 ml-1">ASUNTO</label>
              <select
                required
                value={form.topic}
                onChange={e => setForm(p => ({ ...p, topic: e.target.value }))}
                className="w-full bg-[#fcf9f8] border border-[#c3c8c1] rounded-xl px-4 py-3 text-[14px] text-[#1b1c1c] focus:outline-none focus:border-[#061b0e] transition-colors appearance-none"
              >
                <option value="">Selecciona un tema</option>
                {TOPICS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            {/* Message */}
            <div className="flex flex-col">
              <label className="text-[10px] font-bold tracking-[0.1em] text-[#737973] mb-1.5 ml-1">MENSAJE</label>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                placeholder="Describe tu consulta en detalle..."
                className="w-full bg-[#fcf9f8] border border-[#c3c8c1] rounded-xl px-4 py-3 text-[14px] text-[#1b1c1c] placeholder:text-[#a0a5a0] focus:outline-none focus:border-[#061b0e] transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#061b0e] text-white text-[12px] font-bold tracking-[0.08em] py-3.5 rounded-full mt-1 hover:bg-[#1b3022] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading
                ? <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>ENVIANDO...</>
                : <><span className="material-symbols-outlined text-[16px]">send</span>ENVIAR MENSAJE</>
              }
            </button>
          </form>
        )}

        {/* Response time note */}
        <p className="text-[11px] text-[#a0a5a0] text-center mt-5 leading-relaxed">
          Tiempo de respuesta: menos de 24 horas hábiles.<br />
          Horario de atención: lunes a viernes, 9:00 – 18:00 (Chile continental).
        </p>
      </main>

      <footer className="border-t border-[#c3c8c1]/60 px-5 py-5 text-center">
        <p className="text-[10px] text-[#a0a5a0] tracking-[0.1em]">
          © {new Date().getFullYear()} PUREMATCH · CHILE · DATOS PROTEGIDOS SSL
        </p>
      </footer>
    </div>
  )
}

function Field({
  label, type, value, onChange, placeholder, required,
}: {
  label: string; type: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean
}) {
  return (
    <div className="flex flex-col">
      <label className="text-[10px] font-bold tracking-[0.1em] text-[#737973] mb-1.5 ml-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full bg-[#fcf9f8] border border-[#c3c8c1] rounded-xl px-4 py-3 text-[14px] text-[#1b1c1c] placeholder:text-[#a0a5a0] focus:outline-none focus:border-[#061b0e] transition-colors"
      />
    </div>
  )
}
