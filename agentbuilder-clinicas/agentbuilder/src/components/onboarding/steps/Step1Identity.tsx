'use client'

import { useState, useEffect } from 'react'
import FieldWrapper from '@/components/onboarding/FieldWrapper'
import { validateRequired, validateWhatsApp } from '@/lib/validators'

interface IdentityData {
  clinic_name: string
  trade_name: string
  cnpj: string
  address: string
  operating_hours: string
  patient_whatsapp: string
  reception_whatsapp: string
  agent_persona_name: string
  voice_tone: 'formal' | 'balanced' | 'friendly' | 'casual'
  website: string
  social_media: string
}

interface Props {
  data?: Record<string, unknown>
  onChange: (data: IdentityData) => void
}

const TONE_OPTIONS = [
  {
    value: 'formal',
    label: 'Formal',
    desc: 'Senhor/Senhora, sem emojis',
    example: '"Prezado(a), informamos que sua consulta está confirmada para segunda-feira."',
    color: 'border-blue-300 bg-blue-50'
  },
  {
    value: 'balanced',
    label: 'Equilibrado',
    desc: 'Próximo com certa formalidade',
    example: '"Olá! Que ótimo que vai nos visitar. 😊 Sua consulta está confirmada!"',
    color: 'border-teal-300 bg-teal-50',
    recommended: true
  },
  {
    value: 'friendly',
    label: 'Caloroso',
    desc: 'Acolhedor e próximo',
    example: '"Oi! Que bom! 🌟 Tudo certo com o seu agendamento, pode ficar tranquilo(a)!"',
    color: 'border-green-300 bg-green-50'
  },
  {
    value: 'casual',
    label: 'Informal',
    desc: 'Muito descontraído e próximo',
    example: '"Oi! 🎉 Confirmado! Qualquer coisa, é só chamar!"',
    color: 'border-orange-300 bg-orange-50'
  },
]

