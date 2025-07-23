"use client"

import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Plus, Users, Zap, Star } from 'lucide-react'
import Link from 'next/link'
import { UpdatesSection } from '@/components/updates-section'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Team Retro
            </h1>
          </div>
          <ThemeToggle />
        </header>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Real-time Retrospectives
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Collaborate with your team in real-time. Share thoughts, vote on ideas, and run interactive polls 
            to make your retrospectives more engaging and productive.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create">
              <Button className="retro-button-primary text-lg px-8 py-3">
                <Plus className="h-5 w-5 mr-2" />
                Create New Room
              </Button>
            </Link>
            <Link href="/join">
              <Button variant="outline" className="retro-button-secondary text-lg px-8 py-3">
                <Users className="h-5 w-5 mr-2" />
                Join Existing Room
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
              Real-time Collaboration
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              See updates instantly as your team adds cards, votes, and reacts in real-time.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Interactive Polls
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Run quick polls with voting, scales, and emoji reactions to gather team feedback.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Anonymous Participation
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Encourage honest feedback with anonymous cards and voting options.
            </p>
          </div>
        </div>

        {/* Updates Section */}
        <UpdatesSection />
      </div>
    </div>
  )
} 