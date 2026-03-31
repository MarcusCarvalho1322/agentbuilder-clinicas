import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { extractTextFromBuffer, detectFileType } from '@/lib/extractText'

export const config = { api: { bodyParser: false } }

async function resolveOnboardingId(token: string): Promise<string | null> {
  try {
    const rows = await sql`SELECT id FROM onboardings WHERE token = ${token} LIMIT 1`
    return rows.length ? rows[0].id : null
  } catch {
    return null
  }
}

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  const { token } = params
  try {
    const onboardingId = await resolveOnboardingId(token)
    if (!onboardingId) return NextResponse.json({ error: 'Onboarding not found' }, { status: 404 })

    const uploads = await sql`
      SELECT id, original_name, description, file_type, file_size, upload_section, created_at
      FROM uploads
      WHERE onboarding_id = ${onboardingId}
      ORDER BY created_at ASC
    `
    return NextResponse.json(uploads)
  } catch (e) {
    console.error('List uploads error:', e)
    return NextResponse.json({ error: 'Failed to list uploads' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const { token } = params

  try {
    const onboardingId = await resolveOnboardingId(token)
    if (!onboardingId) return NextResponse.json({ error: 'Onboarding not found' }, { status: 404 })

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

    const inserted = await sql`
      INSERT INTO uploads (onboarding_id, original_name, description, file_type, extracted_text, file_size, upload_section)
      VALUES (${onboardingId}, ${file.name}, ${description}, ${fileType}, ${extractedText}, ${file.size}, ${section})
      RETURNING id
    `

    return NextResponse.json({
      success: true,
      id: inserted[0].id,
      extracted_text: extractedText,
      file_name: file.name,
      file_type: fileType,
    })
  } catch (e) {
    console.error('Upload error:', e)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { token: string } }) {
  const { token } = params
  const { searchParams } = new URL(req.url)
  const uploadId = searchParams.get('id')

  if (!uploadId) return NextResponse.json({ error: 'Upload id required' }, { status: 400 })

  try {
    const onboardingId = await resolveOnboardingId(token)
    if (!onboardingId) return NextResponse.json({ error: 'Onboarding not found' }, { status: 404 })

    const deleted = await sql`
      DELETE FROM uploads
      WHERE id = ${uploadId} AND onboarding_id = ${onboardingId}
      RETURNING id
    `
    if (!deleted.length) return NextResponse.json({ error: 'Upload not found' }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Delete upload error:', e)
    return NextResponse.json({ error: 'Failed to delete upload' }, { status: 500 })
  }
}
