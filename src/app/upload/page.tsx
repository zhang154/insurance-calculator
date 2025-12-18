'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { parseCitiesExcel, parseSalariesExcel } from '@/utils/excelParser'
import { batchInsertCities, batchInsertSalaries, getDataStatistics } from '@/lib/database'
import FileUploader from '@/components/FileUploader'
import CalculateButton from '@/components/CalculateButton'
import DebugCalculation from '@/components/DebugCalculation'

export default function UploadPage() {
  const [citiesFile, setCitiesFile] = useState<File | null>(null)
  const [salariesFile, setSalariesFile] = useState<File | null>(null)
  const [isUploadingCities, setIsUploadingCities] = useState(false)
  const [isUploadingSalaries, setIsUploadingSalaries] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{
    cities?: { success: boolean; message: string }
    salaries?: { success: boolean; message: string }
    calculation?: { success: boolean; message: string; results?: any[] }
  }>({})
  const [statistics, setStatistics] = useState({
    citiesCount: 0,
    salariesCount: 0,
    resultsCount: 0,
    employeesCount: 0
  })

  // 加载数据统计
  const loadStatistics = async () => {
    try {
      const stats = await getDataStatistics()
      setStatistics(stats)
    } catch (error) {
      console.error('加载统计数据失败:', error)
    }
  }

  // 页面加载时获取统计数据
  React.useEffect(() => {
    loadStatistics()
  }, [])

  // 处理城市数据上传
  const handleCitiesUpload = async (file: File) => {
    setIsUploadingCities(true)
    setCitiesFile(file)

    try {
      const citiesData = await parseCitiesExcel(file)
      const result = await batchInsertCities(citiesData)

      setUploadStatus(prev => ({
        ...prev,
        cities: result
      }))

      // 上传成功后重新加载统计数据
      if (result.success) {
        await loadStatistics()
      }
    } catch (error) {
      setUploadStatus(prev => ({
        ...prev,
        cities: {
          success: false,
          message: error instanceof Error ? error.message : '上传失败'
        }
      }))
    }

    setIsUploadingCities(false)
  }

  // 处理工资数据上传
  const handleSalariesUpload = async (file: File) => {
    setIsUploadingSalaries(true)
    setSalariesFile(file)

    try {
      const salariesData = await parseSalariesExcel(file)
      const result = await batchInsertSalaries(salariesData)

      setUploadStatus(prev => ({
        ...prev,
        salaries: result
      }))

      // 上传成功后重新加载统计数据
      if (result.success) {
        await loadStatistics()
      }
    } catch (error) {
      setUploadStatus(prev => ({
        ...prev,
        salaries: {
          success: false,
          message: error instanceof Error ? error.message : '上传失败'
        }
      }))
    }

    setIsUploadingSalaries(false)
  }

  // 处理计算完成
  const handleCalculationComplete = async (success: boolean, message: string, results?: any[]) => {
    setUploadStatus(prev => ({
      ...prev,
      calculation: { success, message, results }
    }))

    // 计算完成或失败后重新加载统计数据
    await loadStatistics()
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
            <h1 className="text-xl font-semibold text-gray-900">数据上传与操作</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 调试信息 */}
        <DebugCalculation />

        {/* 数据统计 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">当前数据统计</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{statistics.citiesCount}</div>
              <div className="text-sm text-blue-600 mt-1">城市标准</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{statistics.salariesCount}</div>
              <div className="text-sm text-green-600 mt-1">工资记录</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{statistics.employeesCount}</div>
              <div className="text-sm text-purple-600 mt-1">员工数量</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{statistics.resultsCount}</div>
              <div className="text-sm text-orange-600 mt-1">计算结果</div>
            </div>
          </div>
        </div>

        {/* 文件上传区域 */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <FileUploader
            onFileSelect={handleCitiesUpload}
            accept=".xlsx,.xls"
            title="上传城市标准数据"
            description="上传包含城市社保标准的Excel文件（cities.xlsx）"
            type="cities"
            isUploading={isUploadingCities}
          />

          <FileUploader
            onFileSelect={handleSalariesUpload}
            accept=".xlsx,.xls"
            title="上传员工工资数据"
            description="上传包含员工工资信息的Excel文件（salaries.xlsx）"
            type="salaries"
            isUploading={isUploadingSalaries}
          />
        </div>

        {/* 执行计算按钮 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">执行计算</h2>
          <p className="text-gray-600 mb-4">
            点击下方按钮，系统将根据已上传的数据自动计算每位员工的社保费用，并将结果保存到数据库中。
          </p>
          <CalculateButton onCalculationComplete={handleCalculationComplete} />
        </div>

        {/* 状态消息 */}
        {(uploadStatus.cities || uploadStatus.salaries || uploadStatus.calculation) && (
          <div className="space-y-4">
            {uploadStatus.cities && (
              <div className={`p-4 rounded-lg ${
                uploadStatus.cities.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {uploadStatus.cities.success ? (
                      <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${
                      uploadStatus.cities.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      城市数据上传{uploadStatus.cities.success ? '成功' : '失败'}
                    </h3>
                    <div className={`mt-2 text-sm ${
                      uploadStatus.cities.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {uploadStatus.cities.message}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {uploadStatus.salaries && (
              <div className={`p-4 rounded-lg ${
                uploadStatus.salaries.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {uploadStatus.salaries.success ? (
                      <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${
                      uploadStatus.salaries.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      工资数据上传{uploadStatus.salaries.success ? '成功' : '失败'}
                    </h3>
                    <div className={`mt-2 text-sm ${
                      uploadStatus.salaries.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {uploadStatus.salaries.message}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {uploadStatus.calculation && (
              <div className={`p-4 rounded-lg ${
                uploadStatus.calculation.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {uploadStatus.calculation.success ? (
                      <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${
                      uploadStatus.calculation.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      社保费用计算{uploadStatus.calculation.success ? '成功' : '失败'}
                    </h3>
                    <div className={`mt-2 text-sm ${
                      uploadStatus.calculation.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {uploadStatus.calculation.message}
                    </div>
                    {uploadStatus.calculation.success && (
                      <div className="mt-3">
                        <Link
                          href="/results"
                          className="text-sm font-medium text-green-600 hover:text-green-500 underline"
                        >
                          查看计算结果 →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}