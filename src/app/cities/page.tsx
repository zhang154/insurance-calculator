'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'

interface City {
  id: number
  city_name: string
  year: string
  rate: number
  base_min: number
  base_max: number
  created_at: string
}

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [newCity, setNewCity] = useState({
    city_name: '',
    year: new Date().getFullYear().toString(),
    rate: '',
    base_min: '',
    base_max: ''
  })
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    loadCities()
  }, [])

  async function loadCities() {
    try {
      const { data, error } = await supabaseAdmin
        .from('cities')
        .select('*')
        .order('city_name', { ascending: true })
        .order('year', { ascending: false })

      if (error) {
        console.error('加载城市数据失败:', error)
      } else {
        setCities(data || [])
      }
    } catch (error) {
      console.error('加载失败:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddCity(e: React.FormEvent) {
    e.preventDefault()

    if (!newCity.city_name || !newCity.year || !newCity.rate || !newCity.base_min || !newCity.base_max) {
      alert('请填写所有必填字段')
      return
    }

    setIsAdding(true)
    try {
      const { error } = await supabaseAdmin
        .from('cities')
        .insert([{
          city_name: newCity.city_name,
          year: newCity.year,
          rate: parseFloat(newCity.rate),
          base_min: parseInt(newCity.base_min),
          base_max: parseInt(newCity.base_max)
        }])

      if (error) {
        alert('添加城市失败: ' + error.message)
      } else {
        alert('城市添加成功!')
        setNewCity({
          city_name: '',
          year: new Date().getFullYear().toString(),
          rate: '',
          base_min: '',
          base_max: ''
        })
        await loadCities()
      }
    } catch (error) {
      alert('操作失败: ' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setIsAdding(false)
    }
  }

  async function handleDeleteCity(id: number) {
    if (!confirm('确定要删除这个城市标准吗？')) return

    try {
      const { error } = await supabaseAdmin
        .from('cities')
        .delete()
        .eq('id', id)

      if (error) {
        alert('删除失败: ' + error.message)
      } else {
        alert('删除成功!')
        await loadCities()
      }
    } catch (error) {
      alert('操作失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载城市数据中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回首页
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">城市标准管理</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 添加新城市表单 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">添加新城市标准</h2>
          <form onSubmit={handleAddCity} className="grid md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">城市名称</label>
              <input
                type="text"
                value={newCity.city_name}
                onChange={(e) => setNewCity({...newCity, city_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="如：深圳、广州"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">年份</label>
              <input
                type="text"
                value={newCity.year}
                onChange={(e) => setNewCity({...newCity, year: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="如：2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">缴费比例</label>
              <input
                type="number"
                step="0.0001"
                value={newCity.rate}
                onChange={(e) => setNewCity({...newCity, rate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="如：0.14"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">基数下限</label>
              <input
                type="number"
                value={newCity.base_min}
                onChange={(e) => setNewCity({...newCity, base_min: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="如：3523"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">基数上限</label>
              <input
                type="number"
                value={newCity.base_max}
                onChange={(e) => setNewCity({...newCity, base_max: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="如：26421"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isAdding}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {isAdding ? '添加中...' : '添加城市'}
              </button>
            </div>
          </form>
        </div>

        {/* 城市列表 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            城市标准列表 ({cities.length} 个)
          </h2>

          {cities.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无城市数据</h3>
              <p className="text-gray-500">请添加第一个城市标准数据</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">城市</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">年份</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">缴费比例</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">基数下限</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">基数上限</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cities.map((city) => (
                    <tr key={city.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {city.city_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {city.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(city.rate * 100).toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ¥{city.base_min.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ¥{city.base_max.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button
                          onClick={() => handleDeleteCity(city.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 快速操作提示 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 批量导入提示</h3>
          <p className="text-blue-700 text-sm mb-3">
            除了手动添加，你也可以通过上传Excel文件批量导入多个城市的标准数据。格式参考：
          </p>
          <ul className="text-blue-700 text-sm list-disc list-inside space-y-1">
            <li>Excel文件格式：.xlsx 或 .xls</li>
            <li>列顺序：id, city_name, year, rate, base_min, base_max</li>
            <li>rate: 使用小数，如 0.14 表示 14%</li>
          </ul>
          <Link
            href="/upload"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm mt-3"
          >
            前往批量上传页面
          </Link>
        </div>
      </main>
    </div>
  )
}