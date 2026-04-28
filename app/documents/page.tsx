'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import TopBar from '@/components/TopBar'

type DocStatus = 'idle' | 'uploaded'

interface DocZone {
  id: string
  label: string
  description: string
  required: boolean
  status: DocStatus
  fileName?: string
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocZone[]>([
    { id: 'pedigree', label: 'Certificado KCC / Pedigree', description: 'PDF o imagen del registro oficial de la Kennel Club de Chile', required: true, status: 'idle' },
    { id: 'vaccines', label: 'Cartilla de Vacunas', description: 'Documento actualizado con todas las vacunas vigentes', required: true, status: 'idle' },
    { id: 'health', label: 'Prueba de Displasia / Salud', description: 'Certificado veterinario de pruebas genéticas y de salud', required: false, status: 'idle' },
  ])

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const handleFileSelect = (docId: string, file: File) => {
    setDocs(prev => prev.map(d =>
      d.id === docId ? { ...d, status: 'uploaded', fileName: file.name } : d
    ))
  }

  const requiredDone = docs.filter(d => d.required).every(d => d.status === 'uploaded')

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <TopBar showBack title="Documentación" />

      <main className="flex-grow pb-[120px] px-4 max-w-[680px] mx-auto w-full pt-6">
        <div className="mb-8">
          <h2 className="font-headline-sm text-headline-sm text-primary text-xl mb-2">Sube tus documentos</h2>
          <p className="font-body-md text-body-md text-on-surface-variant text-sm leading-relaxed">
            Nuestro equipo revisará la documentación en 24–48 horas hábiles. Los documentos obligatorios son necesarios para activar tu perfil.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {docs.map(doc => (
            <div key={doc.id} className={`border rounded-xl p-5 transition-colors ${doc.status === 'uploaded' ? 'bg-surface-container border-primary/40' : 'bg-surface-container-low border-outline-variant'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-label-caps text-label-caps text-on-surface">{doc.label}</h3>
                    {doc.required && (
                      <span className="text-error font-label-caps text-[10px]">*</span>
                    )}
                  </div>
                  <p className="font-metadata text-xs text-outline leading-relaxed">{doc.description}</p>
                </div>
                {doc.status === 'uploaded' && (
                  <span className="material-symbols-outlined text-[#1b5e20] ml-3 flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                )}
              </div>

              {doc.status === 'uploaded' ? (
                <div className="flex items-center gap-2 bg-surface-container rounded-lg px-3 py-2">
                  <span className="material-symbols-outlined text-outline text-sm">description</span>
                  <span className="font-metadata text-xs text-on-surface-variant truncate flex-grow">{doc.fileName}</span>
                  <button
                    onClick={() => setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, status: 'idle', fileName: undefined } : d))}
                    className="text-outline hover:text-error transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRefs.current[doc.id]?.click()}
                  className="w-full border-2 border-dashed border-outline-variant rounded-lg py-6 flex flex-col items-center gap-2 hover:border-primary hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-outline text-3xl">upload_file</span>
                  <span className="font-label-caps text-[10px] text-outline">SELECCIONAR ARCHIVO</span>
                  <span className="font-metadata text-[10px] text-outline-variant">PDF, JPG o PNG · máx. 10 MB</span>
                </button>
              )}

              <input
                ref={el => { fileInputRefs.current[doc.id] = el }}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect(doc.id, file)
                }}
              />
            </div>
          ))}
        </div>

        <p className="font-metadata text-[10px] text-outline mt-4 text-center">
          * Campos obligatorios para activar el perfil de tu ejemplar.
        </p>
      </main>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant px-4 py-4 z-40">
        <div className="max-w-[680px] mx-auto">
          <button
            disabled={!requiredDone}
            className={`w-full font-label-caps text-label-caps py-4 transition-colors ${
              requiredDone
                ? 'bg-primary text-on-primary hover:bg-primary-container cursor-pointer'
                : 'bg-surface-container text-outline cursor-not-allowed'
            }`}
          >
            ENVIAR PARA REVISIÓN
          </button>
        </div>
      </div>
    </div>
  )
}
