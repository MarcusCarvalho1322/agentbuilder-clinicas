'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, File, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react'

interface UploadedFile {
  id: string
  dbId?: string
  name: string
  description: string
  status: 'uploading' | 'success' | 'error'
  error?: string
  extractedText?: string
}

interface Props {
  token: string
  section: string
  onTextExtracted: (text: string) => void
  multiple?: boolean
}

export default function FileUpload({ token, section, onTextExtracted, multiple = false }: Props) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const ACCEPTED = '.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.jpg,.jpeg,.png'
  const MAX_SIZE = 10 * 1024 * 1024 // 10MB

  const handleFileSelect = (file: File) => {
    if (file.size > MAX_SIZE) {
      alert('Arquivo muito grande. Máximo permitido: 10MB')
      return
    }
    setPendingFile(file)
    setDescription('')
  }

  const uploadFile = async () => {
    if (!pendingFile || !description.trim()) return

    const uploadEntry: UploadedFile = {
      id: Math.random().toString(36).slice(2),
      name: pendingFile.name,
      description,
      status: 'uploading'
    }
    setFiles(prev => [...prev, uploadEntry])

    const formData = new FormData()
    formData.append('file', pendingFile)
    formData.append('description', description)
    formData.append('section', section)

    try {
      const res = await fetch(`/api/onboarding/${token}/upload`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Erro no upload')

      setFiles(prev => prev.map(f =>
        f.id === uploadEntry.id
          ? { ...f, status: 'success', dbId: data.id, extractedText: data.extracted_text }
          : f
      ))

      if (data.extracted_text) {
        onTextExtracted(data.extracted_text)
      }
    } catch (err) {
      setFiles(prev => prev.map(f =>
        f.id === uploadEntry.id
          ? { ...f, status: 'error', error: 'Falha no upload. Tente novamente.' }
          : f
      ))
    }

    setPendingFile(null)
    setDescription('')
  }

  const removeFile = async (id: string) => {
    const file = files.find(f => f.id === id)
    if (file?.dbId) {
      try {
        await fetch(`/api/onboarding/${token}/upload?id=${file.dbId}`, { method: 'DELETE' })
      } catch (err) {
        console.error('Failed to delete upload from server:', err)
      }
    }
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }, [])

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {(!files.length || multiple) && !pendingFile && (
        <div
          className={`drop-zone ${isDragging ? 'active' : ''}`}
          onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="w-8 h-8 text-brand-teal mb-3" />
          <p className="text-sm font-semibold text-brand-dark">
            Arraste o arquivo aqui ou clique para selecionar
          </p>
          <p className="text-xs text-brand-mid mt-1">
            PDF, Word, Excel, imagem • Máximo 10MB
          </p>
          <input ref={fileRef} type="file" accept={ACCEPTED} className="hidden"
            onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
        </div>
      )}

      {/* Pending file - needs description */}
      {pendingFile && (
        <div className="border-2 border-brand-teal bg-brand-lteal rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <File className="w-8 h-8 text-brand-teal flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-brand-dark truncate">{pendingFile.name}</p>
              <p className="text-xs text-brand-mid">
                {(pendingFile.size / 1024).toFixed(0)} KB
              </p>
            </div>
            <button onClick={() => setPendingFile(null)}
              className="p-1 hover:bg-white/50 rounded-lg transition-colors">
              <X className="w-4 h-4 text-brand-mid" />
            </button>
          </div>

          <div>
            <label className="field-label">
              Descreva o que é este documento *
            </label>
            <p className="field-hint mb-2">
              Esta descrição ajuda o agente a entender o conteúdo e para que serve este arquivo.
            </p>
            <textarea
              className="textarea bg-white min-h-[80px]"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={
                section === 'convenios'
                  ? 'Ex: Lista de convênios credenciados com regras específicas de cobertura por especialidade'
                  : section === 'exams'
                  ? 'Ex: Tabela de exames laboratoriais com valores particulares e convênios aceitos'
                  : 'Descreva o conteúdo e a finalidade deste documento...'
              }
              autoFocus
            />
          </div>

          <button
            onClick={uploadFile}
            disabled={!description.trim()}
            className="btn-primary w-full justify-center"
          >
            Confirmar envio
          </button>
        </div>
      )}

      {/* Uploaded files list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map(f => (
            <div key={f.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
              {f.status === 'uploading' && <Loader2 className="w-5 h-5 text-brand-teal animate-spin flex-shrink-0" />}
              {f.status === 'success' && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />}
              {f.status === 'error' && <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-brand-dark truncate">{f.name}</p>
                <p className="text-xs text-brand-mid truncate">{f.description}</p>
                {f.status === 'error' && <p className="text-xs text-red-500">{f.error}</p>}
              </div>
              <button onClick={() => removeFile(f.id)}
                className="p-1 hover:bg-gray-100 rounded transition-colors">
                <X className="w-3.5 h-3.5 text-brand-mid" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
