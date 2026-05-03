'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { insforge } from '@/lib/insforge'
import { useAuth } from '@/context/AuthContext'

const ADMIN_EMAILS = ['a@a.com', 'contacto@purematch.cl']

type Tab = 'validaciones' | 'perfiles' | 'matches' | 'usuarios'
type ValidationStatus = 'pending' | 'approved' | 'rejected'
type MatchStatus = 'pending' | 'accepted' | 'rejected'

interface DocRow {
  id: string
  dog_id: string
  type: string
  file_url: string
  status: ValidationStatus
  uploaded_at: string
  dog: { id: string; name: string; breed: string; owner_id: string; verified: boolean } | null
  owner: { name: string; email: string } | null
}

interface DogRow {
  id: string
  owner_id: string
  name: string
  breed: string
  age: string
  sex: string
  pedigree_number: string | null
  zone: string | null
  verified: boolean
  score: number
  photos: string[]
  created_at: string
  owner: { name: string; email: string } | null
}

interface MatchRow {
  id: string
  dog_a_id: string
  dog_b_id: string
  status_a: MatchStatus
  status_b: MatchStatus
  contact_unlocked: boolean
  unlocked_at: string | null
  created_at: string
  dog_a: { name: string; breed: string } | null
  dog_b: { name: string; breed: string } | null
}

interface UserRow {
  id: string
  name: string
  email: string
  phone: string | null
  rut: string | null
  zone: string | null
  avatar_url: string | null
  created_at: string
}

interface AdminStats {
  users: number
  dogs: number
  verifiedDogs: number
  pendingDocs: number
  totalMatches: number
  unlockedMatches: number
}

const STATUS_BADGE: Record<ValidationStatus, { label: string; bg: string; text: string }> = {
  pending:  { label: 'PENDIENTE', bg: 'bg-[#fff8e1]', text: 'text-[#775a19]' },
  approved: { label: 'APROBADO',  bg: 'bg-[#e8f5e9]', text: 'text-[#1b5e20]' },
  rejected: { label: 'RECHAZADO', bg: 'bg-[#fce4ec]', text: 'text-[#ba1a1a]' },
}

const MATCH_STATUS_BADGE: Record<MatchStatus, { label: string; bg: string; text: string }> = {
  pending:  { label: 'PENDIENTE', bg: 'bg-[#fff8e1]', text: 'text-[#775a19]' },
  accepted: { label: 'ACEPTADO',  bg: 'bg-[#e8f5e9]', text: 'text-[#1b5e20]' },
  rejected: { label: 'RECHAZADO', bg: 'bg-[#fce4ec]', text: 'text-[#ba1a1a]' },
}

