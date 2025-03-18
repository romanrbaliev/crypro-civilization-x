
import type { Database } from './types';

// Extend the Database type to include our custom functions
declare module './types' {
  export interface Database {
    public: {
      Functions: {
        create_saves_table: {
          Args: Record<PropertyKey, never>
          Returns: undefined
        }
        generate_unique_ref_code: {
          Args: Record<PropertyKey, never>
          Returns: string
        }
        update_referral_activation: {
          Args: { p_user_id: string; p_activated: boolean }
          Returns: undefined
        }
        check_referral_activation: {
          Args: { p_user_id: string }
          Returns: boolean
        }
        exec_sql: {
          Args: { sql: string }
          Returns: undefined
        }
      }
      Tables: {
        referral_data: {
          Row: {
            created_at: string | null
            is_activated: boolean
            referral_code: string
            referred_by: string | null
            user_id: string
          }
          Insert: {
            created_at?: string | null
            is_activated?: boolean
            referral_code: string
            referred_by?: string | null
            user_id: string
          }
          Update: {
            created_at?: string | null
            is_activated?: boolean
            referral_code?: string
            referred_by?: string | null
            user_id?: string
          }
        }
      }
    }
  }
}
