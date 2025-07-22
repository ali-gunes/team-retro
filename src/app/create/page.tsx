"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CreatePage() {
  const router = useRouter()
  const [roomName, setRoomName] = useState('')
  const [userName, setUserName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomName.trim() || !userName.trim()) return

    setIsCreating(true)

    try {
      // Generate a random room ID
      const roomId = Math.random().toString(36).substring(2, 8)
      
      // In a real app, you might create the room via API
      // For now, we'll just redirect to the room
      router.push(`/room/${roomId}`)
    } catch (error) {
      console.error('Failed to create room:', error)
      setIsCreating(false)
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

        {/* Create Form */}
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create New Retrospective
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Set up a new retrospective session for your team
            </p>
          </div>

          <form onSubmit={handleCreate} className="space-y-6">
            <div>
              <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Room Name
              </label>
              <input
                type="text"
                id="roomName"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name..."
                className="retro-input"
                required
              />
            </div>

            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name..."
                className="retro-input"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isCreating || !roomName.trim() || !userName.trim()}
              className="w-full retro-button-primary"
            >
              {isCreating ? 'Creating...' : 'Create Room'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You'll be the facilitator of this room and can control phases, timers, and settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 