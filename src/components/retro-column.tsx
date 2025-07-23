"use client"

import { Droppable, Draggable } from '@hello-pangea/dnd'
import { RetroCard } from './retro-card'
import { PollCard } from './poll-card'
import { AddCardButton } from './add-card-button'
import type { RetroRoom, RetroColumn as RetroColumnType, Card, Poll, PollVote } from '@/types'

interface RetroColumnProps {
  column: RetroColumnType
  cards: Card[]
  room: RetroRoom
  socket: {
    send: (message: any) => void
  }
  userId: string
  isSelected: boolean
  onSelect: () => void
  onDeselect: () => void
}

const columnConfig = {
  start: {
    title: 'Devam',
    color: 'bg-retro-start',
    icon: '🚀',
    description: 'Neyi sürdürmeliyiz?'
  },
  stop: {
    title: 'Bırak',
    color: 'bg-retro-stop',
    icon: '🛑',
    description: 'Ne yapmayı bırakmalıyız?'
  },
  action: {
    title: 'Aksiyon',
    color: 'bg-retro-action',
    icon: '⚡',
    description: 'Hangi aksiyonları almalıyız?'
  },
  poll: {
    title: 'Hızlı Anketler',
    color: 'bg-retro-poll',
    icon: '📊',
    description: 'Hızlı ekip anketleri'
  }
}

export function RetroColumn({
  column,
  cards,
  room,
  socket,
  userId,
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
          {cards.length} kart{cards.length !== 1 ? '' : ''}
        </div>
      </div>

      {/* Column Content */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-b-lg border border-gray-200 dark:border-gray-700 p-4 min-h-[400px] max-h-[600px] flex flex-col">
        <Droppable droppableId={column}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`flex-1 overflow-y-auto transition-colors duration-200 ${
                snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              {/* Polls (only in poll column) */}
              {column === 'poll' && room.polls && room.polls.map((poll, index) => (
                <div key={`poll-${index}`} className="mb-3">
                  <PollCard
                    poll={poll}
                    pollId={`poll-${index}`}
                    room={room}
                    socket={socket}
                    userId={userId}
                    votes={room.pollVotes || []}
                  />
                </div>
              ))}

              {/* Cards */}
              {cards.map((card, index) => (
                <Draggable key={card.id} draggableId={card.id} index={column === 'poll' ? room.polls?.length + index : index}>
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
                        userId={userId}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}

              {/* Add Card Button */}
              {!isLocked && column !== 'poll' && (
                <div className="mt-3">
                  <AddCardButton
                    column={column}
                    socket={socket}
                    room={room}
                  />
                </div>
              )}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  )
} 