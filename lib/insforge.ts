import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const url = process.env.NEXT_PUBLIC_INSFORGE_URL!
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!

if (!url || !anonKey) {
  throw new Error('Missing NEXT_PUBLIC_INSFORGE_URL or NEXT_PUBLIC_INSFORGE_ANON_KEY in .env.local')
}

export const insforge = createClient<Database>(url, anonKey)
