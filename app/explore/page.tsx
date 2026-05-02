'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'
import { insforge } from '@/lib/insforge'
import { useAuth } from '@/context/AuthContext'
import type { Database } from '@/lib/database.types'

type Dog = Database['public']['Tables']['dogs']['Row']

const DEMO_DOGS: Dog[] = [
  { id: 'd1', owner_id: 'o1', name: 'Arya von Westwood',  breed: 'Border Collie',    age: '2 años', sex: 'Hembra', zone: 'Providencia, RM',  photos: ['https://images.unsplash.com/photo-1589209534004-0c3ec3d8a9e5?w=600&h=800&fit=crop'], pedigree_number: 'KCC-2024-BC-00892', verified: true, score: 95, created_at: '' },
  { id: 'd2', owner_id: 'o2', name: 'Thor of Golden Peak', breed: 'Golden Retriever',  age: '3 años', sex: 'Macho', zone: 'Las Condes, RM',   photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=800&fit=crop'], pedigree_number: 'KCC-2023-GR-01147', verified: true, score: 95, created_at: '' },
  { id: 'd3', owner_id: 'o3', name: 'Luna von Schwarzwald', breed: 'German Shepherd', age: '4 años', sex: 'Hembra', zone: 'Vitacura, RM',     photos: ['https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=600&h=800&fit=crop'], pedigree_number: 'KCC-2022-GS-00634', verified: true, score: 95, created_at: '' },
  { id: 'd4', owner_id: 'o4', name: 'Balto del Sur',       breed: 'Husky Siberiano',  age: '2 años', sex: 'Macho', zone: 'Ñuñoa, RM',        photos: ['https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=600&h=800&fit=crop'], pedigree_number: 'KCC-2024-HS-00311', verified: true, score: 95, created_at: '' },
  { id: 'd5', owner_id: 'o5', name: 'Bella di Milano',     breed: 'Poodle',           age: '1 año',  sex: 'Hembra', zone: 'Santiago Centro',  photos: ['https://images.unsplash.com/photo-1594226801341-41427b4e5c22?w=600&h=800&fit=crop'], pedigree_number: null,                  verified: true, score: 95, created_at: '' },
  { id: 'd6', owner_id: 'o6', name: 'Max vom Rhein',       breed: 'German Shepherd',  age: '5 años', sex: 'Macho', zone: 'Maipú, RM',        photos: ['https://images.unsplash.com/photo-1568572933382-74d440642117?w=600&h=800&fit=crop'], pedigree_number: 'KCC-2020-GS-00192', verified: true, score: 95, created_at: '' },
]

const ALL_BREEDS = ['Todos', 'Border Collie', 'Golden Retriever', 'Labrador Retriever', 'Poodle', 'Husky Siberiano', 'German Shepherd', 'Beagle', 'Bulldog Inglés', 'Dachshund', 'Chihuahua']

export default function ExplorePage() {
  const { user } = useAuth()
  const isDemo = user?.id === 'demo-user'

  const [dogs, setDogs] = useState<Dog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeBreed, setActiveBreed] = useState('Todos')
  const [sexFilter, setSexFilter] = useState<'Todos' | 'Macho' | 'Hembra'>('Todos')

  useEffect(() => {
    if (isDemo) { setDogs(DEMO_DOGS); setLoading(false); return }
    insforge.database.from('dogs').select('*').eq('verified', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setDogs(data ?? []); setLoading(false) })
  }, [isDemo])

  const filtered = dogs.filter(d => {
    const matchBreed = activeBreed === 'Todos' || d.breed === activeBreed
    const matchSex   = sexFilter === 'Todos'   || d.sex === sexFilter
    const q = search.toLowerCase()
    return matchBreed && matchSex && (!q || d.name.toLowerCase().includes(q) || d.breed.toLowerCase().includes(q) || (d.zone ?? '').toLowerCase().includes(q))
  })

  const clearFilters = () => { setSearch(''); setActiveBreed('Todos'); setSexFilter('Todos') }
  const hasFilters = search || activeBreed !== 'Todos' || sexFilter !== 'Todos'

  return (
    <div className="bg-[#fcf9f8] min-h-screen flex flex-col">
      <TopBar />

      <main className="flex-grow pb-[80px] max-w-[680px] mx-auto w-full">

        {/* ── Sticky search bar ── */}
        <div className="sticky top-[60px] z-40 bg-[#fcf9f8]/95 backdrop-blur-sm border-b border-[#c3c8c1]/60 px-4 pt-3 pb-3 flex flex-col gap-2.5">
          {/* Search input */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737973] text-[18px]">search</span>
            <input
              className="w-full bg-white border border-[#c3c8c1] rounded-full pl-10 pr-9 py-2.5 text-sm text-[#1b1c1c] placeholder:text-[#a0a5a0] focus:outline-none focus:border-[#061b0e] transition-colors"
              placeholder="Raza, nombre o zona..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#737973] hover:text-[#1b1c1c]">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Sex + clear */}
          <div className="flex items-center gap-2">
            {(['Todos', 'Macho', 'Hembra'] as const).map(s => (
              <button key={s} onClick={() => setSexFilter(s)}
                className={`px-3.5 py-1 rounded-full text-[10px] font-semibold tracking-[0.08em] border transition-all ${sexFilter === s ? 'bg-[#061b0e] text-white border-[#061b0e]' : 'bg-white text-[#737973] border-[#c3c8c1] hover:border-[#061b0e]'}`}>
                {s.toUpperCase()}
              </button>
            ))}
            {hasFilters && (
              <button onClick={clearFilters} className="ml-auto text-[10px] text-[#737973] underline underline-offset-2 hover:text-[#061b0e] transition-colors">
                Limpiar
              </button>
            )}
          </div>

          {/* Breed chips */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
            {ALL_BREEDS.map(b => (
              <button key={b} onClick={() => setActiveBreed(b)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-[10px] font-semibold tracking-[0.06em] border transition-all ${activeBreed === b ? 'bg-[#fed488] text-[#261900] border-[#fed488]' : 'bg-white text-[#737973] border-[#c3c8c1] hover:border-[#061b0e]'}`}>
                {b === 'Todos' ? 'TODOS' : b.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="px-4 pt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-28 gap-3">
              <span className="material-symbols-outlined text-5xl text-[#c3c8c1] animate-spin">progress_activity</span>
              <p className="text-[10px] font-semibold tracking-[0.1em] text-[#737973]">CARGANDO PERFILES...</p>
            </div>
          ) : (
            <>
              {/* Count row */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-semibold tracking-[0.1em] text-[#737973]">
                  {filtered.length} {filtered.length === 1 ? 'PERFIL' : 'PERFILES'}
                </p>
                {isDemo && (
                  <span className="text-[9px] font-semibold tracking-[0.08em] text-[#775a19] bg-[#fed488]/30 border border-[#fed488]/60 px-2 py-0.5 rounded-full">
                    MODO DEMO
                  </span>
                )}
              </div>

              {/* ── CARD GRID (2 cols portrait) ── */}
              <div className="grid grid-cols-2 gap-3">
                {filtered.map(dog => (
                  <Link key={dog.id} href={isDemo ? '#' : `/dog/${dog.id}`} className="block group">
                    <div className="bg-white border border-[#e4e2e1] rounded-2xl overflow-hidden hover:shadow-[0_8px_32px_rgba(6,27,14,0.12)] transition-all duration-300">

                      {/* Photo — portrait ratio */}
                      <div className="aspect-[3/4] relative overflow-hidden bg-[#f0eded]">
                        {dog.photos[0]
                          ? <img src={dog.photos[0]} alt={dog.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          : <div className="w-full h-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-5xl text-[#c3c8c1]" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
                            </div>
                        }

                        {/* Gradient overlay bottom */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#061b0e]/70 via-transparent to-transparent" />

                        {/* Verified + sex badges top */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                          {dog.verified && (
                            <div className="flex items-center gap-1 bg-[#061b0e]/75 backdrop-blur-sm px-2 py-1 rounded-full">
                              <span className="material-symbols-outlined text-[#fed488] text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                              <span className="text-[8px] font-bold tracking-[0.1em] text-white">KCC</span>
                            </div>
                          )}
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ml-auto ${dog.sex === 'Macho' ? 'bg-[#061b0e]/80' : 'bg-[#775a19]/80'} backdrop-blur-sm`}>
                            <span className="material-symbols-outlined text-white text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                              {dog.sex === 'Macho' ? 'male' : 'female'}
                            </span>
                          </div>
                        </div>

                        {/* Name overlay bottom */}
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="font-serif font-bold text-white text-[15px] leading-tight truncate">{dog.name}</p>
                          <p className="text-white/75 text-[11px] font-medium truncate">{dog.breed}</p>
                        </div>
                      </div>

                      {/* Info strip */}
                      <div className="px-3 py-2.5 flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-[#737973] text-[11px]">{dog.age}</p>
                          {dog.zone && (
                            <div className="flex items-center gap-0.5 mt-0.5">
                              <span className="material-symbols-outlined text-[#a0a5a0] text-[11px]">location_on</span>
                              <span className="text-[#a0a5a0] text-[10px] truncate">{dog.zone.split(',')[0]}</span>
                            </div>
                          )}
                        </div>
                        <span className="material-symbols-outlined text-[#c3c8c1] text-base">chevron_right</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Empty state */}
              {filtered.length === 0 && (
                <div className="flex flex-col items-center py-24 gap-4 text-center">
                  <div className="w-16 h-16 bg-[#f0eded] rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-[#c3c8c1]">search_off</span>
                  </div>
                  <div>
                    <p className="font-serif font-semibold text-[#061b0e] mb-1">Sin resultados</p>
                    <p className="text-[#737973] text-sm">Prueba con otros filtros.</p>
                  </div>
                  <button onClick={clearFilters} className="text-[11px] font-semibold tracking-[0.08em] text-[#061b0e] border border-[#061b0e] px-5 py-2 hover:bg-[#061b0e] hover:text-white transition-colors rounded-full">
                    LIMPIAR FILTROS
                  </button>
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
