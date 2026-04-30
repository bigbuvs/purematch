'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'
import { insforge } from '@/lib/insforge'
import type { Database } from '@/lib/database.types'

type Dog = Database['public']['Tables']['dogs']['Row']

const breeds = ['Todos', 'Golden Retriever', 'Border Collie', 'Labrador', 'Bulldog', 'Poodle', 'Husky']

export default function ExplorePage() {
  const [dogs, setDogs] = useState<Dog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeBreed, setActiveBreed] = useState('Todos')

  useEffect(() => {
    insforge
      .database.from('dogs')
      .select('*')
      .eq('verified', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setDogs(data ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = dogs.filter(d => {
    const matchBreed = activeBreed === 'Todos' || d.breed === activeBreed
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.breed.toLowerCase().includes(search.toLowerCase())
    return matchBreed && matchSearch
  })

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <TopBar />
      <main className="flex-grow pb-[100px] px-4 max-w-[680px] mx-auto w-full">
        <div className="sticky top-[72px] bg-surface z-40 pt-4 pb-3">
          <div className="relative mb-3">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl">search</span>
            <input className="w-full bg-surface-container-low border border-outline-variant rounded-full pl-10 pr-4 py-3 text-body-md placeholder:text-outline-variant focus:outline-none focus:border-primary transition-colors" placeholder="Raza, nombre o zona..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {breeds.map(b => (
              <button key={b} onClick={() => setActiveBreed(b)} className={`flex-shrink-0 px-4 py-1.5 rounded-full font-label-caps text-label-caps border transition-colors ${activeBreed === b ? 'bg-primary text-on-primary border-primary' : 'bg-transparent text-outline border-outline-variant hover:border-primary hover:text-primary'}`}>
                {b.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <span className="material-symbols-outlined text-4xl text-outline-variant animate-spin">progress_activity</span>
          </div>
        ) : (
          <>
            <p className="font-metadata text-xs text-outline mb-4">{filtered.length} perfiles encontrados</p>
            <div className="flex flex-col gap-4">
              {filtered.map(dog => (
                <Link key={dog.id} href={`/dog/${dog.id}`} className="block">
                  <div className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow flex gap-4 p-4">
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
                      {dog.photos[0] && <img src={dog.photos[0]} alt={dog.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex flex-col justify-between flex-grow min-w-0">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="font-headline-sm text-primary text-base truncate">{dog.name}</h2>
                          {dog.verified && <span className="material-symbols-outlined text-[#775a19] text-base flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>}
                        </div>
                        <p className="text-on-surface-variant text-sm">{dog.breed}</p>
                        <p className="font-metadata text-xs text-outline">{dog.age} · {dog.sex}</p>
                      </div>
                      {dog.zone && (
                        <div className="flex items-center gap-1 mt-2">
                          <span className="material-symbols-outlined text-outline text-sm">location_on</span>
                          <span className="font-metadata text-xs text-outline truncate">{dog.zone}</span>
                        </div>
                      )}
                    </div>
                    <span className="material-symbols-outlined text-outline-variant self-center">chevron_right</span>
                  </div>
                </Link>
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-5xl text-outline-variant block mb-4">search_off</span>
                <p className="text-on-surface-variant">No se encontraron perfiles.</p>
              </div>
            )}
          </>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
