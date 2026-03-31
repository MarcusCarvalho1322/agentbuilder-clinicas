'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Download, Copy, Check, FileText, Loader2 } from 'lucide-react'

interface Document { id: string; doc_type: string; title: string; content: string; created_at: string }
interface OnboardingDetail {
  id: string; token: string; clinic_name: string | null; client_name: string | null
  client_email: string | null; status: string; data: Record<string, unknown>
  created_at: string; generated_at: string | null
}

export default function AdminDetail() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [secret, setSecret] = useState('')
  const [authed, setAuthed] = useState(false)
  const [onboarding, setOnboarding] = useState<OnboardingDetail | null>(null)
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [activeDoc, setActiveDoc] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    const s = sessionStorage.getItem('admin_secret')
    if (s) { setSecret(s); load(s) }
    else setLoading(false)
  }, [])

  const load = async (s: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/onboardings/${id}`, {
        headers: { 'x-admin-secret': s }
      })
      if (res.status === 401) { setLoading(false); return }
      const data = await res.json()
      setOnboarding(data.onboarding)
      setDocs(data.documents)
      setAuthed(true)
      sessionStorage.setItem('admin_secret', s)
      if (data.documents.length) setActiveDoc(data.documents[0].id)
    } catch { /* silent */ }
    setLoading(false)
  }

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const download = (doc: Document) => {
    const blob = new Blob([doc.content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${doc.doc_type}_${onboarding?.clinic_name || 'agente'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadAll = () => {
    const full = docs.map(d =>
      `${'='.repeat(60)}\n${d.title.toUpperCase()}\nGerado em: ${new Date(d.created_at).toLocaleString('pt-BR')}\n${'='.repeat(60)}\n\n${d.content}`
    ).join('\n\n\n')
    const blob = new Blob([full], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `AgentBuilder_${onboarding?.clinic_name || 'clinica'}_completo.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!authed && !loading) {
    return (
      <div className="min-h-screen bg-brand-gray flex items-center justify-center px-4">
        <div className="card max-w-sm w-full space-y-4">
          <h2 className="font-bold text-brand-navy">🔐 Acesso Admin</h2>
          <input className="input" type="password" placeholder="Senha"
            value={secret} onChange={e => setSecret(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load(secret)} />
          <button onClick={() => load(secret)} className="btn-primary w-full justify-center">Entrar</button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-teal animate-spin" />
      </div>
    )
  }

  const activeDocument = docs.find(d => d.id === activeDoc)

  return (
    <div className="min-h-screen bg-brand-gray">
      <header className="bg-brand-navy text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin/dashboard')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="font-bold">{onboarding?.clinic_name || 'Detalhes do Onboarding'}</h1>
              <p className="text-xs text-blue-200">{onboarding?.client_email}</p>
            </div>
          </div>
          {docs.length > 0 && (
            <button onClick={downloadAll} className="btn-primary text-xs py-2 gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Baixar tudo
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {docs.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-brand-mid">
              {onboarding?.status === 'generating'
                ? 'Documentos sendo gerados...'
                : 'Nenhum documento gerado ainda.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Doc list */}
            <div className="space-y-2">
              {docs.map(doc => (
                <button key={doc.id}
                  onClick={() => setActiveDoc(doc.id)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                    activeDoc === doc.id
                      ? 'border-brand-teal bg-brand-lteal'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}>
                  <div className="text-xs font-bold text-brand-dark leading-snug">{doc.title}</div>
                  <div className="text-[10px] text-brand-mid mt-1">
                    {(doc.content.length / 1000).toFixed(1)}k caracteres
                  </div>
                </button>
              ))}
            </div>

            {/* Doc content */}
            {activeDocument && (
              <div className="lg:col-span-3 card">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                  <h2 className="font-bold text-brand-navy">{activeDocument.title}</h2>
                  <div className="flex gap-2">
                    <button onClick={() => copy(activeDocument.content, activeDocument.id)}
                      className="btn-secondary text-xs py-1.5 gap-1.5">
                      {copied === activeDocument.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied === activeDocument.id ? 'Copiado!' : 'Copiar'}
                    </button>
                    <button onClick={() => download(activeDocument)}
                      className="btn-primary text-xs py-1.5 gap-1.5">
                      <Download className="w-3 h-3" />
                      .txt
                    </button>
                  </div>
                </div>
                <pre className="text-xs text-brand-dark font-mono whitespace-pre-wrap leading-relaxed
                                bg-gray-50 rounded-xl p-4 max-h-[70vh] overflow-y-auto border border-gray-100">
                  {activeDocument.content}
                </pre>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
