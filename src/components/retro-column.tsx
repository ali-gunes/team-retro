"use client"

import { Droppable, Draggable } from '@hello-pangea/dnd'
import { RetroCard } from './retro-card'
import { AddCardButton } from './add-card-button'
import type { RetroRoom, RetroColumn as RetroColumnType, Card } from '@/types'

interface RetroColumnProps {
  column: RetroColumnType
  cards: Card[]
  room: RetroRoom
  socket: {
    send: (message: any) => void
  }
  isSelected: boolean
  onSelect: () => void
  onDeselect: () => void
}

const columnConfig = {
  start: {
    title: 'Start',
    color: 'bg-retro-start',
    icon: '🚀',
    description: 'What should we start doing?'
  },
  stop: {
    title: 'Stop',
    color: 'bg-retro-stop',
    icon: '🛑',
    description: 'What should we stop doing?'
  },
  action: {
    title: 'Action',
    color: 'bg-retro-action',
    icon: '⚡',
    description: 'What actions should we take?'
  },
  poll: {
    title: 'Quick Polls',
    color: 'bg-retro-poll',
    icon: '📊',
    description: 'Quick team polls'
  }
}

export function RetroColumn({
  column,
  cards,
  room,
  socket,
  isSelected,
  onSelect,
  onDeselect
}: RetroColumnProps) {
  const config = columnConfig[column]
  const isLocked = room.settings.lockedColumns.includes(column)

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div 
        className={`${config.color} text-white rounded-t-lg p-4 cursor-pointer transition-all duration-200 ${
          isSelected ? 'ring-2 ring-white ring-opacity-50' : ''
        }`}
        onClick={isSelected ? onDeselect : onSelect}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{config.icon}</span>
            <div>
              <h3 className="font-semibold text-lg">{config.title}</h3>
              <p className="text-sm opacity-90">{config.description}</p>
            </div>
          </div>
          {isLocked && (
            <span className="text-sm opacity-75">🔒</span>
          )}
        </div>
        <div className="mt-2 text-sm opacity-75">
          {cards.length} card{cards.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Column Content */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-b-lg border border-gray-200 dark:border-gray-700 p-4 min-h-[400px]">
        <Droppable droppableId={column}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`h-full transition-colors duration-200 ${
                snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              {/* Cards */}
              {cards.map((card, index) => (
                <Draggable key={card.id} draggableId={card.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`mb-3 ${
                        snapshot.isDragging ? 'opacity-50' : ''
                      }`}
                    >
                      <RetroCard
                        card={card}
                        room={room}
                        socket={socket}
                        isLocked={isLocked}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}

              {/* Add Card Button */}
              {!isLocked && (
                <AddCardButton
                  column={column}
                  socket={socket}
                  room={room}
                />
              )}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  )
} 