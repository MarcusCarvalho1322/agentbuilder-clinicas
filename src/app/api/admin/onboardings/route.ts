// Admin API - List all onboardings
// src/app/api/admin/onboardings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

function checkAuth(req: NextRequest) {
  const auth = req.headers.get('x-admin-secret')
  return auth === process.env.ADMIN_SECRET
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const rows = await sql`
      SELECT id, token, client_name, client_email, clinic_name,
             status, current_step, created_at, updated_at, completed_at, generated_at
      FROM onboardings
      ORDER BY updated_at DESC
    `
    return NextResponse.json(rows)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { client_name, client_email } = await req.json()
    const { nanoid } = await import('nanoid')
    const token = nanoid(24)

    const rows = await sql`
      INSERT INTO onboardings (token, client_name, client_email)
      VALUES (${token}, ${client_name || null}, ${client_email || null})
      RETURNING *
    `
    const onboarding = rows[0]
    const link = `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/${token}`

    // Notify n8n to send link to client
    const webhookUrl = process.env.N8N_WEBHOOK_NEW
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, client_name, client_email, link })
      }).catch(console.error)
    }

    return NextResponse.json({ ...onboarding, link }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
