"use client"

import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Plus, Users, Zap, Star } from 'lucide-react'
import Link from 'next/link'
import { UpdatesSection } from '@/components/updates-section'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center space-x-4">
            <Image
              src="/logo_teamretro.svg"
              alt="Team Retro Logo"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Team Retro
            </h1>
          </div>
          <ThemeToggle />
        </header>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Gerçek Zamanlı Retrospektif
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Ekibinizle gerçek zamanlı olarak işbirliği yapın. Düşünceleri paylaşın, fikirler üzerinde oy verin ve 
            retrospektiflerinizi daha etkileşimli ve verimli hale getirmek için anketler çalıştırın.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create">
              <Button className="retro-button-primary text-lg px-8 py-3">
                <Plus className="h-5 w-5 mr-2" />
                Yeni Oda Oluştur
              </Button>
            </Link>
            <Link href="/join">
              <Button variant="outline" className="retro-button-secondary text-lg px-8 py-3">
                <Users className="h-5 w-5 mr-2" />
                Mevcut Odaya Katıl
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="text-center">
            <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Gerçek Zamanlı İşbirliği
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Ekibiniz kart ekledikçe, oy verdikçe ya da tepki verdiğinde anlık güncellemeleri görün.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Etkileşimli Anketler
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Ekip geri bildirimi toplamak için oylama ve emoji tepkileri ile hızlı anketler çalıştırın.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Anonim Katılım
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Anonim kartlar ve oylama seçenekleri ile dürüst geri bildirimi teşvik edin.
            </p>
          </div>
        </div>

        {/* Updates Section */}
        <UpdatesSection />
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 mt-auto">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            C&I ekibi için ❤️ ve ☕️ ile yapılmıştır.
          </div>
        </div>
      </footer>
    </div>
  )
} 