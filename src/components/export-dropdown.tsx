"use client"

import { useState, useRef, useEffect } from 'react'
import { Download, FileText, BarChart3, CheckSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { exportToPDF } from '@/utils/export-utils'
import type { RetroRoom } from '@/types'

interface ExportDropdownProps {
  room: RetroRoom
}

export function ExportDropdown({ room }: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleExport = (type: 'actions' | 'summary' | 'polls') => {
    exportToPDF({ type, room })
    setIsOpen(false)
  }

  const exportOptions = [
    {
      type: 'actions' as const,
      title: 'Aksiyon Maddeleri',
      description: 'Sadece aksiyon maddelerini dışa aktar',
      icon: CheckSquare,
      color: 'text-green-600'
    },
    {
      type: 'summary' as const,
      title: 'Tam Özet',
      description: 'Tüm kartları ve anketleri dışa aktar',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      type: 'polls' as const,
      title: 'Anket Sonuçları',
      description: 'Sadece anket sonuçlarını dışa aktar',
      icon: BarChart3,
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <Download className="h-4 w-4" />
        <span>Dışa Aktar</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
              Dışa Aktar Seçenekleri
            </div>
            
            {exportOptions.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.type}
                  onClick={() => handleExport(option.type)}
                  className="w-full text-left px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors duration-200 flex items-start space-x-3"
                >
                  <Icon className={`h-5 w-5 mt-0.5 ${option.color}`} />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {option.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {option.description}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
} 