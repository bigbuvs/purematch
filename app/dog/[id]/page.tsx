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
        insforge.database.from('dogs').select('*').eq('id', id).single(),
        insforge.database.from('documents').select('*').eq('dog_id', id).eq('status', 'approved'),
      ])
      setDog(dogData)
      setDocs(docsData ?? [])

      if (user) {
        const { data: myDogs } = await insforge.database.from('dogs').select('id').eq('owner_id', user.id)
        if (myDogs?.length) {
          const myDogIds = myDogs.map(d => d.id)
          const { data: existing } = await insforge.database
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
    const { data: myDogs } = await insforge.database.from('dogs').select('id').eq('owner_id', user.id).limit(1)
    if (!myDogs?.[0]) { setMatchLoading(false); return }
    await insforge.database.from('matches').insert({ dog_a_id: myDogs[0].id, dog_b_id: dog.id, status_a: 'accepted', status_b: 'pending', contact_unlocked: false })
    setMatchSent(true)
    setMatchLoading(false)
  }

  if (loading) return (
    <div className="bg-[#fcf9f8] min-h-screen flex items-center justify-center">
      <span className="material-symbols-outlined text-5xl text-[#c3c8c1] animate-spin">progress_activity</span>
    </div>
  )

  if (!dog) return (
    <div className="bg-[#fcf9f8] min-h-screen flex flex-col items-center justify-center gap-4">
      <span className="material-symbols-outlined text-5xl text-[#c3c8c1]">pets</span>
      <p className="text-[#737973]">Perfil no encontrado.</p>
      <Link href="/explore" className="text-[11px] font-bold tracking-[0.08em] text-[#061b0e] underline">VOLVER A EXPLORAR</Link>
    </div>
  )

  const docLabels: Record<string, string> = { pedigree: 'Certificado KCC', vaccines: 'Cartilla de Vacunas', health: 'Prueba de Displasia' }

  return (
    <div className="bg-[#fcf9f8] min-h-screen flex flex-col">
      <TopBar showBack title="Perfil" />

      <main className="flex-grow pb-[100px] max-w-[680px] mx-auto w-full">

        {/* Hero photo */}
        <div className="w-full aspect-[4/5] sm:aspect-[16/10] relative bg-[#f0eded]">
          {dog.photos[0]
            ? <img src={dog.photos[0]} alt={dog.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-[#c3c8c1]" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
              </div>
          }

          {/* Bottom gradient + name */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#061b0e]/85 via-transparent to-[#061b0e]/20" />

          <div className="absolute bottom-0 left-0 right-0 p-5">
            {dog.verified && (
              <div className="inline-flex items-center gap-1.5 bg-[#061b0e]/75 backdrop-blur-sm px-2.5 py-1 rounded-full mb-2">
                <span className="material-symbols-outlined text-[#fed488] text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                <span className="text-[9px] font-bold tracking-[0.1em] text-white">VERIFICADO KCC</span>
              </div>
            )}
            <h1 className="font-serif font-bold text-white text-3xl tracking-tight leading-tight">{dog.name}</h1>
            <p className="text-white/85 text-sm mt-1">{dog.breed} · {dog.age} · {dog.sex}</p>
          </div>

          {/* Score badge top-right */}
          {dog.score !== undefined && dog.score !== null && (
            <div className="absolute top-4 right-4 bg-[#fed488] text-[#261900] text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              {dog.score}
            </div>
          )}
        </div>

        <div className="px-4 py-6 flex flex-col gap-4">

          {/* Zone strip */}
          {dog.zone && (
            <div className="flex items-center gap-1.5 text-[#737973]">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              <span className="text-[12px]">{dog.zone}</span>
            </div>
          )}

          {/* Pedigree card */}
          {dog.pedigree_number && (
            <div className="bg-white border border-[#e4e2e1] rounded-2xl p-5 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#fed488]/30 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[#775a19] text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.1em] text-[#737973]">N° PEDIGREE KCC</p>
                <p className="font-serif font-bold text-[#061b0e] text-base">{dog.pedigree_number}</p>
              </div>
            </div>
          )}

          {/* Documentation */}
          {docs.length > 0 && (
            <div>
              <h2 className="font-serif font-bold text-[#061b0e] text-base mb-3">Documentación verificada</h2>
              <div className="flex flex-col gap-2">
                {docs.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between bg-white border border-[#e4e2e1] rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#737973] text-[18px]">description</span>
                      <span className="text-[14px] text-[#1b1c1c]">{docLabels[doc.type] ?? doc.type}</span>
                    </div>
                    <span className="material-symbols-outlined text-[#1b5e20] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gallery */}
          {dog.photos.length > 1 && (
            <div>
              <h2 className="font-serif font-bold text-[#061b0e] text-base mb-3">Galería</h2>
              <div className="grid grid-cols-3 gap-2">
                {dog.photos.slice(1).map((url, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden bg-[#f0eded]">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Match action card */}
          <div className="bg-gradient-to-br from-[#061b0e] to-[#1b3022] rounded-2xl p-6 flex flex-col gap-3 text-white shadow-[0_8px_32px_rgba(6,27,14,0.15)]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#fed488] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
              <p className="text-[10px] font-bold tracking-[0.1em] text-[#fed488]">CONTACTO RESERVADO</p>
            </div>
            <p className="text-white/80 text-[13px] leading-relaxed">
              Solicita un match. Si la otra parte acepta, podrás desbloquear el contacto del criador por <span className="text-[#fed488] font-bold">$9.990 CLP</span>.
            </p>
            {matchSent ? (
              <div className="w-full bg-[#fed488]/15 border border-[#fed488]/30 text-[#fed488] text-[12px] font-bold tracking-[0.08em] py-3.5 text-center rounded-full flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                SOLICITUD ENVIADA
              </div>
            ) : (
              <button
                onClick={handleMatch}
                disabled={matchLoading || !user}
                className="w-full bg-[#fed488] text-[#261900] text-[12px] font-bold tracking-[0.08em] py-3.5 rounded-full hover:bg-[#ffdea5] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {matchLoading
                  ? <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>ENVIANDO...</>
                  : <><span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>SOLICITAR MATCH</>
                }
              </button>
            )}
            {!user && (
              <p className="text-white/60 text-[11px] text-center">
                <Link href="/auth" className="text-[#fed488] underline">Inicia sesión</Link> para solicitar un match.
              </p>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
