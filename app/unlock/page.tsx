'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import TopBar from '@/components/TopBar'
import { insforge } from '@/lib/insforge'
import { useAuth } from '@/context/AuthContext'
import type { Database } from '@/lib/database.types'

type Match = Database['public']['Tables']['matches']['Row']
type Dog = Database['public']['Tables']['dogs']['Row']

interface MatchWithDogs extends Match {
  dog_a: Dog
  dog_b: Dog
}

type PayMethod = 'webpay' | 'mercadopago'

function UnlockContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const matchId = searchParams.get('match_id')
  const isDemo = user?.id === 'demo-user'

  const [matchData, setMatchData] = useState<MatchWithDogs | null>(null)
  const [myDog, setMyDog] = useState<Dog | null>(null)
  const [otherDog, setOtherDog] = useState<Dog | null>(null)
  const [ownerData, setOwnerData] = useState<{ name: string; phone: string | null; email: string } | null>(null)
  const [method, setMethod] = useState<PayMethod>('webpay')
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.replace('/auth'); return }
    if (!matchId) { router.replace('/matches'); return }

    if (isDemo) {
      router.replace('/matches')
      return
    }

    const load = async () => {
      const { data: match, error: matchErr } = await insforge.database
        .from('matches')
        .select('*, dog_a:dogs!dog_a_id(*), dog_b:dogs!dog_b_id(*)')
        .eq('id', matchId)
        .single()

      if (matchErr || !match) { router.replace('/matches'); return }

      const m = match as unknown as MatchWithDogs
      setMatchData(m)

      const { data: myDogs } = await insforge.database.from('dogs').select('*').eq('owner_id', user.id)
      const mine = myDogs?.find(d => d.id === m.dog_a_id || d.id === m.dog_b_id) ?? null
      const other = mine?.id === m.dog_a_id ? m.dog_b : m.dog_a
      setMyDog(mine)
      setOtherDog(other)

      if (m.contact_unlocked) {
        const { data: owner } = await insforge.database
          .from('users').select('name, phone, email').eq('id', other.owner_id).single()
        if (owner) setOwnerData(owner)
      }

      setLoading(false)
    }

    load()
  }, [user, authLoading, matchId, isDemo])

  const handlePay = async () => {
    if (!matchData) return
    setPaying(true); setError(null)
    await new Promise(r => setTimeout(r, 1800))

    const { error: updateErr } = await insforge.database
      .from('matches')
      .update({ contact_unlocked: true, unlocked_at: new Date().toISOString() })
      .eq('id', matchData.id)

    if (updateErr) { setError('Error al procesar el pago. Intenta de nuevo.'); setPaying(false); return }

    if (otherDog) {
      const { data: owner } = await insforge.database
        .from('users').select('name, phone, email').eq('id', otherDog.owner_id).single()
      if (owner) setOwnerData(owner)
    }

    setMatchData(prev => prev ? { ...prev, contact_unlocked: true } : prev)
    setPaying(false)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#fcf9f8] flex flex-col items-center justify-center gap-3">
        <span className="material-symbols-outlined text-[#c3c8c1] animate-spin text-5xl">progress_activity</span>
        <p className="text-[10px] font-bold tracking-[0.1em] text-[#737973]">CARGANDO...</p>
      </div>
    )
  }

  // Already unlocked — show contact info
  if (matchData?.contact_unlocked && ownerData) {
    return (
      <div className="bg-[#fcf9f8] min-h-screen flex flex-col">
        <TopBar showBack title="Contacto desbloqueado" />
        <main className="flex-grow px-5 py-8 max-w-md mx-auto w-full flex flex-col gap-6">

          {/* Match pair */}
          <MatchPair myDog={myDog} otherDog={otherDog} unlocked />

          {/* Contact card */}
          <div className="bg-gradient-to-br from-[#061b0e] to-[#1b3022] text-white rounded-2xl p-6 flex flex-col gap-4 shadow-[0_8px_32px_rgba(6,27,14,0.15)]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#fed488] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>contact_phone</span>
              <p className="text-[10px] font-bold tracking-[0.12em] text-[#fed488]">DATOS DE CONTACTO</p>
            </div>
            <div className="flex flex-col gap-3 mt-1">
              <ContactRow icon="person" label="PROPIETARIO" value={ownerData.name} dark />
              {ownerData.phone && <ContactRow icon="phone" label="TELÉFONO" value={ownerData.phone} href={`tel:${ownerData.phone}`} dark />}
              <ContactRow icon="mail" label="EMAIL" value={ownerData.email} href={`mailto:${ownerData.email}`} dark />
            </div>
          </div>

          <button
            onClick={() => router.push('/matches')}
            className="w-full border border-[#c3c8c1] text-[#1b1c1c] text-[12px] font-bold tracking-[0.08em] py-3 rounded-full hover:bg-[#f0eded] transition-colors"
          >
            VOLVER A MATCHES
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="bg-[#fcf9f8] min-h-screen flex flex-col">
      <TopBar showBack title="Desbloquear contacto" />

      <main className="flex-grow px-5 py-8 max-w-md mx-auto w-full flex flex-col gap-6">

        <MatchPair myDog={myDog} otherDog={otherDog} />

        {/* Price card */}
        <div className="bg-gradient-to-br from-[#061b0e] to-[#1b3022] text-white rounded-2xl p-6 text-center shadow-[0_8px_32px_rgba(6,27,14,0.15)]">
          <p className="text-[10px] font-bold tracking-[0.12em] text-[#fed488] mb-3">DESBLOQUEO DE CONTACTO</p>
          <p className="font-serif font-bold text-5xl text-white mb-1">$9.990</p>
          <p className="text-white/60 text-[12px] mb-5">CLP · pago único por match</p>
          <div className="border-t border-white/15 pt-5 flex flex-col gap-2.5 text-left">
            {[
              'Teléfono verificado del criador',
              'Email directo del propietario',
              'Historial completo de la camada',
            ].map(item => (
              <div key={item} className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#fed488] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="text-white/85 text-[13px]">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment method */}
        <div>
          <p className="text-[10px] font-bold tracking-[0.1em] text-[#737973] mb-3 ml-1">MÉTODO DE PAGO</p>
          <div className="flex flex-col gap-2.5">
            {([
              { id: 'webpay', label: 'Webpay Plus', sub: 'Tarjetas de crédito y débito', icon: 'credit_card' },
              { id: 'mercadopago', label: 'Mercado Pago', sub: 'Tarjetas y transferencias', icon: 'account_balance_wallet' },
            ] as { id: PayMethod; label: string; sub: string; icon: string }[]).map(opt => (
              <button
                key={opt.id}
                onClick={() => setMethod(opt.id)}
                className={`flex items-center gap-3 border rounded-2xl px-4 py-4 text-left transition-all w-full bg-white ${
                  method === opt.id
                    ? 'border-[#061b0e] shadow-[0_4px_16px_rgba(6,27,14,0.08)]'
                    : 'border-[#e4e2e1] hover:border-[#c3c8c1]'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  method === opt.id ? 'bg-[#061b0e] text-white' : 'bg-[#f0eded] text-[#737973]'
                }`}>
                  <span className="material-symbols-outlined text-[20px]">{opt.icon}</span>
                </div>
                <div className="flex-grow">
                  <p className="text-[13px] font-bold text-[#1b1c1c]">{opt.label}</p>
                  <p className="text-[11px] text-[#737973]">{opt.sub}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${method === opt.id ? 'border-[#061b0e]' : 'border-[#c3c8c1]'}`}>
                  {method === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-[#061b0e]" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-[#ffdad6] text-[#93000a] text-[12px] px-4 py-3 rounded-xl flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] mt-0.5">error</span>
            {error}
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={paying}
          className="w-full bg-[#fed488] text-[#261900] text-[12px] font-bold tracking-[0.08em] py-3.5 rounded-full hover:bg-[#ffdea5] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(254,212,136,0.4)]"
        >
          {paying ? (
            <>
              <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
              PROCESANDO...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock_open</span>
              PAGAR $9.990 CLP
            </>
          )}
        </button>

        <p className="text-[10px] text-[#a0a5a0] text-center -mt-3 leading-relaxed">
          Pago seguro · sin cargos recurrentes<br />
          Datos protegidos con cifrado SSL
        </p>
      </main>
    </div>
  )
}

export default function UnlockPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fcf9f8] flex items-center justify-center"><span className="material-symbols-outlined text-5xl text-[#c3c8c1] animate-spin">progress_activity</span></div>}>
      <UnlockContent />
    </Suspense>
  )
}

function MatchPair({ myDog, otherDog, unlocked }: { myDog: Dog | null; otherDog: Dog | null; unlocked?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <DogAvatar dog={myDog} />
      <div className="flex flex-col items-center gap-1">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${unlocked ? 'bg-[#061b0e]' : 'bg-[#fed488]'}`}>
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1", color: unlocked ? '#fed488' : '#261900' }}>
            {unlocked ? 'check' : 'favorite'}
          </span>
        </div>
        <span className="text-[9px] font-bold tracking-[0.1em] text-[#775a19]">{unlocked ? 'DESBLOQUEADO' : 'MATCH'}</span>
      </div>
      <DogAvatar dog={otherDog} />
    </div>
  )
}

function DogAvatar({ dog }: { dog: Dog | null }) {
  if (!dog) return <div className="w-24 h-24 rounded-2xl bg-[#f0eded]" />
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#fed488] bg-[#f0eded]">
        {dog.photos[0]
          ? <img src={dog.photos[0]} alt={dog.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-3xl text-[#c3c8c1]" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span></div>
        }
      </div>
      <p className="text-[11px] font-bold text-[#061b0e] text-center max-w-[90px] truncate">{dog.name}</p>
      <p className="text-[10px] text-[#737973] text-center -mt-1">{dog.breed}</p>
    </div>
  )
}

function ContactRow({ icon, label, value, href, dark }: { icon: string; label: string; value: string; href?: string; dark?: boolean }) {
  const valueClass = dark ? 'text-white' : 'text-[#1b1c1c]'
  const labelClass = dark ? 'text-white/50' : 'text-[#737973]'
  const inner = (
    <>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${dark ? 'bg-white/10' : 'bg-[#f0eded]'}`}>
        <span className={`material-symbols-outlined text-[18px] ${dark ? 'text-[#fed488]' : 'text-[#737973]'}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className={`text-[10px] font-bold tracking-[0.1em] ${labelClass}`}>{label}</p>
        <p className={`text-[14px] truncate ${valueClass}`}>{value}</p>
      </div>
    </>
  )
  if (href) {
    return <a href={href} className="flex items-center gap-3 hover:opacity-90 transition-opacity">{inner}</a>
  }
  return <div className="flex items-center gap-3">{inner}</div>
}
