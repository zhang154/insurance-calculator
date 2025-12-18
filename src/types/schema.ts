import { z } from 'zod'

// 城市标准数据验证模式
export const CitySchema = z.object({
  id: z.number().optional(),
  city_name: z.string().min(1, '城市名称不能为空'),
  year: z.string().min(4, '年份格式不正确').regex(/^\d{4}$/, '年份必须是4位数字'),
  rate: z.number().min(0, '费率不能为负数').max(1, '费率不能超过1'),
  base_min: z.number().min(0, '基数下限不能为负数'),
  base_max: z.number().min(0, '基数上限不能为负数')
})

// 员工工资数据验证模式
export const SalarySchema = z.object({
  id: z.number().optional(),
  employee_id: z.string().min(1, '员工工号不能为空'),
  employee_name: z.string().min(1, '员工姓名不能为空'),
  month: z.string().regex(/^\d{6}$/, '月份格式必须是YYYYMM'),
  salary_amount: z.number().min(0, '工资金额不能为负数')
})

// 计算结果数据验证模式
export const ResultSchema = z.object({
  id: z.number().optional(),
  employee_name: z.string().min(1, '员工姓名不能为空'),
  avg_salary: z.number().min(0, '平均工资不能为负数'),
  contribution_base: z.number().min(0, '缴费基数不能为负数'),
  company_fee: z.number().min(0, '公司缴费不能为负数')
})

// Excel上传数据类型
export type CityInput = z.infer<typeof CitySchema>
export type SalaryInput = z.infer<typeof SalarySchema>
export type ResultInput = z.infer<typeof ResultSchema>

// 计算参数类型
export interface CalculationParams {
  cityName: string
  year: string
}

// 计算结果类型
export interface CalculationResult {
  employee_name: string
  avg_salary: number
  contribution_base: number
  company_fee: number
}