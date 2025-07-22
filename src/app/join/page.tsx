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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <Link href="/" className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
          <ThemeToggle />
        </header>

        {/* Join Form */}
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Join Retrospective
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Enter the room ID to join an existing retrospective session
            </p>
          </div>

          <form onSubmit={handleJoin} className="space-y-6">
            <div>
              <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Room ID
              </label>
              <input
                type="text"
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room ID..."
                className="retro-input"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isJoining || !roomId.trim()}
              className="w-full retro-button-primary"
            >
              {isJoining ? 'Joining...' : 'Join Room'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ask the facilitator for the room ID to join the session.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 