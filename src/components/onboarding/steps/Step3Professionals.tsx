'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import FieldWrapper from '@/components/onboarding/FieldWrapper'
import {
  validateRequired, validateAgeRange, validatePriceField,
  validateConvenioField, validateScheduleField
} from '@/lib/validators'

interface Professional {
  id: string
  name: string
  specialty: string
  age_range: string
  schedule_type: 'stable' | 'variable'
  schedule_days: string
  schedule_time: string
  schedule_interval: string
  schedule_is_biweekly: boolean
  schedule_variable_rule: string
  convenios_rule: string
  price_pix: string
  price_card: string
  accepts_card: boolean
  special_rules: string
  is_expanded: boolean
}

function newProfessional(): Professional {
  return {
    id: Math.random().toString(36).slice(2),
    name: '', specialty: '', age_range: '',
    schedule_type: 'stable',
    schedule_days: '', schedule_time: '', schedule_interval: '',
    schedule_is_biweekly: false, schedule_variable_rule: '',
    convenios_rule: '', price_pix: '', price_card: '',
    accepts_card: true, special_rules: '', is_expanded: true
  }
}

interface Props {
  data?: unknown[]
  onChange: (data: Professional[]) => void
}

export default function Step3Professionals({ data, onChange }: Props) {
  const [profs, setProfs] = useState<Professional[]>(
    (data as Professional[])?.length ? (data as Professional[]) : [newProfessional()]
  )

  useEffect(() => { onChange(profs) }, [profs])

  const update = (id: string, key: keyof Professional, value: unknown) => {
    setProfs(prev => prev.map(p => p.id === id ? { ...p, [key]: value } : p))
  }

  const add = () => {
    setProfs(prev => [...prev, newProfessional()])
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100)
  }

  const remove = (id: string) => {
    if (profs.length === 1) return
    setProfs(prev => prev.filter(p => p.id !== id))
  }

  const toggle = (id: string) => {
    setProfs(prev => prev.map(p => p.id === id ? { ...p, is_expanded: !p.is_expanded } : p))
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="card bg-brand-lteal border-brand-teal/20">
        <p className="text-sm text-brand-dark leading-relaxed">
          👩‍⚕️ <strong>Adicione cada profissional que atende na clínica.</strong> Para cada um, vamos
          coletar agenda, convênios aceitos e valores. Se tiver muitos, pode adicionar os principais
          agora e complementar depois.
        </p>
      </div>

      {profs.map((p, index) => (
        <div key={p.id} className="card border border-gray-200 overflow-hidden">
          {/* Card header */}
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggle(p.id)}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-navy text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                {index + 1}
              </div>
              <div>
                <div className="font-semibold text-brand-dark">
                  {p.name || `Profissional ${index + 1}`}
                </div>
                {p.specialty && (
                  <div className="text-xs text-brand-mid">{p.specialty}</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {profs.length > 1 && (
                <button
                  onClick={e => { e.stopPropagation(); remove(p.id) }}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remover profissional"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              {p.is_expanded ? <ChevronUp className="w-4 h-4 text-brand-mid" /> : <ChevronDown className="w-4 h-4 text-brand-mid" />}
            </div>
          </div>

          {p.is_expanded && (
            <div className="mt-5 space-y-5 border-t border-gray-100 pt-5">
              {/* Basic info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldWrapper label="Nome completo *" validation={validateRequired(p.name)}
                  example="Ex: Dra. Maria Silva">
                  <input className="input" value={p.name}
                    onChange={e => update(p.id, 'name', e.target.value)}
                    placeholder="Nome completo do profissional" />
                </FieldWrapper>
                <FieldWrapper label="Especialidade *" validation={validateRequired(p.specialty)}
                  example="Ex: Cardiologista, Nutricionista, Psicóloga">
                  <input className="input" value={p.specialty}
                    onChange={e => update(p.id, 'specialty', e.target.value)}
                    placeholder="Especialidade ou área de atuação" />
                </FieldWrapper>
              </div>

              <FieldWrapper
                label="Faixa etária atendida *"
                hint="Quais idades este profissional atende?"
                validation={validateAgeRange(p.age_range)}
                example="Ex: Todas as idades | A partir de 12 anos | 0 a 17 anos | Adultos a partir de 18 anos"
              >
                <input className="input" value={p.age_range}
                  onChange={e => update(p.id, 'age_range', e.target.value)}
                  placeholder="Ex: A partir de 14 anos" />
              </FieldWrapper>

              {/* Schedule */}
              <div>
                <label className="field-label">Tipo de agenda *</label>
                <p className="field-hint mb-3">Os dias de atendimento são sempre os mesmos toda semana?</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'stable', label: 'Sim, dias fixos', desc: 'Ex: toda segunda e quarta', emoji: '📅' },
                    { value: 'variable', label: 'Não, varia', desc: 'Ex: avisa as datas periodicamente', emoji: '🔄' },
                  ].map(opt => (
                    <button key={opt.value}
                      onClick={() => update(p.id, 'schedule_type', opt.value)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        p.schedule_type === opt.value
                          ? 'border-brand-teal bg-brand-lteal'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}>
                      <div className="text-lg mb-1">{opt.emoji}</div>
                      <div className="text-sm font-semibold text-brand-dark">{opt.label}</div>
                      <div className="text-xs text-brand-mid">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {p.schedule_type === 'stable' ? (
                <div className="space-y-4 bg-brand-lteal/50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-brand-teal">Agenda Fixa — informe os detalhes</p>
                  <FieldWrapper
                    label="Dias de atendimento *"
                    validation={validateScheduleField(p.schedule_days)}
                    example="Ex: Segundas e Quartas | Terças, Quintas e Sextas | Sábados quinzenalmente"
                  >
                    <input className="input bg-white" value={p.schedule_days}
                      onChange={e => update(p.id, 'schedule_days', e.target.value)}
                      placeholder="Ex: Segundas e Quartas" />
                  </FieldWrapper>
                  <div className="grid grid-cols-2 gap-3">
                    <FieldWrapper label="Horário de início *"
                      example="Ex: A partir das 8h | Das 14h às 18h">
                      <input className="input bg-white" value={p.schedule_time}
                        onChange={e => update(p.id, 'schedule_time', e.target.value)}
                        placeholder="Ex: 8h | Das 14h às 18h" />
                    </FieldWrapper>
                    <FieldWrapper label="Tipo de encaixe"
                      example="Ex: Ordem de chegada | A cada 30 min | A cada 1h">
                      <input className="input bg-white" value={p.schedule_interval}
                        onChange={e => update(p.id, 'schedule_interval', e.target.value)}
                        placeholder="Ordem chegada / hora marcada" />
                    </FieldWrapper>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id={`biweekly-${p.id}`}
                      checked={p.schedule_is_biweekly}
                      onChange={e => update(p.id, 'schedule_is_biweekly', e.target.checked)}
                      className="w-4 h-4 rounded accent-brand-teal" />
                    <label htmlFor={`biweekly-${p.id}`} className="text-sm text-brand-dark cursor-pointer">
                      Atende quinzenalmente (a cada duas semanas)
                    </label>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 rounded-xl p-4">
                  <FieldWrapper
                    label="Como as datas são comunicadas? *"
                    hint="Explique como o agente deve informar o paciente sobre as datas"
                    example="Ex: A profissional informa as datas ao final de cada atendimento | As datas são divulgadas no início de cada mês | Não tem dia fixo — entra em contato quando houver disponibilidade"
                  >
                    <textarea className="textarea bg-white min-h-[80px]"
                      value={p.schedule_variable_rule}
                      onChange={e => update(p.id, 'schedule_variable_rule', e.target.value)}
                      placeholder="Descreva como funcionam as datas variáveis..." />
                  </FieldWrapper>
                </div>
              )}

              {/* Convenios */}
              <FieldWrapper
                label="Convênios aceitos por este profissional *"
                hint="Como este profissional atende em relação aos convênios?"
                validation={validateConvenioField(p.convenios_rule)}
                example={`Ex:\n• "Aceita todos os convênios da clínica"\n• "Aceita todos exceto XPTO e ABC"\n• "Aceita apenas os convênios X, Y e Z"\n• "Somente particular"\n• "Aceita todos para consulta, somente particular para procedimentos"`}
              >
                <textarea className="textarea min-h-[80px]"
                  value={p.convenios_rule}
                  onChange={e => update(p.id, 'convenios_rule', e.target.value)}
                  placeholder="Descreva os convênios aceitos por este profissional..." />
              </FieldWrapper>

              {/* Prices */}
              <div className="space-y-3">
                <label className="field-label">Valores de consulta particular *</label>
                <div className="flex items-center gap-3 mb-2">
                  <input type="checkbox" id={`card-${p.id}`}
                    checked={p.accepts_card}
                    onChange={e => update(p.id, 'accepts_card', e.target.checked)}
                    className="w-4 h-4 rounded accent-brand-teal" />
                  <label htmlFor={`card-${p.id}`} className="text-sm text-brand-dark cursor-pointer">
                    Este profissional aceita cartão de crédito
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FieldWrapper label="PIX / Espécie *"
                    validation={validatePriceField(p.price_pix)}
                    example="Ex: R$ 250,00 ou 250">
                    <input className="input" value={p.price_pix}
                      onChange={e => update(p.id, 'price_pix', e.target.value)}
                      placeholder="R$ 0,00" />
                  </FieldWrapper>
                  {p.accepts_card ? (
                    <FieldWrapper label="Cartão de Crédito *"
                      validation={validatePriceField(p.price_card)}
                      example="Ex: R$ 270,00 ou 270">
                      <input className="input" value={p.price_card}
                        onChange={e => update(p.id, 'price_card', e.target.value)}
                        placeholder="R$ 0,00" />
                    </FieldWrapper>
                  ) : (
                    <div className="flex items-center justify-center p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="text-xs text-brand-mid text-center">Cartão não aceito</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Special rules */}
              <FieldWrapper
                label="Regras especiais (opcional mas importante)"
                hint="Qualquer regra específica que o agente precisa saber sobre este profissional"
                example={`Ex:\n• Exige guia de encaminhamento para atendimento por convênio\n• Não realiza consultas de retorno por convênios regionais\n• Agenda compartilhada com exames — limitar a X pacientes por turno\n• Não atende em período menstrual (preventivos)\n• Atendimento somente particular para neuropediatria\n• Valor de retorno diferente da primeira consulta`}
              >
                <textarea className="textarea min-h-[100px]"
                  value={p.special_rules}
                  onChange={e => update(p.id, 'special_rules', e.target.value)}
                  placeholder="Descreva livremente qualquer regra especial deste profissional..." />
              </FieldWrapper>
            </div>
          )}
        </div>
      ))}

      {/* Add button */}
      <button onClick={add}
        className="w-full py-4 border-2 border-dashed border-brand-teal/40 rounded-2xl
                   text-brand-teal font-semibold text-sm
                   hover:border-brand-teal hover:bg-brand-lteal
                   transition-all flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" />
        Adicionar outro profissional
      </button>

      <div className="card bg-green-50 border-green-200">
        <p className="text-xs text-green-700">
          ✅ <strong>{profs.length} profissional{profs.length !== 1 ? 'is' : ''} adicionado{profs.length !== 1 ? 's' : ''}.</strong>{' '}
          Pode continuar. Se tiver mais para adicionar, pode voltar a esta etapa depois.
        </p>
      </div>
    </div>
  )
}
