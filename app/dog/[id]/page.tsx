import Link from 'next/link'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'

const dogData = {
  name: 'Arya von Westwood',
  breed: 'Border Collie',
  age: '2 años',
  sex: 'Hembra',
  zone: 'Providencia, Región Metropolitana',
  verified: true,
  pedigree: 'KCC-2024-BC-00892',
  score: 98,
  img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCjiZpgrUlAFjaer3vHMMWgzNkg3MezFwu5DwaWxZsP1wyw2E-ukXtQW3ZAjLJDCYKpSfV2m_fZFcYFBWhy2Z5a3aDzmRQe-r5m870zQ6mlpYI0GI1DN0gcc9tckmPjZZwE7GNeObslycCM67qayPqyan4GEvYgKI_zDuOMKXJ8qIqLp7GlQqpLpjftSuwLtMjv6ixhz8UuaYBFzcMblJIwlnMvOYW3zfjvaYnHsoxBKqgGY_S7AtH1tmym1KyDnks5UEIa-1E1j4P',
  docs: [
    { label: 'Certificado KCC', status: 'verified' },
    { label: 'Cartilla Vacunas', status: 'verified' },
    { label: 'Prueba Displasia', status: 'pending' },
  ],
  gallery: [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA3__Q0ufMoiHHoD02iIxQDRsx7Qxt1dT8I0otM87enCrU97qiYA0pQfWYz5V2S65nznkt7j4pvn3JZtNF-R3MmS0lk9OaRwZEG2WwlTgA4-mrLJTHF1olArxWkXNnZIp4QRvCrtERfAkfxZu6-Mc932U8U_okSKc4MPV4xLTx2DiK2BFrHkQHtKr6DOxfgUCvDi6x2wkNusa145B7eMCGgE1TFUCMQC6bVSsKUZAJm2r_kGeOw-pWrBvyD9j7tTca1fiFdbHwgy8X0',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuApuPGGUYlX87qphBbjM12s6TMgO_-kXPn02xrl_F7mDGhiCXCgqov-8Q70q6kaY9JgQOzk3iq-XSaj_lGdaYrQhpT7NsUmGhNogrNvY6q1tq9OX7wGGPeQ75nsGZZy78AE9T7DLJFPrCyX5mJdVUYyxon1ItGN2XvNzLleRp-tycTfnRUFLPH-XpSpAseGpm8KO0TyItbw2X9yS735A7PKFp3ODG1JQtO-Foab8BHzxZGuuePLVyv67byPrxt7GgL-FiW5ysBZc-1C',
  ],
}

export default function DogProfilePage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <TopBar showBack title="Perfil" />

      <main className="flex-grow pb-[100px] max-w-[680px] mx-auto w-full">
        {/* Hero image */}
        <div className="w-full aspect-[4/5] sm:aspect-video relative">
          <img src={dogData.img} alt={dogData.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-display-lg text-white text-2xl font-bold">{dogData.name}</h1>
              {dogData.verified && (
                <span className="material-symbols-outlined text-[#fed488] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              )}
            </div>
            <p className="text-white/80 text-sm">{dogData.breed} · {dogData.age} · {dogData.sex}</p>
          </div>
          {/* Score badge */}
          <div className="absolute top-4 right-4 bg-[#fed488] text-[#261900] font-label-caps text-label-caps px-3 py-1 rounded-full flex items-center gap-1">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            {dogData.score}
          </div>
        </div>

        <div className="px-4 py-6 flex flex-col gap-6">
          {/* Info row */}
          <div className="flex items-center gap-2 text-outline">
            <span className="material-symbols-outlined text-sm">location_on</span>
            <span className="font-metadata text-xs">{dogData.zone}</span>
          </div>

          {/* Pedigree */}
          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-[#775a19]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            <div>
              <p className="font-label-caps text-label-caps text-on-surface-variant">Nº PEDIGREE KCC</p>
              <p className="font-body-md text-body-md text-primary font-semibold">{dogData.pedigree}</p>
            </div>
          </div>

          {/* Documents */}
          <div>
            <h2 className="font-headline-sm text-headline-sm text-primary text-base mb-3">Documentación</h2>
            <div className="flex flex-col gap-2">
              {dogData.docs.map(doc => (
                <div key={doc.label} className="flex items-center justify-between bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3">
                  <span className="font-body-md text-body-md text-on-surface">{doc.label}</span>
                  {doc.status === 'verified' ? (
                    <span className="material-symbols-outlined text-[#1b5e20]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  ) : (
                    <span className="material-symbols-outlined text-[#775a19]" style={{ fontVariationSettings: "'FILL' 1" }}>pending</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Gallery */}
          <div>
            <h2 className="font-headline-sm text-headline-sm text-primary text-base mb-3">Galería</h2>
            <div className="grid grid-cols-3 gap-2">
              {dogData.gallery.map((url, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
              <div className="aspect-square rounded-lg bg-surface-container-low border border-outline-variant flex items-center justify-center">
                <span className="material-symbols-outlined text-outline-variant text-3xl">add_photo_alternate</span>
              </div>
            </div>
          </div>

          {/* Locked contact */}
          <div className="bg-surface-container border border-outline-variant rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-outline" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
              <p className="font-label-caps text-label-caps text-on-surface-variant">CONTACTO BLOQUEADO</p>
            </div>
            <p className="font-metadata text-xs text-outline leading-relaxed">Desbloquea el contacto del criador por $9.990 CLP después de un match mutuo.</p>
            <Link href="/unlock" className="w-full bg-primary text-on-primary font-label-caps text-label-caps py-4 text-center block hover:bg-primary-container transition-colors">
              SOLICITAR MATCH
            </Link>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
