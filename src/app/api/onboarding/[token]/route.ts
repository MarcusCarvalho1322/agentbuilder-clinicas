// src/app/api/onboarding/[token]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  try {
    const rows = await sql`SELECT * FROM onboardings WHERE token = ${token} LIMIT 1`
    if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  try {
    const body = await req.json()
    const { data, current_step } = body

    // Extract clinic name from identity if present
    const clinicName = data?.identity?.clinic_name || null

    const rows = await sql`
      UPDATE onboardings
      SET data = ${JSON.stringify(data)},
          current_step = ${current_step},
          clinic_name = COALESCE(${clinicName}, clinic_name)
      WHERE token = ${token}
      RETURNING *
    `
    if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
