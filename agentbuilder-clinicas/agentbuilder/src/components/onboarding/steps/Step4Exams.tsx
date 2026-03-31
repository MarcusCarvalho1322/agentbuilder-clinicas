'use client'

import { useState, useEffect } from 'react'
import FieldWrapper from '@/components/onboarding/FieldWrapper'
import FileUpload from '@/components/onboarding/FileUpload'

interface Props {
  data?: Record<string, unknown>
  token: string
  onChange: (data: Record<string, unknown>) => void
}

export default function Step4Exams({ data, token, onChange }: Props) {
  const [d, setD] = useState({
    has_lab: (data?.has_lab as boolean) ?? false,
    lab_hours: (data?.lab_hours as string) || '',
    lab_convenios: (data?.lab_convenios as string) || '',
    lab_price_table: (data?.lab_price_table as string) || '',
    has_imaging: (data?.has_imaging as boolean) ?? false,
    imaging_description: (data?.imaging_description as string) || '',
    procedures: (data?.procedures as string) || '',
    preparation_protocols: (data?.preparation_protocols as string) || '',
    uploads_summary: (data?.uploads_summary as string) || '',
  })

  const u = (k: string, v: unknown) => setD(prev => ({ ...prev, [k]: v }))
  useEffect(() => { onChange(d) }, [d])

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="card bg-brand-lteal border-brand-teal/20">
        <p className="text-sm text-brand-dark leading-relaxed">
          🔬 <strong>Informe os exames e procedimentos</strong> que sua clínica oferece além das consultas.
          Se não tiver nenhum, pode pular para a próxima etapa.
        </p>
      </div>

      {/* Laboratorio */}
      <div className="card space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-brand-navy">Exames Laboratoriais</h2>
            <p className="text-sm text-brand-mid mt-0.5">Posto de coleta ou laboratório próprio</p>
          </div>
          <button
            onClick={() => u('has_lab', !d.has_lab)}
            className={`relative w-12 h-6 rounded-full transition-colors ${d.has_lab ? 'bg-brand-teal' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${d.has_lab ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        {d.has_lab && (
          <div className="space-y-4 border-t border-gray-100 pt-4">
            <FieldWrapper
              label="Horário de funcionamento do laboratório"
              example="Ex: Segunda a Sábado, das 7h às 9h30"
            >
              <input className="input" value={d.lab_hours}
                onChange={e => u('lab_hours', e.target.value)}
                placeholder="Dias e horários de coleta" />
            </FieldWrapper>

            <FieldWrapper
              label="Convênios aceitos no laboratório"
              hint="Pode ser diferente dos convênios de consulta"
              example="Ex: AMIL, Bradesco, Sulamerica | Apenas particular | Todos os convênios da clínica"
            >
              <textarea className="textarea min-h-[80px]"
                value={d.lab_convenios}
                onChange={e => u('lab_convenios', e.target.value)}
                placeholder="Liste os convênios aceitos no laboratório..." />
            </FieldWrapper>

            <FieldWrapper
              label="Tabela de valores (particular)"
              hint="Digite os principais exames e valores, ou envie um documento abaixo"
              example={`Ex:\nHemograma: R$ 12,00\nGlicose: R$ 9,00\nTSH: R$ 28,00\nVitamina D: R$ 50,00`}
            >
              <textarea className="textarea min-h-[120px]"
                value={d.lab_price_table}
                onChange={e => u('lab_price_table', e.target.value)}
                placeholder="Liste exames e valores particulares..." />
            </FieldWrapper>

            <div>
              <p className="field-label mb-2">Ou envie a tabela em documento</p>
              <FileUpload token={token} section="exams_lab"
                onTextExtracted={t => u('uploads_summary', d.uploads_summary ? `${d.uploads_summary}\n\n---\n${t}` : t)} />
            </div>
          </div>
        )}
      </div>

      {/* Imaging */}
      <div className="card space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-brand-navy">Exames de Imagem</h2>
            <p className="text-sm text-brand-mid mt-0.5">Ultrassom, raio-X, ecocardiograma, MAPA, etc.</p>
          </div>
          <button
            onClick={() => u('has_imaging', !d.has_imaging)}
            className={`relative w-12 h-6 rounded-full transition-colors ${d.has_imaging ? 'bg-brand-teal' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${d.has_imaging ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        {d.has_imaging && (
          <div className="space-y-4 border-t border-gray-100 pt-4">
            <FieldWrapper
              label="Descreva os exames de imagem disponíveis"
              hint="Quais exames são feitos, por quais profissionais, convênios aceitos e valores"
              example={`Ex:\nUltrassonografias realizadas pelo Dr. X — aceita convênios A, B e C — valor particular: R$ 170\nEcocardiograma pelo Dr. Y — convênios: lista em anexo — particular R$ 350\nMAPA 24h — somente 1 por dia — enviar para confirmação de horário`}
            >
              <textarea className="textarea min-h-[140px]"
                value={d.imaging_description}
                onChange={e => u('imaging_description', e.target.value)}
                placeholder="Descreva os exames de imagem, profissionais, convênios e valores..." />
            </FieldWrapper>

            <div>
              <p className="field-label mb-2">Tabela de exames em documento (opcional)</p>
              <FileUpload token={token} section="exams_imaging"
                onTextExtracted={t => u('uploads_summary', d.uploads_summary ? `${d.uploads_summary}\n\n---\n${t}` : t)} />
            </div>
          </div>
        )}
      </div>

      {/* Procedures */}
      <div className="card space-y-4">
        <div>
          <h2 className="text-base font-bold text-brand-navy">Procedimentos Especiais</h2>
          <p className="text-sm text-brand-mid mt-0.5">
            Infiltrações, biópsias, curativos, procedimentos estéticos, cirurgias, etc.
          </p>
        </div>
        <FieldWrapper
          label="Descreva os procedimentos realizados"
          hint="Inclua quem realiza, convênios aceitos, valores e regras específicas"
          example={`Ex:\nInfiltração — somente particular — valor por quantidade (1: R$ 350 / 2: R$ 700)\nCurativos — realizado pela enfermeira K — somente particular — tabela por tamanho da lesão\nBiópsia de mama — somente particular — tabela por nódulos em anexo`}
        >
          <textarea className="textarea min-h-[120px]"
            value={d.procedures}
            onChange={e => u('procedures', e.target.value)}
            placeholder="Descreva os procedimentos especiais da clínica..." />
        </FieldWrapper>

        <FileUpload token={token} section="procedures"
          onTextExtracted={t => u('uploads_summary', d.uploads_summary ? `${d.uploads_summary}\n\n---\n${t}` : t)}
          multiple />
      </div>

      {/* Preparation protocols */}
      <div className="card space-y-4">
        <div>
          <h2 className="text-base font-bold text-brand-navy">Preparos de Exame</h2>
          <p className="text-sm text-brand-mid mt-0.5">
            Instruções de preparo que o agente deve informar ao paciente no momento do agendamento.
          </p>
        </div>
        <FieldWrapper
          label="Protocolos de preparo"
          hint="Descreva os preparos necessários ou envie os documentos abaixo"
          example={`Ex:\nUSG Abdome Total: Jejum de 6h para adultos. Bexiga cheia (beber 5 copos d'água 1h antes).\nPesquisa de Endometriose: Preparo intestinal com laxante + enema no dia — protocolo completo em anexo\nExames de sangue em geral: Jejum de 8 a 12h`}
        >
          <textarea className="textarea min-h-[120px]"
            value={d.preparation_protocols}
            onChange={e => u('preparation_protocols', e.target.value)}
            placeholder="Descreva os preparos de exame que o agente deve informar ao paciente..." />
        </FieldWrapper>

        <FileUpload token={token} section="preparation"
          onTextExtracted={t => u('uploads_summary', d.uploads_summary ? `${d.uploads_summary}\n\n---\n${t}` : t)}
          multiple />
      </div>

      {!d.has_lab && !d.has_imaging && !d.procedures && (
        <div className="card bg-gray-50 border-gray-200">
          <p className="text-sm text-brand-mid text-center">
            Se sua clínica não oferece exames ou procedimentos além das consultas, pode ir para a próxima etapa.
          </p>
        </div>
      )}
    </div>
  )
}
