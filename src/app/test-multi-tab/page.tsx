"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { usePartySocket } from '@/hooks/use-party-socket'
import type { PartyMessage, RetroRoom } from '@/types'

export default function TestMultiTabPage() {
  const params = useParams()
  const roomId = params.id as string
  const [room, setRoom] = useState<RetroRoom | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<string[]>([])

  // Generate a stable user ID for this session
  const [userId] = useState(() => {
    if (typeof window === 'undefined') return 'user-temp'
    const stored = localStorage.getItem('retro-user-id')
    if (stored) return stored
    const newId = `user-${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('retro-user-id', newId)
    return newId
  })

  const socketOptions = {
    host: process.env.NEXT_PUBLIC_PARTYKIT_HOST || 'localhost:1999',
    room: roomId,
    userId,
    userName: 'Anonymous',
    isFacilitator: false,
    onMessage: (event: MessageEvent) => {
      const message = JSON.parse(event.data) as PartyMessage
      console.log('Test received message:', message.type, message.payload)
      
      setMessages(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message.type}`])
      
      if (message.type === 'room_state') {
        setRoom(message.payload as RetroRoom)
      }
    },
    onOpen: () => {
      console.log('Test connected to room:', roomId)
      setIsConnected(true)
      setMessages(prev => [...prev, `${new Date().toLocaleTimeString()}: Connected`])
    },
    onClose: () => {
      console.log('Test disconnected from room:', roomId)
      setIsConnected(false)
      setMessages(prev => [...prev, `${new Date().toLocaleTimeString()}: Disconnected`])
    },
    onError: (error: Event) => {
      console.error('Test WebSocket error:', error)
      setIsConnected(false)
      setMessages(prev => [...prev, `${new Date().toLocaleTimeString()}: Error`])
    },
  }

  const socket = usePartySocket(socketOptions)

  const sendTestMessage = () => {
    socket.send({
      type: 'card_added',
      payload: {
        id: `test-${Date.now()}`,
        content: `Test card from ${userId} at ${new Date().toLocaleTimeString()}`,
        column: 'start',
        userId,
        userName: 'Anonymous',
        votes: 0,
        reactions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Multi-Tab Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Connection Status */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
            <div className="space-y-2">
              <p><strong>Room ID:</strong> {roomId}</p>
              <p><strong>User ID:</strong> {userId}</p>
              <p><strong>Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </p>
              <p><strong>Participants:</strong> {room?.users?.length || 0}</p>
              <p><strong>Cards:</strong> {room?.cards?.length || 0}</p>
            </div>
            
            <button
              onClick={sendTestMessage}
              disabled={!isConnected}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Send Test Card
            </button>
          </div>

          {/* Message Log */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Message Log</h2>
            <div className="h-64 overflow-y-auto bg-gray-100 dark:bg-gray-700 p-4 rounded">
              {messages.length === 0 ? (
                <p className="text-gray-500">No messages yet...</p>
              ) : (
                <div className="space-y-1">
                  {messages.map((msg, index) => (
                    <div key={index} className="text-sm font-mono">
                      {msg}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setMessages([])}
              className="mt-2 px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
            >
              Clear Log
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">How to Test Multi-Tab:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Open this page in one tab</li>
            <li>Open the same URL in another tab</li>
            <li>Click "Send Test Card" in one tab</li>
            <li>Check if the other tab receives the message</li>
            <li>Verify both tabs show the same participant count</li>
          </ol>
        </div>
      </div>
    </div>
  )
} 