'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'
import { insforge } from '@/lib/insforge'
import { useAuth } from '@/context/AuthContext'

interface MatchCard {
  id: string
  dogName: string
  breed: string
  zone: string | null
  photo: string | null
  unlocked: boolean
  phone: string | null
  mutual: boolean
}

export default function MatchesPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<'accepted' | 'pending'>('accepted')
  const [accepted, setAccepted] = useState<MatchCard[]>([])
  const [pending, setPending] = useState<MatchCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const { data: myDogs } = await insforge.from('dogs').select('id').eq('owner_id', user.id)
      if (!myDogs?.length) { setLoading(false); return }
      const dogIds = myDogs.map(d => d.id)

      const { data: matches } = await insforge
        .from('matches')
        .select('*, dog_a:dogs!dog_a_id(id,name,breed,zone,photos,owner_id), dog_b:dogs!dog_b_id(id,name,breed,zone,photos,owner_id)')
        .or(dogIds.map(id => `dog_a_id.eq.${id}`).join(',') + ',' + dogIds.map(id => `dog_b_id.eq.${id}`).join(','))

      const acc: MatchCard[] = []
      const pend: MatchCard[] = []

      for (const m of matches ?? []) {
        const iAmA = dogIds.includes((m.dog_a as any).id)
        const myStatus = iAmA ? m.status_a : m.status_b
        const theirStatus = iAmA ? m.status_b : m.status_a
        const otherDog = iAmA ? m.dog_b : m.dog_a

        const card: MatchCard = {
          id: m.id,
          dogName: (otherDog as any).name,
          breed: (otherDog as any).breed,
          zone: (otherDog as any).zone,
          photo: (otherDog as any).photos?.[0] ?? null,
          unlocked: m.contact_unlocked,
          phone: null,
          mutual: myStatus === 'accepted' && theirStatus === 'accepted',
        }

        if (card.mutual) acc.push(card)
        else if (myStatus === 'accepted') pend.push(card)
      }

      setAccepted(acc)
      setPending(pend)
      setLoading(false)
    }
    load()
  }, [user])

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <TopBar title="Matches" />
      <main className="flex-grow pb-[100px] px-4 max-w-[680px] mx-auto w-full pt-4">
        <div className="flex border-b border-outline-variant mb-6">
          <button onClick={() => setTab('accepted')} className={`flex-1 py-2 font-label-caps text-label-caps text-center transition-colors ${tab === 'accepted' ? 'border-b-2 border-primary text-primary' : 'text-outline hover:text-primary'}`}>ACEPTADOS ({accepted.length})</button>
          <button onClick={() => setTab('pending')} className={`flex-1 py-2 font-label-caps text-label-caps text-center transition-colors ${tab === 'pending' ? 'border-b-2 border-primary text-primary' : 'text-outline hover:text-primary'}`}>PENDIENTES ({pending.length})</button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><span className="material-symbols-outlined text-4xl text-outline-variant animate-spin">progress_activity</span></div>
        ) : (
          <>
            {tab === 'accepted' && (
              <div className="flex flex-col gap-4">
                {accepted.map(m => (
                  <div key={m.id} className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
                      {m.photo && <img src={m.photo} alt={m.dogName} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex flex-col justify-between flex-grow min-w-0">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="material-symbols-outlined text-[#1b5e20] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                          <span className="font-label-caps text-[10px] text-[#1b5e20]">MATCH MUTUO</span>
                        </div>
                        <h3 className="text-primary text-sm font-semibold truncate">{m.dogName}</h3>
                        <p className="font-metadata text-xs text-outline">{m.breed}{m.zone ? ` · ${m.zone}` : ''}</p>
                      </div>
                      <Link
                        href={`/unlock?match_id=${m.id}`}
                        className={`mt-2 inline-flex items-center gap-1 font-label-caps text-[10px] ${m.unlocked ? 'text-primary' : 'text-[#775a19]'}`}
                      >
                        <span className="material-symbols-outlined text-sm">{m.unlocked ? 'contact_phone' : 'lock_open'}</span>
                        {m.unlocked ? 'VER CONTACTO' : 'DESBLOQUEAR · $9.990'}
                      </Link>
                    </div>
                  </div>
                ))}
                {accepted.length === 0 && <div className="text-center py-16"><span className="material-symbols-outlined text-5xl text-outline-variant block mb-4">handshake</span><p className="text-on-surface-variant">Aún no tienes matches aceptados.</p></div>}
              </div>
            )}

            {tab === 'pending' && (
              <div className="flex flex-col gap-4">
                {pending.map(m => (
                  <div key={m.id} className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex gap-4 opacity-75">
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative bg-surface-container">
                      {m.photo && <img src={m.photo} alt={m.dogName} className="w-full h-full object-cover" />}
                      <div className="absolute inset-0 bg-primary/20" />
                    </div>
                    <div className="flex flex-col justify-center min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-outline text-sm">schedule</span>
                        <span className="font-label-caps text-[10px] text-outline">ESPERANDO RESPUESTA</span>
                      </div>
                      <h3 className="text-primary text-sm font-semibold truncate">{m.dogName}</h3>
                      <p className="font-metadata text-xs text-outline">{m.breed}</p>
                    </div>
                  </div>
                ))}
                {pending.length === 0 && <div className="text-center py-16"><span className="material-symbols-outlined text-5xl text-outline-variant block mb-4">schedule</span><p className="text-on-surface-variant">Sin solicitudes pendientes.</p></div>}
              </div>
            )}
          </>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
