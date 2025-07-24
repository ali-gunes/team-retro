"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Star, Zap, Bug, Package } from 'lucide-react'

interface Update {
  id: string
  type: 'feature' | 'improvement' | 'bug-fix' | 'version'
  title: string
  description: string
  date: string
}

const updates: Update[] = [
    {
        id: '1',
        type: 'feature',
        title: 'Dışa Aktar',
        description: 'PDF formatında dışa aktarma seçeneği eklendi',
        date: '2025-07-24'
      },
  {
    id: '2',
    type: 'version',
    title: 'v0.2.0 - Anket Sistemi Stabil',
    description: 'Gerçek zamanlı oylama ve kategorize edilmiş anket seçimi ile etkileşimli Hızlı Anketler',
    date: '2025-07-24'
  },
  {
    id: '3',
    type: 'feature',
    title: 'Hızlı Anketler Sistemi',
    description: 'İş Yeri, Sprint, Ekip ve daha fazlası gibi kategorilerle oda oluşturma sırasında etkileşimli anketler ekleyin',
    date: '2025-07-24'
  },
  {
    id: '4',
    type: 'improvement',
    title: 'Kart Silme İşlevi',
    description: 'Kart yazarları için uygun yetkilendirme ve UI geri bildirimi ile silme seçeneği eklendi',
    date: '2025-07-23'
  },
  {
    id: '5',
    type: 'feature',
    title: 'Oda Bağlantılarını Paylaş',
    description: 'Toast bildirimleri ve otomatik katılım işlevi ile oda bağlantılarını panoya kopyalayın',
    date: '2025-07-23'
  },
  {
    id: '6',
    type: 'improvement',
    title: 'Geliştirilmiş Oda Oluşturma',
    description: 'Kategorize edilmiş sekmeler ve geliştirilmiş kullanıcı deneyimi ile geçiş tabanlı anket seçimi',
    date: '2025-07-23'
  }
]

export function UpdatesSection() {
  const [currentUpdateIndex, setCurrentUpdateIndex] = useState(0)
  const [showAllUpdates, setShowAllUpdates] = useState(false)

  // Auto-carousel effect
  useEffect(() => {
    if (showAllUpdates) return // Don't auto-cycle when showing all updates
    
    const interval = setInterval(() => {
      setCurrentUpdateIndex((prev) => (prev + 1) % updates.length)
    }, 4000) // Change every 4 seconds

    return () => clearInterval(interval)
  }, [showAllUpdates])

  const getUpdateIcon = (type: Update['type']) => {
    switch (type) {
      case 'feature':
        return <Star className="h-5 w-5 text-blue-500" />
      case 'improvement':
        return <Zap className="h-5 w-5 text-yellow-500" />
      case 'bug-fix':
        return <Bug className="h-5 w-5 text-green-500" />
      case 'version':
        return <Package className="h-5 w-5 text-purple-500" />
      default:
        return <Star className="h-5 w-5 text-gray-500" />
    }
  }

  const getUpdateTypeLabel = (type: Update['type']) => {
    switch (type) {
      case 'feature':
        return 'Yeni Özellik'
      case 'improvement':
        return 'İyileştirme'
      case 'bug-fix':
        return 'Hata Düzeltmesi'
      case 'version':
        return 'Sürüm'
      default:
        return type
    }
  }

  const getUpdateTypeColor = (type: Update['type']) => {
    switch (type) {
      case 'feature':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'improvement':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'bug-fix':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'version':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = date.toLocaleDateString('en-US', { month: 'long' })
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Son Güncellemeler
        </h2>
        <Button
          variant="outline"
          onClick={() => setShowAllUpdates(!showAllUpdates)}
          className="retro-button-secondary"
        >
          {showAllUpdates ? 'Gizle' : 'Tüm Güncellemeler'}
        </Button>
      </div>

      {showAllUpdates ? (
        /* All Updates View */
        <div className="grid gap-4">
          {updates.map((update) => (
            <div key={update.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getUpdateIcon(update.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {update.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUpdateTypeColor(update.type)}`}>
                      {getUpdateTypeLabel(update.type)}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    {update.description}
                  </p>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(update.date)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Carousel View */
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {getUpdateIcon(updates[currentUpdateIndex].type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {updates[currentUpdateIndex].title}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUpdateTypeColor(updates[currentUpdateIndex].type)}`}>
                  {getUpdateTypeLabel(updates[currentUpdateIndex].type)}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                {updates[currentUpdateIndex].description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(updates[currentUpdateIndex].date)}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {currentUpdateIndex + 1} of {updates.length}
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 