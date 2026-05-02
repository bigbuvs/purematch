'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import NavDrawer from '@/components/NavDrawer'

export default function TopBar({ showBack = false, title = 'PureMatch' }: { showBack?: boolean; title?: string }) {
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const name: string = user?.profile?.name ?? user?.user_metadata?.name ?? user?.email ?? ''
  const initials = name
    ? name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'
  const avatar: string | undefined = user?.profile?.avatar_url ?? user?.user_metadata?.avatar_url

  return (
    <>
      <NavDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      <header className="bg-[#fcf9f8] border-b border-[#e4e2e1] flex items-center justify-between px-5 h-[60px] w-full sticky top-0 z-50">
        <div className="w-10">
          {showBack ? (
            <button onClick={() => history.back()} className="material-symbols-outlined text-[#1b1c1c] p-1 rounded-full hover:bg-[#f0eded] transition-colors">
              arrow_back
            </button>
          ) : (
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
              className="w-7 h-7 rounded-full border border-[#e4e2e1] flex items-center justify-center bg-[#f0eded] hover:bg-[#e4e2e1] transition-colors"
            >
              <span className="material-symbols-outlined text-sm text-[#737973]" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
            </button>
          )}
        </div>

        <Link href="/" className="font-serif font-black text-lg text-[#061b0e] tracking-widest uppercase hover:text-[#1b3022] transition-colors">
          {title === 'PureMatch' ? 'PureMatch' : title}
        </Link>

        <Link href="/profile" className="w-10 flex justify-end">
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#c3c8c1] bg-[#f0eded] flex items-center justify-center">
            {avatar
              ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
              : <span className="font-serif font-bold text-xs text-[#061b0e]">{initials}</span>
            }
          </div>
        </Link>
      </header>
    </>
  )
}
