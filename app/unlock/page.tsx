'use client'
import { useState, useEffect } from 'react'
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

export default function UnlockPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const matchId = searchParams.get('match_id')

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

    const load = async () => {
      const { data: match, error: matchErr } = await insforge
        .from('matches')
        .select('*, dog_a:dogs!dog_a_id(*), dog_b:dogs!dog_b_id(*)')
        .eq('id', matchId)
        .single()

      if (matchErr || !match) { router.replace('/matches'); return }

      const m = match as unknown as MatchWithDogs
      setMatchData(m)

      const { data: myDogs } = await insforge.from('dogs').select('*').eq('owner_id', user.id)
      const mine = myDogs?.find(d => d.id === m.dog_a_id || d.id === m.dog_b_id) ?? null
      const other = mine?.id === m.dog_a_id ? m.dog_b : m.dog_a
      setMyDog(mine)
      setOtherDog(other)

      if (m.contact_unlocked) {
        const { data: owner } = await insforge
          .from('users')
          .select('name, phone, email')
          .eq('id', other.owner_id)
          .single()
        if (owner) setOwnerData(owner)
      }

      setLoading(false)
    }

    load()
  }, [user, authLoading, matchId])

  const handlePay = async () => {
    if (!matchData) return
    setPaying(true)
    setError(null)

    // Simulate payment processing — replace with Webpay/MercadoPago redirect in production
    await new Promise(r => setTimeout(r, 1800))

    const { error: updateErr } = await insforge
      .from('matches')
      .update({ contact_unlocked: true, unlocked_at: new Date().toISOString() })
      .eq('id', matchData.id)

    if (updateErr) {
      setError('Error al procesar el pago. Intenta de nuevo.')
      setPaying(false)
      return
    }

    if (otherDog) {
      const { data: owner } = await insforge
        .from('users')
        .select('name, phone, email')
        .eq('id', otherDog.owner_id)
        .single()
      if (owner) setOwnerData(owner)
    }

    setMatchData(prev => prev ? { ...prev, contact_unlocked: true } : prev)
    setPaying(false)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <span className="material-symbols-outlined text-outline animate-spin text-3xl">progress_activity</span>
      </div>
    )
  }

  // Already unlocked — show contact info
  if (matchData?.contact_unlocked && ownerData) {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex flex-col">
        <TopBar showBack title="Contacto Desbloqueado" />
        <main className="flex-grow px-4 py-8 max-w-md mx-auto w-full flex flex-col gap-6">
          <div className="flex items-center justify-center gap-4 mb-2">
            {myDog && (
              <div className="flex flex-col items-center gap-2">
                <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-outline-variant">
                  {myDog.photos[0]
                    ? <img src={myDog.photos[0]} alt={myDog.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-surface-container flex items-center justify-center"><span className="material-symbols-outlined text-outline text-3xl">pets</span></div>
                  }
                </div>
                <p className="font-label-caps text-[10px] text-on-surface-variant text-center max-w-[80px] truncate">{myDog.name}</p>
              </div>
            )}
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-[#fed488] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#261900] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              </div>
            </div>
            {otherDog && (
              <div className="flex flex-col items-center gap-2">
                <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-outline-variant">
                  {otherDog.photos[0]
                    ? <img src={otherDog.photos[0]} alt={otherDog.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-surface-container flex items-center justify-center"><span className="material-symbols-outlined text-outline text-3xl">pets</span></div>
                  }
                </div>
                <p className="font-label-caps text-[10px] text-on-surface-variant text-center max-w-[80px] truncate">{otherDog.name}</p>
              </div>
            )}
          </div>

          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 flex flex-col gap-4">
            <p className="font-label-caps text-[10px] text-outline">DATOS DE CONTACTO</p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-xl">person</span>
                <div>
                  <p className="font-metadata text-[10px] text-outline">PROPIETARIO</p>
                  <p className="font-body-md text-sm text-on-surface">{ownerData.name}</p>
                </div>
              </div>
              {ownerData.phone && (
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">phone</span>
                  <div>
                    <p className="font-metadata text-[10px] text-outline">TELÉFONO</p>
                    <a href={`tel:${ownerData.phone}`} className="font-body-md text-sm text-primary hover:underline">{ownerData.phone}</a>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-xl">mail</span>
                <div>
                  <p className="font-metadata text-[10px] text-outline">EMAIL</p>
                  <a href={`mailto:${ownerData.email}`} className="font-body-md text-sm text-primary hover:underline">{ownerData.email}</a>
                </div>
              </div>
            </div>
          </div>

          <button onClick={() => router.push('/matches')} className="w-full border border-outline-variant text-on-surface font-label-caps text-label-caps py-3 hover:bg-surface-container transition-colors">
            VOLVER A MATCHES
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <TopBar showBack title="Desbloquear Contacto" />

      <main className="flex-grow px-4 py-8 max-w-md mx-auto w-full flex flex-col gap-8">
        {/* Match pair */}
        <div className="flex items-center justify-center gap-4">
          {myDog && (
            <div className="flex flex-col items-center gap-2">
              <div className="w-28 h-28 rounded-xl overflow-hidden border-2 border-outline-variant">
                {myDog.photos[0]
                  ? <img src={myDog.photos[0]} alt={myDog.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-surface-container flex items-center justify-center"><span className="material-symbols-outlined text-outline text-3xl">pets</span></div>
                }
              </div>
              <p className="font-label-caps text-[10px] text-on-surface-variant text-center max-w-[90px] truncate">{myDog.name}</p>
              <p className="font-metadata text-[9px] text-outline text-center">{myDog.breed}</p>
            </div>
          )}
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full bg-[#fed488] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#261900] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            </div>
            <span className="font-label-caps text-[10px] text-[#775a19]">MATCH</span>
          </div>
          {otherDog && (
            <div className="flex flex-col items-center gap-2">
              <div className="w-28 h-28 rounded-xl overflow-hidden border-2 border-outline-variant">
                {otherDog.photos[0]
                  ? <img src={otherDog.photos[0]} alt={otherDog.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-surface-container flex items-center justify-center"><span className="material-symbols-outlined text-outline text-3xl">pets</span></div>
                }
              </div>
              <p className="font-label-caps text-[10px] text-on-surface-variant text-center max-w-[90px] truncate">{otherDog.name}</p>
              <p className="font-metadata text-[9px] text-outline text-center">{otherDog.breed}</p>
            </div>
          )}
        </div>

        {/* Price card */}
        <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 text-center">
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-2">DESBLOQUEO DE CONTACTO</p>
          <p className="font-display-lg text-primary text-4xl font-bold mb-1">$9.990</p>
          <p className="font-metadata text-xs text-outline mb-4">CLP · pago único por match</p>
          <div className="w-12 h-px bg-outline-variant mx-auto mb-4" />
          <ul className="flex flex-col gap-2 text-left">
            {['Teléfono verificado del criador', 'Email directo del propietario', 'Historial completo de la camada'].map(item => (
              <li key={item} className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1b5e20] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="font-metadata text-xs text-on-surface-variant">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Payment method */}
        <div>
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-3">MÉTODO DE PAGO</p>
          <div className="flex flex-col gap-3">
            {([
              { id: 'webpay', label: 'Webpay Plus', sub: 'Tarjetas de crédito y débito' },
              { id: 'mercadopago', label: 'Mercado Pago', sub: 'Tarjetas y transferencias' },
            ] as { id: PayMethod; label: string; sub: string }[]).map(opt => (
              <button
                key={opt.id}
                onClick={() => setMethod(opt.id)}
                className={`flex items-center gap-4 border rounded-xl px-4 py-4 text-left transition-colors w-full ${
                  method === opt.id
                    ? 'border-primary bg-surface-container'
                    : 'border-outline-variant bg-surface-container-low hover:border-primary/50'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === opt.id ? 'border-primary' : 'border-outline-variant'}`}>
                  {method === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
                <div>
                  <p className="font-label-caps text-label-caps text-on-surface">{opt.label}</p>
                  <p className="font-metadata text-[10px] text-outline">{opt.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container font-metadata text-xs px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={paying}
          className="w-full bg-primary text-on-primary font-label-caps text-label-caps py-4 hover:bg-primary-container transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {paying ? (
            <>
              <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
              PROCESANDO...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>lock_open</span>
              PAGAR $9.990 CLP
            </>
          )}
        </button>

        <p className="font-metadata text-[10px] text-outline text-center -mt-4 leading-relaxed">
          Pago seguro. No se realizan cargos recurrentes.<br />
          Datos protegidos con cifrado SSL.
        </p>
      </main>
    </div>
  )
}
