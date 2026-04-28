'use client'
import { useState } from 'react'
import Link from 'next/link'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'

const breeds = ['Todos', 'Golden Retriever', 'Border Collie', 'Labrador', 'Bulldog', 'Poodle', 'Husky']

const dogs = [
  {
    id: '1',
    name: 'Arya von Westwood',
    breed: 'Border Collie',
    age: '2 años',
    sex: 'Hembra',
    zone: 'Providencia, RM',
    verified: true,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCjiZpgrUlAFjaer3vHMMWgzNkg3MezFwu5DwaWxZsP1wyw2E-ukXtQW3ZAjLJDCYKpSfV2m_fZFcYFBWhy2Z5a3aDzmRQe-r5m870zQ6mlpYI0GI1DN0gcc9tckmPjZZwE7GNeObslycCM67qayPqyan4GEvYgKI_zDuOMKXJ8qIqLp7GlQqpLpjftSuwLtMjv6ixhz8UuaYBFzcMblJIwlnMvOYW3zfjvaYnHsoxBKqgGY_S7AtH1tmym1KyDnks5UEIa-1E1j4P',
  },
  {
    id: '2',
    name: 'Thor de Los Andes',
    breed: 'Golden Retriever',
    age: '3 años',
    sex: 'Macho',
    zone: 'Las Condes, RM',
    verified: true,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3__Q0ufMoiHHoD02iIxQDRsx7Qxt1dT8I0otM87enCrU97qiYA0pQfWYz5V2S65nznkt7j4pvn3JZtNF-R3MmS0lk9OaRwZEG2WwlTgA4-mrLJTHF1olArxWkXNnZIp4QRvCrtERfAkfxZu6-Mc932U8U_okSKc4MPV4xLTx2DiK2BFrHkQHtKr6DOxfgUCvDi6x2wkNusa145B7eMCGgE1TFUCMQC6bVSsKUZAJm2r_kGeOw-pWrBvyD9j7tTca1fiFdbHwgy8X0',
  },
  {
    id: '3',
    name: 'Luna Imperiale',
    breed: 'Labrador',
    age: '1 año',
    sex: 'Hembra',
    zone: 'Ñuñoa, RM',
    verified: false,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApuPGGUYlX87qphBbjM12s6TMgO_-kXPn02xrl_F7mDGhiCXCgqov-8Q70q6kaY9JgQOzk3iq-XSaj_lGdaYrQhpT7NsUmGhNogrNvY6q1tq9OX7wGGPeQ75nsGZZy78AE9T7DLJFPrCyX5mJdVUYyxon1ItGN2XvNzLleRp-tycTfnRUFLPH-XpSpAseGpm8KO0TyItbw2X9yS735A7PKFp3ODG1JQtO-Foab8BHzxZGuuePLVyv67byPrxt7GgL-FiW5ysBZc-1C',
  },
  {
    id: '4',
    name: 'Maximus del Rey',
    breed: 'Husky',
    age: '4 años',
    sex: 'Macho',
    zone: 'Vitacura, RM',
    verified: true,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCjiZpgrUlAFjaer3vHMMWgzNkg3MezFwu5DwaWxZsP1wyw2E-ukXtQW3ZAjLJDCYKpSfV2m_fZFcYFBWhy2Z5a3aDzmRQe-r5m870zQ6mlpYI0GI1DN0gcc9tckmPjZZwE7GNeObslycCM67qayPqyan4GEvYgKI_zDuOMKXJ8qIqLp7GlQqpLpjftSuwLtMjv6ixhz8UuaYBFzcMblJIwlnMvOYW3zfjvaYnHsoxBKqgGY_S7AtH1tmym1KyDnks5UEIa-1E1j4P',
  },
]

export default function ExplorePage() {
  const [search, setSearch] = useState('')
  const [activeBreed, setActiveBreed] = useState('Todos')

  const filtered = dogs.filter(d => {
    const matchBreed = activeBreed === 'Todos' || d.breed === activeBreed
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.breed.toLowerCase().includes(search.toLowerCase())
    return matchBreed && matchSearch
  })

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <TopBar />

      <main className="flex-grow pb-[100px] px-4 max-w-[680px] mx-auto w-full">
        {/* Search */}
        <div className="sticky top-[72px] bg-surface z-40 pt-4 pb-3">
          <div className="relative mb-3">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl">search</span>
            <input
              className="w-full bg-surface-container-low border border-outline-variant rounded-full pl-10 pr-4 py-3 text-body-md placeholder:text-outline-variant focus:outline-none focus:border-primary transition-colors"
              placeholder="Raza, nombre o zona..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Breed filters */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {breeds.map(b => (
              <button
                key={b}
                onClick={() => setActiveBreed(b)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full font-label-caps text-label-caps border transition-colors ${
                  activeBreed === b
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-transparent text-outline border-outline-variant hover:border-primary hover:text-primary'
                }`}
              >
                {b.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="font-metadata text-xs text-outline mb-4">{filtered.length} perfiles encontrados</p>

        {/* Cards */}
        <div className="flex flex-col gap-4">
          {filtered.map(dog => (
            <Link key={dog.id} href={`/dog/${dog.id}`} className="block">
              <div className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow flex gap-4 p-4">
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={dog.img} alt={dog.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col justify-between flex-grow min-w-0">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-headline-sm text-headline-sm text-primary text-base truncate">{dog.name}</h2>
                      {dog.verified && (
                        <span className="material-symbols-outlined text-[#775a19] text-base flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                      )}
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant text-sm">{dog.breed}</p>
                    <p className="font-metadata text-xs text-outline">{dog.age} · {dog.sex}</p>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="material-symbols-outlined text-outline text-sm">location_on</span>
                    <span className="font-metadata text-xs text-outline truncate">{dog.zone}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 self-center">
                  <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-outline-variant block mb-4">search_off</span>
            <p className="font-body-md text-on-surface-variant">No se encontraron perfiles.</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