export default function Step1Identity({ data, onChange }: Props) {
  const [d, setD] = useState<IdentityData>({
    clinic_name: (data?.clinic_name as string) || '',
    trade_name: (data?.trade_name as string) || '',
    cnpj: (data?.cnpj as string) || '',
    address: (data?.address as string) || '',
    operating_hours: (data?.operating_hours as string) || '',
    patient_whatsapp: (data?.patient_whatsapp as string) || '',
    reception_whatsapp: (data?.reception_whatsapp as string) || '',
    agent_persona_name: (data?.agent_persona_name as string) || '',
    voice_tone: (data?.voice_tone as IdentityData['voice_tone']) || 'balanced',
    website: (data?.website as string) || '',
    social_media: (data?.social_media as string) || '',
  })

  useEffect(() => { onChange(d) }, [d])

  const u = (k: keyof IdentityData, v: string) => setD(prev => ({ ...prev, [k]: v }))

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="card space-y-5">
        <h2 className="text-base font-bold text-brand-navy border-b border-gray-100 pb-3">
          Dados da Clínica
        </h2>

        <FieldWrapper
          label="Nome da clínica *"
          hint="Como sua clínica é conhecida pelos pacientes"
          example="Ex: Clínica Saúde Integrada, Instituto de Cardiologia do Vale"
          validation={validateRequired(d.clinic_name)}
        >
          <input className="input" value={d.clinic_name}
            onChange={e => u('clinic_name', e.target.value)}
            placeholder="Nome completo da clínica" />
        </FieldWrapper>

        <FieldWrapper
          label="Nome fantasia"
          hint="Se diferente do nome oficial (opcional)"
          example="Ex: CardioVale, Clínica Dr. Silva"
        >
          <input className="input" value={d.trade_name}
            onChange={e => u('trade_name', e.target.value)}
            placeholder="Nome pelo qual é mais conhecida" />
        </FieldWrapper>

        <FieldWrapper
          label="CNPJ"
          hint="Apenas para constar nos documentos (opcional)"
          example="Ex: 12.345.678/0001-90"
        >
          <input className="input" value={d.cnpj}
            onChange={e => u('cnpj', e.target.value)}
            placeholder="00.000.000/0000-00" />
        </FieldWrapper>

        <FieldWrapper
          label="Endereço completo *"
          hint="Rua, número, bairro, cidade e estado"
          example="Ex: Rua das Flores, 123, Centro – Cuiabá/MT"
          validation={validateRequired(d.address)}
        >
          <input className="input" value={d.address}
            onChange={e => u('address', e.target.value)}
            placeholder="Endereço completo da clínica" />
        </FieldWrapper>

        <FieldWrapper
          label="Horário de funcionamento da recepção *"
          hint="Quando a equipe humana está disponível para atender"
          example="Ex: Segunda a Sexta, das 8h às 18h | Sábados das 8h às 12h"
          validation={validateRequired(d.operating_hours)}
        >
          <input className="input" value={d.operating_hours}
            onChange={e => u('operating_hours', e.target.value)}
            placeholder="Dias e horários de atendimento humano" />
        </FieldWrapper>
      </div>

      {/* WhatsApp */}
      <div className="card space-y-5">
        <div>
          <h2 className="text-base font-bold text-brand-navy">Canais de Atendimento</h2>
          <p className="text-sm text-brand-mid mt-1">
            O agente precisa saber onde encaminhar os pacientes e como notificar sua equipe.
          </p>
        </div>

        <FieldWrapper
          label="WhatsApp de atendimento aos pacientes *"
          hint="Número onde os pacientes vão enviar mensagens — onde o agente estará ativo"
          example="Ex: 65999991234 (apenas números, com DDD)"
          validation={validateWhatsApp(d.patient_whatsapp)}
        >
          <input className="input" value={d.patient_whatsapp}
            onChange={e => u('patient_whatsapp', e.target.value)}
            placeholder="DDD + número (ex: 65999991234)" />
        </FieldWrapper>

        <FieldWrapper
          label="WhatsApp interno da recepção *"
          hint="Número INTERNO que receberá os resumos quando o agente transferir um paciente para agendamento. Pode ser o mesmo número ou um número diferente."
          example="Ex: 65988887777 — este é o número que sua equipe verá as transferências chegarem"
          validation={validateWhatsApp(d.reception_whatsapp)}
        >
          <input className="input" value={d.reception_whatsapp}
            onChange={e => u('reception_whatsapp', e.target.value)}
            placeholder="DDD + número da recepção interna" />
        </FieldWrapper>

        <FieldWrapper
          label="Site (opcional)"
          hint="Endereço do site da clínica"
          example="Ex: www.clinicasaudeintegrada.com.br"
        >
          <input className="input" value={d.website}
            onChange={e => u('website', e.target.value)}
            placeholder="www.suaclinica.com.br" />
        </FieldWrapper>

        <FieldWrapper
          label="Redes sociais (opcional)"
          hint="Instagram, Facebook ou outros perfis relevantes"
          example="Ex: @clinicasaudeintegrada (Instagram)"
        >
          <input className="input" value={d.social_media}
            onChange={e => u('social_media', e.target.value)}
            placeholder="@seuperfil ou link das redes" />
        </FieldWrapper>
      </div>

      {/* Agent Persona */}
      <div className="card space-y-5">
        <div>
          <h2 className="text-base font-bold text-brand-navy">Personalidade do Agente</h2>
          <p className="text-sm text-brand-mid mt-1">
            O agente precisa de uma identidade para se apresentar aos pacientes.
          </p>
        </div>

        <FieldWrapper
          label="Nome do agente virtual *"
          hint="Como o agente vai se apresentar para os pacientes. Use um nome que represente sua clínica."
          example="Ex: Sofia, Clara, Ana, Atendimento ProntoMED, Concierge Salus"
          validation={validateRequired(d.agent_persona_name)}
        >
          <input className="input" value={d.agent_persona_name}
            onChange={e => u('agent_persona_name', e.target.value)}
            placeholder="Nome da assistente virtual" />
        </FieldWrapper>

        <div>
          <label className="field-label">Tom de voz do agente *</label>
          <p className="field-hint mb-3">Escolha o estilo de comunicação que mais combina com o perfil da sua clínica</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TONE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => u('voice_tone', opt.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  d.voice_tone === opt.value
                    ? `border-brand-teal bg-brand-lteal`
                    : 'border-gray-200 bg-white hover:border-brand-teal/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-brand-dark">{opt.label}</span>
                  {opt.recommended && (
                    <span className="text-[10px] font-bold text-brand-teal bg-brand-lteal px-2 py-0.5 rounded-full border border-brand-teal/30">
                      Recomendado
                    </span>
                  )}
                </div>
                <div className="text-xs text-brand-mid mb-2">{opt.desc}</div>
                <div className="text-xs text-brand-dark italic bg-white/70 rounded-lg p-2 leading-relaxed">
                  {opt.example}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
