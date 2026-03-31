import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-secret') === process.env.ADMIN_SECRET
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const rows = await sql`SELECT * FROM onboardings WHERE id = ${params.id} LIMIT 1`
    if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const docs = await sql`
      SELECT * FROM generated_documents
      WHERE onboarding_id = ${params.id}
      ORDER BY created_at ASC
    `
    return NextResponse.json({ onboarding: rows[0], documents: docs })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { status } = await req.json()
    const rows = await sql`
      UPDATE onboardings SET status = ${status} WHERE id = ${params.id} RETURNING *
    `
    return NextResponse.json(rows[0])
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
