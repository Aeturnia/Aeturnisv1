import { useState, useEffect, useRef } from 'react'
import { GameMessage } from './GameTextDisplay'

export interface CombatEvent {
  id: string
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'miss' | 'dodge' | 'critical' | 'death' | 'spell' | 'item'
  source: string
  target?: string
  amount?: number
  spell?: string
  item?: string
  effect?: string
  timestamp: Date
  isCritical?: boolean
  isDodged?: boolean
  isMissed?: boolean
}

interface CombatLogProps {
  events: CombatEvent[]
  maxEvents?: number
  showDamageNumbers?: boolean
  groupSimilarEvents?: boolean
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  className?: string
}

const eventTypeColors: Record<string, string> = {
  damage: 'text-red-400',
  heal: 'text-green-400',
  buff: 'text-blue-400',
  debuff: 'text-orange-400',
  miss: 'text-gray-400',
  dodge: 'text-yellow-400',
  critical: 'text-amber-400',
  death: 'text-purple-400',
  spell: 'text-cyan-400',
  item: 'text-pink-400'
}

const eventTypeIcons: Record<string, string> = {
  damage: '💥',
  heal: '💚',
  buff: '⬆️',
  debuff: '⬇️',
  miss: '💨',
  dodge: '🏃',
  critical: '💥',
  death: '💀',
  spell: '✨',
  item: '🧪'
}

