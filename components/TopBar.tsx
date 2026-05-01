'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import HamburgerMenu from './HamburgerMenu'

interface TopBarProps {
  title?: string
  showBack?: boolean
}

export default function TopBar({ title, showBack = false }: TopBarProps) {
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const avatarUrl = user?.profile?.avatar_url ?? user?.user_metadata?.avatar_url ?? null
  const displayName = user?.profile?.name ?? user?.user_metadata?.name ?? user?.name ?? ''
  const initials = displayName.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase() || 'U'

  return (
    <>
      <header className="bg-[#fcf9f8]/95 backdrop-blur-sm border-b border-[#c3c8c1]/60 flex items-center justify-between px-4 h-[60px] w-full sticky top-0 z-50">

        {/* Left — isotipo → home */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <img
            src="/isotipo.svg"
            alt="PureMatch"
            width={32}
            height={32}
            className="rounded-full"
          />
          {!title && (
            <span className="font-serif font-bold text-[#061b0e] text-[15px] tracking-tight hidden sm:block">
              PureMatch
            </span>
          )}
        </Link>

        {/* Center — page title */}
        {title && (
          <h1 className="absolute left-1/2 -translate-x-1/2 font-serif font-bold text-[#061b0e] text-[15px] tracking-tight pointer-events-none">
            {title}
          </h1>
        )}

        {/* Right — back (optional) + avatar + hamburger */}
        <div className="flex items-center gap-2">
          {showBack && (
            <Link
              href="javascript:history.back()"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#737973] hover:bg-[#f0eded] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
          )}

          {/* User avatar → profile */}
          {user && (
            <Link
              href="/profile"
              className="w-8 h-8 rounded-full overflow-hidden bg-[#061b0e] flex items-center justify-center border border-[#c3c8c1] flex-shrink-0 hover:ring-2 hover:ring-[#fed488] transition-all"
            >
              {avatarUrl
                ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                : <span className="text-[#fed488] text-[11px] font-bold">{initials}</span>
              }
            </Link>
          )}

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#1b1c1c] hover:bg-[#f0eded] transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>
        </div>
      </header>

      <HamburgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
