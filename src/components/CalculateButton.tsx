'use client'

import { useState } from 'react'
import { executeCalculationAndSave, getAvailableCities } from '@/lib/calculator'

interface CalculateButtonProps {
  onCalculationComplete?: (success: boolean, message: string, results?: any[]) => void
}

export default function CalculateButton({ onCalculationComplete }: CalculateButtonProps) {
  const [isCalculating, setIsCalculating] = useState(false)
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [availableCities, setAvailableCities] = useState<Array<{ city_name: string; year: string }>>([])
  const [showCitySelect, setShowCitySelect] = useState(false)

  const loadAvailableCities = async () => {
    try {
      const cities = await getAvailableCities()
      setAvailableCities(cities)
      if (cities.length > 0) {
        setSelectedCity(cities[0].city_name)
        setSelectedYear(cities[0].year)
      }
    } catch (error) {
      console.error('加载城市列表失败:', error)
    }
  }

  const handleCalculateClick = async () => {
    setIsCalculating(true)

    try {
      // 加载可用城市
      const cities = await getAvailableCities()
      setAvailableCities(cities)

      if (cities.length === 0) {
        onCalculationComplete?.(false, '没有找到可用的城市标准数据，请先上传城市数据文件')
        setIsCalculating(false)
        return
      }

      // 设置默认选择
      setSelectedCity(cities[0].city_name)
      setSelectedYear(cities[0].year)

      // 如果只有一个城市，直接计算
      if (cities.length === 1) {
        const result = await executeCalculationAndSave({
          cityName: cities[0].city_name,
          year: cities[0].year
        })
        onCalculationComplete?.(result.success, result.message, result.results)
      } else {
        // 显示城市选择对话框
        setShowCitySelect(true)
      }
    } catch (error) {
      onCalculationComplete?.(false, `计算失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }

    setIsCalculating(false)
  }

  const confirmCalculation = async () => {
    setShowCitySelect(false)
    setIsCalculating(true)

    try {
      const result = await executeCalculationAndSave({
        cityName: selectedCity,
        year: selectedYear
      })
      onCalculationComplete?.(result.success, result.message, result.results)
    } catch (error) {
      onCalculationComplete?.(false, `计算失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }

    setIsCalculating(false)
  }

  return (
    <>
      <button
        onClick={handleCalculateClick}
        disabled={isCalculating}
        className="w-full md:w-auto px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
      >
        {isCalculating ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            计算中...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            执行计算并存储结果
          </>
        )}
      </button>

      {/* 城市选择对话框 */}
      {showCitySelect && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">选择计算参数</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  城市
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableCities.map((city, index) => (
                    <option key={index} value={city.city_name}>
                      {city.city_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  年份
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from(new Set(availableCities.map(c => c.year))).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowCitySelect(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmCalculation}
                disabled={isCalculating}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {isCalculating ? '计算中...' : '确认计算'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}