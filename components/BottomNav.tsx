'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { insforge } from '@/lib/insforge'

export default function BottomNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [incomingCount, setIncomingCount] = useState(0)

  useEffect(() => {
    if (!user) return
    if (user.id === 'demo-user') { setIncomingCount(2); return }

    const check = async () => {
      const { data: myDogs } = await insforge.database.from('dogs').select('id').eq('owner_id', user.id)
      if (!myDogs?.length) return
      const dogIds = myDogs.map((d: { id: string }) => d.id)
      const { count } = await insforge.database.from('matches')
        .select('*', { count: 'exact', head: true })
        .or(
          dogIds.map((id: string) => `and(dog_b_id.eq.${id},status_b.eq.pending)`).join(',') + ',' +
          dogIds.map((id: string) => `and(dog_a_id.eq.${id},status_a.eq.pending)`).join(',')
        )
      setIncomingCount(count ?? 0)
    }
    check()
  }, [user, pathname])

  const navItems = [
    { href: '/explore', icon: 'search',    label: 'Explorar', badge: 0 },
    { href: '/matches', icon: 'handshake', label: 'Matches',  badge: incomingCount },
    { href: '/profile', icon: 'person',    label: 'Perfil',   badge: 0 },
  ]

  return (
    <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center bg-[#fcf9f8]/95 backdrop-blur-sm border-t border-[#c3c8c1]/60 shadow-[0_-4px_20px_rgba(6,27,14,0.06)] h-[72px] pb-safe">
      {navItems.map(({ href, icon, label, badge }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center pt-2 w-full h-full transition-all text-[10px] font-semibold tracking-[0.08em] gap-1 border-t-2 ${
              active
                ? 'text-[#061b0e] border-[#061b0e]'
                : 'text-[#a0a5a0] border-transparent hover:text-[#1b1c1c]'
            }`}
          >
            <span className="relative">
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              >
                {icon}
              </span>
              {badge > 0 && (
                <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 bg-[#ba1a1a] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </span>
            {label.toUpperCase()}
          </Link>
        )
      })}
    </nav>
  )
}
