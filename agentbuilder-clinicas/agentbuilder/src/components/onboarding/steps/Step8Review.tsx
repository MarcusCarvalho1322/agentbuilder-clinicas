'use client'

import { useState } from 'react'
import { CheckCircle, AlertTriangle, XCircle, Circle, Loader2, Sparkles } from 'lucide-react'

interface Props {
  formData: Record<string, unknown>
  token: string
  onGenerate: () => void
}

interface SectionStatus {
  label: string
  key: string
  required: boolean
  check: (data: Record<string, unknown>) => { state: 'valid' | 'incomplete' | 'error' | 'optional'; issues: string[] }
}

const SECTIONS: SectionStatus[] = [
  {
    label: 'Perfil da Clínica',
    key: 'profile',
    required: true,
    check: (data) => {
      const p = data.profile as Record<string, unknown> | undefined
      if (!p || p.uses_convenios === null || p.has_multiple_professionals === null || !p.clinic_type) {
        return { state: 'incomplete', issues: ['Todas as 3 perguntas de perfil devem ser respondidas'] }
      }
      return { state: 'valid', issues: [] }
    }
  },
  {
    label: 'Identidade da Clínica',
    key: 'identity',
    required: true,
    check: (data) => {
      const d = data.identity as Record<string, unknown> | undefined
      const issues: string[] = []
      if (!d?.clinic_name) issues.push('Nome da clínica obrigatório')
      if (!d?.address) issues.push('Endereço obrigatório')
      if (!d?.operating_hours) issues.push('Horário de funcionamento obrigatório')
      if (!d?.patient_whatsapp) issues.push('WhatsApp de atendimento obrigatório')
      if (!d?.reception_whatsapp) issues.push('WhatsApp interno da recepção obrigatório')
      if (!d?.agent_persona_name) issues.push('Nome do agente virtual obrigatório')
      return { state: issues.length ? 'incomplete' : 'valid', issues }
    }
  },
  {
    label: 'Convênios / Planos de Saúde',
    key: 'convenios',
    required: true,
    check: (data) => {
      const d = data.convenios as Record<string, unknown> | undefined
      if (!d?.list && !d?.uploads_summary) {
        return {
          state: 'incomplete',
          issues: ['Informe os convênios aceitos ou escreva "Somente particular"']
        }
      }
      return { state: 'valid', issues: [] }
    }
  },
  {
    label: 'Profissionais',
    key: 'professionals',
    required: true,
    check: (data) => {
      const profs = data.professionals as Record<string, unknown>[] | undefined
      if (!profs || profs.length === 0) {
        return { state: 'incomplete', issues: ['Adicione pelo menos um profissional'] }
      }
      const issues: string[] = []
      profs.forEach((p, i) => {
        if (!p.name) issues.push(`Profissional ${i + 1}: nome obrigatório`)
        if (!p.specialty) issues.push(`Profissional ${i + 1}: especialidade obrigatória`)
        if (!p.age_range) issues.push(`Profissional ${i + 1}: faixa etária obrigatória`)
        if (!p.price_pix) issues.push(`Profissional ${i + 1}: valor PIX obrigatório`)
        if (!p.convenios_rule) issues.push(`Profissional ${i + 1}: regra de convênios obrigatória`)
      })
      return { state: issues.length ? 'incomplete' : 'valid', issues }
    }
  },
  {
    label: 'Exames e Procedimentos',
    key: 'exams',
    required: false,
    check: (data) => {
      const d = data.exams as Record<string, unknown> | undefined
      if (!d || (!d.has_lab && !d.has_imaging && !d.procedures)) {
        return { state: 'optional', issues: ['Nenhum exame ou procedimento informado — ok se não aplicável'] }
      }
      return { state: 'valid', issues: [] }
    }
  },
  {
    label: 'Regras de Pagamento',
    key: 'payment',
    required: true,
    check: (data) => {
      const d = data.payment as Record<string, unknown> | undefined
      if (!d?.installment_table && !d?.accepted_methods) {
        return { state: 'incomplete', issues: ['Informe ao menos as formas de pagamento aceitas'] }
      }
      return { state: 'valid', issues: [] }
    }
  },
  {
    label: 'Documentos Complementares',
    key: 'documents',
    required: false,
    check: () => ({ state: 'optional', issues: ['Opcional — documentos adicionais'] })
  },
  {
    label: 'Conversas / FAQ',
    key: 'conversations',
    required: false,
    check: () => ({ state: 'optional', issues: ['Opcional — melhora a qualidade do agente'] })
  },
]

