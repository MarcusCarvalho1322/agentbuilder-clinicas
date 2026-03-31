import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { generateDocuments, type OnboardingData } from '@/lib/claude'

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  try {
    // Load onboarding
    const rows = await sql`SELECT * FROM onboardings WHERE token = ${token} LIMIT 1`
    if (!rows.length) return NextResponse.json({ error: 'Onboarding not found' }, { status: 404 })
    const onboarding = rows[0]

    // Mark as generating
    await sql`UPDATE onboardings SET status = 'generating' WHERE token = ${token}`

    const data = onboarding.data as Record<string, unknown>

    // Build the payload for Claude
    const payload: OnboardingData = {
      profile: data.profile as OnboardingData['profile'],
      identity: data.identity as OnboardingData['identity'],
      convenios: data.convenios as OnboardingData['convenios'],
      professionals: data.professionals as OnboardingData['professionals'],
      exams: data.exams as OnboardingData['exams'] || { has_lab: false, has_imaging: false },
      payment: data.payment as OnboardingData['payment'],
      documents_summary: data.documents_summary as string || '',
      faq_extracted: data.faq_extracted as string | undefined,
      generated_at: new Date().toISOString(),
    }

    // Call Claude API
    const generated = await generateDocuments(payload)

    // Save generated documents
    const docTypes = [
      { key: 'bloco1_master_prompt', title: 'Bloco 1 — Master Prompt (Regras do Agente)' },
      { key: 'bloco2_knowledge_base', title: 'Bloco 2 — Base de Conhecimento' },
      { key: 'message_library', title: 'Biblioteca de Mensagens com Variações' },
      { key: 'handoff_template', title: 'Template de Resumo de Handoff' },
      { key: 'quality_report', title: 'Relatório de Qualidade e Checklist' },
    ]

    for (const doc of docTypes) {
      const content = generated[doc.key as keyof typeof generated]
      if (content) {
        await sql`
          INSERT INTO generated_documents (onboarding_id, doc_type, title, content, format)
          VALUES (${onboarding.id}, ${doc.key}, ${doc.title}, ${content}, 'txt')
        `
      }
    }

    // Update status
    await sql`
      UPDATE onboardings
      SET status = 'generated', generated_at = NOW(), completed_at = NOW()
      WHERE token = ${token}
    `

    // Notify n8n (fire and forget)
    const webhookUrl = process.env.N8N_WEBHOOK_COMPLETED
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          clinic_name: onboarding.clinic_name,
          client_email: onboarding.client_email,
          generated_at: new Date().toISOString(),
          admin_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard/${onboarding.id}`,
        })
      }).catch(console.error)
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Generation error:', e)
    // Revert status on error
    await sql`UPDATE onboardings SET status = 'in_progress' WHERE token = ${token}`
    return NextResponse.json({ error: 'Falha na geração. Por favor, tente novamente.' }, { status: 500 })
  }
}
