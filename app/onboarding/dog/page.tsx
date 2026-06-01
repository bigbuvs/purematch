'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import TopBar from '@/components/TopBar'
import { insforge } from '@/lib/insforge'
import { useAuth } from '@/context/AuthContext'

const breeds = ['Border Collie','Golden Retriever','Labrador Retriever','Bulldog Inglés','Poodle','Husky Siberiano','German Shepherd','Beagle','Boxer','Dachshund','Chihuahua','Rottweiler','Yorkshire Terrier','Doberman']
const zones = ['Las Condes','Providencia','Vitacura','La Reina','Ñuñoa','Peñalolén','Macul','Otro sector']

export default function OnboardingDogPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [form, setForm] = useState({ name: '', breed: '', age: '', sex: '' as 'Macho' | 'Hembra' | '', pedigree: '', zone: '' })
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const allFilled = form.name && form.breed && form.age && form.sex && form.zone

  const handlePhoto = (file: File) => {
    if (photos.length >= 6) return
    const ALLOWED_IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])
    if (!ALLOWED_IMAGE_MIME.has(file.type) && !file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes (JPG, PNG, WebP)')
      return
    }
    if (file.size > 15 * 1024 * 1024) {
      setError('La imagen supera 15 MB')
      return
    }
    setError('')
    setPhotos(prev => [...prev, file])
    setPreviews(prev => [...prev, URL.createObjectURL(file)])
  }

  const removePhoto = (i: number) => {
    setPhotos(prev => prev.filter((_, idx) => idx !== i))
    setPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true); setError('')

    try {
      // Ensure user row exists (dogs.owner_id FK constraint)
      try {
        await insforge.database.from('users').upsert({
          id: user.id,
          email: user.email ?? '',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          name: (user.profile?.name ?? (user as any).user_metadata?.name ?? user.name ?? user.email?.split('@')[0] ?? ''),
        })
      } catch {}

      const photoUrls: string[] = []
      for (const file of photos) {
        const ext = file.name.split('.').pop()
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { data, error: uploadError } = await insforge.storage.from('dog-photos').upload(path, file)
        if (uploadError || !data) { setError(uploadError?.message ?? 'Error al subir foto'); setLoading(false); return }
        photoUrls.push(data.url)
      }

      const { data: inserted, error: insertError } = await insforge.database.from('dogs').insert({
        owner_id: user.id,
        name: form.name,
        breed: form.breed,
        age: form.age,
        sex: form.sex as 'Macho' | 'Hembra',
        pedigree_number: form.pedigree || null,
        zone: form.zone || null,
        photos: photoUrls,
      }).select('id').single()

      if (insertError || !inserted) { setError(insertError?.message ?? 'Error al guardar'); setLoading(false); return }
      router.push(`/documents?dog_id=${inserted.id}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ocurrió un error. Intenta de nuevo.'
      setError(msg)
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#fcf9f8] min-h-screen flex flex-col">
      <TopBar title="Registrar perro" showBack />

      <main className="flex-grow max-w-[680px] mx-auto w-full px-5 py-8">

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#fed488] text-[#261900] flex items-center justify-center text-[12px] font-bold">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
            </div>
            <span className="text-[10px] font-bold tracking-[0.08em] text-[#775a19] hidden sm:block">TU PERFIL</span>
          </div>
          <div className="flex-grow h-[2px] bg-[#fed488]" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#061b0e] text-white flex items-center justify-center text-[12px] font-bold">2</div>
            <span className="text-[10px] font-bold tracking-[0.08em] text-[#061b0e] hidden sm:block">TU PERRO</span>
          </div>
        </div>

        <header className="mb-8">
          <h2 className="font-serif font-bold text-[#061b0e] text-2xl tracking-tight mb-2">Tu ejemplar</h2>
          <p className="text-[#737973] text-sm leading-relaxed">Sube fotos y completa los datos de tu perro de pedigree.</p>
        </header>

        {error && (
          <div className="bg-[#ffdad6] text-[#93000a] text-[12px] px-4 py-3 rounded-xl mb-4 flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] mt-0.5">error</span>
            {error}
          </div>
        )}

        {/* Photos section */}
        <div className="bg-white border border-[#e4e2e1] rounded-2xl p-6 shadow-[0_2px_12px_rgba(6,27,14,0.04)] mb-5">
          <div className="flex items-center justify-between mb-4">
            <label className="text-[10px] font-bold tracking-[0.1em] text-[#737973]">FOTOS · MÁX. 6</label>
            <span className="text-[10px] text-[#a0a5a0]">{previews.length}/6</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {previews.map((url, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden relative group bg-[#f0eded]">
                <img src={url} alt="" className="w-full h-full object-cover" />
                {i === 0 && (
                  <div className="absolute top-1.5 left-1.5 bg-[#fed488] text-[#261900] text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                    PRINCIPAL
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[#061b0e]/80 hover:bg-[#061b0e] text-white flex items-center justify-center backdrop-blur-sm"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            ))}
            {previews.length < 6 && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-[#c3c8c1] flex flex-col items-center justify-center gap-1 hover:border-[#061b0e] hover:bg-[#f0eded] transition-colors"
              >
                <span className="material-symbols-outlined text-[#737973] text-[28px]">add_photo_alternate</span>
                <span className="text-[9px] font-bold tracking-[0.08em] text-[#737973]">AGREGAR</span>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handlePhoto(f); e.target.value = '' }} />
        </div>

        {/* Form card */}
        <div className="bg-white border border-[#e4e2e1] rounded-2xl p-6 shadow-[0_2px_12px_rgba(6,27,14,0.04)]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Field label="NOMBRE DEL PERRO *" placeholder="Ej. Arya von Westwood" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} />

            <div className="flex flex-col">
              <label className="text-[10px] font-bold tracking-[0.1em] text-[#737973] mb-1.5 ml-1">RAZA *</label>
              <div className="relative">
                <select
                  className="w-full bg-[#fcf9f8] border border-[#c3c8c1] rounded-xl px-4 py-3 text-[14px] text-[#1b1c1c] focus:outline-none focus:border-[#061b0e] transition-colors appearance-none cursor-pointer"
                  value={form.breed}
                  onChange={e => setForm(p => ({ ...p, breed: e.target.value }))}
                >
                  <option value="">Selecciona la raza</option>
                  {breeds.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#737973] pointer-events-none text-[18px]">expand_more</span>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col flex-1">
                <Field label="EDAD *" placeholder="Ej. 2 años" value={form.age} onChange={v => setForm(p => ({ ...p, age: v }))} />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold tracking-[0.1em] text-[#737973] mb-1.5 ml-1">SEXO *</label>
              <div className="grid grid-cols-2 gap-2">
                {(['Macho', 'Hembra'] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, sex: s }))}
                    className={`py-3 rounded-xl text-[12px] font-bold tracking-[0.08em] border transition-all flex items-center justify-center gap-1.5 ${
                      form.sex === s
                        ? 'bg-[#061b0e] text-white border-[#061b0e]'
                        : 'bg-[#fcf9f8] text-[#737973] border-[#c3c8c1] hover:border-[#061b0e]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {s === 'Macho' ? 'male' : 'female'}
                    </span>
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold tracking-[0.1em] text-[#737973] mb-1.5 ml-1">SECTOR *</label>
              <div className="relative">
                <select
                  className="w-full bg-[#fcf9f8] border border-[#c3c8c1] rounded-xl px-4 py-3 text-[14px] text-[#1b1c1c] focus:outline-none focus:border-[#061b0e] transition-colors appearance-none cursor-pointer"
                  value={form.zone}
                  onChange={e => setForm(p => ({ ...p, zone: e.target.value }))}
                >
                  <option value="">Selecciona el sector</option>
                  {zones.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#737973] pointer-events-none text-[18px]">expand_more</span>
              </div>
            </div>

            <Field label="Nº PEDIGREE KCC (OPCIONAL)" placeholder="Ej. KCC-2024-BC-00892" value={form.pedigree} onChange={v => setForm(p => ({ ...p, pedigree: v }))} />

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

        <Link href="/onboarding/user" className="flex items-center gap-1.5 text-[#737973] text-[10px] font-bold tracking-[0.08em] mt-6 hover:text-[#061b0e] transition-colors">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          VOLVER
        </Link>
      </main>
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="flex flex-col">
      <label className="text-[10px] font-bold tracking-[0.1em] text-[#737973] mb-1.5 ml-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#fcf9f8] border border-[#c3c8c1] rounded-xl px-4 py-3 text-[14px] text-[#1b1c1c] placeholder:text-[#a0a5a0] focus:outline-none focus:border-[#061b0e] transition-colors"
      />
    </div>
  )
}
