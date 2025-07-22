import { useEffect, useRef, useCallback } from 'react'

interface PartySocketOptions {
  host: string
  room: string
  userId?: string
  userName?: string
  isFacilitator?: boolean
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
      // Build URL with user parameters
      const url = new URL(`${protocol}//${optionsRef.current.host}/parties/room/${optionsRef.current.room}`)
      if (optionsRef.current.userId) {
        url.searchParams.set('userId', optionsRef.current.userId)
      }
      if (optionsRef.current.userName) {
        url.searchParams.set('userName', optionsRef.current.userName)
      }
      if (optionsRef.current.isFacilitator) {
        url.searchParams.set('isFacilitator', 'true')
      }
      
      const ws = new WebSocket(url.toString())
      
      ws.onopen = () => {
        console.log('Connected to PartyKit room')
        reconnectAttemptsRef.current = 0
        isConnectingRef.current = false
        optionsRef.current.onOpen?.()
      }

      ws.onmessage = (event) => {
        optionsRef.current.onMessage?.(event)
      }

      ws.onclose = (event) => {
        console.log('Disconnected from PartyKit room', event.code, event.reason)
        isConnectingRef.current = false
        optionsRef.current.onClose?.()
        
        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000)
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++
            connect()
          }, delay)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        isConnectingRef.current = false
        optionsRef.current.onError?.(error)
      }

      socketRef.current = ws
    } catch (error) {
      console.error('Failed to connect to PartyKit room:', error)
      isConnectingRef.current = false
    }
  }, [])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (socketRef.current) {
      socketRef.current.close()
      socketRef.current = null
    }
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