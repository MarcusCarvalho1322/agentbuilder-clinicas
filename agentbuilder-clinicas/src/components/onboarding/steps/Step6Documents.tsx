// Step6Documents.tsx
'use client'
import FileUpload from '@/components/onboarding/FileUpload'

interface Props { token: string; onChange: (text: string) => void }
let accumulated = ''

export default function Step6Documents({ token, onChange }: Props) {
  const handleExtracted = (text: string) => {
    accumulated = accumulated ? `${accumulated}\n\n---\n${text}` : text
    onChange(accumulated)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="card bg-brand-lteal border-brand-teal/20">
        <p className="text-sm text-brand-dark leading-relaxed">
          📎 <strong>Envie qualquer documento complementar</strong> que ajude a configurar o agente.
          Cada arquivo deve ter uma descrição clara do que contém e para que serve.
          O conteúdo será extraído automaticamente e usado na geração do agente.
        </p>
      </div>

      <div className="card space-y-4">
        <div>
          <h2 className="text-base font-bold text-brand-navy">Documentos Complementares</h2>
          <p className="text-sm text-brand-mid mt-1">
            Exemplos: POP da clínica, manual de atendimento, tabelas, protocolos, scripts de recepcionista,
            carta de credenciamento, histórico de perguntas frequentes.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs text-amber-800 font-semibold mb-1">⚠️ Campo de descrição obrigatório</p>
          <p className="text-xs text-amber-700">
            Após selecionar cada arquivo, você deverá preencher uma descrição do que ele contém.
            Isso é essencial para que o agente entenda como usar o documento.
          </p>
        </div>

        <FileUpload token={token} section="complementary" onTextExtracted={handleExtracted} multiple />
      </div>

      <div className="card bg-gray-50 border-gray-200">
        <p className="text-sm text-brand-mid text-center">
          Esta etapa é opcional. Se não tiver documentos adicionais, clique em "Próxima etapa".
        </p>
      </div>
    </div>
  )
}
