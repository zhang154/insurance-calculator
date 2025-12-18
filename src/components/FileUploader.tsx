'use client'

import { useState, useRef } from 'react'
import { validateExcelFile } from '@/utils/excelParser'

interface FileUploaderProps {
  onFileSelect: (file: File) => void
  accept: string
  title: string
  description: string
  type: 'cities' | 'salaries'
  isUploading?: boolean
}

export default function FileUploader({
  onFileSelect,
  accept,
  title,
  description,
  type,
  isUploading = false
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    setError(null)

    // 验证文件
    const validationError = validateExcelFile(file, type)
    if (validationError) {
      setError(validationError)
      return
    }

    onFileSelect(file)
  }

  const onButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={isUploading ? undefined : onButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleChange}
          disabled={isUploading}
        />

        <div className="flex flex-col items-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
            error ? 'bg-red-100' : 'bg-blue-100'
          }`}>
            {isUploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            ) : (
              <svg className={`w-6 h-6 ${error ? 'text-red-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </div>

          {isUploading ? (
            <div>
              <p className="text-lg font-medium text-gray-900">上传中...</p>
              <p className="text-sm text-gray-600 mt-1">请稍候，正在处理文件</p>
            </div>
          ) : error ? (
            <div>
              <p className="text-lg font-medium text-red-900">上传失败</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setError(null)
                  onButtonClick()
                }}
                className="mt-3 text-sm text-red-600 hover:text-red-500 underline"
              >
                重新选择文件
              </button>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-900">
                {dragActive ? '松开以上传文件' : '点击或拖拽文件到此处'}
              </p>
              <p className="text-sm text-gray-600 mt-1">支持 {accept.replace('.', '').toUpperCase()} 格式</p>
            </div>
          )}
        </div>
      </div>

      {type === 'cities' && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">城市数据文件格式说明：</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 文件名应包含 "cities" 关键词</li>
            <li>• 列顺序：id, city_name, year, rate, base_min, base_max</li>
            <li>• 第一行为表头，从第二行开始为数据</li>
          </ul>
        </div>
      )}

      {type === 'salaries' && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">工资数据文件格式说明：</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• 文件名应包含 "salaries" 关键词</li>
            <li>• 列顺序：id, employee_id, employee_name, month, salary_amount</li>
            <li>• month 格式：YYYYMM（如 202401）</li>
            <li>• 第一行为表头，从第二行开始为数据</li>
          </ul>
        </div>
      )}
    </div>
  )
}