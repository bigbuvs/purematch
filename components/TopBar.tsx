'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function TopBar({ showBack = false, title = 'PureMatch' }: { showBack?: boolean; title?: string }) {
  const pathname = usePathname()
  const { user } = useAuth()

  const name: string = user?.profile?.name ?? user?.user_metadata?.name ?? user?.email ?? ''
  const initials = name
    ? name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'
  const avatar: string | undefined = user?.profile?.avatar_url ?? user?.user_metadata?.avatar_url

  return (
    <header className="bg-surface border-b border-outline-variant flex items-center justify-between px-5 h-[60px] w-full sticky top-0 z-50">
      <div className="w-10">
        {showBack ? (
          <button onClick={() => history.back()} className="material-symbols-outlined text-on-surface p-1 rounded-full hover:bg-surface-container transition-colors">
            arrow_back
          </button>
        ) : (
          <div className="w-7 h-7 rounded-full border border-outline-variant flex items-center justify-center bg-surface-container">
            <span className="material-symbols-outlined text-sm text-outline" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
          </div>
        )}
      </div>

      <h1 className="font-serif font-black text-lg text-primary tracking-widest uppercase">
        {title === 'PureMatch' ? 'PureMatch' : title}
      </h1>

      <Link href="/profile" className="w-10 flex justify-end">
        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-secondary-container bg-surface-container flex items-center justify-center">
          {avatar
            ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
            : <span className="font-serif font-bold text-xs text-primary">{initials}</span>
          }
        </div>
      </Link>
    </header>
  )
}
