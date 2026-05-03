'use client'
import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import TopBar from '@/components/TopBar'
import { insforge } from '@/lib/insforge'
import { useAuth } from '@/context/AuthContext'
import type { Database } from '@/lib/database.types'

type DocType = 'pedigree' | 'vaccines' | 'health'
type Dog = Database['public']['Tables']['dogs']['Row']
type Document = Database['public']['Tables']['documents']['Row']

interface DocZone {
  id: DocType
  label: string
  description: string
  required: boolean
  icon: string
}

const DOC_ZONES: DocZone[] = [
  { id: 'pedigree', label: 'Certificado KCC / Pedigree', description: 'PDF o imagen del registro oficial de la Kennel Club de Chile', required: true, icon: 'workspace_premium' },
  { id: 'vaccines', label: 'Cartilla de Vacunas', description: 'Documento actualizado con todas las vacunas vigentes', required: true, icon: 'vaccines' },
  { id: 'health', label: 'Prueba de Displasia / Salud', description: 'Certificado veterinario de pruebas genéticas y de salud', required: false, icon: 'health_and_safety' },
]

const STATUS_CONFIG = {
  pending:  { label: 'EN REVISIÓN', bg: 'bg-[#fed488]/25', border: 'border-[#fed488]/60', text: 'text-[#775a19]', icon: 'hourglass_empty' },
  approved: { label: 'APROBADO',    bg: 'bg-[#e8f5e9]',   border: 'border-[#1b5e20]/30', text: 'text-[#1b5e20]', icon: 'check_circle' },
  rejected: { label: 'RECHAZADO',   bg: 'bg-[#ffdad6]',   border: 'border-[#ba1a1a]/30', text: 'text-[#ba1a1a]', icon: 'cancel' },
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fcf9f8] flex items-center justify-center"><span className="material-symbols-outlined text-5xl text-[#c3c8c1] animate-spin">progress_activity</span></div>}>
      <DocumentsContent />
    </Suspense>
  )
}

function DocumentsContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [dogs, setDogs] = useState<Dog[]>([])
  const [selectedDogId, setSelectedDogId] = useState<string | null>(searchParams.get('dog_id'))
  const [existingDocs, setExistingDocs] = useState<Document[]>([])
  const [uploading, setUploading] = useState<Partial<Record<DocType, boolean>>>({})
  const [errors, setErrors] = useState<Partial<Record<DocType, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  const fileInputRefs = useRef<Partial<Record<DocType, HTMLInputElement | null>>>({})

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.replace('/auth'); return }

    insforge.database.from('dogs').select('*').eq('owner_id', user.id).then(({ data }) => {
      const list = data ?? []
      setDogs(list)
      if (!selectedDogId && list.length > 0) setSelectedDogId(list[0].id)
      setPageLoading(false)
    })
  }, [user, authLoading])

  useEffect(() => {
    if (!selectedDogId) return
    insforge.database.from('documents').select('*').eq('dog_id', selectedDogId).then(({ data }) => {
      setExistingDocs(data ?? [])
    })
  }, [selectedDogId])

  const getDoc = (type: DocType) => existingDocs.find(d => d.type === type)

  const handleUpload = async (type: DocType, file: File) => {
    if (!user || !selectedDogId) return
    if (file.size > 10 * 1024 * 1024) {
      setErrors(e => ({ ...e, [type]: 'El archivo supera 10 MB' }))
      return
    }

    setUploading(u => ({ ...u, [type]: true }))
    setErrors(e => ({ ...e, [type]: undefined }))

    const ext = file.name.split('.').pop()
    const path = `${selectedDogId}/${type}-${Date.now()}.${ext}`

    const { data: storageData, error: storageErr } = await insforge.storage
      .from('documents').upload(path, file)

    if (storageErr || !storageData) {
      setErrors(e => ({ ...e, [type]: 'Error al subir el archivo. Intenta de nuevo.' }))
      setUploading(u => ({ ...u, [type]: false }))
      return
    }

    const publicUrl = storageData.url

    const existing = getDoc(type)
    if (existing) {
      await insforge.database.from('documents').update({ file_url: publicUrl, status: 'pending', reviewed_at: null }).eq('id', existing.id)
    } else {
      await insforge.database.from('documents').insert({ dog_id: selectedDogId, type, file_url: publicUrl, status: 'pending' })
    }

    const { data: refreshed } = await insforge.database.from('documents').select('*').eq('dog_id', selectedDogId)
    setExistingDocs(refreshed ?? [])
    setUploading(u => ({ ...u, [type]: false }))
  }

  const handleSubmit = async () => {
    if (!selectedDogId) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 600))
    setSubmitted(true)
    setSubmitting(false)
  }

  const requiredDone = DOC_ZONES.filter(d => d.required).every(d => !!getDoc(d.id))
  const totalRequired = DOC_ZONES.filter(d => d.required).length
  const totalDone = DOC_ZONES.filter(d => d.required && getDoc(d.id)).length

  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen bg-[#fcf9f8] flex flex-col items-center justify-center gap-3">
        <span className="material-symbols-outlined text-[#c3c8c1] animate-spin text-5xl">progress_activity</span>
        <p className="text-[10px] font-bold tracking-[0.1em] text-[#737973]">CARGANDO...</p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="bg-[#fcf9f8] min-h-screen flex flex-col">
        <TopBar showBack title="Documentación" />
        <div className="flex-grow flex flex-col items-center justify-center px-6 text-center gap-5">
          <div className="w-20 h-20 rounded-full bg-[#e8f5e9] flex items-center justify-center">
            <span className="material-symbols-outlined text-[#1b5e20] text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <div>
            <h2 className="font-serif font-bold text-[#061b0e] text-2xl mb-2">Documentos enviados</h2>
            <p className="text-[#737973] text-sm leading-relaxed max-w-[320px]">
              Nuestro equipo revisará tu documentación en 24–48 horas hábiles. Te notificaremos cuando tu perfil esté verificado.
            </p>
          </div>
          <button
            onClick={() => router.push('/profile')}
            className="bg-[#061b0e] text-white text-[12px] font-bold tracking-[0.08em] px-8 py-3 rounded-full hover:bg-[#1b3022] transition-colors"
          >
            VER MI PERFIL
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#fcf9f8] min-h-screen flex flex-col">
      <TopBar showBack title="Documentación" />

      <main className="flex-grow pb-[120px] px-4 max-w-[680px] mx-auto w-full pt-6">

        {dogs.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-[#f0eded] rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-[#c3c8c1]">pets</span>
            </div>
            <div>
              <p className="font-serif font-semibold text-[#061b0e] mb-1">Sin ejemplares registrados</p>
              <p className="text-[#737973] text-sm">Primero registra un perro para subir documentación.</p>
            </div>
            <button
              onClick={() => router.push('/onboarding/dog')}
              className="bg-[#061b0e] text-white text-[12px] font-bold tracking-[0.08em] px-6 py-3 rounded-full hover:bg-[#1b3022] transition-colors"
            >
              REGISTRAR EJEMPLAR
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <header className="mb-6">
              <h2 className="font-serif font-bold text-[#061b0e] text-2xl mb-1">Documentos del ejemplar</h2>
              <p className="text-[#737973] text-sm leading-relaxed">
                Sube los certificados oficiales. Tu equipo de PureMatch los revisa en 24–48 hrs.
              </p>
            </header>

            {/* Progress bar */}
            <div className="bg-white border border-[#e4e2e1] rounded-2xl p-4 mb-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#fed488]/30 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[#775a19] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
              </div>
              <div className="flex-grow">
                <div className="flex items-baseline gap-1">
                  <p className="font-serif font-bold text-[#061b0e] text-base">{totalDone}/{totalRequired}</p>
                  <p className="text-[11px] text-[#737973]">documentos obligatorios</p>
                </div>
                <div className="mt-1.5 h-1.5 bg-[#f0eded] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#fed488] to-[#775a19] transition-all duration-300"
                    style={{ width: `${(totalDone / totalRequired) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Dog selector */}
            {dogs.length > 1 && (
              <div className="mb-5">
                <p className="text-[10px] font-bold tracking-[0.1em] text-[#737973] mb-2 ml-1">EJEMPLAR</p>
                <div className="flex gap-2 flex-wrap">
                  {dogs.map(dog => (
                    <button
                      key={dog.id}
                      onClick={() => setSelectedDogId(dog.id)}
                      className={`px-4 py-2 rounded-full border text-[11px] font-bold tracking-[0.06em] transition-all ${
                        selectedDogId === dog.id
                          ? 'bg-[#061b0e] text-white border-[#061b0e]'
                          : 'bg-white text-[#737973] border-[#c3c8c1] hover:border-[#061b0e]'
                      }`}
                    >
                      {dog.name.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Doc zones */}
            <div className="flex flex-col gap-3">
              {DOC_ZONES.map(zone => {
                const existing = getDoc(zone.id)
                const isUploading = uploading[zone.id]
                const status = existing?.status as keyof typeof STATUS_CONFIG | undefined
                const cfg = status ? STATUS_CONFIG[status] : null

                return (
                  <div key={zone.id} className="bg-white border border-[#e4e2e1] rounded-2xl p-5 transition-colors">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#f0eded] flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-[#1b1c1c] text-[20px]">{zone.icon}</span>
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <h3 className="font-serif font-bold text-[#061b0e] text-[14px] truncate">{zone.label}</h3>
                          {zone.required && <span className="text-[#ba1a1a] text-[12px]">*</span>}
                        </div>
                        <p className="text-[11px] text-[#737973] leading-relaxed">{zone.description}</p>
                      </div>
                      {cfg && (
                        <span className={`text-[9px] font-bold tracking-[0.1em] ${cfg.bg} ${cfg.text} ${cfg.border} border px-2 py-1 rounded-full flex items-center gap-1 flex-shrink-0`}>
                          <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
                          {cfg.label}
                        </span>
                      )}
                    </div>

                    {isUploading ? (
                      <div className="flex items-center justify-center gap-2 py-4 bg-[#f0eded] rounded-xl">
                        <span className="material-symbols-outlined text-[#737973] text-[18px] animate-spin">progress_activity</span>
                        <span className="text-[10px] font-bold tracking-[0.08em] text-[#737973]">SUBIENDO...</span>
                      </div>
                    ) : existing ? (
                      <div className="flex items-center gap-2">
                        <a
                          href={existing.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-[#f6f3f2] border border-[#e4e2e1] rounded-xl px-3 py-2.5 flex-grow min-w-0 hover:border-[#061b0e] transition-colors"
                        >
                          <span className="material-symbols-outlined text-[#737973] text-[16px]">description</span>
                          <span className="text-[12px] text-[#1b1c1c] truncate flex-grow">Ver documento</span>
                          <span className="material-symbols-outlined text-[#737973] text-[14px]">open_in_new</span>
                        </a>
                        <button
                          onClick={() => fileInputRefs.current[zone.id]?.click()}
                          className="w-10 h-10 rounded-xl bg-[#f0eded] hover:bg-[#e4e2e1] text-[#737973] flex items-center justify-center transition-colors"
                          title="Reemplazar archivo"
                        >
                          <span className="material-symbols-outlined text-[16px]">refresh</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileInputRefs.current[zone.id]?.click()}
                        className="w-full border-2 border-dashed border-[#c3c8c1] rounded-xl py-6 flex flex-col items-center gap-1.5 hover:border-[#061b0e] hover:bg-[#f6f3f2] transition-colors"
                      >
                        <span className="material-symbols-outlined text-[#737973] text-[28px]">upload_file</span>
                        <span className="text-[10px] font-bold tracking-[0.08em] text-[#737973]">SELECCIONAR ARCHIVO</span>
                        <span className="text-[10px] text-[#a0a5a0]">PDF, JPG o PNG · máx. 10 MB</span>
                      </button>
                    )}

                    {errors[zone.id] && (
                      <p className="text-[11px] text-[#ba1a1a] mt-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        {errors[zone.id]}
                      </p>
                    )}

                    <input
                      ref={el => { fileInputRefs.current[zone.id] = el }}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) handleUpload(zone.id, file)
                        e.target.value = ''
                      }}
                    />
                  </div>
                )
              })}
            </div>

            <p className="text-[10px] text-[#a0a5a0] mt-4 text-center">
              * Campos obligatorios para activar el perfil de tu ejemplar.
            </p>
          </>
        )}
      </main>

      {/* Sticky submit bar */}
      {dogs.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#fcf9f8]/95 backdrop-blur-sm border-t border-[#c3c8c1]/60 px-4 py-4 z-40">
          <div className="max-w-[680px] mx-auto">
            <button
              onClick={handleSubmit}
              disabled={!requiredDone || submitting}
              className={`w-full text-[12px] font-bold tracking-[0.08em] py-3.5 rounded-full transition-colors flex items-center justify-center gap-2 ${
                requiredDone && !submitting
                  ? 'bg-[#061b0e] text-white hover:bg-[#1b3022]'
                  : 'bg-[#e4e2e1] text-[#a0a5a0] cursor-not-allowed'
              }`}
            >
              {submitting
                ? <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>ENVIANDO...</>
                : <>ENVIAR PARA REVISIÓN<span className="material-symbols-outlined text-[16px]">arrow_forward</span></>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
