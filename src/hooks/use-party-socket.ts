import { useEffect, useRef, useCallback } from 'react'

interface PartySocketOptions {
  host: string
  room: string
  userId?: string
  userName?: string
  isFacilitator?: boolean
  roomName?: string
  selectedPolls?: any[]
  onMessage?: (event: MessageEvent) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: (error: Event) => void
}

export function usePartySocket(options: PartySocketOptions) {
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5
  const optionsRef = useRef(options)
  const isConnectingRef = useRef(false)
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Update options ref when options change
  useEffect(() => {
    optionsRef.current = options
  }, [options])

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN || isConnectingRef.current) {
      return
    }

    isConnectingRef.current = true

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      
      // Clean the host string to remove any trailing characters
      const cleanHost = optionsRef.current.host.replace(/[%#]$/, '')
      
      // Build URL with user parameters
      const url = new URL(`${protocol}//${cleanHost}/parties/room/${optionsRef.current.room}`)
      if (optionsRef.current.userId) {
        url.searchParams.set('userId', optionsRef.current.userId)
      }
      // Don't send userName parameter - always use Anonymous
      if (optionsRef.current.isFacilitator) {
        url.searchParams.set('isFacilitator', 'true')
      }
      if (optionsRef.current.roomName) {
        url.searchParams.set('roomName', optionsRef.current.roomName)
      }
      if (optionsRef.current.selectedPolls && optionsRef.current.selectedPolls.length > 0) {
        url.searchParams.set('selectedPolls', JSON.stringify(optionsRef.current.selectedPolls))
      }
      
      console.log('Attempting to connect to:', url.toString())
      
      const ws = new WebSocket(url.toString())
      
      // Add connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          console.error('WebSocket connection timeout')
          ws.close()
        }
      }, 15000) // 15 second timeout for Safari
      
      ws.onopen = () => {
        console.log('Connected to PartyKit room')
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current)
          connectionTimeoutRef.current = null
        }
        reconnectAttemptsRef.current = 0
        isConnectingRef.current = false
        optionsRef.current.onOpen?.()
      }

      ws.onmessage = (event) => {
        optionsRef.current.onMessage?.(event)
      }

      ws.onclose = (event) => {
        console.log('Disconnected from PartyKit room', event.code, event.reason)
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current)
          connectionTimeoutRef.current = null
        }
        isConnectingRef.current = false
        optionsRef.current.onClose?.()
        
        // Only attempt to reconnect if it wasn't a normal closure and we haven't exceeded max attempts
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000)
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`)
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++
            connect()
          }, delay)
        } else if (event.code !== 1000) {
          console.log('Max reconnection attempts reached or connection was closed normally')
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        isConnectingRef.current = false
        optionsRef.current.onError?.(error)
        
        // Don't attempt to reconnect on connection errors immediately
        // Let the onclose handler manage reconnection
      }

      socketRef.current = ws
    } catch (error) {
      console.error('Failed to connect to PartyKit room:', error)
      isConnectingRef.current = false
      
      // Attempt to reconnect on connection errors
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000)
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++
          connect()
        }, delay)
      }
    }
  }, [])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current)
      connectionTimeoutRef.current = null
    }
    
    if (socketRef.current) {
      socketRef.current.close()
      socketRef.current = null
    }
    
    isConnectingRef.current = false
  }, [])

  const send = useCallback((message: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected')
    }
  }, [])

  useEffect(() => {
    connect()
    
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    send,
    disconnect,
    readyState: socketRef.current?.readyState || WebSocket.CONNECTING
  }
} 