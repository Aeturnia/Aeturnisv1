import { useState } from 'react'

export interface QuestObjective {
  id: string
  description: string
  current: number
  target: number
  isCompleted: boolean
  isOptional?: boolean
}

export interface QuestInfo {
  id: string
  title: string
  description: string
  type: 'main' | 'side' | 'daily' | 'weekly' | 'event'
  level: number
  objectives: QuestObjective[]
  reward?: {
    experience: number
    gold: number
    items?: Array<{ name: string; icon: string; quantity: number }>
  }
  timeLimit?: number
  isCompleted: boolean
  canTurnIn: boolean
}

interface QuestTrackerProps {
  quests: QuestInfo[]
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  onQuestClick?: (quest: QuestInfo) => void
  maxVisible?: number
  className?: string
}

const questTypeColors: Record<string, string> = {
  main: 'border-amber-500 bg-amber-900/20',
  side: 'border-blue-500 bg-blue-900/20',
  daily: 'border-green-500 bg-green-900/20',
  weekly: 'border-purple-500 bg-purple-900/20',
  event: 'border-red-500 bg-red-900/20'
}

const questTypeIcons: Record<string, string> = {
  main: '⭐',
  side: '📋',
  daily: '📅',
  weekly: '📆',
  event: '🎉'
}

export function QuestTracker({
  quests,
  isCollapsed = false,
  onToggleCollapse,
  onQuestClick,
  maxVisible = 5,
  className = ''
}: QuestTrackerProps) {
  const [expandedQuests, setExpandedQuests] = useState<Set<string>>(new Set())

  const activeQuests = quests.filter(quest => !quest.isCompleted).slice(0, maxVisible)
  const completedQuests = quests.filter(quest => quest.isCompleted && quest.canTurnIn)

  const toggleQuestExpanded = (questId: string) => {
    setExpandedQuests(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questId)) {
        newSet.delete(questId)
      } else {
        newSet.add(questId)
      }
      return newSet
    })
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`
    }
  }

  if (isCollapsed) {
    return (
      <div className={`bg-dark-800 border border-dark-700 rounded-lg p-2 ${className}`}>
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-between text-white hover:text-amber-400 transition-colors"
        >
          <span className="text-sm font-medium">Quests ({activeQuests.length})</span>
          <span className="text-lg">📝</span>
        </button>
      </div>
    )
  }

  return (
    <div className={`bg-dark-800 border border-dark-700 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-dark-700 p-3 border-b border-dark-600">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Quests</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">
              {activeQuests.length} active
            </span>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ▲
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-3">
        {/* Completed Quests Ready to Turn In */}
        {completedQuests.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-green-400 mb-2">Ready to Turn In</h4>
            {completedQuests.map(quest => (
              <div
                key={quest.id}
                className="bg-green-900/20 border border-green-500 rounded-lg p-2 mb-2 cursor-pointer hover:bg-green-900/30 transition-colors"
                onClick={() => onQuestClick?.(quest)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">✅</span>
                    <div>
                      <div className="text-sm font-medium text-white">{quest.title}</div>
                      <div className="text-xs text-green-300">Click to turn in</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">Lv. {quest.level}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Active Quests */}
        {activeQuests.length > 0 ? (
          <div className="space-y-3">
            {activeQuests.map(quest => {
              const isExpanded = expandedQuests.has(quest.id)
              const borderColor = questTypeColors[quest.type] || 'border-gray-500 bg-gray-900/20'
              const completedObjectives = quest.objectives.filter(obj => obj.isCompleted).length
              const totalObjectives = quest.objectives.length

              return (
                <div
                  key={quest.id}
                  className={`border rounded-lg p-3 transition-all duration-200 ${borderColor}`}
                >
                  {/* Quest Header */}
                  <div
                    className="cursor-pointer"
                    onClick={() => toggleQuestExpanded(quest.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-2">
                        <span className="text-lg">
                          {questTypeIcons[quest.type] || '📋'}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {quest.title}
                          </div>
                          <div className="text-xs text-gray-400 capitalize">
                            {quest.type} Quest • Lv. {quest.level}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {quest.timeLimit && (
                          <div className="text-xs text-orange-400 bg-dark-700 px-2 py-1 rounded">
                            {formatTime(quest.timeLimit)}
                          </div>
                        )}
                        <span className="text-gray-400">
                          {isExpanded ? '▼' : '▶'}
                        </span>
                      </div>
                    </div>

                    {/* Progress Summary */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-300">
                        {completedObjectives}/{totalObjectives} objectives
                      </div>
                      <div className="flex w-20 bg-dark-700 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-amber-500 transition-all duration-300"
                          style={{ width: `${(completedObjectives / totalObjectives) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-dark-600">
                      {/* Description */}
                      {quest.description && (
                        <p className="text-xs text-gray-300 mb-3">{quest.description}</p>
                      )}

                      {/* Objectives */}
                      <div className="space-y-2">
                        {quest.objectives.map(objective => (
                          <div
                            key={objective.id}
                            className={`flex items-center justify-between py-1 px-2 rounded ${
                              objective.isCompleted 
                                ? 'bg-green-900/20 text-green-300' 
                                : 'bg-dark-700 text-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm">
                                {objective.isCompleted ? '✅' : '⏳'}
                              </span>
                              <span className="text-xs">
                                {objective.description}
                                {objective.isOptional && (
                                  <span className="text-gray-500 ml-1">(Optional)</span>
                                )}
                              </span>
                            </div>
                            <span className="text-xs">
                              {objective.current}/{objective.target}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Rewards */}
                      {quest.reward && (
                        <div className="mt-3 p-2 bg-dark-700 rounded">
                          <div className="text-xs text-gray-400 mb-1">Rewards:</div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-purple-400">
                              {quest.reward.experience.toLocaleString()} XP
                            </span>
                            <span className="text-yellow-400">
                              {quest.reward.gold.toLocaleString()}g
                            </span>
                            {quest.reward.items && quest.reward.items.length > 0 && (
                              <div className="flex items-center gap-1">
                                {quest.reward.items.slice(0, 3).map((item, index) => (
                                  <span key={index} className="text-white">
                                    {item.icon} {item.quantity > 1 && `×${item.quantity}`}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">📝</div>
            <div className="text-sm">No active quests</div>
            <div className="text-xs">Visit NPCs to find new adventures!</div>
          </div>
        )}

        {/* More Quests Indicator */}
        {quests.filter(q => !q.isCompleted).length > maxVisible && (
          <div className="mt-3 text-center">
            <div className="text-xs text-gray-400">
              +{quests.filter(q => !q.isCompleted).length - maxVisible} more quests
            </div>
          </div>
        )}
      </div>
    </div>
  )
}