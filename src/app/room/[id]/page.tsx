"use client"

import { useEffect, useState, useMemo, useRef } from 'react'
import { useParams } from 'next/navigation'
import { RetroBoard } from '@/components/retro-board'
import { usePartySocket } from '@/hooks/use-party-socket'
import type { RetroRoom, PartyMessage } from '@/types'

export default function RoomPage() {
  const params = useParams()
  const roomId = params.id as string
  const [room, setRoom] = useState<RetroRoom | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const processedMessages = useRef(new Set<string>())

  // Function to process room name: trim whitespace and capitalize initials
  const processRoomName = (name: string): string => {
    return name
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  // Get room name from localStorage and process it
  const [roomName] = useState(() => {
    if (typeof window === 'undefined') return ''
    const rawName = localStorage.getItem(`room-name-${roomId}`) || ''
    return processRoomName(rawName)
  })

  // Generate a stable user ID for this session
  const [userId] = useState(() => {
    if (typeof window === 'undefined') return 'user-temp'
    const stored = localStorage.getItem('retro-user-id')
    if (stored) return stored
    const newId = `user-${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('retro-user-id', newId)
    return newId
  })

  // Memoize the socket options to prevent unnecessary re-renders
  const socketOptions = useMemo(() => ({
    host: process.env.NEXT_PUBLIC_PARTYKIT_HOST || 'localhost:1999',
    room: roomId,
    userId,
    userName: 'Anonymous', // Always use Anonymous
    isFacilitator: false, // You can make this configurable
    roomName, // Pass room name from localStorage to backend
    onMessage: (event: MessageEvent) => {
      const message = JSON.parse(event.data) as PartyMessage
      console.log('Received message:', message.type, message.payload)
      handleMessage(message)
    },
    onOpen: () => {
      console.log('Connected to room:', roomId)
      setIsConnected(true)
    },
    onClose: () => {
      console.log('Disconnected from room:', roomId)
      setIsConnected(false)
    },
    onError: (error: Event) => {
      console.error('WebSocket error in room page:', error)
      setIsConnected(false)
    },
  }), [roomId, userId, roomName])

  const socket = usePartySocket(socketOptions)

  const handleMessage = (message: PartyMessage) => {
    console.log('Handling message:', message.type, message.payload)
    
    // Create a unique message ID to prevent duplicates
    const messageId = `${message.type}-${message.userId}-${message.timestamp}-${JSON.stringify(message.payload)}`
    
    // Check if we've already processed this message
    if (processedMessages.current.has(messageId)) {
      console.log('Skipping duplicate message:', messageId)
      return
    }
    
    // Add to processed messages
    processedMessages.current.add(messageId)
    
    // Clean up old messages (keep last 100)
    if (processedMessages.current.size > 100) {
      const messagesArray = Array.from(processedMessages.current)
      processedMessages.current = new Set(messagesArray.slice(-50))
    }
    
    // Ignore user_joined messages for the current user to prevent loops
    if (message.type === 'user_joined' && message.userId === userId) {
      console.log('Ignoring own user_joined message')
      return
    }

    switch (message.type) {
      case 'room_state':
        setRoom(message.payload as RetroRoom)
        break
      case 'card_added':
      case 'card_updated':
      case 'card_deleted':
      case 'vote_added':
      case 'vote_removed':
      case 'reaction_added':
      case 'reaction_removed':
      // TODO: Phase functionality might be implemented in the future
      // case 'phase_changed':
      case 'room_settings_updated':
      case 'user_joined':
      case 'user_left':
        // Update room state based on the message
        setRoom(prevRoom => {
          if (!prevRoom) return prevRoom
          return updateRoomState(prevRoom, message)
        })
        break
    }
  }

  const updateRoomState = (currentRoom: RetroRoom, message: PartyMessage): RetroRoom => {
    switch (message.type) {
      case 'card_added':
        return {
          ...currentRoom,
          cards: [...currentRoom.cards, message.payload as any],
          updatedAt: new Date()
        }
      case 'card_updated':
        const updatedCard = message.payload as any
        return {
          ...currentRoom,
          cards: currentRoom.cards.map(card => 
            card.id === updatedCard.id ? updatedCard : card
          ),
          updatedAt: new Date()
        }
      case 'card_deleted':
        const deletedCard = message.payload as any
        return {
          ...currentRoom,
          cards: currentRoom.cards.filter(card => card.id !== deletedCard.id),
          updatedAt: new Date()
        }
      case 'vote_added':
        const vote = message.payload as any
        return {
          ...currentRoom,
          votes: [...currentRoom.votes, vote],
          cards: currentRoom.cards.map(card => 
            card.id === vote.cardId 
              ? { ...card, votes: card.votes + 1 }
              : card
          ),
          updatedAt: new Date()
        }
      case 'vote_removed':
        const removedVote = message.payload as any
        return {
          ...currentRoom,
          votes: currentRoom.votes.filter(v => v.id !== removedVote.id),
          cards: currentRoom.cards.map(card => 
            card.id === removedVote.cardId 
              ? { ...card, votes: Math.max(0, card.votes - 1) }
              : card
          ),
          updatedAt: new Date()
        }
      case 'reaction_added':
        const reaction = message.payload as any
        return {
          ...currentRoom,
          cards: currentRoom.cards.map(card => 
            card.id === reaction.cardId 
              ? { 
                  ...card, 
                  reactions: [
                    ...card.reactions.filter(r => r.userId !== reaction.userId),
                    reaction
                  ]
                }
              : card
          ),
          updatedAt: new Date()
        }
      case 'reaction_removed':
        const removedReaction = message.payload as any
        return {
          ...currentRoom,
          cards: currentRoom.cards.map(card => 
            card.id === removedReaction.cardId 
              ? { 
                  ...card, 
                  reactions: card.reactions.filter(r => 
                    !(r.emoji === removedReaction.emoji && r.userId === removedReaction.userId)
                  )
                }
              : card
          ),
          updatedAt: new Date()
        }
      // TODO: Phase functionality might be implemented in the future
      // case 'phase_changed':
      //   const { phase, timer } = message.payload as any
      //   return {
      //     ...currentRoom,
      //     phase,
      //     phaseTimer: timer,
      //     updatedAt: new Date()
      //   }
      case 'room_settings_updated':
        return {
          ...currentRoom,
          settings: message.payload as any,
          updatedAt: new Date()
        }
      case 'user_joined':
        const newUser = message.payload as any
        // Check if user already exists to prevent duplicates
        const userExists = currentRoom.users.some(u => u.id === newUser.id);
        if (!userExists) {
          return {
            ...currentRoom,
            users: [...currentRoom.users, newUser],
            updatedAt: new Date()
          };
        } else {
          // User already exists, just update their info
          return {
            ...currentRoom,
            users: currentRoom.users.map(u => 
              u.id === newUser.id ? { ...u, ...newUser } : u
            ),
            updatedAt: new Date()
          };
        }
      case 'user_left':
        const leftUser = message.payload as any
        return {
          ...currentRoom,
          users: currentRoom.users.filter(u => u.id !== leftUser.userId),
          updatedAt: new Date()
        }
      default:
        return currentRoom
    }
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            {isConnected ? 'Loading room...' : 'Connecting...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <RetroBoard 
        room={room} 
        socket={socket}
        isConnected={isConnected}
        userId={userId}
      />
    </div>
  )
} 