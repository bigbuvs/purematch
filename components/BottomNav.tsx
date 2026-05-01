'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/explore',  icon: 'search',    label: 'Explorar' },
  { href: '/matches',  icon: 'handshake', label: 'Matches'  },
  { href: '/profile',  icon: 'person',    label: 'Perfil'   },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center bg-[#fcf9f8]/95 backdrop-blur-sm border-t border-[#c3c8c1]/60 shadow-[0_-4px_20px_rgba(6,27,14,0.06)] h-[72px] pb-safe">
      {navItems.map(({ href, icon, label }) => {
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
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
            >
              {icon}
            </span>
            {label.toUpperCase()}
          </Link>
        )
      })}
    </nav>
  )
}
