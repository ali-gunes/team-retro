"use client"

import { useState } from 'react'
import { Share2, Download, Settings, Wifi, WifiOff } from 'lucide-react'
import { Button } from './ui/button'
import { ThemeToggle } from './theme-toggle'
import type { RetroRoom } from '@/types'

interface RoomHeaderProps {
  room: RetroRoom
  isConnected: boolean
  socket: {
    send: (message: any) => void
  }
}

export function RoomHeader({ room, isConnected, socket }: RoomHeaderProps) {
  const [showSettings, setShowSettings] = useState(false)

  const handleShare = async () => {
    const url = `${window.location.origin}/room/${room.id}`
    try {
      await navigator.clipboard.writeText(url)
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  const handleExport = () => {
    // This would trigger an API call to export the room data
    window.open(`/api/export?roomId=${room.id}&format=json`, '_blank')
  }

  const isFacilitator = room.users.some(user => user.isFacilitator)

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Room Info */}
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {room.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Room ID: {room.id}
              </p>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Share Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="retro-button-secondary"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>

            {/* Export Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="retro-button-secondary"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            {/* Settings Button (Facilitator Only) */}
            {isFacilitator && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="retro-button-secondary"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>

        {/* Phase Info */}
        {/* TODO: Phase functionality might be implemented in the future */}
        {/* 
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Phase:
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 rounded-full">
                {room.phase.charAt(0).toUpperCase() + room.phase.slice(1)}
              </span>
            </div>

            {room.phaseTimer && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Timer:
                </span>
                <span className="text-sm font-mono">
                  Timer display would go here
                  10:00
                </span>
              </div>
            )}
          </div>
        </div>
        */}

        {/* Participant Count */}
        <div className="mt-4 flex items-center justify-end">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {room.users.length} participant{room.users.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && isFacilitator && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Room Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={room.settings.allowAnonymousCards}
                    onChange={(e) => {
                      socket.send({
                        type: 'room_settings_updated',
                        payload: {
                          allowAnonymousCards: e.target.checked
                        }
                      })
                    }}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Allow anonymous cards
                  </span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={room.settings.allowVoting}
                    onChange={(e) => {
                      socket.send({
                        type: 'room_settings_updated',
                        payload: {
                          allowVoting: e.target.checked
                        }
                      })
                    }}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Allow voting
                  </span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={room.settings.allowReactions}
                    onChange={(e) => {
                      socket.send({
                        type: 'room_settings_updated',
                        payload: {
                          allowReactions: e.target.checked
                        }
                      })
                    }}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Allow reactions
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
} 