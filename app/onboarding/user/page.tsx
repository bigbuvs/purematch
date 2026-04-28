'use client'
import { useState } from 'react'
import Link from 'next/link'

const zones = [
  'Región Metropolitana',
  'Valparaíso',
  'Biobío',
  'Araucanía',
  'Los Lagos',
  'Antofagasta',
  'Coquimbo',
  'Maule',
  'O\'Higgins',
  'Atacama',
]

export default function OnboardingUserPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', zone: '', rut: '' })

  const allFilled = form.name && form.email && form.phone && form.zone

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center">
      <main className="w-full max-w-md px-6 py-12 flex flex-col">
        {/* Step indicator */}
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
          <h2 className="font-headline-sm text-headline-sm text-primary text-2xl mb-2">Crea tu cuenta</h2>
          <p className="font-body-md text-body-md text-on-surface-variant text-sm">Completa tus datos personales para comenzar.</p>
        </header>

        <form className="flex flex-col gap-5">
          <div className="flex flex-col">
            <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 ml-1">NOMBRE COMPLETO *</label>
            <input
              className="bg-surface-container-low border-b border-primary border-t-0 border-l-0 border-r-0 focus:ring-0 focus:border-primary px-4 py-3 placeholder:text-outline-variant text-body-md transition-all"
              placeholder="Ej. Alejandro von West"
              type="text"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            />
          </div>

          <div className="flex flex-col">
            <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 ml-1">EMAIL *</label>
            <input
              className="bg-surface-container-low border-b border-primary border-t-0 border-l-0 border-r-0 focus:ring-0 focus:border-primary px-4 py-3 placeholder:text-outline-variant text-body-md transition-all"
              placeholder="ejemplo@criador.com"
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            />
          </div>

          <div className="flex flex-col">
            <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 ml-1">TELÉFONO *</label>
            <input
              className="bg-surface-container-low border-b border-primary border-t-0 border-l-0 border-r-0 focus:ring-0 focus:border-primary px-4 py-3 placeholder:text-outline-variant text-body-md transition-all"
              placeholder="+56 9 XXXX XXXX"
              type="tel"
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
            />
          </div>

          <div className="flex flex-col">
            <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 ml-1">RUT (opcional)</label>
            <input
              className="bg-surface-container-low border-b border-primary border-t-0 border-l-0 border-r-0 focus:ring-0 focus:border-primary px-4 py-3 placeholder:text-outline-variant text-body-md transition-all"
              placeholder="12.345.678-9"
              type="text"
              value={form.rut}
              onChange={e => setForm(p => ({ ...p, rut: e.target.value }))}
            />
          </div>

          <div className="flex flex-col">
            <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 ml-1">REGIÓN *</label>
            <div className="relative">
              <select
                className="w-full bg-surface-container-low border-b border-primary border-t-0 border-l-0 border-r-0 focus:ring-0 focus:border-primary px-4 py-3 text-body-md appearance-none cursor-pointer"
                value={form.zone}
                onChange={e => setForm(p => ({ ...p, zone: e.target.value }))}
              >
                <option value="">Selecciona tu región</option>
                {zones.map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
            </div>
          </div>

          <div className="pt-4">
            <Link
              href="/onboarding/dog"
              className={`w-full font-label-caps text-label-caps py-4 text-center block transition-colors ${
                allFilled
                  ? 'bg-primary text-on-primary hover:bg-primary-container'
                  : 'bg-surface-container text-outline pointer-events-none'
              }`}
            >
              CONTINUAR
              <span className="material-symbols-outlined text-sm ml-2 align-middle">arrow_forward</span>
            </Link>
          </div>
        </form>

        <footer className="mt-8 text-center">
          <p className="font-metadata text-[10px] text-outline">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth" className="text-primary underline">Ingresar</Link>
          </p>
        </footer>
      </main>
    </div>
  )
}
