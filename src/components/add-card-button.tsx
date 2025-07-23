"use client"

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from './ui/button'
import type { RetroRoom, RetroColumn as RetroColumnType } from '@/types'

interface AddCardButtonProps {
  column: RetroColumnType
  socket: {
    send: (message: any) => void
  }
  room: RetroRoom
}

export function AddCardButton({ column, socket, room }: AddCardButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [content, setContent] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    socket.send({
      type: 'card_added',
      payload: {
        content: content.trim(),
        column,
        authorName: room.settings.allowAnonymousCards ? undefined : 'Anonymous'
      }
    })

    setContent('')
    setIsAdding(false)
  }

  const handleCancel = () => {
    setContent('')
    setIsAdding(false)
  }

  if (isAdding) {
    return (
      <form onSubmit={handleSubmit} className="mt-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Kart içeriğinizi girin..."
          className="retro-input w-full h-24 resize-none"
          autoFocus
        />
        <div className="flex items-center space-x-2 mt-2">
          <Button type="submit" size="sm" className="retro-button-primary">
            Kart Ekle
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleCancel}
            className="retro-button-secondary"
          >
            İptal
          </Button>
        </div>
      </form>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setIsAdding(true)}
      className="w-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
    >
      <Plus className="h-4 w-4 mr-2" />
      Kart Ekle
    </Button>
  )
} 