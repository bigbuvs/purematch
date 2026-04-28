'use client'
import { useState } from 'react'
import Link from 'next/link'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'

const matchData = {
  accepted: [
    {
      id: '1',
      name: 'Thor de Los Andes',
      breed: 'Golden Retriever',
      zone: 'Las Condes, RM',
      unlocked: true,
      phone: '+56 9 8765 4321',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3__Q0ufMoiHHoD02iIxQDRsx7Qxt1dT8I0otM87enCrU97qiYA0pQfWYz5V2S65nznkt7j4pvn3JZtNF-R3MmS0lk9OaRwZEG2WwlTgA4-mrLJTHF1olArxWkXNnZIp4QRvCrtERfAkfxZu6-Mc932U8U_okSKc4MPV4xLTx2DiK2BFrHkQHtKr6DOxfgUCvDi6x2wkNusa145B7eMCGgE1TFUCMQC6bVSsKUZAJm2r_kGeOw-pWrBvyD9j7tTca1fiFdbHwgy8X0',
    },
    {
      id: '2',
      name: 'Maximus del Rey',
      breed: 'Husky',
      zone: 'Vitacura, RM',
      unlocked: false,
      phone: null,
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCjiZpgrUlAFjaer3vHMMWgzNkg3MezFwu5DwaWxZsP1wyw2E-ukXtQW3ZAjLJDCYKpSfV2m_fZFcYFBWhy2Z5a3aDzmRQe-r5m870zQ6mlpYI0GI1DN0gcc9tckmPjZZwE7GNeObslycCM67qayPqyan4GEvYgKI_zDuOMKXJ8qIqLp7GlQqpLpjftSuwLtMjv6ixhz8UuaYBFzcMblJIwlnMvOYW3zfjvaYnHsoxBKqgGY_S7AtH1tmym1KyDnks5UEIa-1E1j4P',
    },
  ],
  pending: [
    {
      id: '3',
      name: 'Luna Imperiale',
      breed: 'Labrador',
      zone: 'Ñuñoa, RM',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApuPGGUYlX87qphBbjM12s6TMgO_-kXPn02xrl_F7mDGhiCXCgqov-8Q70q6kaY9JgQOzk3iq-XSaj_lGdaYrQhpT7NsUmGhNogrNvY6q1tq9OX7wGGPeQ75nsGZZy78AE9T7DLJFPrCyX5mJdVUYyxon1ItGN2XvNzLleRp-tycTfnRUFLPH-XpSpAseGpm8KO0TyItbw2X9yS735A7PKFp3ODG1JQtO-Foab8BHzxZGuuePLVyv67byPrxt7GgL-FiW5ysBZc-1C',
    },
  ],
}

export default function MatchesPage() {
  const [tab, setTab] = useState<'accepted' | 'pending'>('accepted')

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <TopBar title="Matches" />

      <main className="flex-grow pb-[100px] px-4 max-w-[680px] mx-auto w-full pt-4">
        {/* Tabs */}
        <div className="flex border-b border-outline-variant mb-6">
          <button
            onClick={() => setTab('accepted')}
            className={`flex-1 py-2 font-label-caps text-label-caps text-center transition-colors ${tab === 'accepted' ? 'border-b-2 border-primary text-primary' : 'text-outline hover:text-primary'}`}
          >
            ACEPTADOS ({matchData.accepted.length})
          </button>
          <button
            onClick={() => setTab('pending')}
            className={`flex-1 py-2 font-label-caps text-label-caps text-center transition-colors ${tab === 'pending' ? 'border-b-2 border-primary text-primary' : 'text-outline hover:text-primary'}`}
          >
            PENDIENTES ({matchData.pending.length})
          </button>
        </div>

        {tab === 'accepted' && (
          <div className="flex flex-col gap-4">
            {matchData.accepted.map(m => (
              <div key={m.id} className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={m.img} alt={m.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col justify-between flex-grow min-w-0">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-[#1b5e20] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                      <span className="font-label-caps text-[10px] text-[#1b5e20]">MATCH MUTUO</span>
                    </div>
                    <h3 className="font-headline-sm text-primary text-sm font-semibold truncate">{m.name}</h3>
                    <p className="font-metadata text-xs text-outline">{m.breed} · {m.zone}</p>
                  </div>
                  {m.unlocked ? (
                    <a href={`tel:${m.phone}`} className="mt-2 inline-flex items-center gap-1 text-primary font-label-caps text-[10px]">
                      <span className="material-symbols-outlined text-sm">call</span>
                      {m.phone}
                    </a>
                  ) : (
                    <Link href="/unlock" className="mt-2 inline-flex items-center gap-1 text-[#775a19] font-label-caps text-[10px]">
                      <span className="material-symbols-outlined text-sm">lock_open</span>
                      DESBLOQUEAR · $9.990
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'pending' && (
          <div className="flex flex-col gap-4">
            {matchData.pending.map(m => (
              <div key={m.id} className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex gap-4 opacity-75">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative">
                  <img src={m.img} alt={m.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-primary/20" />
                </div>
                <div className="flex flex-col justify-between flex-grow min-w-0">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-outline text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
                      <span className="font-label-caps text-[10px] text-outline">ESPERANDO RESPUESTA</span>
                    </div>
                    <h3 className="font-headline-sm text-primary text-sm font-semibold truncate">{m.name}</h3>
                    <p className="font-metadata text-xs text-outline">{m.breed} · {m.zone}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'accepted' && matchData.accepted.length === 0 && (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-outline-variant block mb-4">handshake</span>
            <p className="font-body-md text-on-surface-variant">Aún no tienes matches aceptados.</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
