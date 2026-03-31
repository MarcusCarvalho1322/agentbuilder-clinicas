// Step7Conversations.tsx
'use client'
import { useState, useEffect } from 'react'
import FileUpload from '@/components/onboarding/FileUpload'

interface Props { token: string; onChange: (text: string) => void }

export default function Step7Conversations({ token, onChange }: Props) {
  const [manual, setManual] = useState('')
  const [extracted, setExtracted] = useState('')

  useEffect(() => {
    const combined = [manual, extracted].filter(Boolean).join('\n\n---\n')
    onChange(combined)
  }, [manual, extracted])

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="card bg-brand-lteal border-brand-teal/20">
        <p className="text-sm text-brand-dark leading-relaxed">
          💬 <strong>Etapa opcional mas muito poderosa.</strong> Se você tiver conversas reais de
          WhatsApp ou perguntas frequentes dos pacientes, envie aqui. O agente aprenderá com
          as dúvidas reais do seu público e as respostas que sua equipe já utiliza.
        </p>
      </div>

      <div className="card space-y-4">
        <h2 className="text-base font-bold text-brand-navy">Histórico de Conversas ou FAQ</h2>

        <div className="space-y-3">
          <p className="text-sm font-medium text-brand-dark">Opção 1 — Escreva perguntas e respostas frequentes</p>
          <p className="field-hint">Escreva as dúvidas mais comuns e como sua equipe costuma responder.</p>
          <textarea className="textarea min-h-[160px]"
            value={manual}
            onChange={e => setManual(e.target.value)}
            placeholder={`Pergunta: Vocês atendem pelo plano X?\nResposta: Sim, somos credenciados para consultas e procedimentos.\n\nPergunta: Como faço para agendar?\nResposta: Pode agendar diretamente por aqui ou ligar para nosso número.\n\nPergunta: Qual o valor da consulta particular?\nResposta: O valor da consulta varia por especialidade...`}
          />
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-3">
          <p className="text-sm font-medium text-brand-dark">Opção 2 — Envie um documento com conversas ou FAQ</p>
          <p className="field-hint">
            Exportação do WhatsApp (arquivo .txt), documento Word com FAQ, planilha de perguntas frequentes, etc.
          </p>
          <FileUpload token={token} section="conversations" onTextExtracted={setExtracted} multiple />
        </div>
      </div>

      <div className="card bg-gray-50 border-gray-200">
        <p className="text-sm text-brand-mid text-center">
          Esta etapa é completamente opcional. Pule se preferir e siga para a revisão final.
        </p>
      </div>
    </div>
  )
}
