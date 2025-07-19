import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our tables
export interface BankQuote {
  id: string
  bank_name: string
  quote_type: string
  rate: number
  amount_min: number
  amount_max: number
  duration_days: number
  valid_until: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface DepositQuote {
  id: string
  institution_name: string
  deposit_type: string
  rate: number
  amount_min: number
  amount_max: number
  duration_days: number
  early_withdrawal_penalty: number
  currency: string
  risk_rating: string
  valid_until: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface TransactionHistory {
  id: string
  transaction_type: string
  amount: number
  source_institution: string
  target_institution?: string
  rate?: number
  duration_days?: number
  status: string
  executed_by?: string
  execution_date: string
  maturity_date?: string
  actual_return: number
  expected_return: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface ProjectedTransaction {
  id: string
  transaction_date: string
  amount: number
  source_institution: string
  transaction_type: string
  probability: number
  expected_return: number
  duration_days: number
  notes?: string
  created_at: string
  updated_at: string
}