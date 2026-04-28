'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/explore', icon: 'search', label: 'Explore' },
  { href: '/onboarding/user', icon: 'add_circle', label: 'Onboard' },
  { href: '/matches', icon: 'handshake', label: 'Matches' },
  { href: '/profile', icon: 'person', label: 'Profile' },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center bg-[#FDFCF9] border-t border-[#E5E2D9] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] h-[72px] pb-safe">
      {navItems.map(({ href, icon, label }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center pt-2 w-full h-full transition-all font-serif text-[10px] font-semibold uppercase tracking-widest gap-1 border-t-2 ${
              active
                ? 'text-[#1B3022] border-[#1B3022]'
                : 'text-stone-400 border-transparent hover:text-[#1B3022]'
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
            >
              {icon}
            </span>
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
