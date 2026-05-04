'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import TopBar from '@/components/TopBar'
import { insforge } from '@/lib/insforge'
import { useAuth } from '@/context/AuthContext'
import type { Database } from '@/lib/database.types'

type Dog = Database['public']['Tables']['dogs']['Row']

const breeds = ['Border Collie','Golden Retriever','Labrador Retriever','Bulldog Inglés','Poodle','Husky Siberiano','German Shepherd','Beagle','Boxer','Dachshund','Chihuahua','Rottweiler','Yorkshire Terrier','Doberman']
const zones = ['Las Condes','Providencia','Vitacura','La Reina','Ñuñoa','Peñalolén','Macul','Otro sector']

export default function EditDogPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [dog, setDog] = useState<Dog | null>(null)
  const [form, setForm] = useState({ name: '', breed: '', age: '', sex: '' as 'Macho' | 'Hembra' | '', pedigree: '', zone: '' })
  const [existingPhotos, setExistingPhotos] = useState<string[]>([])
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([])
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [notOwner, setNotOwner] = useState(false)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const { data } = await insforge.database.from('dogs').select('*').eq('id', id).single()
      if (!data) { setLoading(false); return }
      if (data.owner_id !== user.id) { setNotOwner(true); setLoading(false); return }
      setDog(data)
      setForm({
        name: data.name,
        breed: data.breed,
        age: data.age ?? '',
        sex: (data.sex as 'Macho' | 'Hembra') ?? '',
        pedigree: data.pedigree_number ?? '',
        zone: data.zone ?? '',
      })
      setExistingPhotos(data.photos ?? [])
      setLoading(false)
    }
    load()
  }, [id, user])

  const addPhoto = (file: File) => {
    const totalPhotos = existingPhotos.length + newPhotoFiles.length
    if (totalPhotos >= 6) return
    setNewPhotoFiles(p => [...p, file])
    setNewPhotoPreviews(p => [...p, URL.createObjectURL(file)])
  }

  const removeExistingPhoto = (i: number) => {
    setExistingPhotos(p => p.filter((_, idx) => idx !== i))
  }

  const removeNewPhoto = (i: number) => {
    setNewPhotoFiles(p => p.filter((_, idx) => idx !== i))
    setNewPhotoPreviews(p => p.filter((_, idx) => idx !== i))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !dog) return
    setSaving(true); setError('')

    const uploadedUrls: string[] = []
    for (const file of newPhotoFiles) {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error: uploadErr } = await insforge.storage.from('dog-photos').upload(path, file)
      if (uploadErr || !data) { setError('Error al subir foto. Intenta de nuevo.'); setSaving(false); return }
      uploadedUrls.push(data.url)
    }

    const finalPhotos = [...existingPhotos, ...uploadedUrls]

    const { error: updateErr } = await insforge.database.from('dogs').update({
      name: form.name,
      breed: form.breed,
      age: form.age,
      sex: form.sex as 'Macho' | 'Hembra',
      pedigree_number: form.pedigree || null,
      zone: form.zone || null,
      photos: finalPhotos,
    }).eq('id', id)

    if (updateErr) { setError('Error al guardar. Intenta de nuevo.'); setSaving(false); return }

    setSaved(true)
    setSaving(false)
    setTimeout(() => router.push('/profile'), 800)
  }

  const totalPhotos = existingPhotos.length + newPhotoFiles.length
  const allFilled = form.name && form.breed && form.age && form.sex

  if (loading) return (
    <div className="min-h-screen bg-[#fcf9f8] flex items-center justify-center">
      <span className="material-symbols-outlined text-5xl text-[#c3c8c1] animate-spin">progress_activity</span>
    </div>
  )

  if (notOwner || !dog) return (
    <div className="min-h-screen bg-[#fcf9f8] flex flex-col items-center justify-center gap-4">
      <span className="material-symbols-outlined text-5xl text-[#c3c8c1]">block</span>
      <p className="text-[#737973] text-sm">Sin permiso para editar este perfil.</p>
    </div>
  )

  return (
    <div className="bg-[#fcf9f8] min-h-screen flex flex-col">
      <TopBar title="Editar ejemplar" showBack />

      <main className="flex-grow max-w-[680px] mx-auto w-full px-5 py-8 flex flex-col gap-5">

        {error && (
          <div className="bg-[#ffdad6] text-[#93000a] text-[12px] px-4 py-3 rounded-xl flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] mt-0.5">error</span>
            {error}
          </div>
        )}

        {/* Photos */}
        <div className="bg-white border border-[#e4e2e1] rounded-2xl p-6 shadow-[0_2px_12px_rgba(6,27,14,0.04)]">
          <div className="flex items-center justify-between mb-4">
            <label className="text-[10px] font-bold tracking-[0.1em] text-[#737973]">FOTOS · MÁX. 6</label>
            <span className="text-[10px] text-[#a0a5a0]">{totalPhotos}/6</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {/* Existing photos */}
            {existingPhotos.map((url, i) => (
              <div key={`ex-${i}`} className="aspect-square rounded-xl overflow-hidden relative bg-[#f0eded]">
                <img src={url} alt="" className="w-full h-full object-cover" />
                {i === 0 && (
                  <div className="absolute top-1.5 left-1.5 bg-[#fed488] text-[#261900] text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                    PRINCIPAL
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeExistingPhoto(i)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[#061b0e]/80 hover:bg-[#061b0e] text-white flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            ))}
            {/* New photo previews */}
            {newPhotoPreviews.map((url, i) => (
              <div key={`new-${i}`} className="aspect-square rounded-xl overflow-hidden relative bg-[#f0eded]">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <div className="absolute top-1.5 left-1.5 bg-[#1b5e20] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                  NUEVA
                </div>
                <button
                  type="button"
                  onClick={() => removeNewPhoto(i)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[#061b0e]/80 hover:bg-[#061b0e] text-white flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            ))}
            {/* Add button */}
            {totalPhotos < 6 && (
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
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) addPhoto(f); e.target.value = '' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="bg-white border border-[#e4e2e1] rounded-2xl p-6 shadow-[0_2px_12px_rgba(6,27,14,0.04)] flex flex-col gap-5">

          <Field label="NOMBRE DEL PERRO *" placeholder="Ej. Arya von Westwood" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} />

          {/* Breed */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold tracking-[0.1em] text-[#737973] mb-1.5 ml-1">RAZA *</label>
            <div className="relative">
              <select
                value={form.breed}
                onChange={e => setForm(p => ({ ...p, breed: e.target.value }))}
                className="w-full bg-[#fcf9f8] border border-[#c3c8c1] rounded-xl px-4 py-3 text-[14px] text-[#1b1c1c] focus:outline-none focus:border-[#061b0e] transition-colors appearance-none cursor-pointer"
              >
                <option value="">Selecciona la raza</option>
                {breeds.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#737973] pointer-events-none text-[18px]">expand_more</span>
            </div>
          </div>

          <Field label="EDAD *" placeholder="Ej. 2 años" value={form.age} onChange={v => setForm(p => ({ ...p, age: v }))} />

          {/* Sex */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold tracking-[0.1em] text-[#737973] mb-1.5 ml-1">SEXO *</label>
            <div className="grid grid-cols-2 gap-2">
              {(['Macho', 'Hembra'] as const).map(s => (
                <button
                  key={s} type="button"
                  onClick={() => setForm(p => ({ ...p, sex: s }))}
                  className={`py-3 rounded-xl text-[12px] font-bold tracking-[0.08em] border transition-all flex items-center justify-center gap-1.5 ${
                    form.sex === s ? 'bg-[#061b0e] text-white border-[#061b0e]' : 'bg-[#fcf9f8] text-[#737973] border-[#c3c8c1] hover:border-[#061b0e]'
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

          {/* Zone */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold tracking-[0.1em] text-[#737973] mb-1.5 ml-1">SECTOR *</label>
            <div className="relative">
              <select
                value={form.zone}
                onChange={e => setForm(p => ({ ...p, zone: e.target.value }))}
                className="w-full bg-[#fcf9f8] border border-[#c3c8c1] rounded-xl px-4 py-3 text-[14px] text-[#1b1c1c] focus:outline-none focus:border-[#061b0e] transition-colors appearance-none cursor-pointer"
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
            disabled={!allFilled || saving || saved}
            className={`w-full text-[12px] font-bold tracking-[0.08em] py-3.5 rounded-full mt-2 transition-colors flex items-center justify-center gap-2 ${
              allFilled && !saving && !saved
                ? 'bg-[#061b0e] text-white hover:bg-[#1b3022]'
                : 'bg-[#e4e2e1] text-[#a0a5a0] cursor-not-allowed'
            }`}
          >
            {saved
              ? <><span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>GUARDADO</>
              : saving
              ? <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>GUARDANDO...</>
              : 'GUARDAR CAMBIOS'
            }
          </button>
        </form>
      </main>
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="flex flex-col">
      <label className="text-[10px] font-bold tracking-[0.1em] text-[#737973] mb-1.5 ml-1">{label}</label>
      <input
        type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-[#fcf9f8] border border-[#c3c8c1] rounded-xl px-4 py-3 text-[14px] text-[#1b1c1c] placeholder:text-[#a0a5a0] focus:outline-none focus:border-[#061b0e] transition-colors"
      />
    </div>
  )
}
