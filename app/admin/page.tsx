'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { insforge } from '@/lib/insforge'
import { useAuth } from '@/context/AuthContext'

type ValidationStatus = 'pending' | 'approved' | 'rejected'

interface DocRow {
  id: string
  dog_id: string
  type: string
  file_url: string
  status: ValidationStatus
  uploaded_at: string
  dog: {
    id: string
    name: string
    breed: string
    owner_id: string
    verified: boolean
  }
  owner: {
    name: string
    email: string
  } | null
}

interface Stats {
  total: number
  pending: number
  verified: number
  rejected: number
}

const STATUS_CONFIG: Record<ValidationStatus, { label: string; bg: string; text: string }> = {
  pending:  { label: 'PENDIENTE', bg: 'bg-[#fff8e1]', text: 'text-[#775a19]' },
  approved: { label: 'APROBADO',  bg: 'bg-[#e8f5e9]', text: 'text-[#1b5e20]' },
  rejected: { label: 'RECHAZADO', bg: 'bg-[#fce4ec]', text: 'text-[#ba1a1a]' },
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [docs, setDocs] = useState<DocRow[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, verified: 0, rejected: 0 })
  const [filter, setFilter] = useState<ValidationStatus | 'all'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const ADMIN_EMAILS = ['a@a.com']

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.replace('/auth'); return }
    if (!ADMIN_EMAILS.includes(user.email ?? '')) { router.replace('/explore'); return }
    fetchData()
  }, [user, authLoading])

  const fetchData = async () => {
    setLoading(true)

    const [{ data: documents }, { data: dogsData }] = await Promise.all([
      insforge.database.from('documents').select('*, dog:dogs(id, name, breed, owner_id, verified)').order('uploaded_at', { ascending: false }),
      insforge.database.from('dogs').select('id, verified'),
    ])

    if (!documents) { setLoading(false); return }

    const ownerIds = [...new Set((documents as any[]).map((d: any) => d.dog?.owner_id).filter(Boolean))]
    const { data: owners } = ownerIds.length > 0
      ? await insforge.database.from('users').select('id, name, email').in('id', ownerIds)
      : { data: [] }

    const ownerMap = Object.fromEntries((owners ?? []).map((o: { id: string; name: string; email: string }) => [o.id, o]))

    const rows: DocRow[] = (documents as any[]).map((d: any) => ({
      id: d.id,
      dog_id: d.dog_id,
      type: d.type,
      file_url: d.file_url,
      status: d.status as ValidationStatus,
      uploaded_at: d.uploaded_at,
      dog: d.dog,
      owner: d.dog?.owner_id ? (ownerMap[d.dog.owner_id] ?? null) : null,
    }))

    setDocs(rows)

    const dogs = dogsData ?? []
    setStats({
      total: dogs.length,
      pending: rows.filter(r => r.status === 'pending').length,
      verified: dogs.filter((d: { id: string; verified: boolean }) => d.verified).length,
      rejected: rows.filter(r => r.status === 'rejected').length,
    })

    setLoading(false)
  }

  const updateDocStatus = async (docId: string, status: ValidationStatus, dogId: string) => {
    setActionLoading(docId)

    await insforge.database.from('documents').update({ status, reviewed_at: new Date().toISOString() }).eq('id', docId)

    if (status === 'approved') {
      const { data: dogDocs } = await insforge.database
        .from('documents')
        .select('type, status')
        .eq('dog_id', dogId)

      const required = ['pedigree', 'vaccines']
      const allApproved = required.every(t => dogDocs?.some(d => d.type === t && d.status === 'approved'))
      if (allApproved) {
        await insforge.database.from('dogs').update({ verified: true, score: 80 }).eq('id', dogId)
      }
    }

    if (status === 'rejected') {
      await insforge.database.from('dogs').update({ verified: false }).eq('id', dogId)
    }

    setActionLoading(null)
    setExpanded(null)
    await fetchData()
  }

  const filtered = filter === 'all' ? docs : docs.filter(d => d.status === filter)

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#fcf9f8] flex items-center justify-center">
        <span className="material-symbols-outlined text-[#737973] animate-spin text-3xl">progress_activity</span>
      </div>
    )
  }

  return (
    <div className="bg-[#fcf9f8] text-[#1b1c1c] min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#f6f3f2] border-r border-[#e4e2e1] h-screen sticky top-0">
        <div className="px-6 py-6 border-b border-[#e4e2e1]">
          <h1 className="font-serif font-bold text-xl text-[#061b0e] tracking-widest uppercase">PureMatch</h1>
          <p className="text-[10px] font-bold tracking-[0.1em] text-[#737973] mt-1">PANEL DE ADMINISTRACIÓN</p>
        </div>
        <nav className="flex flex-col gap-1 p-4 flex-grow">
          {[
            { icon: 'fact_check', label: 'Validaciones', active: true },
            { icon: 'pets',       label: 'Perfiles',     active: false },
            { icon: 'people',     label: 'Usuarios',     active: false },
            { icon: 'analytics',  label: 'Analíticas',   active: false },
          ].map(item => (
            <button
              key={item.label}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left w-full transition-colors text-sm ${
                item.active ? 'bg-[#061b0e] text-white' : 'text-[#737973] hover:bg-[#f0eded] hover:text-[#1b1c1c]'
              }`}
            >
              <span className="material-symbols-outlined text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-[#e4e2e1]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#061b0e] text-white flex items-center justify-center text-sm font-bold">A</div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.1em] text-[#1b1c1c]">Admin</p>
              <p className="text-[10px] text-[#737973] truncate max-w-[130px]">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-grow flex flex-col min-w-0">
        <header className="bg-[#fcf9f8] border-b border-[#e4e2e1] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="font-serif text-[#061b0e] text-lg font-semibold">Validaciones de Documentos</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#737973]">{new Date().toLocaleDateString('es-CL')}</span>
            <button onClick={fetchData} className="text-[#737973] hover:text-[#061b0e] transition-colors" title="Actualizar">
              <span className="material-symbols-outlined text-base">refresh</span>
            </button>
          </div>
        </header>

        <main className="p-6 flex flex-col gap-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Perfiles',  value: stats.total,    icon: 'pets',    color: 'text-[#061b0e]' },
              { label: 'Docs Pendientes', value: stats.pending,  icon: 'pending', color: 'text-[#775a19]' },
              { label: 'Verificados',     value: stats.verified, icon: 'verified',color: 'text-[#1b5e20]' },
              { label: 'Rechazados',      value: stats.rejected, icon: 'cancel',  color: 'text-[#ba1a1a]' },
            ].map(s => (
              <div key={s.label} className="bg-[#f6f3f2] border border-[#e4e2e1] rounded-xl p-5 flex flex-col gap-2">
                <span className={`material-symbols-outlined ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                <p className={`text-2xl font-bold font-serif ${s.color}`}>{s.value}</p>
                <p className="text-[10px] font-bold tracking-[0.1em] text-[#737973]">{s.label.toUpperCase()}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-[0.08em] border transition-colors ${
                  filter === f
                    ? 'bg-[#061b0e] text-white border-[#061b0e]'
                    : 'bg-transparent text-[#737973] border-[#e4e2e1] hover:border-[#061b0e] hover:text-[#061b0e]'
                }`}
              >
                {f === 'all' ? 'TODOS' : STATUS_CONFIG[f].label}
            </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-[#f6f3f2] border border-[#e4e2e1] rounded-xl overflow-hidden">
            {filtered.length === 0 ? (
              <div className="py-12 text-center">
                <span className="material-symbols-outlined text-[#737973] text-3xl block mb-2">inbox</span>
                <p className="text-sm text-[#737973]">No hay documentos en esta categoría.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e4e2e1] bg-[#f0eded]">
                    <th className="px-4 py-3 text-left text-[10px] font-bold tracking-[0.1em] text-[#737973]">PERRO / TIPO</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold tracking-[0.1em] text-[#737973] hidden sm:table-cell">PROPIETARIO</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold tracking-[0.1em] text-[#737973] hidden md:table-cell">ENVIADO</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold tracking-[0.1em] text-[#737973]">ESTADO</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4e2e1]">
                  {filtered.map(doc => (
                    <>
                      <tr
                        key={doc.id}
                        className="hover:bg-[#f0eded] transition-colors cursor-pointer"
                        onClick={() => setExpanded(expanded === doc.id ? null : doc.id)}
                      >
                        <td className="px-4 py-3">
                          <p className="text-sm text-[#1b1c1c] font-medium">{doc.dog?.name ?? '—'}</p>
                          <p className="text-[10px] text-[#737973] capitalize">{doc.type}</p>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <p className="text-sm text-[#737973]">{doc.owner?.name ?? '—'}</p>
                          <p className="text-[10px] text-[#737973]">{doc.owner?.email ?? ''}</p>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="text-xs text-[#737973]">
                            {new Date(doc.uploaded_at).toLocaleDateString('es-CL')}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-[0.08em] ${STATUS_CONFIG[doc.status].bg} ${STATUS_CONFIG[doc.status].text}`}>
                            {STATUS_CONFIG[doc.status].label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="material-symbols-outlined text-[#737973] text-sm">
                            {expanded === doc.id ? 'expand_less' : 'expand_more'}
                          </span>
                        </td>
                      </tr>
                      {expanded === doc.id && (
                        <tr key={`${doc.id}-expanded`}>
                          <td colSpan={5} className="bg-[#f0eded] px-6 py-4">
                            <div className="flex flex-col gap-4">
                              <div className="flex items-center gap-3">
                                <a
                                  href={doc.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-4 py-2 border border-[#e4e2e1] rounded-lg hover:border-[#061b0e] hover:text-[#061b0e] transition-colors text-[10px] font-bold tracking-[0.08em] text-[#737973]"
                                >
                                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                                  VER DOCUMENTO
                                </a>
                                <span className="text-[10px] text-[#737973]">{doc.dog?.breed}</span>
                              </div>
                              {doc.status === 'pending' && (
                                <div className="flex gap-3">
                                  <button
                                    disabled={actionLoading === doc.id}
                                    onClick={() => updateDocStatus(doc.id, 'approved', doc.dog_id)}
                                    className="bg-[#1b5e20] text-white text-[11px] font-bold tracking-[0.08em] px-6 py-2 rounded-full hover:bg-[#2e7d32] transition-colors disabled:opacity-60 flex items-center gap-2"
                                  >
                                    {actionLoading === doc.id && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                                    APROBAR
                                  </button>
                                  <button
                                    disabled={actionLoading === doc.id}
                                    onClick={() => updateDocStatus(doc.id, 'rejected', doc.dog_id)}
                                    className="bg-[#ba1a1a] text-white text-[11px] font-bold tracking-[0.08em] px-6 py-2 rounded-full hover:bg-[#c62828] transition-colors disabled:opacity-60"
                                  >
                                    RECHAZAR
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
