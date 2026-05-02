'use client'
import Link from 'next/link'
import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { insforge } from '@/lib/insforge'
import { useRouter } from 'next/navigation'

const APP_LINKS = [
  { label: 'Explorar ejemplares', href: '/explore',      icon: 'search' },
  { label: 'Mis matches',         href: '/matches',      icon: 'favorite' },
  { label: 'Mi perfil',           href: '/profile',      icon: 'person' },
  { label: 'Editar perfil',       href: '/edit-profile', icon: 'manage_accounts' },
]

const INFO_LINKS = [
  { label: 'Términos de uso', href: '/terms',    icon: 'gavel' },
  { label: 'Privacidad',      href: '/privacy',  icon: 'shield' },
]

const LANDING_LINKS = [
  { label: 'Quiénes somos',  href: '#quienes-somos', icon: 'groups' },
  { label: 'Qué hacemos',    href: '#como-funciona',  icon: 'auto_awesome' },
  { label: 'Ver ejemplares', href: '/explore',        icon: 'search' },
]

export default function NavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleLink = (href: string) => {
    onClose()
    if (href.startsWith('#')) {
      setTimeout(() => {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
      }, 300)
    }
  }

  const handleSignOut = async () => {
    onClose()
    await insforge.auth.signOut()
    router.replace('/')
  }

  const name: string = user?.profile?.name ?? user?.user_metadata?.name ?? user?.email ?? ''
  const initials = name
    ? name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
    : '?'
  const avatar: string | undefined = user?.profile?.avatar_url ?? user?.user_metadata?.avatar_url

  const mainLinks = user ? APP_LINKS : LANDING_LINKS

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-[#061b0e]/60 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Drawer panel */}
      <aside
        className={`fixed top-0 left-0 z-[70] h-full w-[300px] sm:w-[340px] bg-[#061b0e] flex flex-col shadow-[4px_0_40px_rgba(0,0,0,0.4)] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#fed488] flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[#261900] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
            </div>
            <span className="font-serif font-black text-[16px] text-white tracking-[0.15em]">PureMatch</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-white text-[18px]">close</span>
          </button>
        </div>

        {/* User info (when logged in) */}
        {user && (
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#fed488]/40 bg-[#1b3022] flex items-center justify-center flex-shrink-0">
              {avatar
                ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
                : <span className="font-serif font-bold text-sm text-[#fed488]">{initials}</span>
              }
            </div>
            <div className="min-w-0">
              <p className="text-white text-[13px] font-semibold truncate">{name || 'Mi cuenta'}</p>
              <p className="text-white/40 text-[11px] truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex flex-col gap-1 px-3 pt-4 flex-grow overflow-y-auto">
          {mainLinks.map(({ label, href, icon }) =>
            href.startsWith('/') ? (
              <Link
                key={label}
                href={href}
                onClick={onClose}
                className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors group"
              >
                <span className="material-symbols-outlined text-[#fed488]/70 group-hover:text-[#fed488] text-[20px] transition-colors">{icon}</span>
                <span className="text-[14px] font-medium">{label}</span>
              </Link>
            ) : (
              <button
                key={label}
                onClick={() => handleLink(href)}
                className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors group w-full text-left"
              >
                <span className="material-symbols-outlined text-[#fed488]/70 group-hover:text-[#fed488] text-[20px] transition-colors">{icon}</span>
                <span className="text-[14px] font-medium">{label}</span>
              </button>
            )
          )}

          <div className="h-px bg-white/10 my-2 mx-1" />

          {INFO_LINKS.map(({ label, href, icon }) => (
            <Link
              key={label}
              href={href}
              onClick={onClose}
              className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors group"
            >
              <span className="material-symbols-outlined text-white/30 group-hover:text-[#fed488]/60 text-[18px] transition-colors">{icon}</span>
              <span className="text-[13px]">{label}</span>
            </Link>
          ))}

          <div className="h-px bg-white/10 my-2 mx-1" />

          {user ? (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors group w-full text-left"
            >
              <span className="material-symbols-outlined text-white/40 group-hover:text-[#fed488]/70 text-[20px] transition-colors">logout</span>
              <span className="text-[14px]">Cerrar sesión</span>
            </button>
          ) : (
            <Link
              href="/auth"
              onClick={onClose}
              className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl bg-[#fed488] text-[#261900] hover:bg-[#ffdea5] transition-colors font-bold"
            >
              <span className="material-symbols-outlined text-[20px]">login</span>
              <span className="text-[14px] font-bold tracking-[0.05em]">Ingresar / Registrarse</span>
            </Link>
          )}
        </nav>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-white/10">
          <p className="text-[10px] text-white/30 tracking-[0.1em] leading-relaxed">
            PLATAFORMA PRIVADA · DATOS PROTEGIDOS<br />
            © {new Date().getFullYear()} PUREMATCH · CHILE
          </p>
        </div>
      </aside>
    </>
  )
}
