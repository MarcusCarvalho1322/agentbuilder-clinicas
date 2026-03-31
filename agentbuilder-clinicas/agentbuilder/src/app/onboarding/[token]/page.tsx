'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import StepIndicator from '@/components/onboarding/StepIndicator'
import Step0Profile from '@/components/onboarding/steps/Step0Profile'
import Step1Identity from '@/components/onboarding/steps/Step1Identity'
import Step2Convenios from '@/components/onboarding/steps/Step2Convenios'
import Step3Professionals from '@/components/onboarding/steps/Step3Professionals'
import Step4Exams from '@/components/onboarding/steps/Step4Exams'
import Step5Payment from '@/components/onboarding/steps/Step5Payment'
import Step6Documents from '@/components/onboarding/steps/Step6Documents'
import Step7Conversations from '@/components/onboarding/steps/Step7Conversations'
import Step8Review from '@/components/onboarding/steps/Step8Review'
import { ChevronLeft, ChevronRight, Save, Loader2 } from 'lucide-react'

const STEPS = [
  { id: 0, label: 'Perfil',       short: 'Perfil'    },
  { id: 1, label: 'Identidade',   short: 'Clínica'   },
  { id: 2, label: 'Convênios',    short: 'Convênios' },
  { id: 3, label: 'Profissionais',short: 'Equipe'    },
  { id: 4, label: 'Exames',       short: 'Exames'    },
  { id: 5, label: 'Pagamentos',   short: 'Pgto.'     },
  { id: 6, label: 'Documentos',   short: 'Docs'      },
  { id: 7, label: 'Conversas',    short: 'FAQ'       },
  { id: 8, label: 'Revisão',      short: 'Revisão'   },
]

export default function OnboardingPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [validation, setValidation] = useState<Record<string, string>>({})
  const [clinicName, setClinicName] = useState('')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Carregar dados salvos
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/onboarding/${token}`)
        if (!res.ok) {
          if (res.status === 404) setError('Link de onboarding não encontrado ou expirado.')
          else setError('Erro ao carregar seus dados. Tente novamente.')
          return
        }
        const data = await res.json()
        setFormData(data.data || {})
        setValidation(data.validation || {})
        setCurrentStep(data.current_step || 0)
        setClinicName(data.clinic_name || '')
      } catch {
        setError('Falha de conexão. Verifique sua internet.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  // Auto-save a cada 30 segundos se houver mudanças
  const saveProgress = useCallback(async (data: Record<string, unknown>, step: number) => {
    setSaving(true)
    try {
      await fetch(`/api/onboarding/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, current_step: step })
      })
      setLastSaved(new Date())
    } catch {
      // Silencioso no auto-save
    } finally {
      setSaving(false)
    }
  }, [token])

  const updateFormData = useCallback((section: string, sectionData: unknown) => {
    setFormData(prev => {
      const updated = { ...prev, [section]: sectionData }
      return updated
    })
  }, [])

  const handleNext = async () => {
    await saveProgress(formData, currentStep + 1)
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleManualSave = async () => {
    await saveProgress(formData, currentStep)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-brand-teal animate-spin mx-auto" />
          <p className="text-brand-mid text-sm">Carregando seus dados...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-xl font-bold text-brand-navy">Ops!</h2>
          <p className="text-brand-mid">{error}</p>
          <p className="text-xs text-brand-mid">
            Se o problema persistir, entre em contato com a equipe BIZZ.IA.
          </p>
        </div>
      </div>
    )
  }

  const stepComponents: Record<number, React.ReactNode> = {
    0: <Step0Profile data={formData.profile as Record<string,unknown>} onChange={(d) => updateFormData('profile', d)} />,
    1: <Step1Identity data={formData.identity as Record<string,unknown>} onChange={(d) => updateFormData('identity', d)} />,
    2: <Step2Convenios data={formData.convenios as Record<string,unknown>} token={token} onChange={(d) => updateFormData('convenios', d)} />,
    3: <Step3Professionals data={formData.professionals as unknown[]} onChange={(d) => updateFormData('professionals', d)} />,
    4: <Step4Exams data={formData.exams as Record<string,unknown>} token={token} onChange={(d) => updateFormData('exams', d)} />,
    5: <Step5Payment data={formData.payment as Record<string,unknown>} onChange={(d) => updateFormData('payment', d)} />,
    6: <Step6Documents token={token} onChange={(d) => updateFormData('documents_summary', d)} />,
    7: <Step7Conversations token={token} onChange={(d) => updateFormData('faq_extracted', d)} />,
    8: <Step8Review formData={formData} token={token} onGenerate={() => router.push(`/onboarding/${token}/complete`)} />,
  }

  return (
    <div className="min-h-screen bg-brand-gray">
      {/* Header */}
      <header className="bg-brand-navy text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">♥</span>
            <div>
              <div className="font-bold text-sm tracking-wide">AgentBuilder.IA</div>
              {clinicName && (
                <div className="text-xs text-blue-200 truncate max-w-[200px]">{clinicName}</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lastSaved && (
              <span className="text-xs text-blue-200 hidden sm:block">
                Salvo às {lastSaved.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button onClick={handleManualSave} disabled={saving} className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              Salvar
            </button>
          </div>
        </div>
      </header>

      {/* Step Indicator */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <StepIndicator steps={STEPS} currentStep={currentStep} validation={validation} />
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-slide-up">
          {/* Step header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-brand-teal uppercase tracking-widest">
                Etapa {currentStep + 1} de {STEPS.length}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-brand-navy">
              {STEPS[currentStep].label}
            </h1>
          </div>

          {/* Step content */}
          {stepComponents[currentStep]}
        </div>
      </main>

      {/* Footer navigation */}
      <footer className="sticky bottom-0 bg-white border-t border-gray-100 shadow-lg z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="btn-ghost disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </button>

          <div className="text-xs text-brand-mid hidden sm:block">
            {currentStep + 1} / {STEPS.length}
          </div>

          {currentStep < STEPS.length - 1 && (
            <button onClick={handleNext} className="btn-primary">
              Próxima etapa
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}
