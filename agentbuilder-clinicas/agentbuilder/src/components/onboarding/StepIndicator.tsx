'use client'

import { Check, AlertTriangle, X, Circle } from 'lucide-react'
import { clsx } from 'clsx'

interface Step {
  id: number
  label: string
  short: string
}

interface Props {
  steps: Step[]
  currentStep: number
  validation: Record<string, string>
}

const STEP_SECTIONS = [
  'profile', 'identity', 'convenios', 'professionals',
  'exams', 'payment', 'documents', 'conversations', 'review'
]

export default function StepIndicator({ steps, currentStep, validation }: Props) {
  return (
    <div className="relative">
      {/* Desktop */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const section = STEP_SECTIONS[index]
          const vstate = validation[section]
          const isActive = currentStep === index
          const isCompleted = currentStep > index

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={clsx(
                  'step-indicator',
                  isActive && 'active',
                  isCompleted && 'completed',
                  !isActive && !isCompleted && 'pending'
                )}>
                  {isCompleted ? (
                    vstate === 'error' ? (
                      <X className="w-4 h-4" />
                    ) : vstate === 'incomplete' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="mt-1.5 text-center">
                  <div className={clsx(
                    'text-xs font-medium transition-colors',
                    isActive ? 'text-brand-navy' : 'text-brand-mid'
                  )}>
                    {step.label}
                  </div>
                  {isCompleted && vstate && (
                    <div className={clsx(
                      'text-[10px] font-semibold mt-0.5',
                      vstate === 'valid' && 'text-green-600',
                      vstate === 'incomplete' && 'text-amber-600',
                      vstate === 'error' && 'text-red-600',
                    )}>
                      {vstate === 'valid' && '✓ Ok'}
                      {vstate === 'incomplete' && '⚠ Incompleto'}
                      {vstate === 'error' && '✕ Erro'}
                    </div>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={clsx(
                  'flex-1 h-0.5 mx-2 transition-colors',
                  currentStep > index ? 'bg-brand-teal' : 'bg-gray-200'
                )} />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {steps.map((step, index) => {
            const isActive = currentStep === index
            const isCompleted = currentStep > index
            const section = STEP_SECTIONS[index]
            const vstate = validation[section]

            return (
              <div key={step.id} className="flex-shrink-0 flex items-center gap-1">
                <div className={clsx(
                  'flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border-2',
                  isActive && 'bg-brand-navy border-brand-navy text-white',
                  isCompleted && vstate === 'error' && 'bg-red-500 border-red-500 text-white',
                  isCompleted && vstate === 'incomplete' && 'bg-amber-400 border-amber-400 text-white',
                  isCompleted && (!vstate || vstate === 'valid') && 'bg-brand-teal border-brand-teal text-white',
                  !isActive && !isCompleted && 'bg-white border-gray-300 text-gray-400',
                )}>
                  {isCompleted ? (
                    vstate === 'error' ? '✕' : vstate === 'incomplete' ? '!' : '✓'
                  ) : index + 1}
                </div>
                {isActive && (
                  <span className="text-xs font-semibold text-brand-navy whitespace-nowrap">
                    {step.short}
                  </span>
                )}
                {index < steps.length - 1 && (
                  <div className={clsx(
                    'w-3 h-0.5 ml-0.5',
                    currentStep > index ? 'bg-brand-teal' : 'bg-gray-200'
                  )} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