const TAB_CONFIG: { id: Tab; icon: string; label: string }[] = [
  { id: 'validaciones', icon: 'fact_check', label: 'Validaciones' },
  { id: 'perfiles',     icon: 'pets',       label: 'Perfiles' },
  { id: 'matches',      icon: 'favorite',   label: 'Matches' },
  { id: 'usuarios',     icon: 'people',     label: 'Usuarios' },
]

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('validaciones')
  const [stats, setStats] = useState<AdminStats>({ users: 0, dogs: 0, verifiedDogs: 0, pendingDocs: 0, totalMatches: 0, unlockedMatches: 0 })
  const [statsLoading, setStatsLoading] = useState(true)

  const loadStats = useCallback(async () => {
    setStatsLoading(true)
    const [{ data: usersData }, { data: dogsData }, { data: docsData }, { data: matchesData }] = await Promise.all([
      insforge.database.from('users').select('id'),
      insforge.database.from('dogs').select('id, verified'),
      insforge.database.from('documents').select('id, status'),
      insforge.database.from('matches').select('id, contact_unlocked'),
    ])
    setStats({
      users: usersData?.length ?? 0,
      dogs: dogsData?.length ?? 0,
      verifiedDogs: (dogsData as any[] ?? []).filter((d: any) => d.verified).length,
      pendingDocs: (docsData as any[] ?? []).filter((d: any) => d.status === 'pending').length,
      totalMatches: matchesData?.length ?? 0,
      unlockedMatches: (matchesData as any[] ?? []).filter((m: any) => m.contact_unlocked).length,
    })
    setStatsLoading(false)
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.replace('/auth'); return }
    if (!ADMIN_EMAILS.includes(user.email ?? '')) { router.replace('/explore'); return }
    loadStats()
  }, [user, authLoading])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#fcf9f8] flex items-center justify-center">
        <span className="material-symbols-outlined text-[#737973] animate-spin text-3xl">progress_activity</span>
      </div>
    )
  }

  const adminName = (user as any)?.profile?.name ?? user?.email ?? 'Admin'
  const adminInitial = adminName[0]?.toUpperCase() ?? 'A'

  return (
    <div className="bg-[#fcf9f8] text-[#1b1c1c] min-h-screen flex">
      {/* Sidebar — desktop only */}
      <aside className="hidden md:flex flex-col w-64 bg-[#f6f3f2] border-r border-[#e4e2e1] h-screen sticky top-0">
        <div className="px-6 py-6 border-b border-[#e4e2e1]">
          <h1 className="font-serif font-bold text-xl text-[#061b0e]">PureMatch</h1>
          <p className="text-[10px] font-bold tracking-[0.1em] text-[#737973] mt-1">PANEL DE ADMINISTRACIÓN</p>
        </div>
        <nav className="flex flex-col gap-1 p-4 flex-grow">
          {TAB_CONFIG.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left w-full transition-colors text-sm ${
                tab === t.id ? 'bg-[#061b0e] text-white' : 'text-[#737973] hover:bg-[#f0eded] hover:text-[#1b1c1c]'
              }`}
            >
              <span className="material-symbols-outlined text-base" style={tab === t.id ? { fontVariationSettings: "'FILL' 1" } : undefined}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-[#e4e2e1]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#061b0e] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              {adminInitial}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold tracking-[0.1em] text-[#1b1c1c]">Admin</p>
              <p className="text-[10px] text-[#737973] truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Mobile tab bar */}
        <div className="md:hidden flex border-b border-[#e4e2e1] bg-[#f6f3f2] overflow-x-auto">
          {TAB_CONFIG.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-[11px] font-bold tracking-[0.08em] whitespace-nowrap transition-colors flex-shrink-0 ${
                tab === t.id ? 'border-b-2 border-[#061b0e] text-[#061b0e]' : 'text-[#737973]'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">{t.icon}</span>
              {t.label.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div className="border-b border-[#e4e2e1] px-6 py-3 grid grid-cols-3 md:grid-cols-6 gap-4 bg-white">
          {([
            { label: 'USUARIOS',    value: stats.users,           color: 'text-[#061b0e]' },
            { label: 'PERFILES',    value: stats.dogs,            color: 'text-[#061b0e]' },
            { label: 'VERIFICADOS', value: stats.verifiedDogs,    color: 'text-[#1b5e20]' },
            { label: 'DOC. PEND.',  value: stats.pendingDocs,     color: stats.pendingDocs > 0 ? 'text-[#775a19]' : 'text-[#061b0e]' },
            { label: 'MATCHES',     value: stats.totalMatches,    color: 'text-[#061b0e]' },
            { label: 'DESBLOQ.',    value: stats.unlockedMatches, color: 'text-[#1b5e20]' },
          ] as { label: string; value: number; color: string }[]).map(s => (
            <div key={s.label} className="text-center">
              <p className={`text-xl font-bold font-serif ${s.color}`}>
                {statsLoading ? <span className="text-[#c3c8c1]">—</span> : s.value}
              </p>
              <p className="text-[9px] font-bold tracking-[0.1em] text-[#a0a5a0]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-grow overflow-auto">
          {tab === 'validaciones' && <ValidacionesTab onAction={loadStats} />}
          {tab === 'perfiles'     && <PerfilesTab onAction={loadStats} />}
          {tab === 'matches'      && <MatchesTab onAction={loadStats} />}
          {tab === 'usuarios'     && <UsuariosTab />}
        </div>
      </div>
    </div>
  )
}

// ─── VALIDACIONES TAB ────────────────────────────────────────────────────────

function ValidacionesTab({ onAction }: { onAction: () => void }) {
  const [docs, setDocs] = useState<DocRow[]>([])
  const [filter, setFilter] = useState<ValidationStatus | 'all'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchDocs = useCallback(async () => {
    setLoading(true)
    const { data: documents } = await insforge.database
      .from('documents')
      .select('*, dog:dogs(id, name, breed, owner_id, verified)')
      .order('uploaded_at', { ascending: false })

    if (!documents) { setLoading(false); return }

    const ownerIds = [...new Set((documents as any[]).map((d: any) => d.dog?.owner_id).filter(Boolean))]
    const { data: owners } = ownerIds.length > 0
      ? await insforge.database.from('users').select('id, name, email').in('id', ownerIds)
      : { data: [] }

    const ownerMap = Object.fromEntries((owners ?? []).map((o: any) => [o.id, o]))

    setDocs((documents as any[]).map((d: any) => ({
      id: d.id, dog_id: d.dog_id, type: d.type, file_url: d.file_url,
      status: d.status as ValidationStatus, uploaded_at: d.uploaded_at,
      dog: d.dog ?? null,
      owner: d.dog?.owner_id ? (ownerMap[d.dog.owner_id] ?? null) : null,
    })))
    setLoading(false)
  }, [])

  useEffect(() => { fetchDocs() }, [fetchDocs])

  const updateDocStatus = async (docId: string, status: ValidationStatus, dogId: string) => {
    setActionLoading(docId)
    await insforge.database.from('documents').update({ status, reviewed_at: new Date().toISOString() }).eq('id', docId)

    if (status === 'approved') {
      const { data: dogDocs } = await insforge.database.from('documents').select('type, status').eq('dog_id', dogId)
      const allApproved = ['pedigree', 'vaccines'].every(t =>
        (dogDocs as any[] ?? []).some((d: any) => d.type === t && d.status === 'approved')
      )
      if (allApproved) {
        await insforge.database.from('dogs').update({ verified: true, score: 80 }).eq('id', dogId)
      }
    }
    if (status === 'rejected') {
      await insforge.database.from('dogs').update({ verified: false }).eq('id', dogId)
    }

    setActionLoading(null)
    setExpanded(null)
    await fetchDocs()
    onAction()
  }

  const filtered = filter === 'all' ? docs : docs.filter(d => d.status === filter)

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-serif text-[#061b0e] text-lg font-semibold">Validación de Documentos</h2>
        <button onClick={fetchDocs} className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.08em] text-[#737973] hover:text-[#061b0e] transition-colors">
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          ACTUALIZAR
        </button>
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
            {f === 'all' ? 'TODOS' : STATUS_BADGE[f].label}
            {f !== 'all' && (
              <span className="ml-1.5 opacity-70">{docs.filter(d => d.status === f).length}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="material-symbols-outlined text-[#737973] animate-spin text-3xl">progress_activity</span>
        </div>
      ) : (
        <div className="bg-white border border-[#e4e2e1] rounded-xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <span className="material-symbols-outlined text-[#c3c8c1] text-4xl block mb-2">inbox</span>
              <p className="text-sm text-[#737973]">No hay documentos en esta categoría.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e4e2e1] bg-[#f6f3f2]">
                  <th className="px-4 py-3 text-left text-[10px] font-bold tracking-[0.1em] text-[#737973]">PERRO / TIPO</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold tracking-[0.1em] text-[#737973] hidden sm:table-cell">PROPIETARIO</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold tracking-[0.1em] text-[#737973] hidden md:table-cell">FECHA</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold tracking-[0.1em] text-[#737973]">ESTADO</th>
                  <th className="px-4 py-3 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4e2e1]">
                {filtered.map(doc => (
                  <>
                    <tr
                      key={doc.id}
                      className="hover:bg-[#f6f3f2] transition-colors cursor-pointer"
                      onClick={() => setExpanded(expanded === doc.id ? null : doc.id)}
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-[#1b1c1c]">{doc.dog?.name ?? '—'}</p>
                        <p className="text-[10px] text-[#737973] capitalize">{doc.type}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <p className="text-sm text-[#737973]">{doc.owner?.name ?? '—'}</p>
                        <p className="text-[10px] text-[#a0a5a0]">{doc.owner?.email ?? ''}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-xs text-[#737973]">{new Date(doc.uploaded_at).toLocaleDateString('es-CL')}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-[0.08em] ${STATUS_BADGE[doc.status].bg} ${STATUS_BADGE[doc.status].text}`}>
                          {STATUS_BADGE[doc.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="material-symbols-outlined text-[#a0a5a0] text-[18px]">
                          {expanded === doc.id ? 'expand_less' : 'expand_more'}
                        </span>
                      </td>
                    </tr>
                    {expanded === doc.id && (
                      <tr key={`${doc.id}-exp`}>
                        <td colSpan={5} className="bg-[#f0eded] px-5 py-4">
                          <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3 flex-wrap text-sm text-[#737973]">
                              <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e4e2e1] rounded-lg hover:border-[#061b0e] hover:text-[#061b0e] transition-colors text-[11px] font-bold tracking-[0.08em]"
                              >
                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                                VER DOCUMENTO
                              </a>
                              {doc.dog?.breed && <span className="text-[12px]">{doc.dog.breed}</span>}
                              {doc.dog?.verified && (
                                <span className="flex items-center gap-1 text-[11px] font-bold text-[#1b5e20]">
                                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                  Perfil verificado
                                </span>
                              )}
                            </div>
                            {doc.status === 'pending' && (
                              <div className="flex gap-3">
                                <button
                                  disabled={actionLoading === doc.id}
                                  onClick={() => updateDocStatus(doc.id, 'approved', doc.dog_id)}
                                  className="bg-[#1b5e20] text-white text-[11px] font-bold tracking-[0.08em] px-6 py-2 rounded-full hover:bg-[#2e7d32] transition-colors disabled:opacity-60 flex items-center gap-2"
                                >
                                  {actionLoading === doc.id
                                    ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                    : <span className="material-symbols-outlined text-sm">check</span>}
                                  APROBAR
                                </button>
                                <button
                                  disabled={actionLoading === doc.id}
                                  onClick={() => updateDocStatus(doc.id, 'rejected', doc.dog_id)}
                                  className="bg-[#ba1a1a] text-white text-[11px] font-bold tracking-[0.08em] px-6 py-2 rounded-full hover:bg-[#c62828] transition-colors disabled:opacity-60 flex items-center gap-2"
                                >
                                  <span className="material-symbols-outlined text-sm">close</span>
                                  RECHAZAR
                                </button>
                              </div>
                            )}
                            {doc.status !== 'pending' && (
                              <div className="flex gap-3">
                                <button
                                  disabled={actionLoading === doc.id}
                                  onClick={() => updateDocStatus(doc.id, 'pending', doc.dog_id)}
                                  className="bg-white text-[#737973] border border-[#e4e2e1] text-[11px] font-bold tracking-[0.08em] px-5 py-2 rounded-full hover:border-[#061b0e] hover:text-[#061b0e] transition-colors disabled:opacity-60 flex items-center gap-1.5"
                                >
                                  <span className="material-symbols-outlined text-sm">undo</span>
                                  RESTABLECER A PENDIENTE
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
      )}
    </div>
  )
}

// ─── PERFILES TAB ─────────────────────────────────────────────────────────────

function PerfilesTab({ onAction }: { onAction: () => void }) {
  const [dogs, setDogs] = useState<DogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [editScore, setEditScore] = useState<{ id: string; value: string } | null>(null)
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all')

  const fetchDogs = useCallback(async () => {
    setLoading(true)
    const { data } = await insforge.database
      .from('dogs')
      .select('*')
      .order('created_at', { ascending: false })

    if (!data) { setLoading(false); return }

    const ownerIds = [...new Set((data as any[]).map((d: any) => d.owner_id).filter(Boolean))]
    const { data: owners } = ownerIds.length > 0
      ? await insforge.database.from('users').select('id, name, email').in('id', ownerIds)
      : { data: [] }

    const ownerMap = Object.fromEntries((owners ?? []).map((o: any) => [o.id, o]))

    setDogs((data as any[]).map((d: any) => ({ ...d, owner: ownerMap[d.owner_id] ?? null })))
    setLoading(false)
  }, [])

  useEffect(() => { fetchDogs() }, [fetchDogs])

  const toggleVerified = async (dog: DogRow) => {
    setActionLoading(dog.id)
    const newVerified = !dog.verified
    await insforge.database
      .from('dogs')
      .update({ verified: newVerified, score: newVerified ? 80 : 0 })
      .eq('id', dog.id)
    setActionLoading(null)
    setExpanded(null)
    await fetchDogs()
    onAction()
  }

  const saveScore = async (dogId: string) => {
    if (!editScore) return
    const score = parseInt(editScore.value, 10)
    if (isNaN(score) || score < 0 || score > 100) return
    setActionLoading(dogId)
    await insforge.database.from('dogs').update({ score }).eq('id', dogId)
    setActionLoading(null)
    setEditScore(null)
    await fetchDogs()
  }

  const filtered = filterVerified === 'all' ? dogs
    : filterVerified === 'verified' ? dogs.filter(d => d.verified)
    : dogs.filter(d => !d.verified)

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-serif text-[#061b0e] text-lg font-semibold">Perfiles de Ejemplares</h2>
        <button onClick={fetchDogs} className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.08em] text-[#737973] hover:text-[#061b0e] transition-colors">
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          ACTUALIZAR
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {([
          { id: 'all',        label: 'TODOS' },
          { id: 'verified',   label: 'VERIFICADOS' },
          { id: 'unverified', label: 'SIN VERIFICAR' },
        ] as { id: 'all' | 'verified' | 'unverified'; label: string }[]).map(f => (
          <button
            key={f.id}
            onClick={() => setFilterVerified(f.id)}
            className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-[0.08em] border transition-colors ${
              filterVerified === f.id
                ? 'bg-[#061b0e] text-white border-[#061b0e]'
                : 'bg-transparent text-[#737973] border-[#e4e2e1] hover:border-[#061b0e] hover:text-[#061b0e]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="material-symbols-outlined text-[#737973] animate-spin text-3xl">progress_activity</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#e4e2e1] rounded-xl py-16 text-center">
          <span className="material-symbols-outlined text-[#c3c8c1] text-4xl block mb-2">pets</span>
          <p className="text-sm text-[#737973]">No hay perfiles en esta categoría.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#e4e2e1] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e4e2e1] bg-[#f6f3f2]">
                <th className="px-4 py-3 text-left text-[10px] font-bold tracking-[0.1em] text-[#737973]">EJEMPLAR</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold tracking-[0.1em] text-[#737973] hidden sm:table-cell">PROPIETARIO</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold tracking-[0.1em] text-[#737973] hidden lg:table-cell">PEDIGREE</th>
                <th className="px-4 py-3 text-center text-[10px] font-bold tracking-[0.1em] text-[#737973]">SCORE</th>
                <th className="px-4 py-3 text-center text-[10px] font-bold tracking-[0.1em] text-[#737973]">ESTADO</th>
                <th className="px-4 py-3 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4e2e1]">
              {filtered.map(dog => (
                <>
                  <tr
                    key={dog.id}
                    className="hover:bg-[#f6f3f2] transition-colors cursor-pointer"
                    onClick={() => setExpanded(expanded === dog.id ? null : dog.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-[#f0eded] flex-shrink-0">
                          {dog.photos?.[0]
                            ? <img src={dog.photos[0]} alt={dog.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-[#c3c8c1] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span></div>
                          }
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1b1c1c]">{dog.name}</p>
                          <p className="text-[10px] text-[#737973]">{dog.breed} · {dog.sex}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="text-sm text-[#737973]">{dog.owner?.name ?? '—'}</p>
                      <p className="text-[10px] text-[#a0a5a0]">{dog.owner?.email ?? ''}</p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-xs text-[#737973] font-mono">{dog.pedigree_number ?? <span className="text-[#c3c8c1]">—</span>}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {editScore?.id === dog.id ? (
                        <div className="flex items-center gap-1 justify-center" onClick={e => e.stopPropagation()}>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={editScore.value}
                            onChange={e => setEditScore({ id: dog.id, value: e.target.value })}
                            className="w-14 border border-[#c3c8c1] rounded-lg px-2 py-1 text-xs text-center focus:outline-none focus:border-[#061b0e]"
                          />
                          <button
                            onClick={() => saveScore(dog.id)}
                            disabled={actionLoading === dog.id}
                            className="text-[#1b5e20] hover:text-[#2e7d32] transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">check</span>
                          </button>
                          <button
                            onClick={() => setEditScore(null)}
                            className="text-[#737973] hover:text-[#ba1a1a] transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={e => { e.stopPropagation(); setEditScore({ id: dog.id, value: String(dog.score) }) }}
                          className="text-sm font-bold text-[#1b1c1c] hover:text-[#061b0e] transition-colors group flex items-center gap-1 mx-auto"
                          title="Editar score"
                        >
                          {dog.score}
                          <span className="material-symbols-outlined text-[#c3c8c1] group-hover:text-[#737973] text-[14px] opacity-0 group-hover:opacity-100 transition-opacity">edit</span>
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {dog.verified
                        ? <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-[#e8f5e9] text-[#1b5e20]">
                            <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                            VERIFICADO
                          </span>
                        : <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-[#f6f3f2] text-[#737973]">
                            PENDIENTE
                          </span>
                      }
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="material-symbols-outlined text-[#a0a5a0] text-[18px]">
                        {expanded === dog.id ? 'expand_less' : 'expand_more'}
                      </span>
                    </td>
                  </tr>
                  {expanded === dog.id && (
                    <tr key={`${dog.id}-exp`}>
                      <td colSpan={6} className="bg-[#f0eded] px-5 py-4">
                        <div className="flex flex-col gap-4">
                          {/* Photos row */}
                          {dog.photos?.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto pb-1">
                              {dog.photos.slice(0, 6).map((url, i) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                                  <img src={url} alt={`${dog.name} ${i + 1}`} className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-[#e4e2e1] hover:opacity-80 transition-opacity" />
                                </a>
                              ))}
                            </div>
                          )}
                          {/* Details */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <Detail label="Edad" value={dog.age} />
                            <Detail label="Zona" value={dog.zone ?? '—'} />
                            <Detail label="N.° Pedigree" value={dog.pedigree_number ?? '—'} />
                            <Detail label="Registrado" value={new Date(dog.created_at).toLocaleDateString('es-CL')} />
                          </div>
                          {/* Actions */}
                          <div className="flex gap-3 flex-wrap">
                            <button
                              disabled={actionLoading === dog.id}
                              onClick={() => toggleVerified(dog)}
                              className={`flex items-center gap-2 text-[11px] font-bold tracking-[0.08em] px-5 py-2 rounded-full transition-colors disabled:opacity-60 ${
                                dog.verified
                                  ? 'bg-[#fce4ec] text-[#ba1a1a] hover:bg-[#f8bbd0]'
                                  : 'bg-[#061b0e] text-white hover:bg-[#1b3022]'
                              }`}
                            >
                              {actionLoading === dog.id
                                ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                : <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{dog.verified ? 'cancel' : 'verified'}</span>}
                              {dog.verified ? 'REVOCAR VERIFICACIÓN' : 'VERIFICAR MANUALMENTE'}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── MATCHES TAB ──────────────────────────────────────────────────────────────

function MatchesTab({ onAction }: { onAction: () => void }) {
  const [matches, setMatches] = useState<MatchRow[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'mutual' | 'pending' | 'unlocked'>('all')

  const fetchMatches = useCallback(async () => {
    setLoading(true)
    const { data } = await insforge.database
      .from('matches')
      .select('*, dog_a:dogs!dog_a_id(name, breed), dog_b:dogs!dog_b_id(name, breed)')
      .order('created_at', { ascending: false })

    if (data) setMatches(data as any[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchMatches() }, [fetchMatches])

  const deleteMatch = async (matchId: string) => {
    if (!confirm('¿Eliminar este match permanentemente?')) return
    setActionLoading(matchId)
    await insforge.database.from('matches').delete().eq('id', matchId)
    setActionLoading(null)
    await fetchMatches()
    onAction()
  }

  const filtered = matches.filter(m => {
    if (filterStatus === 'all') return true
    if (filterStatus === 'mutual') return m.status_a === 'accepted' && m.status_b === 'accepted'
    if (filterStatus === 'pending') return m.status_a === 'pending' || m.status_b === 'pending'
    if (filterStatus === 'unlocked') return m.contact_unlocked
    return true
  })

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-serif text-[#061b0e] text-lg font-semibold">Matches</h2>
        <button onClick={fetchMatches} className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.08em] text-[#737973] hover:text-[#061b0e] transition-colors">
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          ACTUALIZAR
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {([
          { id: 'all',      label: 'TODOS' },
          { id: 'mutual',   label: 'MUTUOS' },
          { id: 'pending',  label: 'PENDIENTES' },
          { id: 'unlocked', label: 'DESBLOQUEADOS' },
        ] as { id: 'all' | 'mutual' | 'pending' | 'unlocked'; label: string }[]).map(f => (
          <button
            key={f.id}
            onClick={() => setFilterStatus(f.id)}
            className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-[0.08em] border transition-colors ${
              filterStatus === f.id
                ? 'bg-[#061b0e] text-white border-[#061b0e]'
                : 'bg-transparent text-[#737973] border-[#e4e2e1] hover:border-[#061b0e] hover:text-[#061b0e]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="material-symbols-outlined text-[#737973] animate-spin text-3xl">progress_activity</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#e4e2e1] rounded-xl py-16 text-center">
          <span className="material-symbols-outlined text-[#c3c8c1] text-4xl block mb-2">favorite_border</span>
          <p className="text-sm text-[#737973]">No hay matches en esta categoría.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#e4e2e1] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e4e2e1] bg-[#f6f3f2]">
                <th className="px-4 py-3 text-left text-[10px] font-bold tracking-[0.1em] text-[#737973]">EJEMPLARES</th>
                <th className="px-4 py-3 text-center text-[10px] font-bold tracking-[0.1em] text-[#737973] hidden sm:table-cell">ESTADO A</th>
                <th className="px-4 py-3 text-center text-[10px] font-bold tracking-[0.1em] text-[#737973] hidden sm:table-cell">ESTADO B</th>
                <th className="px-4 py-3 text-center text-[10px] font-bold tracking-[0.1em] text-[#737973]">CONTACTO</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold tracking-[0.1em] text-[#737973] hidden md:table-cell">FECHA</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4e2e1]">
              {filtered.map(m => (
                <tr key={m.id} className="hover:bg-[#f6f3f2] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-sm font-medium text-[#1b1c1c]">{m.dog_a?.name ?? '—'}</p>
                        <p className="text-[10px] text-[#737973]">{m.dog_a?.breed ?? ''}</p>
                      </div>
                      <span className="material-symbols-outlined text-[#fed488] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                      <div>
                        <p className="text-sm font-medium text-[#1b1c1c]">{m.dog_b?.name ?? '—'}</p>
                        <p className="text-[10px] text-[#737973]">{m.dog_b?.breed ?? ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${MATCH_STATUS_BADGE[m.status_a].bg} ${MATCH_STATUS_BADGE[m.status_a].text}`}>
                      {MATCH_STATUS_BADGE[m.status_a].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${MATCH_STATUS_BADGE[m.status_b].bg} ${MATCH_STATUS_BADGE[m.status_b].text}`}>
                      {MATCH_STATUS_BADGE[m.status_b].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {m.contact_unlocked
                      ? <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-[#e8f5e9] text-[#1b5e20]">
                          <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock_open</span>
                          DESBLOQ.
                        </span>
                      : <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-[#f6f3f2] text-[#a0a5a0]">
                          <span className="material-symbols-outlined text-[12px]">lock</span>
                          BLOQ.
                        </span>
                    }
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-xs text-[#737973]">{new Date(m.created_at).toLocaleDateString('es-CL')}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      disabled={actionLoading === m.id}
                      onClick={() => deleteMatch(m.id)}
                      className="text-[#c3c8c1] hover:text-[#ba1a1a] transition-colors"
                      title="Eliminar match"
                    >
                      {actionLoading === m.id
                        ? <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                        : <span className="material-symbols-outlined text-[18px]">delete</span>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── USUARIOS TAB ─────────────────────────────────────────────────────────────

function UsuariosTab() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [dogCounts, setDogCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const [{ data: usersData }, { data: dogsData }] = await Promise.all([
      insforge.database.from('users').select('*').order('created_at', { ascending: false }),
      insforge.database.from('dogs').select('owner_id'),
    ])

    if (usersData) setUsers(usersData as UserRow[])
    if (dogsData) {
      const counts: Record<string, number> = {}
      ;(dogsData as any[]).forEach((d: any) => { counts[d.owner_id] = (counts[d.owner_id] ?? 0) + 1 })
      setDogCounts(counts)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const filtered = search.trim()
    ? users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.zone ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : users

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-serif text-[#061b0e] text-lg font-semibold">Usuarios Registrados</h2>
        <button onClick={fetchUsers} className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.08em] text-[#737973] hover:text-[#061b0e] transition-colors">
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          ACTUALIZAR
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <span className="material-symbols-outlined text-[#a0a5a0] text-[18px] absolute left-3 top-1/2 -translate-y-1/2">search</span>
        <input
          type="text"
          placeholder="Buscar por nombre, email o zona..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-[#e4e2e1] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#1b1c1c] placeholder:text-[#a0a5a0] focus:outline-none focus:border-[#061b0e] transition-colors"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="material-symbols-outlined text-[#737973] animate-spin text-3xl">progress_activity</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#e4e2e1] rounded-xl py-16 text-center">
          <span className="material-symbols-outlined text-[#c3c8c1] text-4xl block mb-2">person_off</span>
          <p className="text-sm text-[#737973]">{search ? 'Sin resultados para esa búsqueda.' : 'No hay usuarios registrados.'}</p>
        </div>
      ) : (
        <div className="bg-white border border-[#e4e2e1] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e4e2e1] bg-[#f6f3f2]">
                <th className="px-4 py-3 text-left text-[10px] font-bold tracking-[0.1em] text-[#737973]">USUARIO</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold tracking-[0.1em] text-[#737973] hidden md:table-cell">TELÉFONO</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold tracking-[0.1em] text-[#737973] hidden lg:table-cell">ZONA</th>
                <th className="px-4 py-3 text-center text-[10px] font-bold tracking-[0.1em] text-[#737973]">PERFILES</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold tracking-[0.1em] text-[#737973] hidden md:table-cell">REGISTRO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4e2e1]">
              {filtered.map(u => {
                const initial = u.name?.[0]?.toUpperCase() ?? u.email[0].toUpperCase()
                return (
                  <tr key={u.id} className="hover:bg-[#f6f3f2] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-[#f0eded] flex-shrink-0 flex items-center justify-center border border-[#e4e2e1]">
                          {u.avatar_url
                            ? <img src={u.avatar_url} alt={u.name} className="w-full h-full object-cover" />
                            : <span className="font-bold text-sm text-[#737973]">{initial}</span>
                          }
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1b1c1c]">{u.name || <span className="text-[#a0a5a0]">Sin nombre</span>}</p>
                          <a href={`mailto:${u.email}`} className="text-[10px] text-[#737973] hover:text-[#061b0e] transition-colors">{u.email}</a>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {u.phone
                        ? <a href={`tel:${u.phone}`} className="text-sm text-[#737973] hover:text-[#061b0e] transition-colors">{u.phone}</a>
                        : <span className="text-sm text-[#c3c8c1]">—</span>}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-sm text-[#737973]">{u.zone ?? <span className="text-[#c3c8c1]">—</span>}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold ${
                        dogCounts[u.id] ? 'bg-[#e8f5e9] text-[#1b5e20]' : 'bg-[#f6f3f2] text-[#a0a5a0]'
                      }`}>
                        {dogCounts[u.id] ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-xs text-[#737973]">{new Date(u.created_at).toLocaleDateString('es-CL')}</p>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-[#e4e2e1] bg-[#f6f3f2]">
            <p className="text-[10px] text-[#a0a5a0]">{filtered.length} usuario{filtered.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold tracking-[0.1em] text-[#a0a5a0] mb-0.5">{label.toUpperCase()}</p>
      <p className="text-sm text-[#1b1c1c]">{value}</p>
    </div>
  )
}
