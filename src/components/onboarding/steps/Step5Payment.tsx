// Step5Payment.tsx
'use client'
import { useState, useEffect } from 'react'
import FieldWrapper from '@/components/onboarding/FieldWrapper'

interface Props { data?: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }

export default function Step5Payment({ data, onChange }: Props) {
  const [d, setD] = useState({
    installment_table: (data?.installment_table as string) || '',
    accepted_methods: (data?.accepted_methods as string) || '',
    special_rules: (data?.special_rules as string) || '',
  })
  const u = (k: string, v: string) => setD(prev => ({ ...prev, [k]: v }))
  useEffect(() => { onChange(d) }, [d])

  const METHODS = ['PIX', 'Cartão de crédito', 'Cartão de débito', 'Dinheiro/Espécie', 'Transferência bancária', 'Cheque']
  const [selectedMethods, setSelectedMethods] = useState<string[]>(
    d.accepted_methods ? d.accepted_methods.split(', ') : ['PIX', 'Cartão de crédito', 'Dinheiro/Espécie']
  )

  const toggleMethod = (m: string) => {
    const updated = selectedMethods.includes(m)
      ? selectedMethods.filter(x => x !== m)
      : [...selectedMethods, m]
    setSelectedMethods(updated)
    u('accepted_methods', updated.join(', '))
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="card bg-brand-lteal border-brand-teal/20">
        <p className="text-sm text-brand-dark">
          💳 <strong>Configure as regras de pagamento</strong> da clínica. O agente usará essas informações para informar os pacientes corretamente.
        </p>
      </div>

      <div className="card space-y-5">
        <h2 className="text-base font-bold text-brand-navy border-b border-gray-100 pb-3">Formas de Pagamento Aceitas</h2>
        <div className="flex flex-wrap gap-2">
          {METHODS.map(m => (
            <button key={m} onClick={() => toggleMethod(m)}
              className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                selectedMethods.includes(m)
                  ? 'border-brand-teal bg-brand-lteal text-brand-teal'
                  : 'border-gray-200 bg-white text-brand-mid hover:border-gray-300'
              }`}>
              {selectedMethods.includes(m) ? '✓ ' : ''}{m}
            </button>
          ))}
        </div>
      </div>

      <div className="card space-y-5">
        <h2 className="text-base font-bold text-brand-navy border-b border-gray-100 pb-3">Parcelamento no Cartão</h2>
        <FieldWrapper
          label="Tabela de parcelamento"
          hint="Como funciona o parcelamento? Se não parcelar, escreva 'Não parcelamos'."
          example={`Ex:\nAté R$ 199: à vista + R$ 20 de acréscimo\nR$ 200 a R$ 499: até 2x + R$ 20\nR$ 500 a R$ 799: até 3x + R$ 50\nAcima de R$ 2.000: até 6x + R$ 100\n\nOu simplesmente: Não parcelamos | Parcelamos sem juros em até 3x`}
        >
          <textarea className="textarea min-h-[140px]"
            value={d.installment_table}
            onChange={e => u('installment_table', e.target.value)}
            placeholder="Descreva as regras de parcelamento da clínica..." />
        </FieldWrapper>

        <FieldWrapper
          label="Regras especiais de pagamento"
          hint="Algum profissional ou serviço tem regras diferentes? (opcional)"
          example="Ex: A Dra. X só aceita PIX — não aceita cartão | Procedimentos acima de R$ 1.000 têm parcelamento especial | Consultas de retorno têm desconto de 20%"
        >
          <textarea className="textarea min-h-[80px]"
            value={d.special_rules}
            onChange={e => u('special_rules', e.target.value)}
            placeholder="Regras de pagamento específicas por profissional ou serviço..." />
        </FieldWrapper>
      </div>
    </div>
  )
}
