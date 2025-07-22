"use client"

import { useState } from 'react'
import { Play, Pause, SkipForward } from 'lucide-react'
import { Button } from './ui/button'
import type { RetroRoom, RetroPhase } from '@/types'

interface PhaseControlsProps {
  room: RetroRoom
  socket: {
    send: (message: any) => void
  }
}

const phases: { value: RetroPhase; label: string; description: string }[] = [
  {
    value: 'ideation',
    label: 'Ideation',
    description: 'Add cards to columns'
  },
  {
    value: 'grouping',
    label: 'Grouping',
    description: 'Organize similar cards'
  },
  {
    value: 'voting',
    label: 'Voting',
    description: 'Vote on important items'
  },
  {
    value: 'discussion',
    label: 'Discussion',
    description: 'Discuss top voted items'
  }
]

export function PhaseControls({ room, socket }: PhaseControlsProps) {
  const [showPhaseSelector, setShowPhaseSelector] = useState(false)

  const currentPhase = phases.find(p => p.value === room.phase)
  const isFacilitator = room.users.some(user => user.isFacilitator)

  const handlePhaseChange = (phase: RetroPhase) => {
    socket.send({
      type: 'phase_changed',
      payload: {
        phase,
        startTimer: true
      }
    })
    setShowPhaseSelector(false)
  }

  const handleTimerToggle = () => {
    if (room.phaseTimer?.isActive) {
      // Stop timer
      socket.send({
        type: 'phase_changed',
        payload: {
          phase: room.phase,
          startTimer: false
        }
      })
    } else {
      // Start timer
      socket.send({
        type: 'phase_changed',
        payload: {
          phase: room.phase,
          startTimer: true
        }
      })
    }
  }

  if (!isFacilitator) {
    return (
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex items-center justify-center space-x-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Current Phase: {currentPhase?.label}
          </span>
          {room.phaseTimer?.isActive && (
            <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
              {/* Timer display */}
              10:00
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Phase Selector */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPhaseSelector(!showPhaseSelector)}
              className="retro-button-secondary"
            >
              {currentPhase?.label}
              <SkipForward className="h-4 w-4 ml-2" />
            </Button>

            {showPhaseSelector && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                <div className="p-2">
                  {phases.map((phase) => (
                    <button
                      key={phase.value}
                      onClick={() => handlePhaseChange(phase.value)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        phase.value === room.phase
                          ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="font-medium">{phase.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {phase.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Timer Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTimerToggle}
              className="retro-button-secondary"
            >
              {room.phaseTimer?.isActive ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            {room.phaseTimer?.isActive && (
              <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                {/* Timer display */}
                10:00
              </span>
            )}
          </div>
        </div>

        {/* Phase Description */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {currentPhase?.description}
        </div>
      </div>
    </div>
  )
} 