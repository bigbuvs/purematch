import Link from 'next/link'

interface TopBarProps {
  showBack?: boolean
  title?: string
}

export default function TopBar({ showBack = false, title = 'PureMatch' }: TopBarProps) {
  return (
    <header className="bg-[#FDFCF9] border-b border-[#E5E2D9] flex justify-between items-center px-6 py-4 w-full sticky top-0 z-50">
      {showBack ? (
        <Link href="javascript:history.back()" className="material-symbols-outlined text-[#1B3022] p-2 -ml-2 rounded-full hover:bg-stone-100 transition-colors">
          arrow_back
        </Link>
      ) : (
        <button className="material-symbols-outlined text-[#1B3022] p-2 -ml-2 rounded-full hover:bg-stone-100 transition-colors">
          menu
        </button>
      )}
      <h1 className="text-xl font-serif font-black text-[#1B3022] tracking-tight">{title}</h1>
      <div className="w-8 h-8 rounded-full overflow-hidden border border-[#E5E2D9]">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuApuPGGUYlX87qphBbjM12s6TMgO_-kXPn02xrl_F7mDGhiCXCgqov-8Q70q6kaY9JgQOzk3iq-XSaj_lGdaYrQhpT7NsUmGhNogrNvY6q1tq9OX7wGGPeQ75nsGZZy78AE9T7DLJFPrCyX5mJdVUYyxon1ItGN2XvNzLleRp-tycTfnRUFLPH-XpSpAseGpm8KO0TyItbw2X9yS735A7PKFp3ODG1JQtO-Foab8BHzxZGuuePLVyv67byPrxt7GgL-FiW5ysBZc-1C"
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </div>
    </header>
  )
}
