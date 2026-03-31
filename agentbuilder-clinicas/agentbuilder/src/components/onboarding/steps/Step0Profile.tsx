'use client'

import { useState, useEffect } from 'react'
import { Building2, Users, Stethoscope } from 'lucide-react'

interface ProfileData {
  uses_convenios: boolean | null
  has_multiple_professionals: boolean | null
  clinic_type: 'routine' | 'elective' | 'both' | null
}

interface Props {
  data?: Record<string, unknown>
  onChange: (data: ProfileData) => void
}

export default function Step0Profile({ data, onChange }: Props) {
  const [profile, setProfile] = useState<ProfileData>({
    uses_convenios: (data?.uses_convenios as boolean) ?? null,
    has_multiple_professionals: (data?.has_multiple_professionals as boolean) ?? null,
    clinic_type: (data?.clinic_type as ProfileData['clinic_type']) ?? null,
  })

  useEffect(() => {
    onChange(profile)
  }, [profile])

  const update = (key: keyof ProfileData, value: unknown) => {
    setProfile(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Intro */}
      <div className="card bg-brand-lteal border-brand-teal/20">
        <p className="text-sm text-brand-dark leading-relaxed">
          🎉 <strong>Bem-vindo ao AgentBuilder.IA!</strong> Antes de começar, vamos entender o perfil
          da sua clínica para personalizar as perguntas certas para você. São apenas 3 perguntinhas rápidas.
        </p>
      </div>

      {/* Q1 - Convenios */}
      <div className="card space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-lteal flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-brand-teal" />
          </div>
          <div>
            <h3 className="font-bold text-brand-navy">
              Sua clínica atende por convênios / planos de saúde?
            </h3>
            <p className="text-sm text-brand-mid mt-1">
              Isso inclui qualquer plano de saúde, cooperativa médica ou seguro saúde.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: true, label: 'Sim, atendemos convênios', emoji: '✅' },
            { value: false, label: 'Não, somente particular', emoji: '💳' },
          ].map(opt => (
            <button
              key={String(opt.value)}
              onClick={() => update('uses_convenios', opt.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                profile.uses_convenios === opt.value
                  ? 'border-brand-teal bg-brand-lteal'
                  : 'border-gray-200 bg-white hover:border-brand-teal/40'
              }`}
            >
              <div className="text-xl mb-1">{opt.emoji}</div>
              <div className="text-sm font-semibold text-brand-dark">{opt.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Q2 - Professionals */}
      <div className="card space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-lteal flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-brand-teal" />
          </div>
          <div>
            <h3 className="font-bold text-brand-navy">
              Quantos profissionais de saúde sua clínica possui?
            </h3>
            <p className="text-sm text-brand-mid mt-1">
              Conte médicos, terapeutas, psicólogos, nutricionistas — todos que atendem pacientes.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: false, label: '1 a 3 profissionais', emoji: '👤' },
            { value: true, label: '4 ou mais profissionais', emoji: '👥' },
          ].map(opt => (
            <button
              key={String(opt.value)}
              onClick={() => update('has_multiple_professionals', opt.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                profile.has_multiple_professionals === opt.value
                  ? 'border-brand-teal bg-brand-lteal'
                  : 'border-gray-200 bg-white hover:border-brand-teal/40'
              }`}
            >
              <div className="text-xl mb-1">{opt.emoji}</div>
              <div className="text-sm font-semibold text-brand-dark">{opt.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Q3 - Clinic type */}
      <div className="card space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-lteal flex items-center justify-center flex-shrink-0">
            <Stethoscope className="w-5 h-5 text-brand-teal" />
          </div>
          <div>
            <h3 className="font-bold text-brand-navy">
              Qual é o foco principal dos atendimentos?
            </h3>
            <p className="text-sm text-brand-mid mt-1">
              Isso nos ajuda a personalizar as mensagens e o fluxo do agente para o seu tipo de paciente.
            </p>
          </div>
        </div>
        <div className="space-y-2">
          {[
            {
              value: 'routine',
              label: 'Consultas de rotina e acompanhamento',
              desc: 'Clínica geral, especialidades, saúde do dia a dia',
              emoji: '🏥'
            },
            {
              value: 'elective',
              label: 'Procedimentos eletivos e estéticos',
              desc: 'Cirurgia plástica, dermatologia estética, implantes',
              emoji: '✨'
            },
            {
              value: 'both',
              label: 'Ambos',
              desc: 'Mistura de consultas de rotina e procedimentos',
              emoji: '⚕️'
            },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => update('clinic_type', opt.value)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                profile.clinic_type === opt.value
                  ? 'border-brand-teal bg-brand-lteal'
                  : 'border-gray-200 bg-white hover:border-brand-teal/40'
              }`}
            >
              <span className="text-2xl flex-shrink-0">{opt.emoji}</span>
              <div>
                <div className="text-sm font-semibold text-brand-dark">{opt.label}</div>
                <div className="text-xs text-brand-mid">{opt.desc}</div>
              </div>
              {profile.clinic_type === opt.value && (
                <div className="ml-auto w-5 h-5 rounded-full bg-brand-teal flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Progress check */}
      {profile.uses_convenios !== null &&
       profile.has_multiple_professionals !== null &&
       profile.clinic_type !== null && (
        <div className="card bg-green-50 border-green-200 flex items-center gap-3">
          <span className="text-2xl">🎯</span>
          <div>
            <div className="font-semibold text-green-700 text-sm">Perfil configurado!</div>
            <div className="text-xs text-green-600">
              O formulário foi personalizado para o seu tipo de clínica. Clique em "Próxima etapa".
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
