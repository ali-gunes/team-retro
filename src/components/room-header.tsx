"use client"

import { useState } from 'react'
import { Share2, Download, Settings, Wifi, WifiOff } from 'lucide-react'
import { Button } from './ui/button'
import { ThemeToggle } from './theme-toggle'
import type { RetroRoom } from '@/types'
import Image from 'next/image'

interface RoomHeaderProps {
  room: RetroRoom
  isConnected: boolean
  socket: {
    send: (message: any) => void
  }
}

export function RoomHeader({ room, isConnected, socket }: RoomHeaderProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [showCopiedToast, setShowCopiedToast] = useState(false)

  const handleShare = async () => {
    const joinUrl = `${window.location.origin}/room/${room.id}`
    
    try {
      await navigator.clipboard.writeText(joinUrl)
      setShowCopiedToast(true)
      setTimeout(() => setShowCopiedToast(false), 2000) // Hide toast after 2 seconds
    } catch (error) {
      console.error('Failed to copy URL:', error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = joinUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setShowCopiedToast(true)
      setTimeout(() => setShowCopiedToast(false), 2000)
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
          {/* Left Side - Room Info */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
              Oda ID: {room.id}
            </div>
            
            {/* Share Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="retro-button-secondary"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Paylaş
            </Button>
            
            {/* Connection Status - Shows if WebSocket is connected to the server */}
            <div className="flex items-center space-x-2 group relative">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
                <span className="bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap">
                  {isConnected ? 'Bağlı' : 'Bağlantı Yok'}
                </span>
              </div>
            </div>
          </div>

          {/* Center - Room Name */}
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {room.name}
            </h1>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {/* Export Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="retro-button-secondary"
              >
                <Download className="h-4 w-4 mr-2" />
                Dışa Aktar
              </Button>

              {/* Settings Button (Facilitator Only) */}
              {/* TODO: Settings functionality will be implemented later
              {isFacilitator && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="retro-button-secondary"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Ayarlar
                </Button>
              )}
              */}

              {/* Participant Count */}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {room.users.length} katılımcı
              </div>

              {/* Theme Toggle */}
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {showCopiedToast && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-in slide-in-from-top-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Katılım bağlantısı panoya kopyalandı!</span>
            </div>
          </div>
        )}

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

        {/* Settings Panel */}
        {/* TODO: Settings functionality will be implemented later
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
        */}
      </div>
    </header>
  )
} 