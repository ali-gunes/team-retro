"use client"

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { RetroColumn } from './retro-column'
// TODO: Phase functionality might be implemented in the future
// import { PhaseControls } from './phase-controls'
import { RoomHeader } from './room-header'
import type { RetroRoom, RetroColumn as RetroColumnType } from '@/types'

interface RetroBoardProps {
  room: RetroRoom
  socket: {
    send: (message: any) => void
    readyState: number
  }
  isConnected: boolean
  userId: string
  columns?: RetroColumnType[]
}

export function RetroBoard({ room, socket, isConnected, userId, columns = ['poll', 'start', 'stop', 'action'] }: RetroBoardProps) {
  const [selectedColumn, setSelectedColumn] = useState<RetroColumnType | null>(null)

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result
    const sourceColumn = source.droppableId as RetroColumnType
    const destinationColumn = destination.droppableId as RetroColumnType

    if (sourceColumn === destinationColumn) return

    // Send card update to move it to new column
    socket.send({
      type: 'card_updated',
      payload: {
        id: draggableId,
        column: destinationColumn
      }
    })
  }

  const getCardsForColumn = (column: RetroColumnType) => {
    return room.cards.filter(card => card.column === column)
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
      {/* Header */}
      <RoomHeader 
        room={room} 
        isConnected={isConnected}
        socket={socket}
      />

      {/* Phase Controls */}
      {/* <PhaseControls 
        room={room}
        socket={socket}
      /> */}

      {/* Main Board */}
      <div className="flex-1 container mx-auto px-4 py-8 flex flex-col overflow-hidden">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className={`grid gap-6 flex-1 items-stretch overflow-hidden ${
            columns.length === 3 
              ? 'grid-cols-1 md:grid-cols-3 max-w-4xl mx-auto' 
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
          }`}>
            {columns.map((column) => (
              <RetroColumn
                key={column}
                column={column}
                cards={getCardsForColumn(column)}
                room={room}
                socket={socket}
                userId={userId}
                isSelected={selectedColumn === column}
                onSelect={() => setSelectedColumn(column)}
                onDeselect={() => setSelectedColumn(null)}
              />
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 flex-shrink-0">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            C&I ekibi için ❤️ ve ☕️ ile yapılmıştır.
          </div>
        </div>
      </footer>
    </div>
  )
} 