'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'
import { insforge } from '@/lib/insforge'
import { useAuth } from '@/context/AuthContext'
import type { Database } from '@/lib/database.types'

type Dog = Database['public']['Tables']['dogs']['Row']

const DEMO_DOGS: Dog[] = [
  { id: 'demo-d1', owner_id: 'demo-user', name: 'Arya von Westwood', breed: 'Border Collie', age: '2 años', sex: 'Hembra', zone: 'Providencia, RM',
    photos: ['https://images.unsplash.com/photo-1589209534004-0c3ec3d8a9e5?w=400&h=400&fit=crop'], pedigree_number: 'KCC-2024-BC-00892', verified: true, score: 95, created_at: '' },
  { id: 'demo-d2', owner_id: 'demo-user', name: 'Thor of Golden Peak', breed: 'Golden Retriever', age: '3 años', sex: 'Macho', zone: 'Las Condes, RM',
    photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop'], pedigree_number: 'KCC-2023-GR-01147', verified: true, score: 95, created_at: '' },
]

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const isDemo = user?.id === 'demo-user'

  const [tab, setTab] = useState<'dogs' | 'settings'>('dogs')
  const [dogs, setDogs] = useState<Dog[]>([])
  const [matchCount, setMatchCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    if (isDemo) {
      setDogs(DEMO_DOGS)
      setMatchCount(2)
      setLoading(false)
      return
    }
    const load = async () => {
      const { data: dogsData } = await insforge.database.from('dogs').select('*').eq('owner_id', user.id)
      const dogIds = (dogsData ?? []).map((d: Dog) => d.id)
      let count = 0
      if (dogIds.length) {
        const { count: c } = await insforge.database.from('matches').select('*', { count: 'exact', head: true })
          .or(`dog_a_id.in.(${dogIds.join(',')}),dog_b_id.in.(${dogIds.join(',')})`)
          .eq('status_a', 'accepted').eq('status_b', 'accepted')
        count = c ?? 0
      }
      setDogs(dogsData ?? [])
      setMatchCount(count)
      setLoading(false)
    }
    load()
  }, [user, isDemo])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const name = user?.profile?.name ?? user?.user_metadata?.name ?? user?.email ?? 'Usuario'
  const avatarUrl = user?.profile?.avatar_url ?? user?.user_metadata?.avatar_url ?? null
  const initials = name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
    : 'Acceso reciente'

  return (
    <div className="bg-[#fcf9f8] min-h-screen flex flex-col">
      <TopBar title="Mi Perfil" />

      <main className="flex-grow pb-[100px] max-w-[680px] mx-auto w-full">

        {/* Hero */}
        <div className="relative bg-gradient-to-b from-[#061b0e] to-[#1b3022] text-white px-5 pt-8 pb-16">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#fed488] bg-[#1b3022] flex items-center justify-center shadow-lg flex-shrink-0">
              {avatarUrl
                ? <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                : <span className="text-[#fed488] text-2xl font-bold">{initials}</span>
              }
            </div>
            <div className="min-w-0 flex-grow">
              <h1 className="font-serif font-bold text-xl tracking-tight truncate">{name}</h1>
              <p className="text-white/60 text-[12px] mt-0.5">Miembro · {memberSince}</p>
              {isDemo && (
                <span className="inline-block mt-2 text-[9px] font-bold tracking-[0.1em] text-[#261900] bg-[#fed488] px-2 py-0.5 rounded-full">
                  MODO DEMO
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stat cards (overlapping hero) */}
        <div className="px-4 -mt-10 grid grid-cols-2 gap-3">
          <StatCard icon="pets" label="Perros" value={loading ? '—' : dogs.length} />
          <StatCard icon="handshake" label="Matches" value={loading ? '—' : matchCount} />
        </div>

        {/* Tabs */}
        <div className="px-4 mt-6">
          <div className="bg-white border border-[#e4e2e1] rounded-full p-1 flex">
            {[
              { key: 'dogs', label: 'Mis perros' },
              { key: 'settings', label: 'Configuración' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as typeof tab)}
                className={`flex-1 py-2.5 rounded-full text-[11px] font-bold tracking-[0.08em] transition-all ${
                  tab === t.key ? 'bg-[#061b0e] text-white' : 'text-[#737973] hover:text-[#1b1c1c]'
                }`}
              >
                {t.label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pt-5">
          {tab === 'dogs' && (
            <div className="flex flex-col gap-3">
              {dogs.map(dog => (
                <Link key={dog.id} href={isDemo ? '#' : `/dog/${dog.id}`} className="block group">
                  <div className="bg-white border border-[#e4e2e1] rounded-2xl overflow-hidden flex hover:shadow-[0_8px_32px_rgba(6,27,14,0.10)] transition-all duration-300">
                    <div className="w-24 h-24 flex-shrink-0 bg-[#f0eded] relative overflow-hidden">
                      {dog.photos[0]
                        ? <img src={dog.photos[0]} alt={dog.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl text-[#c3c8c1]" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
                          </div>
                      }
                    </div>
                    <div className="flex flex-col justify-center flex-grow min-w-0 p-4">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="font-serif font-bold text-[#061b0e] text-[15px] truncate">{dog.name}</h3>
                        {dog.verified && (
                          <span className="material-symbols-outlined text-[#fed488] text-[15px] flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        )}
                      </div>
                      <p className="text-[#737973] text-[12px]">{dog.breed} · {dog.age}</p>
                      <span className={`inline-flex items-center gap-1 text-[9px] font-bold tracking-[0.1em] mt-1.5 w-fit px-2 py-0.5 rounded-full ${
                        dog.verified
                          ? 'bg-[#fed488]/30 text-[#775a19] border border-[#fed488]/50'
                          : 'bg-[#f0eded] text-[#737973] border border-[#e4e2e1]'
                      }`}>
                        {dog.verified ? 'VERIFICADO KCC' : 'EN REVISIÓN'}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-[#c3c8c1] self-center pr-3">chevron_right</span>
                  </div>
                </Link>
              ))}

              {!isDemo && (
                <Link
                  href="/onboarding/dog"
                  className="border-2 border-dashed border-[#c3c8c1] rounded-2xl p-5 flex items-center justify-center gap-2 text-[#737973] hover:border-[#061b0e] hover:text-[#061b0e] hover:bg-white transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  <span className="text-[11px] font-bold tracking-[0.08em]">AGREGAR EJEMPLAR</span>
                </Link>
              )}
              {!loading && dogs.length === 0 && !isDemo && (
                <div className="text-center py-10">
                  <p className="text-[#737973] text-sm">Aún no has registrado ningún perro.</p>
                </div>
              )}
            </div>
          )}

          {tab === 'settings' && (
            <div className="flex flex-col gap-2.5">
              {[
                { icon: 'person', label: 'Datos personales', action: () => router.push('/onboarding/user') },
                { icon: 'description', label: 'Documentos', action: () => router.push('/documents') },
                { icon: 'notifications', label: 'Notificaciones', action: () => {} },
                { icon: 'lock', label: 'Seguridad', action: () => {} },
                { icon: 'help', label: 'Ayuda y soporte', action: () => {} },
                ...(user?.email === 'a@a.com' ? [{ icon: 'admin_panel_settings', label: 'Panel de administración', action: () => router.push('/admin') }] : []),
              ].map(item => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="flex items-center gap-3 bg-white border border-[#e4e2e1] rounded-2xl px-4 py-4 text-left hover:bg-[#f6f3f2] transition-colors w-full"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#f0eded] flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[#1b1c1c] text-[20px]">{item.icon}</span>
                  </div>
                  <span className="text-[14px] text-[#1b1c1c] flex-grow">{item.label}</span>
                  <span className="material-symbols-outlined text-[#c3c8c1] text-[18px]">chevron_right</span>
                </button>
              ))}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 bg-white border border-[#ffdad6] rounded-2xl px-4 py-4 text-left hover:bg-[#ffdad6]/30 transition-colors w-full mt-2"
              >
                <div className="w-9 h-9 rounded-xl bg-[#ffdad6] flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[#ba1a1a] text-[20px]">logout</span>
                </div>
                <span className="text-[14px] text-[#ba1a1a] flex-grow font-semibold">Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="bg-white border border-[#e4e2e1] rounded-2xl px-4 py-4 shadow-[0_4px_16px_rgba(6,27,14,0.08)] flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-[#fed488]/30 flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-[#775a19] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="font-serif font-bold text-[#061b0e] text-2xl leading-none">{value}</p>
        <p className="text-[10px] font-bold tracking-[0.1em] text-[#737973] mt-1">{label.toUpperCase()}</p>
      </div>
    </div>
  )
}
