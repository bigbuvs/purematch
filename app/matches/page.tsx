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
  age: string
  zone: string | null
  photo: string | null
  unlocked: boolean
  mutual: boolean
  myStatus: string
  theirStatus: string
}

const DEMO_MUTUAL: MatchCard[] = [
  {
    id: 'm1',
    dogName: 'Thor of Golden Peak',
    breed: 'Golden Retriever',
    age: '3 años',
    zone: 'Las Condes',
    photo: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=600&fit=crop',
    unlocked: false,
    mutual: true,
    myStatus: 'accepted',
    theirStatus: 'accepted',
  },
  {
    id: 'm2',
    dogName: 'Luna von Schwarzwald',
    breed: 'German Shepherd',
    age: '4 años',
    zone: 'Vitacura',
    photo: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=600&h=600&fit=crop',
    unlocked: true,
    mutual: true,
    myStatus: 'accepted',
    theirStatus: 'accepted',
  },
]

const DEMO_PENDING: MatchCard[] = [
  {
    id: 'p1',
    dogName: 'Balto del Sur',
    breed: 'Husky Siberiano',
    age: '2 años',
    zone: 'Ñuñoa',
    photo: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=600&h=600&fit=crop',
    unlocked: false,
    mutual: false,
    myStatus: 'accepted',
    theirStatus: 'pending',
  },
  {
    id: 'p2',
    dogName: 'Bella di Milano',
    breed: 'Poodle',
    age: '1 año',
    zone: 'Providencia',
    photo: 'https://images.unsplash.com/photo-1594226801341-41427b4e5c22?w=600&h=600&fit=crop',
    unlocked: false,
    mutual: false,
    myStatus: 'accepted',
    theirStatus: 'pending',
  },
]

function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center text-center py-24 gap-4">
      <div className="w-16 h-16 bg-[#f0eded] rounded-full flex items-center justify-center">
        <span className="material-symbols-outlined text-3xl text-[#c3c8c1]">{icon}</span>
      </div>
      <div>
        <p className="font-serif font-semibold text-[#061b0e] mb-1">{title}</p>
        <p className="text-[#737973] text-sm leading-relaxed max-w-[260px] mx-auto">{desc}</p>
      </div>
    </div>
  )
}

