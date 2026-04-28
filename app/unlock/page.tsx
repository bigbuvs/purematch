'use client'
import { useState } from 'react'
import Link from 'next/link'
import TopBar from '@/components/TopBar'

const matchPair = {
  myDog: {
    name: 'Arya von Westwood',
    breed: 'Border Collie',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCjiZpgrUlAFjaer3vHMMWgzNkg3MezFwu5DwaWxZsP1wyw2E-ukXtQW3ZAjLJDCYKpSfV2m_fZFcYFBWhy2Z5a3aDzmRQe-r5m870zQ6mlpYI0GI1DN0gcc9tckmPjZZwE7GNeObslycCM67qayPqyan4GEvYgKI_zDuOMKXJ8qIqLp7GlQqpLpjftSuwLtMjv6ixhz8UuaYBFzcMblJIwlnMvOYW3zfjvaYnHsoxBKqgGY_S7AtH1tmym1KyDnks5UEIa-1E1j4P',
  },
  matchDog: {
    name: 'Maximus del Rey',
    breed: 'Husky',
    owner: 'Carlos Reyes',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3__Q0ufMoiHHoD02iIxQDRsx7Qxt1dT8I0otM87enCrU97qiYA0pQfWYz5V2S65nznkt7j4pvn3JZtNF-R3MmS0lk9OaRwZEG2WwlTgA4-mrLJTHF1olArxWkXNnZIp4QRvCrtERfAkfxZu6-Mc932U8U_okSKc4MPV4xLTx2DiK2BFrHkQHtKr6DOxfgUCvDi6x2wkNusa145B7eMCGgE1TFUCMQC6bVSsKUZAJm2r_kGeOw-pWrBvyD9j7tTca1fiFdbHwgy8X0',
  },
}

type PayMethod = 'webpay' | 'mercadopago'

export default function UnlockPage() {
  const [method, setMethod] = useState<PayMethod>('webpay')
  const [loading, setLoading] = useState(false)

  const handlePay = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <TopBar showBack title="Desbloquear Contacto" />

      <main className="flex-grow px-4 py-8 max-w-md mx-auto w-full flex flex-col gap-8">
        {/* Match pair */}
        <div className="flex items-center justify-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-28 h-28 rounded-xl overflow-hidden border-2 border-outline-variant">
              <img src={matchPair.myDog.img} alt={matchPair.myDog.name} className="w-full h-full object-cover" />
            </div>
            <p className="font-label-caps text-[10px] text-on-surface-variant text-center max-w-[90px] truncate">{matchPair.myDog.name}</p>
            <p className="font-metadata text-[9px] text-outline text-center">{matchPair.myDog.breed}</p>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full bg-[#fed488] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#261900] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            </div>
            <span className="font-label-caps text-[10px] text-[#775a19]">MATCH</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="w-28 h-28 rounded-xl overflow-hidden border-2 border-outline-variant">
              <img src={matchPair.matchDog.img} alt={matchPair.matchDog.name} className="w-full h-full object-cover" />
            </div>
            <p className="font-label-caps text-[10px] text-on-surface-variant text-center max-w-[90px] truncate">{matchPair.matchDog.name}</p>
            <p className="font-metadata text-[9px] text-outline text-center">{matchPair.matchDog.breed}</p>
          </div>
        </div>

        {/* Price card */}
        <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6 text-center">
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-2">DESBLOQUEO DE CONTACTO</p>
          <p className="font-display-lg text-primary text-4xl font-bold mb-1">$9.990</p>
          <p className="font-metadata text-xs text-outline mb-4">CLP · pago único por match</p>
          <div className="w-12 h-px bg-outline-variant mx-auto mb-4" />
          <ul className="flex flex-col gap-2 text-left">
            {[
              'Teléfono verificado del criador',
              'Email directo del propietario',
              'Historial completo de la camada',
            ].map(item => (
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

        {/* Pay button */}
        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full bg-primary text-on-primary font-label-caps text-label-caps py-4 hover:bg-primary-container transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
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
