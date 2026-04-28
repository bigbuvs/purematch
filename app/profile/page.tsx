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

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<'dogs' | 'settings'>('dogs')
  const [dogs, setDogs] = useState<Dog[]>([])
  const [matchCount, setMatchCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const [{ data: dogsData }, { count }] = await Promise.all([
        insforge.from('dogs').select('*').eq('owner_id', user.id),
        insforge.from('matches').select('*', { count: 'exact', head: true })
          .or(`dog_a_id.in.(${(dogsData ?? []).map((d: Dog) => d.id).join(',') || 'null'}),dog_b_id.in.(${(dogsData ?? []).map((d: Dog) => d.id).join(',') || 'null'})`)
          .eq('status_a', 'accepted').eq('status_b', 'accepted'),
      ])
      setDogs(dogsData ?? [])
      setMatchCount(count ?? 0)
      setLoading(false)
    }
    load()
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth')
  }

  const name = user?.user_metadata?.name ?? user?.email ?? 'Usuario'
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }) : ''

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <TopBar title="Mi Perfil" />
      <main className="flex-grow pb-[100px] max-w-[680px] mx-auto w-full">
        <div className="bg-surface-container-low border-b border-outline-variant px-4 pt-6 pb-4 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-[3px] border-[#fed488] bg-surface-container flex items-center justify-center">
              {user?.user_metadata?.avatar_url
                ? <img src={user.user_metadata.avatar_url} alt={name} className="w-full h-full object-cover" />
                : <span className="material-symbols-outlined text-4xl text-outline">person</span>
              }
            </div>
          </div>
          <div className="text-center">
            <h1 className="font-headline-sm text-primary text-lg font-semibold">{name}</h1>
            <p className="font-metadata text-xs text-outline">Miembro desde {memberSince}</p>
          </div>
          <div className="flex w-full divide-x divide-outline-variant">
            {[{ label: 'Perros', value: dogs.length }, { label: 'Matches', value: matchCount }].map(s => (
              <div key={s.label} className="flex-1 flex flex-col items-center py-2">
                <span className="font-headline-sm text-primary text-xl font-bold">{loading ? '—' : s.value}</span>
                <span className="font-label-caps text-[10px] text-outline">{s.label.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex border-b border-outline-variant px-4">
          <button onClick={() => setTab('dogs')} className={`flex-1 py-3 font-label-caps text-label-caps text-center transition-colors ${tab === 'dogs' ? 'border-b-2 border-primary text-primary' : 'text-outline hover:text-primary'}`}>MIS PERROS</button>
          <button onClick={() => setTab('settings')} className={`flex-1 py-3 font-label-caps text-label-caps text-center transition-colors ${tab === 'settings' ? 'border-b-2 border-primary text-primary' : 'text-outline hover:text-primary'}`}>CONFIGURACIÓN</button>
        </div>

        <div className="px-4 py-6">
          {tab === 'dogs' && (
            <div className="flex flex-col gap-4">
              {dogs.map(dog => (
                <Link key={dog.id} href={`/dog/${dog.id}`} className="block">
                  <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex gap-4 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-shadow">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
                      {dog.photos[0] && <img src={dog.photos[0]} alt={dog.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex flex-col justify-center flex-grow min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        <h3 className="text-primary text-sm font-semibold truncate">{dog.name}</h3>
                        <span className="material-symbols-outlined text-base flex-shrink-0" style={{ color: dog.verified ? '#775a19' : '#737973', fontVariationSettings: "'FILL' 1" }}>{dog.verified ? 'verified' : 'pending'}</span>
                      </div>
                      <p className="font-metadata text-xs text-outline">{dog.breed}</p>
                      <p className="font-label-caps text-[10px] mt-1 text-on-surface-variant">{dog.verified ? 'VERIFICADO' : 'EN REVISIÓN'}</p>
                    </div>
                    <span className="material-symbols-outlined text-outline-variant self-center">chevron_right</span>
                  </div>
                </Link>
              ))}
              <Link href="/onboarding/dog" className="border border-dashed border-outline-variant rounded-xl p-4 flex items-center justify-center gap-2 text-outline hover:border-primary hover:text-primary transition-colors">
                <span className="material-symbols-outlined">add</span>
                <span className="font-label-caps text-label-caps">AGREGAR PERRO</span>
              </Link>
            </div>
          )}

          {tab === 'settings' && (
            <div className="flex flex-col gap-3">
              {[
                { icon: 'person', label: 'Datos personales', action: () => router.push('/onboarding/user') },
                { icon: 'notifications', label: 'Notificaciones', action: () => {} },
                { icon: 'lock', label: 'Seguridad', action: () => {} },
                { icon: 'help', label: 'Ayuda y soporte', action: () => {} },
              ].map(item => (
                <button key={item.label} onClick={item.action} className="flex items-center gap-4 bg-surface-container-low border border-outline-variant rounded-xl px-4 py-4 text-left hover:bg-surface-container transition-colors w-full">
                  <span className="material-symbols-outlined text-outline">{item.icon}</span>
                  <span className="font-body-md text-on-surface flex-grow">{item.label}</span>
                  <span className="material-symbols-outlined text-outline-variant text-sm">chevron_right</span>
                </button>
              ))}
              <button onClick={handleSignOut} className="flex items-center gap-4 bg-surface-container-low border border-error/30 rounded-xl px-4 py-4 text-left hover:bg-error-container transition-colors w-full">
                <span className="material-symbols-outlined text-error">logout</span>
                <span className="font-body-md text-error flex-grow">Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
