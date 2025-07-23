"use client"

import { useState, useEffect } from 'react'
import { BarChart3 } from 'lucide-react'
import type { RetroRoom } from '@/types'

interface Poll {
  question: string
  type: 'yes_no' | 'scale_1_5' | 'multiple_choice' | 'emoji_scale'
  options?: string[]
}

interface PollVote {
  pollId: string
  userId: string
  value: number | string
}

interface PollCardProps {
  poll: Poll
  pollId: string
  room: RetroRoom
  socket: {
    send: (message: any) => void
  }
  userId: string
  votes: PollVote[]
}

export function PollCard({ poll, pollId, room, socket, userId, votes }: PollCardProps) {
  const [userVote, setUserVote] = useState<number | string | null>(() => {
    const existingVote = votes.find(v => v.pollId === pollId && v.userId === userId)
    return existingVote ? existingVote.value : null
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastServerVote, setLastServerVote] = useState<number | string | null>(() => {
    const existingVote = votes.find(v => v.pollId === pollId && v.userId === userId)
    return existingVote ? existingVote.value : null
  })

  const handleVote = async (value: number | string) => {
    if (isUpdating) return // Prevent rapid clicks

    // Optimistic update - show change immediately
    const previousVote = userVote
    setUserVote(value)
    setIsUpdating(true)

    try {
      // Remove previous vote if exists
      if (previousVote !== null) {
        socket.send({
          type: 'poll_vote_removed',
          payload: {
            pollId,
            userId
          }
        })
      }

      // Add new vote
      socket.send({
        type: 'poll_vote_added',
        payload: {
          pollId,
          userId,
          value
        }
      })

      // Update last known server state
      setLastServerVote(value)
    } catch (error) {
      console.error('Failed to update poll vote:', error)
      // Revert optimistic update on error
      setUserVote(previousVote)
    } finally {
      setIsUpdating(false)
    }
  }

  // Sync with server state when votes change
  useEffect(() => {
    const serverVote = votes.find(v => v.pollId === pollId && v.userId === userId)
    const serverVoteValue = serverVote ? serverVote.value : null
    
    if (serverVoteValue !== lastServerVote) {
      setLastServerVote(serverVoteValue)
      setUserVote(serverVoteValue)
    }
  }, [votes, pollId, userId, lastServerVote])

  const getVoteCount = (value: number | string) => {
    return votes.filter(v => v.pollId === pollId && v.value === value).length
  }

  const getTotalVotes = () => {
    return votes.filter(v => v.pollId === pollId).length
  }

  const getAverageVote = () => {
    const scaleVotes = votes.filter(v => v.pollId === pollId && typeof v.value === 'number')
    if (scaleVotes.length === 0) return 0
    const sum = scaleVotes.reduce((acc, vote) => acc + (vote.value as number), 0)
    return sum / scaleVotes.length
  }

  return (
    <div className="retro-card">
      {/* Poll Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="h-4 w-4 text-purple-500" />
            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">ANKET</span>
          </div>
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
            {poll.question}
          </h3>
        </div>
      </div>

      {/* Poll Content */}
      <div className="space-y-3">
        {poll.type === 'yes_no' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Evet/Hayır
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {getTotalVotes()} oy
              </span>
            </div>

            {/* Yes/No Options */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleVote('Yes')}
                disabled={isUpdating}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  userVote === 'Yes'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Evet
              </button>
              <button
                onClick={() => handleVote('No')}
                disabled={isUpdating}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  userVote === 'No'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Hayır
              </button>
            </div>

            {/* Results Display */}
            {getTotalVotes() > 0 && (
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Evet: <span className="font-semibold text-green-600 dark:text-green-400">{getVoteCount('Yes')}</span>
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Hayır: <span className="font-semibold text-red-600 dark:text-red-400">{getVoteCount('No')}</span>
                </span>
              </div>
            )}
          </div>
        )}

        {poll.type === 'scale_1_5' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Ölçek: 1-5
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {getTotalVotes()} oy
              </span>
            </div>

            {/* Scale Options */}
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleVote(value)}
                  disabled={isUpdating}
                  className={`flex-1 py-2 px-1 rounded-md text-sm font-medium transition-colors ${
                    userVote === value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {value}
                </button>
              ))}
            </div>

            {/* Results Display */}
            {getTotalVotes() > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500 dark:text-gray-400">Ortalama:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {getAverageVote().toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <div key={value} className="text-center">
                      <div className="text-xs font-medium">{value}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {getVoteCount(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {poll.type === 'emoji_scale' && poll.options && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Emoji Ölçeği
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {getTotalVotes()} oy
              </span>
            </div>

            {/* Emoji Scale Options */}
            <div className="flex items-center space-x-2">
              {poll.options.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleVote(emoji)}
                  disabled={isUpdating}
                  className={`flex-1 py-3 px-2 rounded-md text-lg transition-colors ${
                    userVote === emoji
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Results Display */}
            {getTotalVotes() > 0 && (
              <div className="mt-2 flex items-center justify-center space-x-2">
                {poll.options.map((emoji) => (
                  <div key={emoji} className="text-center">
                    <div className="text-lg">{emoji}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {getVoteCount(emoji)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {poll.type === 'multiple_choice' && poll.options && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Çoklu Seçim
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {getTotalVotes()} oy
              </span>
            </div>

            {/* Multiple Choice Options */}
            <div className="space-y-2">
              {poll.options.map((option) => {
                const voteCount = getVoteCount(option)
                const percentage = getTotalVotes() > 0 ? (voteCount / getTotalVotes()) * 100 : 0
                
                return (
                  <div key={option} className="space-y-1">
                    <button
                      onClick={() => handleVote(option)}
                      disabled={isUpdating}
                      className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                        userVote === option
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        <span className="text-xs">
                          {voteCount} oy
                        </span>
                      </div>
                    </button>
                    
                    {/* Progress Bar */}
                    {getTotalVotes() > 0 && (
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                        <div
                          className="bg-purple-500 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 