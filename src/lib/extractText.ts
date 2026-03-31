// Extração de texto de documentos enviados pelo cliente

export async function extractTextFromBuffer(
  buffer: Buffer,
  fileType: string,
  filename: string
): Promise<string> {
  const ext = filename.split('.').pop()?.toLowerCase() || fileType.toLowerCase()

  try {
    if (ext === 'pdf' || fileType === 'application/pdf') {
      const pdfParse = (await import('pdf-parse')).default
      const data = await pdfParse(buffer)
      return cleanExtractedText(data.text)
    }

    if (ext === 'docx' || fileType.includes('wordprocessingml')) {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      return cleanExtractedText(result.value)
    }

    if (ext === 'xlsx' || ext === 'xls' || fileType.includes('spreadsheet')) {
      const XLSX = await import('xlsx')
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const texts: string[] = []
      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName]
        const csv = XLSX.utils.sheet_to_csv(sheet)
        texts.push(`[Aba: ${sheetName}]\n${csv}`)
      })
      return cleanExtractedText(texts.join('\n\n'))
    }

    // Tentar como texto simples (txt, csv, etc)
    if (ext === 'txt' || ext === 'csv' || fileType.includes('text')) {
      return cleanExtractedText(buffer.toString('utf-8'))
    }

    return '[Tipo de arquivo não suportado para extração automática. Conteúdo disponível apenas na descrição fornecida pelo cliente.]'
  } catch (error) {
    console.error('Erro ao extrair texto:', error)
    return '[Falha na extração automática do documento. A equipe deve revisar o arquivo enviado.]'
  }
}

function cleanExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/[ \t]{3,}/g, '  ')
    .trim()
    .substring(0, 50000) // Limitar a 50k chars para não explodir o contexto
}

export function detectFileType(filename: string, mimeType: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return 'pdf'
  if (ext === 'docx' || ext === 'doc') return 'docx'
  if (ext === 'xlsx' || ext === 'xls') return 'xlsx'
  if (ext === 'txt') return 'txt'
  if (ext === 'csv') return 'csv'
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image'
  if (mimeType.includes('pdf')) return 'pdf'
  if (mimeType.includes('word')) return 'docx'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'xlsx'
  return 'other'
}
