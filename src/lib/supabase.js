import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zzgyqdpwywjsrnrptzqq.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_qk8gii3E1h-e_Ap_aegQ3A_v2PUD5LB'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

