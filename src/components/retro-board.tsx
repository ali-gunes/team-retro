"use client"

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { RetroColumn } from './retro-column'
import { PhaseControls } from './phase-controls'
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
}

export function RetroBoard({ room, socket, isConnected, userId }: RetroBoardProps) {
  const [selectedColumn, setSelectedColumn] = useState<RetroColumnType | null>(null)

  const columns: RetroColumnType[] = ['start', 'stop', 'action', 'poll']

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <RoomHeader 
        room={room} 
        isConnected={isConnected}
        socket={socket}
      />

      {/* Phase Controls */}
      <PhaseControls 
        room={room}
        socket={socket}
      />

      {/* Main Board */}
      <div className="container mx-auto px-4 py-8">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
    </div>
  )
} 