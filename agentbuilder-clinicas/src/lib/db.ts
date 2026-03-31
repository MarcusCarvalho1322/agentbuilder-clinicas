import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não configurada')
}

export const sql = neon(process.env.DATABASE_URL)

export type OnboardingStatus =
  | 'in_progress'
  | 'completed'
  | 'generating'
  | 'generated'
  | 'delivered'

export interface Onboarding {
  id: string
  token: string
  client_email: string | null
  client_name: string | null
  clinic_name: string | null
  status: OnboardingStatus
  current_step: number
  data: Record<string, unknown>
  validation: Record<string, 'valid' | 'incomplete' | 'error' | 'optional'>
  created_at: string
  updated_at: string
  completed_at: string | null
  generated_at: string | null
}

export interface Upload {
  id: string
  onboarding_id: string
  original_name: string
  description: string
  file_type: string
  extracted_text: string | null
  file_size: number | null
  upload_section: string | null
  created_at: string
}

export interface GeneratedDocument {
  id: string
  onboarding_id: string
  doc_type: string
  title: string
  content: string
  format: string
  created_at: string
}
