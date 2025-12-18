import * as xlsx from 'xlsx'
import { CityInput, SalaryInput } from '@/types/schema'

// 解析城市标准Excel文件
export function parseCitiesExcel(file: File): Promise<CityInput[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = xlsx.read(data, { type: 'array' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

        // 跳过表头，处理数据行
        const cities: CityInput[] = []
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i]
          if (row.length === 0 || !row[0]) continue // 跳过空行

          // 映射Excel列到数据库字段（处理字段名映射）
          const city: CityInput = {
            city_name: row[1] || row[0] || '', // 处理可能的列位置差异
            year: String(row[2] || row[1] || ''),
            rate: Number(row[3] || row[2]) || 0,
            base_min: Number(row[4] || row[3]) || 0,
            base_max: Number(row[5] || row[4]) || 0
          }

          cities.push(city)
        }

        resolve(cities)
      } catch (error) {
        reject(new Error(`解析城市数据文件失败: ${error instanceof Error ? error.message : '未知错误'}`))
      }
    }

    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(file)
  })
}

// 解析员工工资Excel文件
export function parseSalariesExcel(file: File): Promise<SalaryInput[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = xlsx.read(data, { type: 'array' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

        // 跳过表头，处理数据行
        const salaries: SalaryInput[] = []
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i]
          if (row.length === 0 || !row[0]) continue // 跳过空行

          const salary: SalaryInput = {
            employee_id: String(row[1] || ''),
            employee_name: String(row[2] || ''),
            month: String(row[3] || ''),
            salary_amount: Number(row[4]) || 0
          }

          salaries.push(salary)
        }

        resolve(salaries)
      } catch (error) {
        reject(new Error(`解析工资数据文件失败: ${error instanceof Error ? error.message : '未知错误'}`))
      }
    }

    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(file)
  })
}

// 验证Excel文件格式
export function validateExcelFile(file: File, type: 'cities' | 'salaries'): string | null {
  // 检查文件扩展名
  const validExtensions = ['.xlsx', '.xls']
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))

  if (!validExtensions.includes(fileExtension)) {
    return '请上传Excel文件（.xlsx或.xls格式）'
  }

  // 检查文件名（可选）
  if (type === 'cities' && !file.name.toLowerCase().includes('citie')) {
    return '请上传正确的城市标准文件（cities.xlsx）'
  }

  if (type === 'salaries' && !file.name.toLowerCase().includes('salar')) {
    return '请上传正确的工资数据文件（salaries.xlsx）'
  }

  return null
}