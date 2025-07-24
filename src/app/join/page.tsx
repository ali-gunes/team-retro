"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function JoinPage() {
  const router = useRouter()
  const [roomId, setRoomId] = useState('')
  const [isJoining, setIsJoining] = useState(false)

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomId.trim()) return

    setIsJoining(true)

    try {
      // In a real app, you might validate the room exists via API
      // For now, we'll just redirect to the room
      router.push(`/room/${roomId.trim()}`)
    } catch (error) {
      console.error('Failed to join room:', error)
      setIsJoining(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <Link href="/" className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            <ArrowLeft className="h-5 w-5" />
            <span>Ana Sayfaya Dön</span>
          </Link>
          <ThemeToggle />
        </header>

        {/* Join Form */}
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Retrospektife Katıl
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Mevcut bir retrospektif oturumuna katılmak için oda ID'sini girin
            </p>
          </div>

          <form onSubmit={handleJoin} className="space-y-6">
            <div>
              <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Oda ID
              </label>
              <input
                type="text"
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Oda ID'sini girin..."
                className="retro-input"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isJoining || !roomId.trim()}
              className="w-full retro-button-primary"
            >
              {isJoining ? 'Katılıyor...' : 'Odaya Katıl'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Oturuma katılmak için kolaylaştırıcıdan oda ID'sini isteyin.
            </p>
          </div>
        </div>
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