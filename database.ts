import { supabaseAdmin, TABLES, CityInput, SalaryInput } from './supabase'
import { CitySchema, SalarySchema } from '@/types/schema'

/**
 * 批量插入城市标准数据
 */
export async function batchInsertCities(cities: CityInput[]): Promise<{ success: boolean; message: string }> {
  try {
    // 验证数据
    for (const city of cities) {
      const validation = CitySchema.safeParse(city)
      if (!validation.success) {
        return {
          success: false,
          message: `城市数据验证失败: ${validation.error.issues.map(e => e.message).join(', ')}`
        }
      }
    }

    // 清空现有数据（可选，根据需求决定）
    const { error: deleteError } = await supabaseAdmin
      .from(TABLES.CITIES)
      .delete()
      .neq('id', -1)

    if (deleteError) {
      throw new Error('清空现有城市数据失败: ' + deleteError.message)
    }

    // 批量插入新数据
    const { error: insertError } = await supabaseAdmin
      .from(TABLES.CITIES)
      .insert(cities)

    if (insertError) {
      throw new Error('插入城市数据失败: ' + insertError.message)
    }

    return {
      success: true,
      message: `成功插入 ${cities.length} 条城市标准数据`
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '插入城市数据时发生未知错误'
    }
  }
}

/**
 * 批量插入员工工资数据
 */
export async function batchInsertSalaries(salaries: SalaryInput[]): Promise<{ success: boolean; message: string }> {
  try {
    // 验证数据
    for (const salary of salaries) {
      const validation = SalarySchema.safeParse(salary)
      if (!validation.success) {
        return {
          success: false,
          message: `工资数据验证失败: ${validation.error.issues.map(e => e.message).join(', ')}`
        }
      }
    }

    // 清空现有数据（可选，根据需求决定）
    const { error: deleteError } = await supabaseAdmin
      .from(TABLES.SALARIES)
      .delete()
      .neq('id', -1)

    if (deleteError) {
      throw new Error('清空现有工资数据失败: ' + deleteError.message)
    }

    // 批量插入新数据
    const { error: insertError } = await supabaseAdmin
      .from(TABLES.SALARIES)
      .insert(salaries)

    if (insertError) {
      throw new Error('插入工资数据失败: ' + insertError.message)
    }

    return {
      success: true,
      message: `成功插入 ${salaries.length} 条工资数据`
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '插入工资数据时发生未知错误'
    }
  }
}

/**
 * 获取所有计算结果
 */
export async function getAllResults(): Promise<{ success: boolean; data?: any[]; message: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from(TABLES.RESULTS)
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error('获取计算结果失败: ' + error.message)
    }

    return {
      success: true,
      data: data || [],
      message: `成功获取 ${data?.length || 0} 条计算结果`
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '获取计算结果时发生未知错误'
    }
  }
}

/**
 * 获取数据统计信息
 */
export async function getDataStatistics(): Promise<{
  citiesCount: number
  salariesCount: number
  resultsCount: number
  employeesCount: number
}> {
  try {
    // 获取城市数量 - 使用 id 字段来计数
    const { data: citiesData, count: citiesCount } = await supabaseAdmin
      .from(TABLES.CITIES)
      .select('id', { count: 'exact' })

    // 获取工资记录数量 - 使用 id 字段来计数
    const { count: salariesCount } = await supabaseAdmin
      .from(TABLES.SALARIES)
      .select('id', { count: 'exact' })

    // 获取结果数量 - 使用 id 字段来计数
    const { count: resultsCount } = await supabaseAdmin
      .from(TABLES.RESULTS)
      .select('id', { count: 'exact' })

    // 获取员工数量（去重）
    const { data: employees } = await supabaseAdmin
      .from(TABLES.SALARIES)
      .select('employee_name')

    const uniqueEmployees = new Set(employees?.map(e => e.employee_name))
    const employeesCount = uniqueEmployees.size

    return {
      citiesCount: citiesCount || 0,
      salariesCount: salariesCount || 0,
      resultsCount: resultsCount || 0,
      employeesCount
    }
  } catch (error) {
    console.error('获取数据统计失败:', error)
    return {
      citiesCount: 0,
      salariesCount: 0,
      resultsCount: 0,
      employeesCount: 0
    }
  }
}