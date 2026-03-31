'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, RefreshCw, ExternalLink, Clock, CheckCircle, AlertTriangle, Sparkles, FileText } from 'lucide-react'

interface Onboarding {
  id: string
  token: string
  client_name: string | null
  client_email: string | null
  clinic_name: string | null
  status: string
  current_step: number
  created_at: string
  updated_at: string
  completed_at: string | null
  generated_at: string | null
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  in_progress:  { label: 'Em andamento', color: 'badge-incomplete', icon: <Clock className="w-3 h-3" /> },
  completed:    { label: 'Concluído',    color: 'badge-incomplete', icon: <CheckCircle className="w-3 h-3" /> },
  generating:   { label: 'Gerando IA',  color: 'badge-incomplete', icon: <RefreshCw className="w-3 h-3 animate-spin" /> },
  generated:    { label: 'Gerado ✓',    color: 'badge-valid',      icon: <Sparkles className="w-3 h-3" /> },
  delivered:    { label: 'Entregue ✓',  color: 'badge-valid',      icon: <CheckCircle className="w-3 h-3" /> },
}

const STEPS_TOTAL = 9

export default function AdminDashboard() {
  const router = useRouter()
  const [secret, setSecret] = useState('')
  const [authed, setAuthed] = useState(false)
  const [onboardings, setOnboardings] = useState<Onboarding[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [creating, setCreating] = useState(false)
  const [newLink, setNewLink] = useState<string | null>(null)

  const fetchData = async (s: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/onboardings', {
        headers: { 'x-admin-secret': s }
      })
      if (res.status === 401) { setAuthed(false); return }
      const data = await res.json()
      setOnboardings(data)
      setAuthed(true)
    } catch { /* silent */ }
    setLoading(false)
  }

  const handleAuth = async () => { await fetchData(secret) }

  const handleCreate = async () => {
    setCreating(true)
    try {
      const res = await fetch('/api/admin/onboardings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ client_name: newName, client_email: newEmail })
      })
      const data = await res.json()
      setNewLink(data.link)
      await fetchData(secret)
    } catch { /* silent */ }
    setCreating(false)
  }

  const filtered = onboardings.filter(o =>
    !search || [o.clinic_name, o.client_name, o.client_email, o.token]
      .some(f => f?.toLowerCase().includes(search.toLowerCase()))
  )

  if (!authed) {
    return (
      <div className="min-h-screen bg-brand-gray flex items-center justify-center px-4">
        <div className="card max-w-sm w-full space-y-4">
          <div className="text-center">
            <div className="text-3xl mb-2">🔐</div>
            <h1 className="text-xl font-bold text-brand-navy">Painel Admin</h1>
            <p className="text-sm text-brand-mid">AgentBuilder.IA — BIZZ.IA</p>
          </div>
          <input className="input" type="password" placeholder="Senha de acesso"
            value={secret} onChange={e => setSecret(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAuth()} />
          <button onClick={handleAuth} className="btn-primary w-full justify-center">
            Entrar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-gray">
      {/* Header */}
      <header className="bg-brand-navy text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">♥ AgentBuilder.IA — Painel Admin</h1>
            <p className="text-xs text-blue-200">BIZZ.IA Intelligence Ecosystem</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => fetchData(secret)}
              className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg">
              <RefreshCw className="w-3 h-3" /> Atualizar
            </button>
            <button onClick={() => { setShowNew(true); setNewLink(null) }}
              className="btn-primary text-xs py-2">
              <Plus className="w-3.5 h-3.5" /> Novo Cliente
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: onboardings.length, color: 'text-brand-navy' },
            { label: 'Em andamento', value: onboardings.filter(o => o.status === 'in_progress').length, color: 'text-amber-600' },
            { label: 'Gerados', value: onboardings.filter(o => o.status === 'generated').length, color: 'text-brand-teal' },
            { label: 'Entregues', value: onboardings.filter(o => o.status === 'delivered').length, color: 'text-green-600' },
          ].map(s => (
            <div key={s.label} className="card text-center">
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-brand-mid mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* New client modal */}
        {showNew && (
          <div className="card border-brand-teal border-2 space-y-4">
            <h3 className="font-bold text-brand-navy">Criar novo onboarding</h3>
            {newLink ? (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-green-700 mb-1">✅ Link gerado com sucesso!</p>
                  <p className="text-xs text-green-600 mb-2">Envie este link para o cliente:</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-white border border-green-200 rounded-lg px-3 py-2 flex-1 break-all">
                      {newLink}
                    </code>
                    <button onClick={() => navigator.clipboard.writeText(newLink)}
                      className="btn-secondary text-xs py-2 flex-shrink-0">Copiar</button>
                  </div>
                </div>
                <p className="text-xs text-brand-mid">
                  O n8n também foi notificado para enviar o link por WhatsApp/email se configurado.
                </p>
                <button onClick={() => { setShowNew(false); setNewName(''); setNewEmail(''); setNewLink(null) }}
                  className="btn-ghost text-xs">Fechar</button>
              </div>
            ) : (
              <div className="space-y-3">
                <input className="input" placeholder="Nome do cliente / responsável"
                  value={newName} onChange={e => setNewName(e.target.value)} />
                <input className="input" type="email" placeholder="Email do cliente (opcional)"
                  value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                <div className="flex gap-2">
                  <button onClick={handleCreate} disabled={creating || !newName}
                    className="btn-primary text-sm">
                    {creating ? 'Criando...' : 'Gerar link de onboarding'}
                  </button>
                  <button onClick={() => setShowNew(false)} className="btn-ghost text-sm">Cancelar</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-mid" />
          <input className="input pl-10" placeholder="Buscar por clínica, cliente, email ou token..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Onboardings table */}
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-brand-navy text-white text-xs">
                  {['Clínica / Cliente', 'Status', 'Progresso', 'Criado em', 'Gerado em', 'Ações'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-brand-mid">
                    {loading ? 'Carregando...' : 'Nenhum onboarding encontrado'}
                  </td></tr>
                )}
                {filtered.map((o, i) => {
                  const cfg = STATUS_CONFIG[o.status] || STATUS_CONFIG.in_progress
                  return (
                    <tr key={o.id} className={`border-t border-gray-100 hover:bg-brand-gray/50 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-sm text-brand-dark">
                          {o.clinic_name || o.client_name || 'Sem nome'}
                        </div>
                        {o.client_email && <div className="text-xs text-brand-mid">{o.client_email}</div>}
                        <div className="text-[10px] text-gray-400 font-mono">{o.token.slice(0,8)}...</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`${cfg.color} flex items-center gap-1 w-fit`}>
                          {cfg.icon}{cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5 w-20">
                            <div className="bg-brand-teal h-1.5 rounded-full transition-all"
                              style={{ width: `${((o.current_step) / STEPS_TOTAL) * 100}%` }} />
                          </div>
                          <span className="text-xs text-brand-mid">{o.current_step}/{STEPS_TOTAL}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-brand-mid">
                        {new Date(o.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-xs text-brand-mid">
                        {o.generated_at ? new Date(o.generated_at).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => router.push(`/admin/dashboard/${o.id}`)}
                            className="flex items-center gap-1 text-xs text-brand-teal hover:text-brand-navy font-medium">
                            <FileText className="w-3.5 h-3.5" />
                            {o.status === 'generated' ? 'Ver docs' : 'Detalhes'}
                          </button>
                          <a href={`/onboarding/${o.token}`} target="_blank"
                            className="flex items-center gap-1 text-xs text-brand-mid hover:text-brand-navy">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
