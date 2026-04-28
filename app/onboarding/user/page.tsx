'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { insforge } from '@/lib/insforge'
import { useAuth } from '@/context/AuthContext'

const zones = ['Región Metropolitana','Valparaíso','Biobío','Araucanía','Los Lagos','Antofagasta','Coquimbo','Maule',"O'Higgins",'Atacama']

export default function OnboardingUserPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [form, setForm] = useState({ name: '', phone: '', zone: '', rut: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const allFilled = form.name && form.phone && form.zone

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true); setError('')
    const { error } = await insforge.from('users').upsert({
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
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center">
      <main className="w-full max-w-md px-6 py-12 flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-caps text-label-caps">1</div>
            <span className="font-label-caps text-[10px] text-primary">TU PERFIL</span>
          </div>
          <div className="flex-grow h-px bg-outline-variant" />
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-surface-container text-outline flex items-center justify-center font-label-caps text-label-caps">2</div>
            <span className="font-label-caps text-[10px] text-outline">TU PERRO</span>
          </div>
        </div>

        <header className="mb-8">
          <h1 className="font-serif font-bold text-xl text-primary tracking-widest uppercase mb-1">PureMatch</h1>
          <h2 className="font-headline-sm text-primary text-2xl mb-2">Crea tu cuenta</h2>
          <p className="text-on-surface-variant text-sm">Completa tus datos personales para comenzar.</p>
        </header>

        {error && <div className="bg-error-container text-on-error-container text-xs px-4 py-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleContinue} className="flex flex-col gap-5">
          {[
            { label: 'NOMBRE COMPLETO *', key: 'name', type: 'text', placeholder: 'Ej. Alejandro von West' },
            { label: 'TELÉFONO *', key: 'phone', type: 'tel', placeholder: '+56 9 XXXX XXXX' },
            { label: 'RUT (opcional)', key: 'rut', type: 'text', placeholder: '12.345.678-9' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key} className="flex flex-col">
              <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 ml-1">{label}</label>
              <input className="bg-surface-container-low border-b border-primary border-t-0 border-l-0 border-r-0 focus:ring-0 px-4 py-3 placeholder:text-outline-variant text-body-md" placeholder={placeholder} type={type} value={form[key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
            </div>
          ))}

          <div className="flex flex-col">
            <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 ml-1">REGIÓN *</label>
            <div className="relative">
              <select className="w-full bg-surface-container-low border-b border-primary border-t-0 border-l-0 border-r-0 focus:ring-0 px-4 py-3 text-body-md appearance-none cursor-pointer" value={form.zone} onChange={e => setForm(p => ({ ...p, zone: e.target.value }))}>
                <option value="">Selecciona tu región</option>
                {zones.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" disabled={!allFilled || loading} className={`w-full font-label-caps text-label-caps py-4 transition-colors ${allFilled && !loading ? 'bg-primary text-on-primary hover:bg-primary-container' : 'bg-surface-container text-outline cursor-not-allowed'}`}>
              {loading ? 'GUARDANDO...' : 'CONTINUAR'} {!loading && <span className="material-symbols-outlined text-sm ml-2 align-middle">arrow_forward</span>}
            </button>
          </div>
        </form>

        <footer className="mt-8 text-center">
          <p className="font-metadata text-[10px] text-outline">¿Ya tienes cuenta? <Link href="/auth" className="text-primary underline">Ingresar</Link></p>
        </footer>
      </main>
    </div>
  )
}