export default function MatchesPage() {
  const { user } = useAuth()
  const isDemo = user?.id === 'demo-user'
  const [tab, setTab] = useState<'mutual' | 'pending'>('mutual')
  const [mutual, setMutual] = useState<MatchCard[]>([])
  const [pending, setPending] = useState<MatchCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemo) {
      setMutual(DEMO_MUTUAL)
      setPending(DEMO_PENDING)
      setLoading(false)
      return
    }
    if (!user) { setLoading(false); return }

    const load = async () => {
      const { data: myDogs } = await insforge.database.from('dogs').select('id').eq('owner_id', user.id)
      if (!myDogs?.length) { setLoading(false); return }
      const dogIds = myDogs.map(d => d.id)

      const { data: matches } = await insforge.database
        .from('matches')
        .select('*, dog_a:dogs!dog_a_id(id,name,breed,age,zone,photos), dog_b:dogs!dog_b_id(id,name,breed,age,zone,photos)')
        .or(dogIds.map(id => `dog_a_id.eq.${id}`).join(',') + ',' + dogIds.map(id => `dog_b_id.eq.${id}`).join(','))

      const mut: MatchCard[] = []
      const pend: MatchCard[] = []

      for (const m of matches ?? []) {
        const iAmA = dogIds.includes((m.dog_a as any).id)
        const myStatus = iAmA ? m.status_a : m.status_b
        const theirStatus = iAmA ? m.status_b : m.status_a
        const other = iAmA ? m.dog_b : m.dog_a

        if (myStatus !== 'accepted') continue

        const card: MatchCard = {
          id: m.id,
          dogName: (other as any).name,
          breed: (other as any).breed,
          age: (other as any).age ?? '',
          zone: (other as any).zone,
          photo: (other as any).photos?.[0] ?? null,
          unlocked: m.contact_unlocked,
          mutual: theirStatus === 'accepted',
          myStatus,
          theirStatus,
        }

        if (card.mutual) mut.push(card)
        else pend.push(card)
      }

      setMutual(mut)
      setPending(pend)
      setLoading(false)
    }
    load()
  }, [user, isDemo])

  return (
    <div className="bg-[#fcf9f8] min-h-screen flex flex-col">
      <TopBar title="Matches" />
      <main className="flex-grow pb-[80px] max-w-[680px] mx-auto w-full">

        {/* Tabs */}
        <div className="flex border-b border-[#c3c8c1]/60 bg-[#fcf9f8] sticky top-[60px] z-30">
          {([
            { key: 'mutual',  label: 'Mutuos',     count: mutual.length  },
            { key: 'pending', label: 'Pendientes',  count: pending.length },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-3.5 text-[11px] tracking-[0.08em] font-semibold flex items-center justify-center gap-2 transition-colors border-b-2 ${
                tab === t.key ? 'border-[#061b0e] text-[#061b0e]' : 'border-transparent text-[#a0a5a0] hover:text-[#1b1c1c]'
              }`}
            >
              {t.label.toUpperCase()}
              <span className={`text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                tab === t.key ? 'bg-[#061b0e] text-white' : 'bg-[#f0eded] text-[#737973]'
              }`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        <div className="px-4 pt-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <span className="material-symbols-outlined text-5xl text-[#c3c8c1] animate-spin">progress_activity</span>
              <p className="text-[10px] font-semibold tracking-[0.1em] text-[#737973]">CARGANDO MATCHES...</p>
            </div>
          ) : (
            <>
              {tab === 'mutual' && (
                <div className="flex flex-col gap-3">
                  {mutual.length === 0
                    ? <EmptyState icon="handshake" title="Sin matches mutuos aún" desc="Cuando ambas partes acepten, aparecerá aquí el contacto." />
                    : mutual.map(m => (
                        <div key={m.id} className="bg-white border border-[#e4e2e1] rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(6,27,14,0.04)]">
                          <div className="flex">
                            <div className="w-28 h-28 flex-shrink-0 bg-[#f0eded] relative overflow-hidden">
                              {m.photo
                                ? <img src={m.photo} alt={m.dogName} className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-4xl text-[#c3c8c1]" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
                                  </div>
                              }
                            </div>
                            <div className="flex flex-col justify-between flex-grow min-w-0 p-4">
                              <div>
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="material-symbols-outlined text-sm text-[#1b5e20]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                                  <span className="text-[9px] font-bold text-[#1b5e20] tracking-[0.1em]">MATCH MUTUO</span>
                                </div>
                                <h3 className="font-serif font-semibold text-[#061b0e] text-base truncate">{m.dogName}</h3>
                                <p className="text-xs text-[#737973]">{m.breed}{m.age ? ` · ${m.age}` : ''}</p>
                                {m.zone && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <span className="material-symbols-outlined text-[#a0a5a0] text-xs">location_on</span>
                                    <span className="text-xs text-[#a0a5a0]">{m.zone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="border-t border-[#e4e2e1] px-4 py-3">
                            <Link
                              href={`/unlock?match_id=${m.id}`}
                              className="flex items-center gap-2 text-[10px] tracking-[0.08em] font-semibold text-[#061b0e] hover:text-[#1b3022] transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                                {m.unlocked ? 'contact_phone' : 'lock_open'}
                              </span>
                              {m.unlocked ? 'VER DATOS DE CONTACTO' : 'DESBLOQUEAR CONTACTO · $9.990'}
                              {!m.unlocked && <span className="material-symbols-outlined text-xs ml-auto">arrow_forward</span>}
                            </Link>
                          </div>
                        </div>
                      ))
                  }
                </div>
              )}

              {tab === 'pending' && (
                <div className="flex flex-col gap-3">
                  {pending.length === 0
                    ? <EmptyState icon="schedule" title="Sin solicitudes pendientes" desc="Las solicitudes que envíes y aún no tienen respuesta aparecerán aquí." />
                    : pending.map(m => (
                        <div key={m.id} className="bg-white border border-[#e4e2e1] rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(6,27,14,0.04)]">
                          <div className="flex">
                            <div className="w-28 h-28 flex-shrink-0 bg-[#f0eded] relative overflow-hidden">
                              {m.photo
                                ? <>
                                    <img src={m.photo} alt={m.dogName} className="w-full h-full object-cover opacity-50" />
                                    <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]" />
                                  </>
                                : <div className="w-full h-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-4xl text-[#c3c8c1]" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
                                  </div>
                              }
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[#737973] text-2xl">schedule</span>
                              </div>
                            </div>
                            <div className="flex flex-col justify-center flex-grow min-w-0 p-4">
                              <span className="text-[9px] font-bold text-[#a0a5a0] tracking-[0.1em] mb-1">ESPERANDO RESPUESTA</span>
                              <h3 className="font-serif font-semibold text-[#061b0e] text-base truncate">{m.dogName}</h3>
                              <p className="text-xs text-[#737973]">{m.breed}{m.age ? ` · ${m.age}` : ''}</p>
                            </div>
                          </div>
                        </div>
                      ))
                  }
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
