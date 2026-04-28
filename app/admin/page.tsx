'use client'
import { useState } from 'react'

type ValidationStatus = 'pending' | 'approved' | 'rejected'

interface Validation {
  id: string
  dogName: string
  breed: string
  owner: string
  submitted: string
  status: ValidationStatus
  docs: { label: string; ok: boolean }[]
}

const validations: Validation[] = [
  {
    id: '1',
    dogName: 'Arya von Westwood',
    breed: 'Border Collie',
    owner: 'Alejandro von West',
    submitted: '2024-03-12',
    status: 'pending',
    docs: [
      { label: 'KCC Certificate', ok: true },
      { label: 'Vaccine Card', ok: true },
      { label: 'Hip Dysplasia', ok: false },
    ],
  },
  {
    id: '2',
    dogName: 'Luna Imperiale',
    breed: 'Labrador',
    owner: 'Valentina Soto',
    submitted: '2024-03-10',
    status: 'approved',
    docs: [
      { label: 'KCC Certificate', ok: true },
      { label: 'Vaccine Card', ok: true },
      { label: 'Hip Dysplasia', ok: true },
    ],
  },
  {
    id: '3',
    dogName: 'Rex Imperator',
    breed: 'Rottweiler',
    owner: 'Miguel Torres',
    submitted: '2024-03-09',
    status: 'rejected',
    docs: [
      { label: 'KCC Certificate', ok: false },
      { label: 'Vaccine Card', ok: true },
      { label: 'Hip Dysplasia', ok: false },
    ],
  },
  {
    id: '4',
    dogName: 'Thor del Bosque',
    breed: 'Golden Retriever',
    owner: 'Camila Navarrete',
    submitted: '2024-03-08',
    status: 'pending',
    docs: [
      { label: 'KCC Certificate', ok: true },
      { label: 'Vaccine Card', ok: false },
    ],
  },
]

const stats = [
  { label: 'Total Perfiles', value: '142', icon: 'pets', color: 'text-primary' },
  { label: 'Pendientes', value: '18', icon: 'pending', color: 'text-[#775a19]' },
  { label: 'Verificados', value: '119', icon: 'verified', color: 'text-[#1b5e20]' },
  { label: 'Rechazados', value: '5', icon: 'cancel', color: 'text-error' },
]

const statusConfig: Record<ValidationStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'PENDIENTE', bg: 'bg-[#fff8e1]', text: 'text-[#775a19]' },
  approved: { label: 'APROBADO', bg: 'bg-[#e8f5e9]', text: 'text-[#1b5e20]' },
  rejected: { label: 'RECHAZADO', bg: 'bg-[#fce4ec]', text: 'text-error' },
}

