import { supabaseAdmin, TABLES, City, Salary, Result } from './supabase'
import { CalculationParams, CalculationResult } from '@/types/schema'

/**
 * 计算社保缴纳费用的核心函数
 * @param params 计算参数（城市名称和年份）
 * @returns Promise<CalculationResult[]> 计算结果数组
 */
export async function calculateInsuranceFees(params: CalculationParams): Promise<CalculationResult[]> {
  try {
    // 1. 获取城市标准数据（支持城市名称别名）
    const normalizedCityName = normalizeCityName(params.cityName)

    const { data: cityData, error: cityError } = await supabaseAdmin
      .from(TABLES.CITIES)
      .select('*')
      .eq('city_name', normalizedCityName)
      .eq('year', params.year)
      .single()

    if (cityError || !cityData) {
      throw new Error(`未找到城市 ${params.cityName} 在 ${params.year} 年的社保标准数据`)
    }

    // 2. 获取所有工资数据
    const { data: salaryData, error: salaryError } = await supabaseAdmin
      .from(TABLES.SALARIES)
      .select('*')

    if (salaryError) {
      throw new Error('获取工资数据失败: ' + salaryError.message)
    }

    if (!salaryData || salaryData.length === 0) {
      throw new Error('没有找到工资数据')
    }

    // 3. 按员工分组计算平均工资
    const salaryGroups = groupSalariesByEmployee(salaryData)
    const employeeAverageSalaries = calculateAverageSalaries(salaryGroups)

    // 4. 计算每位员工的缴费基数和公司应缴费用
    const results: CalculationResult[] = []

    for (const [employeeName, avgSalary] of employeeAverageSalaries.entries()) {
      // 确定缴费基数
      const contributionBase = calculateContributionBase(
        avgSalary,
        cityData.base_min,
        cityData.base_max
      )

      // 计算公司应缴费用
      const companyFee = contributionBase * cityData.rate

      results.push({
        employee_name: employeeName,
        avg_salary: Math.round(avgSalary * 100) / 100, // 保留两位小数
        contribution_base: Math.round(contributionBase * 100) / 100,
        company_fee: Math.round(companyFee * 100) / 100
      })
    }

    return results
  } catch (error) {
    console.error('计算社保费用失败:', error)
    throw error
  }
}

/**
 * 执行计算并保存结果到数据库
 * @param params 计算参数
 * @returns Promise<{ success: boolean; message: string; results?: CalculationResult[] }>
 */
export async function executeCalculationAndSave(params: CalculationParams): Promise<{
  success: boolean
  message: string
  results?: CalculationResult[]
}> {
  try {
    // 1. 执行计算
    const calculationResults = await calculateInsuranceFees(params)

    // 2. 清空现有的结果表
    const { error: deleteError } = await supabaseAdmin
      .from(TABLES.RESULTS)
      .delete()
      .neq('id', -1) // 删除所有记录

    if (deleteError) {
      throw new Error('清空现有结果失败: ' + deleteError.message)
    }

    // 3. 插入新的计算结果
    const { error: insertError } = await supabaseAdmin
      .from(TABLES.RESULTS)
      .insert(calculationResults)

    if (insertError) {
      throw new Error('保存计算结果失败: ' + insertError.message)
    }

    return {
      success: true,
      message: `成功计算并保存了 ${calculationResults.length} 位员工的社保费用`,
      results: calculationResults
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '计算过程中发生未知错误'
    }
  }
}

/**
 * 将工资数据按员工分组
 */
function groupSalariesByEmployee(salaries: Salary[]): Map<string, Salary[]> {
  const groups = new Map<string, Salary[]>()

  for (const salary of salaries) {
    if (!groups.has(salary.employee_name)) {
      groups.set(salary.employee_name, [])
    }
    groups.get(salary.employee_name)!.push(salary)
  }

  return groups
}

/**
 * 计算每位员工的年度月平均工资
 */
function calculateAverageSalaries(salaryGroups: Map<string, Salary[]>): Map<string, number> {
  const averageSalaries = new Map<string, number>()

  for (const [employeeName, employeeSalaries] of salaryGroups.entries()) {
    const totalSalary = employeeSalaries.reduce((sum, salary) => sum + salary.salary_amount, 0)
    const averageSalary = totalSalary / employeeSalaries.length
    averageSalaries.set(employeeName, averageSalary)
  }

  return averageSalaries
}

/**
 * 计算缴费基数
 * @param avgSalary 平均工资
 * @param baseMin 基数下限
 * @param baseMax 基数上限
 * @returns 最终缴费基数
 */
function calculateContributionBase(avgSalary: number, baseMin: number, baseMax: number): number {
  if (avgSalary < baseMin) {
    return baseMin
  } else if (avgSalary > baseMax) {
    return baseMax
  } else {
    return avgSalary
  }
}

/**
 * 获取可用的城市列表
 */
export async function getAvailableCities(): Promise<{ city_name: string; year: string }[]> {
  const { data, error } = await supabaseAdmin
    .from(TABLES.CITIES)
    .select('city_name, year')
    .order('year', { ascending: false })
    .order('city_name', { ascending: true })

  if (error) {
    throw new Error('获取城市列表失败: ' + error.message)
  }

  return data || []
}

/**
 * 标准化城市名称（处理可能的别名）
 */
function normalizeCityName(cityName: string): string {
  const cityMappings: { [key: string]: string } = {
    '南山': '佛山',
    '深圳市南山区': '佛山',
    '深圳南山': '佛山',
    // 可以添加更多映射
  }

  return cityMappings[cityName] || cityName
}