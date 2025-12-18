import { createClient } from '@supabase/supabase-js'

// 安全地获取环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

// 验证必需的环境变量
if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required. Please check your .env.local file.')
}
if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required. Please check your .env.local file.')
}

// 创建客户端（用于前端操作）
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 创建服务端客户端（用于后端操作，有更高权限）
// 注意：在客户端组件中，我们将使用相同的 anon key
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase // 如果没有 service role key，回退到普通客户端

// 数据库表名常量
export const TABLES = {
  CITIES: 'cities',
  SALARIES: 'salaries',
  RESULTS: 'results'
} as const

// 类型定义
export interface City {
  id: number
  city_name: string
  year: string
  rate: number
  base_min: number
  base_max: number
}

export interface Salary {
  id: number
  employee_id: string
  employee_name: string
  month: string
  salary_amount: number
}

export interface Result {
  id: number
  employee_name: string
  avg_salary: number
  contribution_base: number
  company_fee: number
  created_at: string
}