export default function AdminPage() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState<ValidationStatus | 'all'>('all')
  const [localData, setLocalData] = useState(validations)

  const filtered = localData.filter(v => filter === 'all' || v.status === filter)

  const updateStatus = (id: string, status: ValidationStatus) => {
    setLocalData(prev => prev.map(v => v.id === id ? { ...v, status } : v))
    setExpanded(null)
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-surface-container-low border-r border-outline-variant h-screen sticky top-0">
        <div className="px-6 py-6 border-b border-outline-variant">
          <h1 className="font-serif font-bold text-xl text-primary tracking-widest uppercase">PureMatch</h1>
          <p className="font-label-caps text-[10px] text-outline mt-1">PANEL DE ADMINISTRACIÓN</p>
        </div>
        <nav className="flex flex-col gap-1 p-4 flex-grow">
          {[
            { icon: 'dashboard', label: 'Dashboard', active: false },
            { icon: 'fact_check', label: 'Validaciones', active: true },
            { icon: 'pets', label: 'Perfiles', active: false },
            { icon: 'people', label: 'Usuarios', active: false },
            { icon: 'payments', label: 'Pagos', active: false },
            { icon: 'analytics', label: 'Analíticas', active: false },
          ].map(item => (
            <button
              key={item.label}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left w-full transition-colors font-body-md text-sm ${
                item.active
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-outline-variant">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-caps text-sm">A</div>
            <div>
              <p className="font-label-caps text-[10px] text-on-surface">Admin</p>
              <p className="font-metadata text-[10px] text-outline">admin@purematch.cl</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-surface border-b border-outline-variant px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="font-headline-sm text-primary text-lg font-semibold">Validaciones de Perfiles</h2>
          <div className="flex items-center gap-2">
            <span className="font-metadata text-xs text-outline">{new Date().toLocaleDateString('es-CL')}</span>
            <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-caps text-sm">A</div>
          </div>
        </header>

        <main className="p-6 flex flex-col gap-6">
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(s => (
              <div key={s.label} className="bg-surface-container-low border border-outline-variant rounded-xl p-5 flex flex-col gap-2">
                <span className={`material-symbols-outlined ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                <p className={`font-headline-sm text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="font-label-caps text-[10px] text-outline">{s.label.toUpperCase()}</p>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full font-label-caps text-label-caps border transition-colors ${
                  filter === f
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-transparent text-outline border-outline-variant hover:border-primary hover:text-primary'
                }`}
              >
                {f === 'all' ? 'TODOS' : statusConfig[f].label}
              </button>
            ))}
          </div>

          {/* Validation table */}
          <div className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container">
                  <th className="px-4 py-3 text-left font-label-caps text-[10px] text-outline">PERRO</th>
                  <th className="px-4 py-3 text-left font-label-caps text-[10px] text-outline hidden sm:table-cell">PROPIETARIO</th>
                  <th className="px-4 py-3 text-left font-label-caps text-[10px] text-outline hidden md:table-cell">ENVIADO</th>
                  <th className="px-4 py-3 text-left font-label-caps text-[10px] text-outline">ESTADO</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filtered.map(v => (
                  <>
                    <tr
                      key={v.id}
                      className="hover:bg-surface-container transition-colors cursor-pointer"
                      onClick={() => setExpanded(expanded === v.id ? null : v.id)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-body-md text-sm text-on-surface font-medium">{v.dogName}</p>
                        <p className="font-metadata text-[10px] text-outline">{v.breed}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <p className="font-body-md text-sm text-on-surface-variant">{v.owner}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="font-metadata text-xs text-outline">{v.submitted}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full font-label-caps text-[10px] ${statusConfig[v.status].bg} ${statusConfig[v.status].text}`}>
                          {statusConfig[v.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="material-symbols-outlined text-outline text-sm">
                          {expanded === v.id ? 'expand_less' : 'expand_more'}
                        </span>
                      </td>
                    </tr>
                    {expanded === v.id && (
                      <tr key={`${v.id}-expanded`}>
                        <td colSpan={5} className="bg-surface-container px-6 py-4">
                          <div className="flex flex-col gap-4">
                            <div>
                              <p className="font-label-caps text-[10px] text-outline mb-2">DOCUMENTOS ENVIADOS</p>
                              <div className="flex flex-wrap gap-2">
                                {v.docs.map(doc => (
                                  <div
                                    key={doc.label}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-metadata ${
                                      doc.ok
                                        ? 'border-[#a5d6a7] bg-[#e8f5e9] text-[#1b5e20]'
                                        : 'border-[#ef9a9a] bg-[#fce4ec] text-error'
                                    }`}
                                  >
                                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                                      {doc.ok ? 'check_circle' : 'cancel'}
                                    </span>
                                    {doc.label}
                                  </div>
                                ))}
                              </div>
                            </div>
                            {v.status === 'pending' && (
                              <div className="flex gap-3">
                                <button
                                  onClick={() => updateStatus(v.id, 'approved')}
                                  className="bg-[#1b5e20] text-white font-label-caps text-label-caps px-6 py-2 hover:bg-[#2e7d32] transition-colors"
                                >
                                  APROBAR
                                </button>
                                <button
                                  onClick={() => updateStatus(v.id, 'rejected')}
                                  className="bg-error text-white font-label-caps text-label-caps px-6 py-2 hover:bg-error/80 transition-colors"
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
          </div>
        </main>
      </div>
    </div>
  )
}
