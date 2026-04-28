'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'

const breeds = [
  'Border Collie', 'Golden Retriever', 'Labrador Retriever', 'Bulldog Inglés',
  'Poodle', 'Husky Siberiano', 'German Shepherd', 'Beagle', 'Boxer',
  'Dachshund', 'Chihuahua', 'Rottweiler', 'Yorkshire Terrier', 'Doberman',
]

export default function OnboardingDogPage() {
  const [form, setForm] = useState({
    name: '',
    breed: '',
    age: '',
    sex: '' as 'Macho' | 'Hembra' | '',
    pedigree: '',
  })
  const [photos, setPhotos] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const handlePhoto = (file: File) => {
    const url = URL.createObjectURL(file)
    setPhotos(prev => [...prev.slice(0, 5), url])
  }

  const allFilled = form.name && form.breed && form.age && form.sex

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col items-center">
      <main className="w-full max-w-md px-6 py-12 flex flex-col">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-surface-container text-outline flex items-center justify-center font-label-caps text-label-caps">1</div>
            <span className="font-label-caps text-[10px] text-outline">TU PERFIL</span>
          </div>
          <div className="flex-grow h-px bg-primary" />
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-caps text-label-caps">2</div>
            <span className="font-label-caps text-[10px] text-primary">TU PERRO</span>
          </div>
        </div>

        <header className="mb-8">
          <h1 className="font-serif font-bold text-xl text-primary tracking-widest uppercase mb-1">PureMatch</h1>
          <h2 className="font-headline-sm text-headline-sm text-primary text-2xl mb-2">Registra tu perro</h2>
          <p className="font-body-md text-body-md text-on-surface-variant text-sm">Agrega las fotos y datos de tu ejemplar.</p>
        </header>

        {/* Photo upload */}
        <div className="mb-6">
          <label className="font-label-caps text-label-caps text-on-surface-variant mb-3 ml-1 block">FOTOS (máx. 6)</label>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((url, i) => (
              <div key={i} className="aspect-square rounded-lg overflow-hidden relative group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                  className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-white">close</span>
                </button>
              </div>
            ))}
            {photos.length < 6 && (
              <button
                onClick={() => fileRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-outline text-2xl">add_photo_alternate</span>
                <span className="font-label-caps text-[9px] text-outline">FOTO</span>
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) handlePhoto(file)
            }}
          />
        </div>

        <form className="flex flex-col gap-5">
          <div className="flex flex-col">
            <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 ml-1">NOMBRE DEL PERRO *</label>
            <input
              className="bg-surface-container-low border-b border-primary border-t-0 border-l-0 border-r-0 focus:ring-0 focus:border-primary px-4 py-3 placeholder:text-outline-variant text-body-md"
              placeholder="Ej. Arya von Westwood"
              type="text"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            />
          </div>

          <div className="flex flex-col">
            <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 ml-1">RAZA *</label>
            <div className="relative">
              <select
                className="w-full bg-surface-container-low border-b border-primary border-t-0 border-l-0 border-r-0 focus:ring-0 focus:border-primary px-4 py-3 text-body-md appearance-none cursor-pointer"
                value={form.breed}
                onChange={e => setForm(p => ({ ...p, breed: e.target.value }))}
              >
                <option value="">Selecciona la raza</option>
                {breeds.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col flex-1">
              <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 ml-1">EDAD *</label>
              <input
                className="bg-surface-container-low border-b border-primary border-t-0 border-l-0 border-r-0 focus:ring-0 focus:border-primary px-4 py-3 placeholder:text-outline-variant text-body-md"
                placeholder="Ej. 2 años"
                type="text"
                value={form.age}
                onChange={e => setForm(p => ({ ...p, age: e.target.value }))}
              />
            </div>

            <div className="flex flex-col flex-1">
              <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 ml-1">SEXO *</label>
              <div className="flex gap-2 mt-1">
                {(['Macho', 'Hembra'] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, sex: s }))}
                    className={`flex-1 py-3 font-label-caps text-label-caps border transition-colors ${
                      form.sex === s
                        ? 'bg-primary text-on-primary border-primary'
                        : 'bg-transparent text-outline border-outline-variant hover:border-primary'
                    }`}
                  >
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 ml-1">Nº PEDIGREE KCC (opcional)</label>
            <input
              className="bg-surface-container-low border-b border-primary border-t-0 border-l-0 border-r-0 focus:ring-0 focus:border-primary px-4 py-3 placeholder:text-outline-variant text-body-md"
              placeholder="Ej. KCC-2024-BC-00892"
              type="text"
              value={form.pedigree}
              onChange={e => setForm(p => ({ ...p, pedigree: e.target.value }))}
            />
          </div>

          <div className="pt-4">
            <Link
              href="/documents"
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

        <div className="mt-4">
          <Link href="/onboarding/user" className="flex items-center gap-1 text-outline font-label-caps text-[10px] hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            VOLVER
          </Link>
        </div>
      </main>
    </div>
  )
}
