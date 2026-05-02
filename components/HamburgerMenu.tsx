'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

interface HamburgerMenuProps {
  open: boolean
  onClose: () => void
}

const NAV_LINKS = [
  { href: '/explore',  icon: 'search',    label: 'Explorar' },
  { href: '/matches',  icon: 'handshake', label: 'Matches'  },
  { href: '/profile',  icon: 'person',    label: 'Mi Perfil' },
  { href: '/documents',icon: 'description',label: 'Documentos' },
]

export default function HamburgerMenu({ open, onClose }: HamburgerMenuProps) {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const isDemo = user?.id === 'demo-user'
  const displayName = user?.profile?.name ?? user?.user_metadata?.name ?? user?.name ?? 'Usuario'
  const avatarUrl = user?.profile?.avatar_url ?? user?.user_metadata?.avatar_url ?? null
  const initials = displayName.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()

  // Close on route change
  useEffect(() => { onClose() }, [pathname])

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleSignOut = async () => {
    onClose()
    await signOut()
    router.push('/')
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-[#061b0e]/50 backdrop-blur-[2px] transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Drawer — slides in from right */}
      <aside
        className={`fixed top-0 right-0 h-full z-[70] w-[280px] bg-[#fcf9f8] shadow-[−8px_0_40px_rgba(6,27,14,0.18)] flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#e4e2e1]">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden bg-[#061b0e] flex items-center justify-center flex-shrink-0 border border-[#c3c8c1]">
              {avatarUrl
                ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                : <span className="text-[#fed488] text-sm font-bold">{initials}</span>
              }
            </div>
            <div className="min-w-0">
              <p className="font-serif font-semibold text-[#061b0e] text-sm truncate">{displayName}</p>
              {isDemo && (
                <span className="text-[9px] font-bold tracking-[0.1em] text-[#775a19] bg-[#fed488]/25 border border-[#fed488]/50 px-1.5 py-0.5 rounded-full">
                  MODO DEMO
                </span>
              )}
              {!isDemo && user?.email && (
                <p className="text-[#a0a5a0] text-[11px] truncate">{user.email}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#737973] hover:bg-[#f0eded] transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-grow px-3 pt-4 flex flex-col gap-1">
          {NAV_LINKS.map(({ href, icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? 'bg-[#061b0e] text-white'
                    : 'text-[#1b1c1c] hover:bg-[#f0eded]'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {icon}
                </span>
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 pb-8 pt-3 border-t border-[#e4e2e1] flex flex-col gap-1">
          {isDemo ? (
            <Link
              href="/auth"
              className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-[#775a19] hover:bg-[#fed488]/15 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>login</span>
              Crear cuenta / Ingresar
            </Link>
          ) : (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-[#737973] hover:bg-[#f0eded] transition-all w-full text-left"
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>logout</span>
              Cerrar sesión
            </button>
          )}
        </div>
      </aside>
    </>
  )
}
