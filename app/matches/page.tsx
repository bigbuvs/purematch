'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'
import { insforge } from '@/lib/insforge'
import { useAuth } from '@/context/AuthContext'

interface MatchCard {
  id: string
  matchId: string
  otherDogId: string
  dogName: string
  breed: string
  age: string
  zone: string | null
  photo: string | null
  unlocked: boolean
  mutual: boolean
  myStatus: string
  theirStatus: string
  iAmA: boolean
}

// ── Demo data ────────────────────────────────────────────────────────────────

const DEMO_MUTUAL: MatchCard[] = [
  { id: 'm1', matchId: 'm1', otherDogId: '', dogName: 'Thor of Golden Peak', breed: 'Golden Retriever', age: '3 años', zone: 'Las Condes', photo: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=600&fit=crop', unlocked: false, mutual: true, myStatus: 'accepted', theirStatus: 'accepted', iAmA: true },
  { id: 'm2', matchId: 'm2', otherDogId: '', dogName: 'Luna von Schwarzwald', breed: 'German Shepherd', age: '4 años', zone: 'Vitacura', photo: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=600&h=600&fit=crop', unlocked: true, mutual: true, myStatus: 'accepted', theirStatus: 'accepted', iAmA: false },
]

const DEMO_SENT: MatchCard[] = [
  { id: 'p1', matchId: 'p1', otherDogId: '', dogName: 'Balto del Sur', breed: 'Husky Siberiano', age: '2 años', zone: 'Ñuñoa', photo: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=600&h=600&fit=crop', unlocked: false, mutual: false, myStatus: 'accepted', theirStatus: 'pending', iAmA: true },
]

const DEMO_INCOMING: MatchCard[] = [
  { id: 'r1', matchId: 'r1', otherDogId: '', dogName: 'Bella di Milano', breed: 'Bulldog Inglés', age: '1 año', zone: 'Providencia', photo: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=600&h=600&fit=crop', unlocked: false, mutual: false, myStatus: 'pending', theirStatus: 'accepted', iAmA: false },
  { id: 'r2', matchId: 'r2', otherDogId: '', dogName: 'Max von Bayern', breed: 'Rottweiler', age: '5 años', zone: 'La Reina', photo: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=600&h=600&fit=crop', unlocked: false, mutual: false, myStatus: 'pending', theirStatus: 'accepted', iAmA: false },
]

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center text-center py-20 gap-4">
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

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MatchesPage() {
  const { user } = useAuth()
  const isDemo = user?.id === 'demo-user'
  const [tab, setTab] = useState<'mutual' | 'sent' | 'incoming'>('incoming')
  const [mutual, setMutual]     = useState<MatchCard[]>([])
  const [sent, setSent]         = useState<MatchCard[]>([])
  const [incoming, setIncoming] = useState<MatchCard[]>([])
  const [loading, setLoading]   = useState(true)
  const [responding, setResponding] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (isDemo) {
      setMutual(DEMO_MUTUAL)
      setSent(DEMO_SENT)
      setIncoming(DEMO_INCOMING)
      setLoading(false)
      return
    }
    if (!user) { setLoading(false); return }

    const { data: myDogs } = await insforge.database.from('dogs').select('id').eq('owner_id', user.id)
    if (!myDogs?.length) { setLoading(false); return }
    const dogIds = myDogs.map(d => d.id)

    const { data: matches } = await insforge.database
      .from('matches')
      .select('*, dog_a:dogs!dog_a_id(id,name,breed,age,zone,photos), dog_b:dogs!dog_b_id(id,name,breed,age,zone,photos)')
      .or(dogIds.map(id => `dog_a_id.eq.${id}`).join(',') + ',' + dogIds.map(id => `dog_b_id.eq.${id}`).join(','))

    const mut: MatchCard[] = []
    const snt: MatchCard[] = []
    const inc: MatchCard[] = []

    for (const m of matches ?? []) {
      const iAmA = dogIds.includes((m.dog_a as any).id)
      const myStatus    = iAmA ? m.status_a : m.status_b
      const theirStatus = iAmA ? m.status_b : m.status_a
      const other = iAmA ? m.dog_b : m.dog_a

      if (myStatus === 'rejected') continue

      const card: MatchCard = {
        id: m.id,
        matchId: m.id,
        otherDogId: (other as any).id ?? '',
        dogName: (other as any).name,
        breed:   (other as any).breed,
        age:     (other as any).age ?? '',
        zone:    (other as any).zone,
        photo:   (other as any).photos?.[0] ?? null,
        unlocked: m.contact_unlocked,
        mutual:  myStatus === 'accepted' && theirStatus === 'accepted',
        myStatus,
        theirStatus,
        iAmA,
      }

      if (myStatus === 'pending') {
        inc.push(card)
      } else if (myStatus === 'accepted' && theirStatus === 'accepted') {
        mut.push(card)
      } else if (myStatus === 'accepted') {
        snt.push(card)
      }
    }

    setMutual(mut)
    setSent(snt)
    setIncoming(inc)
    setLoading(false)
  }, [user, isDemo])

  useEffect(() => { load() }, [load])

  // Switch to incoming tab if there are requests
  useEffect(() => {
    if (!loading && incoming.length > 0) setTab('incoming')
    else if (!loading && mutual.length > 0) setTab('mutual')
  }, [loading])

  const handleRespond = async (card: MatchCard, accept: boolean) => {
    if (isDemo) return
    setResponding(card.matchId)
    const field = card.iAmA ? 'status_a' : 'status_b'
    await insforge.database
      .from('matches')
      .update({ [field]: accept ? 'accepted' : 'rejected' })
      .eq('id', card.matchId)
    setResponding(null)
    await load()
    if (accept) setTab('mutual')
  }

  const tabs = [
    { key: 'incoming' as const, label: 'Recibidas',  count: incoming.length, dot: incoming.length > 0 },
    { key: 'mutual'  as const, label: 'Mutuos',      count: mutual.length,   dot: false },
    { key: 'sent'    as const, label: 'Enviadas',     count: sent.length,     dot: false },
  ]

  return (
    <div className="bg-[#fcf9f8] min-h-screen flex flex-col">
      <TopBar title="Matches" />
      <main className="flex-grow pb-[80px] max-w-[680px] mx-auto w-full">

        {/* Tabs */}
        <div className="flex border-b border-[#c3c8c1]/60 bg-[#fcf9f8] sticky top-[60px] z-30">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-3.5 text-[10px] tracking-[0.08em] font-bold flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
                tab === t.key ? 'border-[#061b0e] text-[#061b0e]' : 'border-transparent text-[#a0a5a0] hover:text-[#1b1c1c]'
              }`}
            >
              {t.label.toUpperCase()}
              <span className={`relative text-[10px] min-w-[20px] h-5 rounded-full flex items-center justify-center font-bold px-1 ${
                tab === t.key ? 'bg-[#061b0e] text-white' : 'bg-[#f0eded] text-[#737973]'
              }`}>
                {t.count}
                {t.dot && tab !== t.key && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#ba1a1a]" />
                )}
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
              {/* ── RECIBIDAS ── */}
              {tab === 'incoming' && (
                <div className="flex flex-col gap-3">
                  {incoming.length === 0
                    ? <EmptyState icon="mark_email_unread" title="Sin solicitudes recibidas" desc="Cuando alguien solicite un match con tu ejemplar, aparecerá aquí." />
                    : incoming.map(m => (
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
                            <div className="flex flex-col justify-center flex-grow min-w-0 p-4">
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="w-2 h-2 rounded-full bg-[#775a19] flex-shrink-0" />
                                <span className="text-[9px] font-bold text-[#775a19] tracking-[0.1em]">NUEVA SOLICITUD</span>
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
                          <div className="border-t border-[#e4e2e1] px-4 py-3 flex flex-col gap-2">
                            <div className="flex gap-2">
                              <button
                                disabled={responding === m.matchId}
                                onClick={() => handleRespond(m, false)}
                                className="flex-1 border border-[#e4e2e1] text-[#737973] text-[10px] font-bold tracking-[0.08em] py-2.5 rounded-full hover:border-[#ba1a1a] hover:text-[#ba1a1a] transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                              >
                                <span className="material-symbols-outlined text-sm">close</span>
                                RECHAZAR
                              </button>
                              <button
                                disabled={responding === m.matchId}
                                onClick={() => handleRespond(m, true)}
                                className="flex-1 bg-[#061b0e] text-white text-[10px] font-bold tracking-[0.08em] py-2.5 rounded-full hover:bg-[#1b3022] transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                              >
                                {responding === m.matchId
                                  ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                  : <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                                }
                                ACEPTAR
                              </button>
                            </div>
                            {m.otherDogId && !isDemo && (
                              <Link
                                href={`/dog/${m.otherDogId}`}
                                className="flex items-center justify-center gap-1.5 text-[10px] font-bold tracking-[0.08em] text-[#737973] hover:text-[#061b0e] transition-colors py-1"
                              >
                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                                VER PERFIL COMPLETO
                              </Link>
                            )}
                          </div>
                        </div>
                      ))
                  }
                </div>
              )}

              {/* ── MUTUOS ── */}
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
                          <div className="border-t border-[#e4e2e1] px-4 py-3 flex flex-col gap-2">
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
                            {m.otherDogId && !isDemo && (
                              <Link
                                href={`/dog/${m.otherDogId}`}
                                className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.08em] text-[#737973] hover:text-[#061b0e] transition-colors"
                              >
                                <span className="material-symbols-outlined text-sm">pets</span>
                                VER PERFIL COMPLETO DEL EJEMPLAR
                              </Link>
                            )}
                          </div>
                        </div>
                      ))
                  }
                </div>
              )}

              {/* ── ENVIADAS ── */}
              {tab === 'sent' && (
                <div className="flex flex-col gap-3">
                  {sent.length === 0
                    ? <EmptyState icon="send" title="Sin solicitudes enviadas" desc="Cuando solicites un match y estén pendientes de respuesta, aparecerán aquí." />
                    : sent.map(m => (
                        <div key={m.id} className="bg-white border border-[#e4e2e1] rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(6,27,14,0.04)]">
                          <div className="flex">
                            <div className="w-28 h-28 flex-shrink-0 bg-[#f0eded] relative overflow-hidden">
                              {m.photo ? (
                                <>
                                  <img src={m.photo} alt={m.dogName} className="w-full h-full object-cover opacity-50" />
                                  <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]" />
                                </>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="material-symbols-outlined text-4xl text-[#c3c8c1]" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
                                </div>
                              )}
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
                          <div className="border-t border-[#e4e2e1] px-4 py-3 flex items-center justify-between">
                            <button
                              disabled={responding === m.matchId || isDemo}
                              onClick={() => handleRespond(m, false)}
                              className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.08em] text-[#737973] hover:text-[#ba1a1a] transition-colors disabled:opacity-40"
                            >
                              <span className="material-symbols-outlined text-sm">close</span>
                              CANCELAR SOLICITUD
                            </button>
                            {m.otherDogId && !isDemo && (
                              <Link
                                href={`/dog/${m.otherDogId}`}
                                className="flex items-center gap-1 text-[10px] font-semibold tracking-[0.08em] text-[#737973] hover:text-[#061b0e] transition-colors"
                              >
                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                                VER PERFIL
                              </Link>
                            )}
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
