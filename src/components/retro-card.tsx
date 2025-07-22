"use client"

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react'
import { Button } from './ui/button'
import type { Card, RetroRoom } from '@/types'

interface RetroCardProps {
  card: Card
  room: RetroRoom
  socket: {
    send: (message: any) => void
  }
  isLocked: boolean
  userId: string
}

export function RetroCard({ card, room, socket, isLocked, userId }: RetroCardProps) {
  const [showReactions, setShowReactions] = useState(false)
  const [isVoted, setIsVoted] = useState(false)

  const handleVote = () => {
    if (isLocked || !room.settings.allowVoting) return

    if (isVoted) {
      socket.send({
        type: 'vote_removed',
        payload: {
          cardId: card.id
        }
      })
      setIsVoted(false)
    } else {
      socket.send({
        type: 'vote_added',
        payload: {
          cardId: card.id
        }
      })
      setIsVoted(true)
    }
  }

  const handleReaction = (emoji: string) => {
    if (isLocked || !room.settings.allowReactions) return

    // Close the reaction picker
    setShowReactions(false)

    const hasReaction = card.reactions.some(r => r.emoji === emoji && r.userId === userId)
    
    if (hasReaction) {
      socket.send({
        type: 'reaction_removed',
        payload: {
          cardId: card.id,
          emoji
        }
      })
    } else {
      socket.send({
        type: 'reaction_added',
        payload: {
          cardId: card.id,
          emoji
        }
      })
    }
  }

  const commonReactions = ['👍', '❤️', '😄', '😮', '😢', '😡']

  return (
    <div className={`retro-card ${card.isHighlighted ? 'ring-2 ring-yellow-400' : ''}`}>
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {card.authorName} • {new Date(card.createdAt).toLocaleTimeString()}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Card Content */}
      <div className="mb-3">
        <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
          {card.content}
        </ReactMarkdown>
      </div>

      {/* Card Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Vote Button */}
          {room.settings.allowVoting && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVote}
              disabled={isLocked}
              className={`h-8 px-2 ${isVoted ? 'text-red-500' : 'text-gray-500'}`}
            >
              <Heart className={`h-4 w-4 mr-1 ${isVoted ? 'fill-current' : ''}`} />
              {card.votes > 0 && <span className="text-sm">{card.votes}</span>}
            </Button>
          )}

          {/* Reactions */}
          {room.settings.allowReactions && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReactions(!showReactions)}
              disabled={isLocked}
              className="h-8 px-2 text-gray-500"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Existing Reactions */}
        {card.reactions.length > 0 && (
          <div className="flex items-center space-x-1">
            {card.reactions.map((reaction, index) => (
              <button
                key={`${reaction.emoji}-${index}`}
                onClick={() => handleReaction(reaction.emoji)}
                disabled={isLocked}
                className="text-sm hover:scale-110 transition-transform"
                title={`${reaction.userName} reacted with ${reaction.emoji}`}
              >
                {reaction.emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reaction Picker */}
      {showReactions && room.settings.allowReactions && (
        <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-2">
            {commonReactions.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                disabled={isLocked}
                className="text-lg hover:scale-125 transition-transform p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 