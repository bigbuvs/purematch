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
  { id: 'd1', owner_id: 'o1', name: 'Arya von Westwood',  breed: 'Border Collie',    age: '2 años', sex: 'Hembra', zone: 'Providencia, RM',  photos: ['https://images.unsplash.com/photo-1589209534004-0c3ec3d8a9e5?w=600&h=800&fit=crop'], pedigree_number: 'KCC-2024-BC-00892', verified: true, created_at: '' },
  { id: 'd2', owner_id: 'o2', name: 'Thor of Golden Peak', breed: 'Golden Retriever',  age: '3 años', sex: 'Macho', zone: 'Las Condes, RM',   photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=800&fit=crop'], pedigree_number: 'KCC-2023-GR-01147', verified: true, created_at: '' },
  { id: 'd3', owner_id: 'o3', name: 'Luna von Schwarzwald', breed: 'German Shepherd', age: '4 años', sex: 'Hembra', zone: 'Vitacura, RM',     photos: ['https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=600&h=800&fit=crop'], pedigree_number: 'KCC-2022-GS-00634', verified: true, created_at: '' },
  { id: 'd4', owner_id: 'o4', name: 'Balto del Sur',       breed: 'Husky Siberiano',  age: '2 años', sex: 'Macho', zone: 'Ñuñoa, RM',        photos: ['https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=600&h=800&fit=crop'], pedigree_number: 'KCC-2024-HS-00311', verified: true, created_at: '' },
  { id: 'd5', owner_id: 'o5', name: 'Bella di Milano',     breed: 'Poodle',           age: '1 año',  sex: 'Hembra', zone: 'Santiago Centro',  photos: ['https://images.unsplash.com/photo-1594226801341-41427b4e5c22?w=600&h=800&fit=crop'], pedigree_number: null,                  verified: true, created_at: '' },
  { id: 'd6', owner_id: 'o6', name: 'Max vom Rhein',       breed: 'German Shepherd',  age: '5 años', sex: 'Macho', zone: 'Maipú, RM',        photos: ['https://images.unsplash.com/photo-1568572933382-74d440642117?w=600&h=800&fit=crop'], pedigree_number: 'KCC-2020-GS-00192', verified: true, created_at: '' },
]

