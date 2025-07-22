import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Team Retro
            </h1>
          </div>
          <ThemeToggle />
        </header>

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Real-time Retrospectives
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Collaborate with your team in real-time. Create anonymous cards, vote, and discuss 
            to improve your team's processes together.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/create" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 px-8 bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 retro-button-primary">
              Create New Retro
            </Link>
            <Link href="/join" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 px-8 border border-gray-300 bg-white hover:bg-gray-50 hover:text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-100 retro-button-secondary">
              Join Existing Retro
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="w-12 h-12 bg-retro-start rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl">🚀</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Start
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                What should we start doing?
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-retro-stop rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl">🛑</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Stop
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                What should we stop doing?
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-retro-action rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Action
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                What actions should we take?
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 dark:text-gray-400">
          <p>Built with React, TypeScript, and PartyKit for real-time collaboration</p>
        </footer>
      </div>
    </div>
  )
} 