export function CombatLog({
  events,
  maxEvents = 50,
  showDamageNumbers = true,
  groupSimilarEvents = false,
  isCollapsed = false,
  onToggleCollapse,
  className = ''
}: CombatLogProps) {
  const [filteredEvents, setFilteredEvents] = useState<CombatEvent[]>([])
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set())
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [filteredEvents])

  // Process events
  useEffect(() => {
    let processedEvents = [...events]

    // Apply filters
    if (activeFilters.size > 0) {
      processedEvents = processedEvents.filter(event => 
        activeFilters.has(event.type)
      )
    }

    // Group similar events if enabled
    if (groupSimilarEvents) {
      const groupedEvents: CombatEvent[] = []
      const groupMap = new Map<string, { event: CombatEvent; count: number; totalAmount: number }>()

      processedEvents.forEach(event => {
        const key = `${event.source}-${event.target}-${event.type}-${event.spell || event.item || ''}`
        const existing = groupMap.get(key)

        if (existing && Math.abs(event.timestamp.getTime() - existing.event.timestamp.getTime()) < 5000) {
          existing.count++
          existing.totalAmount += event.amount || 0
        } else {
          groupMap.set(key, { event, count: 1, totalAmount: event.amount || 0 })
        }
      })

      groupMap.forEach(({ event, count, totalAmount }) => {
        if (count > 1) {
          groupedEvents.push({
            ...event,
            id: `${event.id}-grouped`,
            amount: totalAmount
          })
        } else {
          groupedEvents.push(event)
        }
      })

      processedEvents = groupedEvents
    }

    // Limit to max events
    processedEvents = processedEvents.slice(-maxEvents)

    setFilteredEvents(processedEvents)
  }, [events, maxEvents, groupSimilarEvents, activeFilters])

  const formatCombatEvent = (event: CombatEvent) => {
    const color = eventTypeColors[event.type] || 'text-gray-300'
    const icon = eventTypeIcons[event.type] || '⚡'

    switch (event.type) {
      case 'damage':
        return {
          icon,
          text: `${event.source} ${event.isCritical ? 'critically ' : ''}hits ${event.target} for`,
          amount: event.amount,
          suffix: event.isCritical ? ' damage!' : ' damage',
          color: event.isCritical ? 'text-amber-400' : color
        }

      case 'heal':
        return {
          icon,
          text: `${event.source} heals ${event.target || 'themselves'} for`,
          amount: event.amount,
          suffix: ' health',
          color
        }

      case 'miss':
        return {
          icon,
          text: `${event.source} misses ${event.target}`,
          color
        }

      case 'dodge':
        return {
          icon,
          text: `${event.target} dodges ${event.source}'s attack`,
          color
        }

      case 'buff':
        return {
          icon,
          text: `${event.source} gains ${event.effect}`,
          color
        }

      case 'debuff':
        return {
          icon,
          text: `${event.target} is afflicted with ${event.effect}`,
          color
        }

      case 'spell':
        return {
          icon,
          text: `${event.source} casts ${event.spell}`,
          color
        }

      case 'item':
        return {
          icon,
          text: `${event.source} uses ${event.item}`,
          color
        }

      case 'death':
        return {
          icon,
          text: `${event.target} has been defeated`,
          color
        }

      default:
        return {
          icon: '⚡',
          text: `${event.source} performs an action`,
          color: 'text-gray-300'
        }
    }
  }

  const toggleFilter = (eventType: string) => {
    setActiveFilters(prev => {
      const newFilters = new Set(prev)
      if (newFilters.has(eventType)) {
        newFilters.delete(eventType)
      } else {
        newFilters.add(eventType)
      }
      return newFilters
    })
  }

  const eventTypes = Array.from(new Set(events.map(e => e.type)))

  if (isCollapsed) {
    return (
      <div className={`bg-dark-800 border border-dark-700 rounded-lg p-2 ${className}`}>
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-between text-white hover:text-amber-400 transition-colors"
        >
          <span className="text-sm font-medium">Combat Log</span>
          <span className="text-lg">⚔️</span>
        </button>
      </div>
    )
  }

  return (
    <div className={`bg-dark-800 border border-dark-700 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-dark-700 p-3 border-b border-dark-600">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white">Combat Log</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">
              {filteredEvents.length}/{maxEvents}
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

        {/* Filters */}
        {eventTypes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {eventTypes.map(type => (
              <button
                key={type}
                onClick={() => toggleFilter(type)}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  activeFilters.has(type) || activeFilters.size === 0
                    ? `${eventTypeColors[type]} bg-current bg-opacity-20 border border-current`
                    : 'text-gray-500 bg-dark-600 border border-dark-500'
                }`}
              >
                {eventTypeIcons[type]} {type}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Combat Events */}
      <div
        ref={scrollRef}
        className="h-48 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-dark-600 scrollbar-track-dark-800"
      >
        {filteredEvents.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">⚔️</div>
            <div className="text-sm">No combat events</div>
            <div className="text-xs">Combat actions will appear here</div>
          </div>
        ) : (
          filteredEvents.map((event, index) => {
            const formatted = formatCombatEvent(event)
            const timeStr = event.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit' 
            })

            return (
              <div
                key={`${event.id}-${index}`}
                className="flex items-center gap-2 text-xs py-1 px-2 rounded hover:bg-dark-700/50 transition-colors"
              >
                <span className="text-gray-500 font-mono text-xs min-w-0 flex-shrink-0">
                  {timeStr}
                </span>
                <span className="text-sm">{formatted.icon}</span>
                <div className={`flex-1 ${formatted.color}`}>
                  <span>{formatted.text}</span>
                  {formatted.amount && showDamageNumbers && (
                    <span className="font-bold mx-1">{formatted.amount}</span>
                  )}
                  {formatted.suffix && <span>{formatted.suffix}</span>}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Controls */}
      <div className="bg-dark-700 p-2 border-t border-dark-600">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilteredEvents([])}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Clear
            </button>
            <span className="text-gray-500">|</span>
            <label className="flex items-center gap-1 text-gray-400">
              <input
                type="checkbox"
                checked={showDamageNumbers}
                onChange={() => {/* Toggle damage numbers */}}
                className="w-3 h-3"
              />
              Numbers
            </label>
            <label className="flex items-center gap-1 text-gray-400">
              <input
                type="checkbox"
                checked={groupSimilarEvents}
                onChange={() => {/* Toggle grouping */}}
                className="w-3 h-3"
              />
              Group
            </label>
          </div>
          <div className="text-gray-500">
            Events: {events.length}
          </div>
        </div>
      </div>
    </div>
  )
}