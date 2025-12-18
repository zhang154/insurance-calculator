'use client'

import { useState, useEffect } from 'react'
import { supabaseAdmin } from '@/lib/supabase'

export default function DebugCalculation() {
  const [cities, setCities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function debugCalculation() {
      try {
        console.log('🔍 开始调试计算流程...')

        // 1. 检查数据库连接
        console.log('📍 测试数据库连接...')
        const { data: testData, error: testError, count: totalCount } = await supabaseAdmin
          .from('cities')
          .select('id', { count: 'exact' })

        if (testError) {
          console.error('❌ 数据库连接失败:', testError)
          return
        }

        console.log('✅ 数据库连接成功，总记录数:', totalCount || 0)

        // 2. 获取所有城市数据
        console.log('📊 获取城市列表...')
        const { data: citiesData, error: citiesError } = await supabaseAdmin
          .from('cities')
          .select('*')
          .limit(5)

        if (citiesError) {
          console.error('❌ 获取城市数据失败:', citiesError)
        } else {
          console.log('✅ 城市数据:', citiesData)
          setCities(citiesData || [])
        }

        // 3. 模拟 getAvailableCities 函数
        console.log('🔍 模拟 getAvailableCities 函数...')
        const { data: availableCities, error: availableError } = await supabaseAdmin
          .from('cities')
          .select('city_name, year')
          .order('year', { ascending: false })
          .order('city_name', { ascending: true })

        if (availableError) {
          console.error('❌ 获取可用城市失败:', availableError)
        } else {
          console.log('✅ 可用城市:', availableCities)
          console.log('城市数量:', availableCities?.length || 0)
        }

        // 4. 检查表结构
        console.log('🏗️ 检查表结构...')
        const { data: schema } = await supabaseAdmin
          .from('cities')
          .select('*')
          .limit(1)

        if (schema && schema.length > 0) {
          console.log('✅ 表结构:', Object.keys(schema[0]))
        }

        setLoading(false)
      } catch (error) {
        console.error('💥 调试过程中发生错误:', error)
        setLoading(false)
      }
    }

    debugCalculation()
  }, [])

  if (loading) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold text-red-800 mb-2">调试中...</h3>
        <p className="text-red-600">请查看浏览器控制台的详细输出</p>
      </div>
    )
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">计算调试信息</h3>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="font-medium text-yellow-700">数据库连接状态:</span>
          <span className="text-yellow-600">✅ 正常</span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium text-yellow-700">城市数据数量:</span>
          <span className="text-yellow-600">{cities.length} 条</span>
        </div>

        {cities.length > 0 && (
          <div className="mt-3">
            <h4 className="font-semibold text-yellow-700 mb-1">前3条城市数据:</h4>
            {cities.slice(0, 3).map((city, index) => (
              <div key={index} className="text-sm text-yellow-600 bg-yellow-100 p-2 rounded">
                ID: {city.id}, 城市: "{city.city_name}", 年份: {city.year}, 费率: {city.rate}
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 text-sm text-yellow-600">
          <p><strong>📋 排查步骤:</strong></p>
          <ol className="list-decimal list-inside space-y-1 mt-1">
            <li>检查上方控制台输出，确认城市数据是否正确加载</li>
            <li>如果控制台显示"可用城市: []"，说明数据库为空</li>
            <li>如果数据正常，问题可能在计算函数的逻辑中</li>
          </ol>
        </div>
      </div>
    </div>
  )
}