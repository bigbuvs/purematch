'use client'
import { useState } from 'react'
import Link from 'next/link'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'

const profileData = {
  name: 'Alejandro von West',
  email: 'alejandro@criador.com',
  zone: 'Providencia, RM',
  memberSince: 'Marzo 2024',
  verified: true,
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApuPGGUYlX87qphBbjM12s6TMgO_-kXPn02xrl_F7mDGhiCXCgqov-8Q70q6kaY9JgQOzk3iq-XSaj_lGdaYrQhpT7NsUmGhNogrNvY6q1tq9OX7wGGPeQ75nsGZZy78AE9T7DLJFPrCyX5mJdVUYyxon1ItGN2XvNzLleRp-tycTfnRUFLPH-XpSpAseGpm8KO0TyItbw2X9yS735A7PKFp3ODG1JQtO-Foab8BHzxZGuuePLVyv67byPrxt7GgL-FiW5ysBZc-1C',
  stats: [
    { label: 'Perros', value: '2' },
    { label: 'Matches', value: '5' },
    { label: 'Crianzas', value: '1' },
  ],
  dogs: [
    {
      id: '1',
      name: 'Arya von Westwood',
      breed: 'Border Collie',
      verified: true,
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCjiZpgrUlAFjaer3vHMMWgzNkg3MezFwu5DwaWxZsP1wyw2E-ukXtQW3ZAjLJDCYKpSfV2m_fZFcYFBWhy2Z5a3aDzmRQe-r5m870zQ6mlpYI0GI1DN0gcc9tckmPjZZwE7GNeObslycCM67qayPqyan4GEvYgKI_zDuOMKXJ8qIqLp7GlQqpLpjftSuwLtMjv6ixhz8UuaYBFzcMblJIwlnMvOYW3zfjvaYnHsoxBKqgGY_S7AtH1tmym1KyDnks5UEIa-1E1j4P',
    },
    {
      id: '4',
      name: 'Rex Imperial',
      breed: 'Golden Retriever',
      verified: false,
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3__Q0ufMoiHHoD02iIxQDRsx7Qxt1dT8I0otM87enCrU97qiYA0pQfWYz5V2S65nznkt7j4pvn3JZtNF-R3MmS0lk9OaRwZEG2WwlTgA4-mrLJTHF1olArxWkXNnZIp4QRvCrtERfAkfxZu6-Mc932U8U_okSKc4MPV4xLTx2DiK2BFrHkQHtKr6DOxfgUCvDi6x2wkNusa145B7eMCGgE1TFUCMQC6bVSsKUZAJm2r_kGeOw-pWrBvyD9j7tTca1fiFdbHwgy8X0',
    },
  ],
}

export default function ProfilePage() {
  const [tab, setTab] = useState<'dogs' | 'settings'>('dogs')

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <TopBar title="Mi Perfil" />

      <main className="flex-grow pb-[100px] max-w-[680px] mx-auto w-full">
        {/* Profile header */}
        <div className="bg-surface-container-low border-b border-outline-variant px-4 pt-6 pb-4 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-[3px] border-[#fed488]">
              <img src={profileData.avatar} alt={profileData.name} className="w-full h-full object-cover" />
            </div>
            {profileData.verified && (
              <span
                className="material-symbols-outlined absolute bottom-0 right-0 text-[#fed488] bg-surface rounded-full text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
            )}
          </div>
          <div className="text-center">
            <h1 className="font-headline-sm text-primary text-lg font-semibold">{profileData.name}</h1>
            <p className="font-metadata text-xs text-outline">{profileData.zone} · Miembro desde {profileData.memberSince}</p>
          </div>

          {/* Stats */}
          <div className="flex w-full divide-x divide-outline-variant">
            {profileData.stats.map(s => (
              <div key={s.label} className="flex-1 flex flex-col items-center py-2">
                <span className="font-headline-sm text-primary text-xl font-bold">{s.value}</span>
                <span className="font-label-caps text-[10px] text-outline">{s.label.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-outline-variant px-4">
          <button
            onClick={() => setTab('dogs')}
            className={`flex-1 py-3 font-label-caps text-label-caps text-center transition-colors ${tab === 'dogs' ? 'border-b-2 border-primary text-primary' : 'text-outline hover:text-primary'}`}
          >
            MIS PERROS
          </button>
          <button
            onClick={() => setTab('settings')}
            className={`flex-1 py-3 font-label-caps text-label-caps text-center transition-colors ${tab === 'settings' ? 'border-b-2 border-primary text-primary' : 'text-outline hover:text-primary'}`}
          >
            CONFIGURACIÓN
          </button>
        </div>

        <div className="px-4 py-6">
          {tab === 'dogs' && (
            <div className="flex flex-col gap-4">
              {profileData.dogs.map(dog => (
                <Link key={dog.id} href={`/dog/${dog.id}`} className="block">
                  <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex gap-4 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-shadow">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={dog.img} alt={dog.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col justify-center flex-grow min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        <h3 className="font-headline-sm text-primary text-sm font-semibold truncate">{dog.name}</h3>
                        {dog.verified ? (
                          <span className="material-symbols-outlined text-[#775a19] text-base flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        ) : (
                          <span className="material-symbols-outlined text-outline text-base flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>pending</span>
                        )}
                      </div>
                      <p className="font-metadata text-xs text-outline">{dog.breed}</p>
                      <p className="font-label-caps text-[10px] mt-1 text-on-surface-variant">
                        {dog.verified ? 'VERIFICADO' : 'EN REVISIÓN'}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-outline-variant self-center">chevron_right</span>
                  </div>
                </Link>
              ))}

              <Link
                href="/onboarding/dog"
                className="border border-dashed border-outline-variant rounded-xl p-4 flex items-center justify-center gap-2 text-outline hover:border-primary hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">add</span>
                <span className="font-label-caps text-label-caps">AGREGAR PERRO</span>
              </Link>
            </div>
          )}

          {tab === 'settings' && (
            <div className="flex flex-col gap-3">
              {[
                { icon: 'person', label: 'Datos personales' },
                { icon: 'notifications', label: 'Notificaciones' },
                { icon: 'lock', label: 'Seguridad' },
                { icon: 'help', label: 'Ayuda y soporte' },
                { icon: 'logout', label: 'Cerrar sesión' },
              ].map(item => (
                <button
                  key={item.label}
                  className="flex items-center gap-4 bg-surface-container-low border border-outline-variant rounded-xl px-4 py-4 text-left hover:bg-surface-container transition-colors w-full"
                >
                  <span className="material-symbols-outlined text-outline">{item.icon}</span>
                  <span className="font-body-md text-body-md text-on-surface flex-grow">{item.label}</span>
                  <span className="material-symbols-outlined text-outline-variant text-sm">chevron_right</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
