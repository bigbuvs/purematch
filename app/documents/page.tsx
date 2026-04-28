'use client'
import { useState, useRef, useEffect } from 'react'
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
}

const DOC_ZONES: DocZone[] = [
  { id: 'pedigree', label: 'Certificado KCC / Pedigree', description: 'PDF o imagen del registro oficial de la Kennel Club de Chile', required: true },
  { id: 'vaccines', label: 'Cartilla de Vacunas', description: 'Documento actualizado con todas las vacunas vigentes', required: true },
  { id: 'health', label: 'Prueba de Displasia / Salud', description: 'Certificado veterinario de pruebas genéticas y de salud', required: false },
]

const STATUS_CONFIG = {
  pending:  { label: 'EN REVISIÓN', bg: 'bg-[#fff8e1]', text: 'text-[#775a19]', icon: 'hourglass_empty' },
  approved: { label: 'APROBADO',    bg: 'bg-[#e8f5e9]', text: 'text-[#1b5e20]', icon: 'check_circle' },
  rejected: { label: 'RECHAZADO',   bg: 'bg-[#fce4ec]', text: 'text-error',     icon: 'cancel' },
}

export default function DocumentsPage() {
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

    insforge.from('dogs').select('*').eq('owner_id', user.id).then(({ data }) => {
      const list = data ?? []
      setDogs(list)
      if (!selectedDogId && list.length > 0) setSelectedDogId(list[0].id)
      setPageLoading(false)
    })
  }, [user, authLoading])

  useEffect(() => {
    if (!selectedDogId) return
    insforge.from('documents').select('*').eq('dog_id', selectedDogId).then(({ data }) => {
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
      .from('documents')
      .upload(path, file, { upsert: true })

    if (storageErr || !storageData) {
      setErrors(e => ({ ...e, [type]: 'Error al subir el archivo. Intenta de nuevo.' }))
      setUploading(u => ({ ...u, [type]: false }))
      return
    }

    const { data: { publicUrl } } = insforge.storage.from('documents').getPublicUrl(storageData.path)

    const existing = getDoc(type)
    if (existing) {
      await insforge.from('documents').update({ file_url: publicUrl, status: 'pending', reviewed_at: null }).eq('id', existing.id)
    } else {
      await insforge.from('documents').insert({ dog_id: selectedDogId, type, file_url: publicUrl, status: 'pending' })
    }

    const { data: refreshed } = await insforge.from('documents').select('*').eq('dog_id', selectedDogId)
    setExistingDocs(refreshed ?? [])
    setUploading(u => ({ ...u, [type]: false }))
  }

  const handleSubmit = async () => {
    if (!selectedDogId) return
    setSubmitting(true)
    // All uploads are already persisted individually; submission just flags intent
    await new Promise(r => setTimeout(r, 600))
    setSubmitted(true)
    setSubmitting(false)
  }

  const requiredDone = DOC_ZONES.filter(d => d.required).every(d => !!getDoc(d.id))

  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <span className="material-symbols-outlined text-outline animate-spin text-3xl">progress_activity</span>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex flex-col">
        <TopBar showBack title="Documentación" />
        <div className="flex-grow flex flex-col items-center justify-center px-6 text-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[#e8f5e9] flex items-center justify-center">
            <span className="material-symbols-outlined text-[#1b5e20] text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-primary text-xl mb-2">Documentos enviados</h2>
            <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
              Nuestro equipo revisará tu documentación en 24–48 horas hábiles.<br />Te notificaremos cuando tu perfil esté verificado.
            </p>
          </div>
          <button onClick={() => router.push('/profile')} className="bg-primary text-on-primary font-label-caps text-label-caps px-8 py-3 hover:bg-primary-container transition-colors">
            VER MI PERFIL
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <TopBar showBack title="Documentación" />

      <main className="flex-grow pb-[120px] px-4 max-w-[680px] mx-auto w-full pt-6">
        {/* Dog selector */}
        {dogs.length > 1 && (
          <div className="mb-6">
            <p className="font-label-caps text-[10px] text-outline mb-2">EJEMPLAR</p>
            <div className="flex gap-2 flex-wrap">
              {dogs.map(dog => (
                <button
                  key={dog.id}
                  onClick={() => setSelectedDogId(dog.id)}
                  className={`px-4 py-2 rounded-full border font-label-caps text-label-caps transition-colors ${
                    selectedDogId === dog.id
                      ? 'bg-primary text-on-primary border-primary'
                      : 'border-outline-variant text-outline hover:border-primary hover:text-primary'
                  }`}
                >
                  {dog.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {dogs.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-outline text-4xl mb-3 block">pets</span>
            <p className="font-body-md text-sm text-on-surface-variant mb-4">Primero registra un ejemplar para subir documentos.</p>
            <button onClick={() => router.push('/onboarding/dog')} className="bg-primary text-on-primary font-label-caps text-label-caps px-6 py-3 hover:bg-primary-container transition-colors">
              REGISTRAR EJEMPLAR
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="font-headline-sm text-headline-sm text-primary text-xl mb-2">Sube tus documentos</h2>
              <p className="font-body-md text-body-md text-on-surface-variant text-sm leading-relaxed">
                Nuestro equipo revisará la documentación en 24–48 horas hábiles. Los documentos obligatorios son necesarios para activar tu perfil.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {DOC_ZONES.map(zone => {
                const existing = getDoc(zone.id)
                const isUploading = uploading[zone.id]

                return (
                  <div key={zone.id} className={`border rounded-xl p-5 transition-colors ${existing ? 'bg-surface-container border-primary/40' : 'bg-surface-container-low border-outline-variant'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-label-caps text-label-caps text-on-surface">{zone.label}</h3>
                          {zone.required && <span className="text-error font-label-caps text-[10px]">*</span>}
                        </div>
                        <p className="font-metadata text-xs text-outline leading-relaxed">{zone.description}</p>
                      </div>
                      {existing && (
                        <span className={`font-label-caps text-[10px] px-2 py-1 rounded-full ml-3 flex-shrink-0 ${STATUS_CONFIG[existing.status as keyof typeof STATUS_CONFIG]?.bg} ${STATUS_CONFIG[existing.status as keyof typeof STATUS_CONFIG]?.text}`}>
                          {STATUS_CONFIG[existing.status as keyof typeof STATUS_CONFIG]?.label}
                        </span>
                      )}
                    </div>

                    {isUploading ? (
                      <div className="flex items-center justify-center gap-2 py-4 text-outline">
                        <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                        <span className="font-label-caps text-[10px]">SUBIENDO...</span>
                      </div>
                    ) : existing ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 bg-surface-container rounded-lg px-3 py-2 flex-grow min-w-0">
                          <span className="material-symbols-outlined text-outline text-sm">description</span>
                          <a href={existing.file_url} target="_blank" rel="noopener noreferrer" className="font-metadata text-xs text-on-surface-variant truncate flex-grow hover:text-primary transition-colors">
                            Ver documento
                          </a>
                        </div>
                        <button onClick={() => fileInputRefs.current[zone.id]?.click()} className="text-outline hover:text-primary transition-colors p-2" title="Reemplazar">
                          <span className="material-symbols-outlined text-sm">upload</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileInputRefs.current[zone.id]?.click()}
                        className="w-full border-2 border-dashed border-outline-variant rounded-lg py-6 flex flex-col items-center gap-2 hover:border-primary hover:bg-surface-container transition-colors"
                      >
                        <span className="material-symbols-outlined text-outline text-3xl">upload_file</span>
                        <span className="font-label-caps text-[10px] text-outline">SELECCIONAR ARCHIVO</span>
                        <span className="font-metadata text-[10px] text-outline-variant">PDF, JPG o PNG · máx. 10 MB</span>
                      </button>
                    )}

                    {errors[zone.id] && (
                      <p className="font-metadata text-[10px] text-error mt-2">{errors[zone.id]}</p>
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

            <p className="font-metadata text-[10px] text-outline mt-4 text-center">
              * Campos obligatorios para activar el perfil de tu ejemplar.
            </p>
          </>
        )}
      </main>

      {dogs.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant px-4 py-4 z-40">
          <div className="max-w-[680px] mx-auto">
            <button
              onClick={handleSubmit}
              disabled={!requiredDone || submitting}
              className={`w-full font-label-caps text-label-caps py-4 transition-colors flex items-center justify-center gap-2 ${
                requiredDone && !submitting
                  ? 'bg-primary text-on-primary hover:bg-primary-container cursor-pointer'
                  : 'bg-surface-container text-outline cursor-not-allowed'
              }`}
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  ENVIANDO...
                </>
              ) : (
                'ENVIAR PARA REVISIÓN'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
