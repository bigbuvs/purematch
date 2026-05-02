'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import TopBar from '@/components/TopBar'
import { insforge } from '@/lib/insforge'
import { useAuth } from '@/context/AuthContext'

const zones = ['Las Condes', 'Providencia', 'Vitacura', 'La Reina', 'Ñuñoa', 'Peñalolén', 'Macul', 'Otro sector']

export default function EditProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({ name: '', phone: '', zone: '' })
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user) return
    const name = user.profile?.name ?? user.user_metadata?.name ?? ''
    const phone = user.profile?.phone ?? ''
    const zone = user.profile?.zone ?? ''
    const avatar = user.profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null
    setForm({ name, phone, zone })
    setAvatarPreview(avatar)
    setLoading(false)
  }, [user])

  const handleAvatarChange = (file: File) => {
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true); setError('')

    let avatar_url = user.profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null

    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const path = `avatars/${user.id}/avatar.${ext}`
      const { data, error: uploadErr } = await (insforge.storage.from('dog-photos').upload(path, avatarFile) as any)
      if (uploadErr || !data) {
        setError('Error al subir la foto. Intenta de nuevo.')
        setSaving(false)
        return
      }
      avatar_url = data.url
    }

    const { error: upsertErr } = await (insforge.database.from('users').upsert({
      id: user.id,
      name: form.name || null,
      phone: form.phone || null,
      zone: form.zone || null,
      email: user.email ?? '',
      avatar_url,
      rut: null,
    }) as any)

    if (upsertErr) { setError('Error al guardar. Intenta de nuevo.'); setSaving(false); return }

    setSaved(true)
    setSaving(false)
    setTimeout(() => router.push('/profile'), 800)
  }

  const initials = form.name
    ? form.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : (user?.email?.[0] ?? '?').toUpperCase()

  if (loading) return (
    <div className="min-h-screen bg-[#fcf9f8] flex items-center justify-center">
      <span className="material-symbols-outlined text-5xl text-[#c3c8c1] animate-spin">progress_activity</span>
    </div>
  )

  return (
    <div className="bg-[#fcf9f8] min-h-screen flex flex-col">
      <TopBar title="Editar perfil" showBack />

      <main className="flex-grow max-w-[680px] mx-auto w-full px-5 py-8">

        {/* Avatar section */}
        <div className="flex flex-col items-center mb-8">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative group"
          >
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#fed488] bg-[#1b3022] flex items-center justify-center shadow-lg">
              {avatarPreview
                ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                : <span className="text-[#fed488] text-2xl font-bold">{initials}</span>
              }
            </div>
            <div className="absolute inset-0 rounded-2xl bg-[#061b0e]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[28px]">photo_camera</span>
            </div>
          </button>
          <p className="text-[10px] font-bold tracking-[0.1em] text-[#737973] mt-3">TOCA PARA CAMBIAR FOTO</p>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleAvatarChange(f); e.target.value = '' }} />
        </div>

        {error && (
          <div className="bg-[#ffdad6] text-[#93000a] text-[12px] px-4 py-3 rounded-xl mb-4 flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] mt-0.5">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white border border-[#e4e2e1] rounded-2xl p-6 flex flex-col gap-5 shadow-[0_2px_12px_rgba(6,27,14,0.04)]">

          {/* Name */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold tracking-[0.1em] text-[#737973] mb-1.5 ml-1">NOMBRE COMPLETO</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Ej. Alejandro von West"
              className="w-full bg-[#fcf9f8] border border-[#c3c8c1] rounded-xl px-4 py-3 text-[14px] text-[#1b1c1c] placeholder:text-[#a0a5a0] focus:outline-none focus:border-[#061b0e] transition-colors"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold tracking-[0.1em] text-[#737973] mb-1.5 ml-1">TELÉFONO (WHATSAPP)</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              placeholder="+56 9 1234 5678"
              className="w-full bg-[#fcf9f8] border border-[#c3c8c1] rounded-xl px-4 py-3 text-[14px] text-[#1b1c1c] placeholder:text-[#a0a5a0] focus:outline-none focus:border-[#061b0e] transition-colors"
            />
            <p className="text-[10px] text-[#a0a5a0] mt-1.5 ml-1">Este número se compartirá cuando desbloqueen tu contacto</p>
          </div>

          {/* Zone */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold tracking-[0.1em] text-[#737973] mb-1.5 ml-1">SECTOR</label>
            <div className="relative">
              <select
                value={form.zone}
                onChange={e => setForm(p => ({ ...p, zone: e.target.value }))}
                className="w-full bg-[#fcf9f8] border border-[#c3c8c1] rounded-xl px-4 py-3 text-[14px] text-[#1b1c1c] focus:outline-none focus:border-[#061b0e] transition-colors appearance-none cursor-pointer"
              >
                <option value="">Selecciona tu sector</option>
                {zones.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#737973] pointer-events-none text-[18px]">expand_more</span>
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold tracking-[0.1em] text-[#737973] mb-1.5 ml-1">EMAIL</label>
            <div className="w-full bg-[#f0eded] border border-[#e4e2e1] rounded-xl px-4 py-3 text-[14px] text-[#a0a5a0] flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">lock</span>
              {user?.email}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || saved}
            className="w-full bg-[#061b0e] text-white text-[12px] font-bold tracking-[0.08em] py-3.5 rounded-full mt-2 hover:bg-[#1b3022] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
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
