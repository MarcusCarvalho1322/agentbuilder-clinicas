import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { extractTextFromBuffer, detectFileType } from '@/lib/extractText'

export const config = { api: { bodyParser: false } }

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const { token } = params

  try {
    // Verify token exists
    const rows = await sql`SELECT id FROM onboardings WHERE token = ${token} LIMIT 1`
    if (!rows.length) return NextResponse.json({ error: 'Onboarding not found' }, { status: 404 })
    const onboardingId = rows[0].id

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const description = formData.get('description') as string || ''
    const section = formData.get('section') as string || 'general'

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!description.trim()) return NextResponse.json({ error: 'Description required' }, { status: 400 })

    const MAX = 10 * 1024 * 1024
    if (file.size > MAX) return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileType = detectFileType(file.name, file.type)
    const extractedText = await extractTextFromBuffer(buffer, fileType, file.name)

    // Save to DB
    await sql`
      INSERT INTO uploads (onboarding_id, original_name, description, file_type, extracted_text, file_size, upload_section)
      VALUES (${onboardingId}, ${file.name}, ${description}, ${fileType}, ${extractedText}, ${file.size}, ${section})
    `

    return NextResponse.json({
      success: true,
      extracted_text: extractedText,
      file_name: file.name,
      file_type: fileType,
    })
  } catch (e) {
    console.error('Upload error:', e)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
