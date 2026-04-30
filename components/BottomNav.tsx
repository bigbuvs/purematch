'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/explore',  icon: 'search',     label: 'Explorar' },
  { href: '/matches',  icon: 'handshake',  label: 'Matches'  },
  { href: '/profile',  icon: 'person',     label: 'Perfil'   },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 w-full z-50 bg-surface border-t border-outline-variant pb-safe">
      <div className="flex h-[60px] max-w-[680px] mx-auto">
        {navItems.map(({ href, icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 transition-all ${active ? 'text-primary' : 'text-outline hover:text-on-surface-variant'}`}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              >
                {icon}
              </span>
              <span className={`font-label-caps text-[9px] tracking-[0.08em] uppercase ${active ? 'text-primary' : ''}`}>
                {label}
              </span>
              {active && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-primary rounded-b-full" />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
