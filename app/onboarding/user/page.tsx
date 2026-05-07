'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import TopBar from '@/components/TopBar'
import { insforge } from '@/lib/insforge'
import { useAuth } from '@/context/AuthContext'

const zones = ['Las Condes','Providencia','Vitacura','La Reina','Ñuñoa','Peñalolén','Macul','Otro sector']

export default function OnboardingUserPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [form, setForm] = useState({ name: '', phone: '', zone: '', rut: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user || user.id === 'demo-user') return
    insforge.database.from('users').select('name, phone, zone, rut').eq('id', user.id).single().then(({ data }) => {
      if (!data) return
      setForm({
        name: data.name ?? '',
        phone: data.phone ?? '',
        zone: data.zone ?? '',
        rut: data.rut ?? '',
      })
    })
  }, [user])
  const allFilled = form.name && form.phone && form.zone

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true); setError('')
    const { error } = await insforge.database.from('users').upsert({
      id: user.id,
      name: form.name,
      email: user.email!,
      phone: form.phone,
      zone: form.zone,
      rut: form.rut || null,
    })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/onboarding/dog')
  }

  return (
    <div className="bg-[#fcf9f8] min-h-screen flex flex-col">
      <TopBar title="Crear cuenta" />

      <main className="flex-grow max-w-[680px] mx-auto w-full px-5 py-8">

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8">
          <Step n={1} label="Tu perfil" active />
          <div className="flex-grow h-[2px] bg-[#e4e2e1]" />
          <Step n={2} label="Tu perro" />
        </div>

        <header className="mb-8">
          <h2 className="font-serif font-bold text-[#061b0e] text-2xl tracking-tight mb-2">Tus datos personales</h2>
          <p className="text-[#737973] text-sm leading-relaxed">Necesitamos algunos datos básicos para crear tu perfil de criador.</p>
        </header>

        {error && (
          <div className="bg-[#ffdad6] text-[#93000a] text-[12px] px-4 py-3 rounded-xl mb-4 flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] mt-0.5">error</span>
            {error}
          </div>
        )}

        {/* Form card */}
        <div className="bg-white border border-[#e4e2e1] rounded-2xl p-6 shadow-[0_2px_12px_rgba(6,27,14,0.04)]">
          <form onSubmit={handleContinue} className="flex flex-col gap-5">
            {[
              { label: 'NOMBRE COMPLETO *', key: 'name', type: 'text', placeholder: 'Ej. Alejandro von West' },
              { label: 'TELÉFONO *', key: 'phone', type: 'tel', placeholder: '+56 9 XXXX XXXX' },
              { label: 'RUT (OPCIONAL)', key: 'rut', type: 'text', placeholder: '12.345.678-9' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key} className="flex flex-col">
                <label className="text-[10px] font-bold tracking-[0.1em] text-[#737973] mb-1.5 ml-1">{label}</label>
                <input
                  className="w-full bg-[#fcf9f8] border border-[#c3c8c1] rounded-xl px-4 py-3 text-[14px] text-[#1b1c1c] placeholder:text-[#a0a5a0] focus:outline-none focus:border-[#061b0e] transition-colors"
                  placeholder={placeholder}
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                />
              </div>
            ))}

            <div className="flex flex-col">
              <label className="text-[10px] font-bold tracking-[0.1em] text-[#737973] mb-1.5 ml-1">SECTOR *</label>
              <div className="relative">
                <select
                  className="w-full bg-[#fcf9f8] border border-[#c3c8c1] rounded-xl px-4 py-3 text-[14px] text-[#1b1c1c] focus:outline-none focus:border-[#061b0e] transition-colors appearance-none cursor-pointer"
                  value={form.zone}
                  onChange={e => setForm(p => ({ ...p, zone: e.target.value }))}
                >
                  <option value="">Selecciona tu sector</option>
                  {zones.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#737973] pointer-events-none text-[18px]">expand_more</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!allFilled || loading}
              className={`w-full text-[12px] font-bold tracking-[0.08em] py-3.5 rounded-full mt-2 transition-colors flex items-center justify-center gap-2 ${
                allFilled && !loading
                  ? 'bg-[#061b0e] text-white hover:bg-[#1b3022]'
                  : 'bg-[#e4e2e1] text-[#a0a5a0] cursor-not-allowed'
              }`}
            >
              {loading
                ? <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>GUARDANDO...</>
                : <>CONTINUAR<span className="material-symbols-outlined text-[16px]">arrow_forward</span></>
              }
            </button>
          </form>
        </div>

        <footer className="mt-6 text-center">
          <p className="text-[11px] text-[#737973]">
            ¿Ya tienes cuenta? <Link href="/auth" className="text-[#061b0e] font-semibold underline underline-offset-2">Ingresar</Link>
          </p>
        </footer>
      </main>
    </div>
  )
}

function Step({ n, label, active }: { n: number; label: string; active?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold ${
        active ? 'bg-[#061b0e] text-white' : 'bg-[#e4e2e1] text-[#a0a5a0]'
      }`}>
        {n}
      </div>
      <span className={`text-[10px] font-bold tracking-[0.08em] hidden sm:block ${active ? 'text-[#061b0e]' : 'text-[#a0a5a0]'}`}>
        {label.toUpperCase()}
      </span>
    </div>
  )
}
