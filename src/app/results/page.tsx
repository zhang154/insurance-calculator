'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getAllResults } from '@/lib/database'
import ResultsTable from '@/components/ResultsTable'

interface Result {
  id: number
  employee_name: string
  avg_salary: number
  contribution_base: number
  company_fee: number
  created_at: string
}

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadResults()
  }, [])

  const loadResults = async () => {
    try {
      setLoading(true)
      const result = await getAllResults()

      if (result.success && result.data) {
        setResults(result.data)
      } else {
        setError(result.message || '加载结果失败')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载结果时发生错误')
    } finally {
      setLoading(false)
    }
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
            <h1 className="text-xl font-semibold text-gray-900">结果查询与展示</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题和描述 */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            社保费用计算结果
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            查看已计算完成的员工社保费用结果，支持数据排序、导出和打印功能。
          </p>
        </div>

        {/* 内容区域 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">加载计算结果中...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <div className="space-x-4">
                <button
                  onClick={loadResults}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  重新加载
                </button>
                <Link
                  href="/upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  前往上传数据
                </Link>
              </div>
            </div>
          ) : (
            <ResultsTable data={results} />
          )}
        </div>

        {/* 统计信息 */}
        {!loading && !error && results.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">数据统计概览</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{results.length}</div>
                <div className="text-sm text-gray-600 mt-1">员工总数</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  ¥{results.reduce((sum, item) => sum + item.avg_salary, 0).toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
                </div>
                <div className="text-sm text-gray-600 mt-1">平均工资总额</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  ¥{results.reduce((sum, item) => sum + item.contribution_base, 0).toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
                </div>
                <div className="text-sm text-gray-600 mt-1">缴费基数总额</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  ¥{results.reduce((sum, item) => sum + item.company_fee, 0).toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
                </div>
                <div className="text-sm text-gray-600 mt-1">公司月缴费总额</div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  最后更新时间：{results.length > 0 && new Date(results[0].created_at).toLocaleString('zh-CN')}
                </div>
                <Link
                  href="/upload"
                  className="text-sm text-blue-600 hover:text-blue-500 underline"
                >
                  重新计算 →
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 打印样式 */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:shadow-none,
          .print\\:shadow-none * {
            visibility: visible;
          }
          .print\\:shadow-none {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}