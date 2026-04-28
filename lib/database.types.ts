export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          rut: string | null
          zone: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      dogs: {
        Row: {
          id: string
          owner_id: string
          name: string
          breed: string
          age: string
          sex: 'Macho' | 'Hembra'
          pedigree_number: string | null
          zone: string | null
          verified: boolean
          score: number
          photos: string[]
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['dogs']['Row'], 'id' | 'created_at' | 'verified' | 'score'>
        Update: Partial<Database['public']['Tables']['dogs']['Insert']> & { verified?: boolean; score?: number }
      }
      documents: {
        Row: {
          id: string
          dog_id: string
          type: 'pedigree' | 'vaccines' | 'health'
          file_url: string
          status: 'pending' | 'approved' | 'rejected'
          uploaded_at: string
          reviewed_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'id' | 'uploaded_at' | 'reviewed_at'>
        Update: Partial<Database['public']['Tables']['documents']['Insert']> & { reviewed_at?: string | null }
      }
      matches: {
        Row: {
          id: string
          dog_a_id: string
          dog_b_id: string
          status_a: 'pending' | 'accepted' | 'rejected'
          status_b: 'pending' | 'accepted' | 'rejected'
          contact_unlocked: boolean
          unlocked_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['matches']['Row'], 'id' | 'created_at' | 'unlocked_at'>
        Update: Partial<Database['public']['Tables']['matches']['Insert']> & { contact_unlocked?: boolean; unlocked_at?: string | null }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
