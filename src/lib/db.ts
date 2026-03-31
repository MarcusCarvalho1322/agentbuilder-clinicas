import { neon } from '@neondatabase/serverless'

let _sql: ReturnType<typeof neon> | null = null

export const sql = ((...args: any[]) => {
  if (!_sql) {
    _sql = neon(process.env.DATABASE_URL!)
  }
  return (_sql as any)(...args)
}) as ReturnType<typeof neon>
