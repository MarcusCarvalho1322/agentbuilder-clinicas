'use client'

import { ReactNode } from 'react'
import { clsx } from 'clsx'
import type { FieldValidation } from '@/lib/validators'

interface Props {
  label?: string
  hint?: string
  example?: string
  validation?: FieldValidation
  children: ReactNode
  optional?: boolean
}

export default function FieldWrapper({ label, hint, example, validation, children, optional }: Props) {
  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center gap-2">
          <label className="field-label">{label}</label>
          {optional && (
            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded-full font-medium">
              Opcional
            </span>
          )}
        </div>
      )}
      {hint && <p className="field-hint">{hint}</p>}
      {children}
      {example && (
        <div className="mt-1.5 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
          <p className="text-[10px] font-semibold text-brand-teal mb-0.5">💡 Exemplos de preenchimento</p>
          <pre className="text-[10px] text-brand-mid whitespace-pre-wrap font-sans leading-relaxed">{example}</pre>
        </div>
      )}
      {validation && validation.state !== 'valid' && (
        <p className={clsx(
          'text-xs font-medium mt-1',
          validation.state === 'error' && 'text-red-600',
          validation.state === 'incomplete' && 'text-amber-600',
        )}>
          {validation.state === 'error' ? '✕ ' : '⚠ '}{validation.message}
        </p>
      )}
    </div>
  )
}
