import type { Metadata } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://purematch-app.vercel.app'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  try {
    // Fetch dog data server-side for OG tags
    const res = await fetch(`${APP_URL}/api/dog-meta?id=${id}`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const dog = await res.json()
      const title = `${dog.name} · ${dog.breed} — PureMatch`
      const desc = `${dog.sex ?? ''} · ${dog.age ?? ''} · ${dog.zone ?? 'Chile'}. Perfil verificado en PureMatch.`.trim()
      const image = dog.photo ?? null
      return {
        title,
        description: desc,
        ...(image ? {
          openGraph: { title, description: desc, images: [{ url: image, width: 600, height: 600 }], type: 'profile' },
          twitter: { card: 'summary_large_image', title, description: desc, images: [image] },
        } : {
          openGraph: { title, description: desc, type: 'profile' },
        }),
      }
    }
  } catch {}
  return {
    title: 'Perfil de ejemplar — PureMatch',
    openGraph: { title: 'Perfil de ejemplar — PureMatch' },
  }
}

export default function DogLayout({ children }: { children: React.ReactNode }) {
  return children
}
