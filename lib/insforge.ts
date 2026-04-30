import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_INSFORGE_URL ?? ''
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY ?? ''

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const insforge = createClient<any>(url, anonKey)
