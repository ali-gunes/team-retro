"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Poll {
  question: string
  type: 'yes_no' | 'scale_1_5' | 'multiple_choice' | 'emoji_scale'
  options?: string[]
}

interface PollCategory {
  category: string
  polls: Poll[]
}

export default function CreatePage() {
  const router = useRouter()
  const [roomName, setRoomName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [enablePolls, setEnablePolls] = useState(false)
  const [pollCategories, setPollCategories] = useState<PollCategory[]>([])
  const [selectedPolls, setSelectedPolls] = useState<Set<string>>(new Set())
  const [activeCategory, setActiveCategory] = useState<string>('')

  // Load polls from polls.json
  useEffect(() => {
    fetch('/polls.json')
      .then(response => response.json())
      .then(data => {
        setPollCategories(data)
        if (data.length > 0) {
          setActiveCategory(data[0].category)
        }
      })
      .catch(error => {
        console.error('Failed to load polls:', error)
      })
  }, [])

  const handlePollToggle = (pollId: string) => {
    const newSelected = new Set(selectedPolls)
    if (newSelected.has(pollId)) {
      newSelected.delete(pollId)
    } else {
      newSelected.add(pollId)
    }
    setSelectedPolls(newSelected)
  }

  const getPollTypeLabel = (type: string) => {
    switch (type) {
      case 'yes_no':
        return 'Yes/No'
      case 'scale_1_5':
        return 'Scale: 1-5'
      case 'multiple_choice':
        return 'Multiple Choice'
      case 'emoji_scale':
        return 'Emoji Scale'
      default:
        return type
    }
  }

  const getActiveCategoryPolls = () => {
    const category = pollCategories.find(cat => cat.category === activeCategory)
    return category ? category.polls : []
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomName.trim()) return

    setIsCreating(true)

    try {
      // Generate a random room ID
      const roomId = Math.random().toString(36).substring(2, 8)
      
      // Store the room name and selected polls in localStorage
      localStorage.setItem(`room-name-${roomId}`, roomName.trim())
      
      if (enablePolls && selectedPolls.size > 0) {
        // Convert selected poll IDs back to poll objects
        const selectedPollsData: Poll[] = []
        pollCategories.forEach(category => {
          category.polls.forEach((poll, index) => {
            const pollId = `${category.category}-${index}`
            if (selectedPolls.has(pollId)) {
              selectedPollsData.push(poll)
            }
          })
        })
        localStorage.setItem(`room-polls-${roomId}`, JSON.stringify(selectedPollsData))
      }
      
      // Navigate to the room without URL parameters
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
        <div className="max-w-4xl mx-auto">
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

            {/* Quick Polls Toggle */}
            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <div className="relative inline-block w-11 h-6 transition-colors duration-200 ease-in-out">
                  <input
                    type="checkbox"
                    checked={enablePolls}
                    onChange={(e) => setEnablePolls(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                    enablePolls ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}>
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out transform ${
                      enablePolls ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Quick Polls
                </span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Add interactive polls to gather team feedback during the retrospective
              </p>
            </div>

            {/* Poll Selection */}
            {enablePolls && pollCategories.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Select Polls to Include
                </h3>
                
                {/* Category Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <nav className="-mb-px flex space-x-8">
                    {pollCategories.map((category) => (
                      <button
                        key={category.category}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setActiveCategory(category.category)
                        }}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeCategory === category.category
                            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      >
                        {category.category}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Polls in Active Category */}
                <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                  {getActiveCategoryPolls().map((poll, index) => {
                    const pollId = `${activeCategory}-${index}`
                    return (
                      <label key={pollId} className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedPolls.has(pollId)}
                          onChange={() => handlePollToggle(pollId)}
                          className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {poll.question}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {getPollTypeLabel(poll.type)}
                            {poll.options && `: ${poll.options.join(', ')}`}
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </div>
                
                {selectedPolls.size > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedPolls.size} poll{selectedPolls.size !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            )}

            <Button
              type="submit"
              disabled={isCreating || !roomName.trim() || (enablePolls && selectedPolls.size === 0)}
              className="w-full retro-button-primary"
            >
              {isCreating ? 'Creating...' : 'Create Room'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You'll be the facilitator of this room and can control settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 