const ALL_BREEDS = ['Todos', 'Border Collie', 'Golden Retriever', 'Labrador Retriever', 'Poodle', 'Husky Siberiano', 'German Shepherd', 'Beagle', 'Bulldog Inglés', 'Dachshund', 'Chihuahua']
const breeds = ['Todos', 'Border Collie', 'Golden Retriever', 'Labrador Retriever', 'Poodle', 'Husky Siberiano', 'German Shepherd', 'Beagle', 'Bulldog Inglés']

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
    insforge.database
      .from('dogs')
      .select('*')
      .eq('verified', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setDogs(data ?? []); setLoading(false) })
  }, [isDemo])

  const filtered = dogs.filter(d => {
    const matchBreed = activeBreed === 'Todos' || d.breed === activeBreed
    const matchSex = sexFilter === 'Todos' || d.sex === sexFilter
    const q = search.toLowerCase()
    const matchSearch = !q || d.name.toLowerCase().includes(q) || d.breed.toLowerCase().includes(q) || (d.zone ?? '').toLowerCase().includes(q)
    return matchBreed && matchSex && matchSearch
  })

  const clearFilters = () => { setSearch(''); setActiveBreed('Todos'); setSexFilter('Todos') }
  const hasFilters = search || activeBreed !== 'Todos' || sexFilter !== 'Todos'

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <TopBar />
      <main className="flex-grow pb-[80px] max-w-[680px] mx-auto w-full">

        {/* Sticky search + filters */}
        <div className="sticky top-[60px] bg-background/95 backdrop-blur-sm z-40 px-4 pt-4 pb-3 border-b border-outline-variant">
          <div className="relative mb-3">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
            <input
              className="w-full bg-surface-container-low border border-outline-variant rounded-full pl-10 pr-4 py-2.5 text-sm placeholder:text-outline-variant focus:outline-none focus:border-primary transition-colors"
              placeholder="Buscar por raza, nombre o zona..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Sex filter pills */}
          <div className="flex gap-2 mb-2.5">
            {(['Todos', 'Macho', 'Hembra'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSexFilter(s)}
                className={`px-3 py-1 rounded-full font-label-caps text-[10px] border transition-colors ${sexFilter === s ? 'bg-primary text-on-primary border-primary' : 'bg-transparent text-outline border-outline-variant hover:border-primary'}`}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Breed scroll */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {breeds.map(b => (
              <button
                key={b}
                onClick={() => setActiveBreed(b)}
                className={`flex-shrink-0 px-3 py-1 rounded-full font-label-caps text-[10px] border transition-colors ${activeBreed === b ? 'bg-primary text-on-primary border-primary' : 'bg-transparent text-outline border-outline-variant hover:border-primary'}`}
              >
                {b.toUpperCase()}
              </button>
            ))}
            {hasFilters && (
              <button onClick={clearFilters} className="ml-auto text-[10px] text-[#737973] underline underline-offset-2 hover:text-[#061b0e] transition-colors">
                Limpiar
              </button>
            )}
          </div>
</div>
        <div className="px-4 pt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <span className="material-symbols-outlined text-5xl text-outline-variant animate-spin">progress_activity</span>
              <p className="font-label-caps text-[10px] text-outline tracking-[0.1em]">CARGANDO PERFILES...</p>
            </div>
          ) : (
            <>
              <p className="font-label-caps text-[10px] text-outline tracking-[0.08em] mb-4">
                {filtered.length} {filtered.length === 1 ? 'PERFIL' : 'PERFILES'} ENCONTRADOS
              </p>

              <div className="flex flex-col gap-3">
                {filtered.map(dog => (
                  <Link key={dog.id} href={`/dog/${dog.id}`} className="block group">
                    <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden hover:shadow-[0_4px_24px_rgba(6,27,14,0.10)] transition-all flex gap-0">

                      {/* Photo */}
                      <div className="w-28 h-28 flex-shrink-0 bg-surface-container relative overflow-hidden">
                        {dog.photos[0]
                          ? <img src={dog.photos[0]} alt={dog.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          : <div className="w-full h-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-4xl text-outline-variant" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
                            </div>
                        }
                        {/* Sex badge */}
                        <div className={`absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center ${dog.sex === 'Macho' ? 'bg-primary/90' : 'bg-secondary/90'}`}>
                          <span className="material-symbols-outlined text-white text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {dog.sex === 'Macho' ? 'male' : 'female'}
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex flex-col justify-between flex-grow min-w-0 p-4">
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <h2 className="font-serif font-semibold text-primary text-base truncate">{dog.name}</h2>
                            {dog.verified && (
                              <span className="material-symbols-outlined text-secondary text-base flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                            )}
                          </div>
                          <p className="text-on-surface-variant text-sm font-medium">{dog.breed}</p>
                          <p className="font-metadata text-xs text-outline mt-0.5">{dog.age}</p>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          {dog.zone
                            ? <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-outline text-sm">location_on</span>
                                <span className="font-metadata text-xs text-outline truncate">{dog.zone}</span>
                              </div>
                            : <div />
                          }
                          {dog.pedigree_number && (
                            <span className="font-label-caps text-[9px] text-secondary bg-secondary-container/50 border border-secondary-container px-2 py-0.5 rounded-full">KCC</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center pr-3">
                        <span className="material-symbols-outlined text-outline-variant text-lg">chevron_right</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-20 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-outline-variant">search_off</span>
                  </div>
                  <div>
                    <p className="font-serif font-semibold text-primary mb-1">Sin resultados</p>
                    <p className="text-on-surface-variant text-sm">Prueba con otros filtros o términos de búsqueda.</p>
                  </div>
                  <button onClick={() => { setSearch(''); setActiveBreed('Todos'); setSexFilter('Todos') }} className="font-label-caps text-[10px] text-primary border border-primary px-4 py-2 hover:bg-primary hover:text-on-primary transition-colors">
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
