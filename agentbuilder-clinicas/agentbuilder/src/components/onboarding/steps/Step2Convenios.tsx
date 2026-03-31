'use client'

import { useState, useEffect } from 'react'
import FieldWrapper from '@/components/onboarding/FieldWrapper'
import FileUpload from '@/components/onboarding/FileUpload'

interface Props {
  data?: Record<string, unknown>
  token: string
  onChange: (data: Record<string, unknown>) => void
}

export default function Step2Convenios({ data, token, onChange }: Props) {
  const [list, setList] = useState((data?.list as string) || '')
  const [specialRules, setSpecialRules] = useState((data?.special_rules as string) || '')
  const [uploadsSummary, setUploadsSummary] = useState((data?.uploads_summary as string) || '')

  useEffect(() => {
    onChange({ list, special_rules: specialRules, uploads_summary: uploadsSummary })
  }, [list, specialRules, uploadsSummary])

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="card bg-brand-lteal border-brand-teal/20">
        <p className="text-sm text-brand-dark leading-relaxed">
          💡 <strong>Dica:</strong> Liste os convênios e planos de saúde que sua clínica aceita.
          Você pode digitar diretamente, enviar um documento, ou as duas coisas.
          Não se preocupe com formatação — escreva como preferir.
        </p>
      </div>

      <div className="card space-y-5">
        <h2 className="text-base font-bold text-brand-navy border-b border-gray-100 pb-3">
          Convênios e Planos de Saúde
        </h2>

        <FieldWrapper
          label="Liste os convênios aceitos"
          hint="Digite um por linha ou separe por vírgula. Se preferir, envie um documento abaixo."
          example={`Exemplos de como escrever:\n• Um por linha: AMIL\nBradesco Saúde\nSulamerica\n• Ou separado por vírgula: AMIL, Bradesco, Sulamerica`}
        >
          <textarea
            className="textarea min-h-[160px]"
            value={list}
            onChange={e => setList(e.target.value)}
            placeholder={`Digite os convênios aceitos pela clínica.\n\nPode ser um por linha:\nAMIL\nBradesco Saúde\nSulamerica\n\nOu separados por vírgula:\nAMIL, Bradesco Saúde, Sulamerica`}
          />
        </FieldWrapper>

        <FieldWrapper
          label="Regras especiais de convênio (opcional mas importante)"
          hint="Algum convênio tem regra diferente? Ex: cobre só consulta, não cobre exames; precisa de autorização prévia; credenciamento é individual por médico."
          example={`Exemplos:\n• O Plano X cobre apenas consultas, não cobre procedimentos\n• O convênio Y exige guia de encaminhamento para qualquer atendimento\n• O Plano Z não é credenciado institucionalmente — cada médico tem seu próprio credenciamento\n• O Plano W só atende para as especialidades A e B`}
        >
          <textarea
            className="textarea min-h-[120px]"
            value={specialRules}
            onChange={e => setSpecialRules(e.target.value)}
            placeholder="Descreva regras específicas de cada convênio, se houver..."
          />
        </FieldWrapper>
      </div>

      {/* Upload */}
      <div className="card space-y-4">
        <div>
          <h2 className="text-base font-bold text-brand-navy">Documento de Convênios (opcional)</h2>
          <p className="text-sm text-brand-mid mt-1">
            Tem uma tabela de convênios, carta de credenciamento ou lista oficial? Envie aqui.
            Aceitamos PDF, Word, Excel ou imagem.
          </p>
        </div>
        <FileUpload
          token={token}
          section="convenios"
          onTextExtracted={(text) => setUploadsSummary(prev =>
            prev ? `${prev}\n\n---\n${text}` : text
          )}
        />
        {uploadsSummary && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-green-700 mb-1">✅ Documento processado</p>
            <p className="text-xs text-green-600">
              Texto extraído com sucesso. O agente utilizará essas informações.
            </p>
          </div>
        )}
      </div>

      {/* If not using convenios */}
      {!list && !uploadsSummary && (
        <div className="card border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-700">
            ⚠️ <strong>Atenção:</strong> Se sua clínica não trabalha com convênios, escreva
            <strong> "Atendimento somente particular"</strong> no campo acima.
            Isso é importante para o agente informar corretamente os pacientes.
          </p>
        </div>
      )}
    </div>
  )
}
