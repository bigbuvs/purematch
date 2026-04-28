'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'
import { insforge } from '@/lib/insforge'
import { useAuth } from '@/context/AuthContext'
import type { Database } from '@/lib/database.types'

type Dog = Database['public']['Tables']['dogs']['Row']
type Document = Database['public']['Tables']['documents']['Row']

export default function DogProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [dog, setDog] = useState<Dog | null>(null)
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [matchLoading, setMatchLoading] = useState(false)
  const [matchSent, setMatchSent] = useState(false)

  useEffect(() => {
    const load = async () => {
      const [{ data: dogData }, { data: docsData }] = await Promise.all([
        insforge.from('dogs').select('*').eq('id', id).single(),
        insforge.from('documents').select('*').eq('dog_id', id).eq('status', 'approved'),
      ])
      setDog(dogData)
      setDocs(docsData ?? [])

      if (user) {
        const { data: myDogs } = await insforge.from('dogs').select('id').eq('owner_id', user.id)
        if (myDogs?.length) {
          const myDogIds = myDogs.map(d => d.id)
          const { data: existing } = await insforge
            .from('matches')
            .select('id')
            .or(
              myDogIds.map(mid => `and(dog_a_id.eq.${mid},dog_b_id.eq.${id})`).join(',') +
              ',' +
              myDogIds.map(mid => `and(dog_a_id.eq.${id},dog_b_id.eq.${mid})`).join(',')
            )
            .limit(1)
          if (existing?.length) setMatchSent(true)
        }
      }

      setLoading(false)
    }
    load()
  }, [id, user])

  const handleMatch = async () => {
    if (!user || !dog) return
    setMatchLoading(true)
    const { data: myDogs } = await insforge.from('dogs').select('id').eq('owner_id', user.id).limit(1)
    if (!myDogs?.[0]) { setMatchLoading(false); return }
    await insforge.from('matches').insert({ dog_a_id: myDogs[0].id, dog_b_id: dog.id, status_a: 'accepted', status_b: 'pending', contact_unlocked: false })
    setMatchSent(true)
    setMatchLoading(false)
  }

  if (loading) return (
    <div className="bg-surface min-h-screen flex items-center justify-center">
      <span className="material-symbols-outlined text-5xl text-outline-variant animate-spin">progress_activity</span>
    </div>
  )

  if (!dog) return (
    <div className="bg-surface min-h-screen flex flex-col items-center justify-center gap-4">
      <span className="material-symbols-outlined text-5xl text-outline-variant">pets</span>
      <p className="text-on-surface-variant">Perfil no encontrado.</p>
    </div>
  )

  const docLabels: Record<string, string> = { pedigree: 'Certificado KCC', vaccines: 'Cartilla Vacunas', health: 'Prueba Displasia' }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <TopBar showBack title="Perfil" />
      <main className="flex-grow pb-[100px] max-w-[680px] mx-auto w-full">
        <div className="w-full aspect-[4/5] sm:aspect-video relative bg-surface-container">
          {dog.photos[0] && <img src={dog.photos[0]} alt={dog.name} className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-white text-2xl font-bold">{dog.name}</h1>
              {dog.verified && <span className="material-symbols-outlined text-[#fed488] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>}
            </div>
            <p className="text-white/80 text-sm">{dog.breed} · {dog.age} · {dog.sex}</p>
          </div>
          <div className="absolute top-4 right-4 bg-[#fed488] text-[#261900] font-label-caps text-label-caps px-3 py-1 rounded-full flex items-center gap-1">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            {dog.score}
          </div>
        </div>

        <div className="px-4 py-6 flex flex-col gap-6">
          {dog.zone && (
            <div className="flex items-center gap-2 text-outline">
              <span className="material-symbols-outlined text-sm">location_on</span>
              <span className="font-metadata text-xs">{dog.zone}</span>
            </div>
          )}

          {dog.pedigree_number && (
            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#775a19]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
              <div>
                <p className="font-label-caps text-label-caps text-on-surface-variant">Nº PEDIGREE KCC</p>
                <p className="font-body-md text-primary font-semibold">{dog.pedigree_number}</p>
              </div>
            </div>
          )}

          {docs.length > 0 && (
            <div>
              <h2 className="font-headline-sm text-primary text-base mb-3">Documentación</h2>
              <div className="flex flex-col gap-2">
                {docs.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3">
                    <span className="text-on-surface">{docLabels[doc.type] ?? doc.type}</span>
                    <span className="material-symbols-outlined text-[#1b5e20]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {dog.photos.length > 1 && (
            <div>
              <h2 className="font-headline-sm text-primary text-base mb-3">Galería</h2>
              <div className="grid grid-cols-3 gap-2">
                {dog.photos.slice(1).map((url, i) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-surface-container border border-outline-variant rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-outline" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
              <p className="font-label-caps text-label-caps text-on-surface-variant">CONTACTO BLOQUEADO</p>
            </div>
            <p className="font-metadata text-xs text-outline leading-relaxed">Desbloquea el contacto del criador por $9.990 CLP después de un match mutuo.</p>
            {matchSent ? (
              <div className="w-full bg-surface-container text-on-surface-variant font-label-caps text-label-caps py-4 text-center rounded">
                ✓ SOLICITUD ENVIADA
              </div>
            ) : (
              <button onClick={handleMatch} disabled={matchLoading || !user} className="w-full bg-primary text-on-primary font-label-caps text-label-caps py-4 text-center hover:bg-primary-container transition-colors disabled:opacity-60">
                {matchLoading ? 'ENVIANDO...' : 'SOLICITAR MATCH'}
              </button>
            )}
            {!user && <p className="font-metadata text-[10px] text-outline text-center"><Link href="/auth" className="underline text-primary">Inicia sesión</Link> para solicitar un match.</p>}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