export default function Step8Review({ formData, token, onGenerate }: Props) {
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const results = SECTIONS.map(s => ({ ...s, result: s.check(formData) }))
  const hasErrors = results.some(r => r.result.state === 'error')
  const hasRequired = results.filter(r => r.required).every(r => r.result.state === 'valid')
  const canGenerate = !hasErrors && hasRequired

  const IconFor = ({ state }: { state: string }) => {
    if (state === 'valid') return <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
    if (state === 'incomplete') return <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
    if (state === 'error') return <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
    return <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch(`/api/onboarding/${token}/generate`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar documentos')
      onGenerate()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.')
      setGenerating(false)
    }
  }

  const validCount = results.filter(r => r.result.state === 'valid').length
  const totalRequired = results.filter(r => r.required).length
  const requiredValid = results.filter(r => r.required && r.result.state === 'valid').length

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Summary card */}
      <div className={`card border-2 ${canGenerate ? 'border-green-300 bg-green-50' : 'border-amber-300 bg-amber-50'}`}>
        <div className="flex items-center gap-4">
          <div className={`text-4xl`}>{canGenerate ? '🎉' : '⚠️'}</div>
          <div>
            <h2 className={`font-bold text-lg ${canGenerate ? 'text-green-800' : 'text-amber-800'}`}>
              {canGenerate
                ? 'Pronto para gerar o agente!'
                : 'Algumas informações precisam ser completadas'}
            </h2>
            <p className={`text-sm mt-1 ${canGenerate ? 'text-green-700' : 'text-amber-700'}`}>
              {requiredValid}/{totalRequired} seções obrigatórias completas
              {validCount > totalRequired && ` • ${validCount - totalRequired} seção(ões) opcional(is) preenchida(s)`}
            </p>
          </div>
        </div>
      </div>

      {/* Section checklist */}
      <div className="card space-y-2">
        <h3 className="font-bold text-brand-navy text-base mb-4">Checklist de Seções</h3>
        {results.map(r => (
          <div key={r.key}
            className={`flex items-start gap-3 p-3 rounded-xl border ${
              r.result.state === 'valid' ? 'border-green-100 bg-green-50/50' :
              r.result.state === 'incomplete' ? 'border-amber-100 bg-amber-50/50' :
              r.result.state === 'error' ? 'border-red-100 bg-red-50/50' :
              'border-gray-100 bg-gray-50/50'
            }`}>
            <IconFor state={r.result.state} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-brand-dark">{r.label}</span>
                {!r.required && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded-full font-medium">
                    Opcional
                  </span>
                )}
              </div>
              {r.result.issues.map((issue, i) => (
                <p key={i} className={`text-xs mt-0.5 ${
                  r.result.state === 'error' ? 'text-red-600' :
                  r.result.state === 'incomplete' ? 'text-amber-700' :
                  'text-gray-500'
                }`}>
                  {r.result.state !== 'valid' && '→ '}{issue}
                </p>
              ))}
            </div>
            <div className={`text-xs font-bold flex-shrink-0 ${
              r.result.state === 'valid' ? 'text-green-600' :
              r.result.state === 'incomplete' ? 'text-amber-600' :
              r.result.state === 'error' ? 'text-red-600' :
              'text-gray-400'
            }`}>
              {r.result.state === 'valid' ? '✓ Ok' :
               r.result.state === 'incomplete' ? '⚠ Incompleto' :
               r.result.state === 'error' ? '✕ Erro' : '○ Opcional'}
            </div>
          </div>
        ))}
      </div>

      {/* What will be generated */}
      <div className="card space-y-3">
        <h3 className="font-bold text-brand-navy text-base">O que será gerado</h3>
        {[
          { icon: '📋', label: 'Bloco 1 — Master Prompt', desc: 'Regras completas de comportamento do agente' },
          { icon: '📚', label: 'Bloco 2 — Base de Conhecimento', desc: 'Todos os dados da clínica em formato consultável' },
          { icon: '💬', label: 'Biblioteca de Mensagens', desc: 'Mínimo 3 variações de mensagem para cada cenário' },
          { icon: '📨', label: 'Template de Handoff', desc: 'Resumo estruturado enviado à sua recepção a cada transferência' },
          { icon: '✅', label: 'Relatório de Qualidade', desc: 'Pontos que precisam de revisão antes de ativar o agente' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-3 text-sm">
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            <div>
              <span className="font-semibold text-brand-dark">{item.label}</span>
              <span className="text-brand-mid"> — {item.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="card bg-red-50 border-red-200">
          <p className="text-sm text-red-700">❌ {error}</p>
        </div>
      )}

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={!canGenerate || generating}
        className="btn-primary w-full justify-center py-4 text-base"
      >
        {generating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Gerando documentos do agente... (pode levar 1-2 minutos)
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Gerar meu Agente de Atendimento
          </>
        )}
      </button>

      {!canGenerate && (
        <p className="text-xs text-center text-brand-mid">
          Complete as seções marcadas com ⚠️ para habilitar a geração.
        </p>
      )}
    </div>
  )
}
