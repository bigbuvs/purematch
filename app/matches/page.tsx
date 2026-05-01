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
    zone: 'Las Condes, RM',
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
    zone: 'Vitacura, RM',
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
    zone: 'Ñuñoa, RM',
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
    zone: 'Santiago Centro',
    photo: 'https://images.unsplash.com/photo-1594226801341-41427b4e5c22?w=600&h=600&fit=crop',
    unlocked: false,
    mutual: false,
    myStatus: 'accepted',
    theirStatus: 'pending',
  },
]

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
    if (!user) return
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

        {/* Sticky tabs */}
        <div className="sticky top-[60px] z-30 bg-[#fcf9f8]/95 backdrop-blur-sm border-b border-[#c3c8c1]/60">
          <div className="flex">
            {([
              { key: 'mutual',  label: 'Mutuos',      count: mutual.length  },
              { key: 'pending', label: 'Pendientes',   count: pending.length },
            ] as const).map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 py-3.5 text-[11px] font-semibold tracking-[0.08em] flex items-center justify-center gap-2 transition-colors border-b-2 ${
                  tab === t.key
                    ? 'border-[#061b0e] text-[#061b0e]'
                    : 'border-transparent text-[#737973] hover:text-[#1b1c1c]'
                }`}
              >
                {t.label.toUpperCase()}
                <span className={`text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                  tab === t.key ? 'bg-[#061b0e] text-white' : 'bg-[#e4e2e1] text-[#737973]'
                }`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 pt-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-28 gap-3">
              <span className="material-symbols-outlined text-5xl text-[#c3c8c1] animate-spin">progress_activity</span>
              <p className="text-[10px] font-semibold tracking-[0.1em] text-[#737973]">CARGANDO MATCHES...</p>
            </div>
          ) : (
            <>
              {/* ── MUTUAL TAB ── */}
              {tab === 'mutual' && (
                <div className="flex flex-col gap-4">
                  {mutual.length === 0 ? (
                    <EmptyState
                      icon="handshake"
                      title="Sin matches mutuos aún"
                      desc="Cuando ambas partes acepten, el match aparecerá aquí con datos de contacto."
                    />
                  ) : (
                    mutual.map(m => (
                      <div key={m.id} className="bg-white border border-[#e4e2e1] rounded-2xl overflow-hidden hover:shadow-[0_8px_32px_rgba(6,27,14,0.10)] transition-all duration-300">
                        <div className="flex gap-0">
                          {/* Square photo */}
                          <div className="w-32 h-32 flex-shrink-0 relative overflow-hidden bg-[#f0eded]">
                            {m.photo
                              ? <img src={m.photo} alt={m.dogName} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center">
                                  <span className="material-symbols-outlined text-4xl text-[#c3c8c1]" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
                                </div>
                            }
                            {/* Match badge overlay */}
                            <div className="absolute top-2 left-2 bg-[#fed488] rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
                              <span className="material-symbols-outlined text-[#261900] text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex flex-col justify-between flex-grow min-w-0 p-4">
                            <div>
                              <span className="text-[9px] font-bold tracking-[0.12em] text-[#775a19] bg-[#fed488]/25 border border-[#fed488]/50 px-2 py-0.5 rounded-full">
                                MATCH MUTUO
                              </span>
                              <h3 className="font-serif font-bold text-[#061b0e] text-base mt-2 truncate">{m.dogName}</h3>
                              <p className="text-[#737973] text-[12px]">{m.breed}{m.age ? ` · ${m.age}` : ''}</p>
                              {m.zone && (
                                <div className="flex items-center gap-1 mt-1.5">
                                  <span className="material-symbols-outlined text-[#a0a5a0] text-[12px]">location_on</span>
                                  <span className="text-[#a0a5a0] text-[11px] truncate">{m.zone.split(',')[0]}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Contact CTA */}
                        <div className="border-t border-[#e4e2e1] px-4 py-3">
                          <Link
                            href={isDemo ? '#' : `/unlock?match_id=${m.id}`}
                            className={`flex items-center gap-2 text-[10px] font-bold tracking-[0.08em] transition-colors ${
                              m.unlocked
                                ? 'text-[#061b0e]'
                                : 'text-[#775a19] hover:text-[#261900]'
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                              {m.unlocked ? 'contact_phone' : 'lock_open'}
                            </span>
                            {m.unlocked ? 'VER DATOS DE CONTACTO' : 'DESBLOQUEAR CONTACTO · $9.990'}
                            {!m.unlocked && (
                              <span className="ml-auto bg-[#fed488] text-[#261900] text-[9px] font-bold px-2.5 py-1 rounded-full">
                                DESBLOQUEAR
                              </span>
                            )}
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ── PENDING TAB ── */}
              {tab === 'pending' && (
                <div className="flex flex-col gap-3">
                  {pending.length === 0 ? (
                    <EmptyState
                      icon="schedule"
                      title="Sin solicitudes pendientes"
                      desc="Las solicitudes que envíes aparecerán aquí mientras esperan respuesta."
                    />
                  ) : (
                    pending.map(m => (
                      <div key={m.id} className="bg-white border border-[#e4e2e1] rounded-2xl overflow-hidden">
                        <div className="flex gap-0">
                          {/* Blurred photo */}
                          <div className="w-28 h-28 flex-shrink-0 relative overflow-hidden bg-[#f0eded]">
                            {m.photo
                              ? <>
                                  <img src={m.photo} alt={m.dogName} className="w-full h-full object-cover opacity-50 blur-[2px] scale-105" />
                                </>
                              : <div className="w-full h-full flex items-center justify-center">
                                  <span className="material-symbols-outlined text-4xl text-[#c3c8c1]" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
                                </div>
                            }
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-8 h-8 rounded-full bg-[#fcf9f8]/90 flex items-center justify-center shadow-sm">
                                <span className="material-symbols-outlined text-[#737973] text-[18px]">schedule</span>
                              </div>
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex flex-col justify-center flex-grow min-w-0 p-4">
                            <span className="text-[9px] font-bold tracking-[0.12em] text-[#737973] bg-[#f0eded] px-2 py-0.5 rounded-full w-fit mb-2">
                              ESPERANDO RESPUESTA
                            </span>
                            <h3 className="font-serif font-bold text-[#1b1c1c] text-base truncate">{m.dogName}</h3>
                            <p className="text-[#737973] text-[12px]">{m.breed}</p>
                            {m.zone && (
                              <div className="flex items-center gap-1 mt-1">
                                <span className="material-symbols-outlined text-[#a0a5a0] text-[11px]">location_on</span>
                                <span className="text-[#a0a5a0] text-[11px] truncate">{m.zone.split(',')[0]}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Demo notice */}
              {isDemo && (
                <div className="mt-6 flex items-start gap-3 bg-[#fed488]/15 border border-[#fed488]/50 rounded-xl px-4 py-3">
                  <span className="material-symbols-outlined text-[#775a19] text-[18px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                  <p className="text-[11px] text-[#775a19] leading-relaxed">
                    <span className="font-bold">Modo Demo —</span> Los datos son de muestra. Crea una cuenta para ver tus matches reales.
                  </p>
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
