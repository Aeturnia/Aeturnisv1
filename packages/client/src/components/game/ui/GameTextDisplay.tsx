import { useState, useEffect, useRef } from 'react'

export interface GameMessage {
  id: string
  content: string
  type: 'narrative' | 'dialogue' | 'system' | 'error' | 'success' | 'combat' | 'loot'
  timestamp: Date
  speaker?: string
  metadata?: Record<string, any>
}

interface GameTextDisplayProps {
  messages: GameMessage[]
  maxMessages?: number
  autoScroll?: boolean
  showTimestamps?: boolean
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  className?: string
}

const messageTypeStyles: Record<string, string> = {
  narrative: 'text-gray-200 bg-dark-800/50',
  dialogue: 'text-blue-200 bg-blue-900/20 border-l-4 border-blue-500',
  system: 'text-yellow-200 bg-yellow-900/20 border-l-4 border-yellow-500',
  error: 'text-red-200 bg-red-900/20 border-l-4 border-red-500',
  success: 'text-green-200 bg-green-900/20 border-l-4 border-green-500',
  combat: 'text-orange-200 bg-orange-900/20 border-l-4 border-orange-500',
  loot: 'text-purple-200 bg-purple-900/20 border-l-4 border-purple-500'
}

const messageTypeIcons: Record<string, string> = {
  narrative: '📖',
  dialogue: '💬',
  system: '⚙️',
  error: '❌',
  success: '✅',
  combat: '⚔️',
  loot: '💰'
}

export function GameTextDisplay({
  messages,
  maxMessages = 100,
  autoScroll = true,
  showTimestamps = false,
  isCollapsed = false,
  onToggleCollapse,
  className = ''
}: GameTextDisplayProps) {
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && !isUserScrolling && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, autoScroll, isUserScrolling])

  // Handle manual scrolling
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10

      setIsUserScrolling(!isAtBottom)

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      // Reset user scrolling after 3 seconds of no scroll activity
      scrollTimeoutRef.current = setTimeout(() => {
        setIsUserScrolling(false)
      }, 3000)
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  const displayMessages = messages.slice(-maxMessages)

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatMessage = (message: GameMessage) => {
    let content = message.content

    // Format dialogue with speaker
    if (message.type === 'dialogue' && message.speaker) {
      content = `${message.speaker}: "${content}"`
    }

    // Format combat messages with special styling
    if (message.type === 'combat') {
      content = content.replace(/(\d+)/g, '<span class="text-red-400 font-bold">$1</span>')
      content = content.replace(/(critical|miss|dodge)/gi, '<span class="text-yellow-400 font-bold">$1</span>')
    }

    // Format loot messages
    if (message.type === 'loot') {
      content = content.replace(/(\[.*?\])/g, '<span class="text-purple-400 font-bold">$1</span>')
    }

    return content
  }

  if (isCollapsed) {
    return (
      <div className={`bg-dark-800 border border-dark-700 rounded-lg p-2 ${className}`}>
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-between text-white hover:text-amber-400 transition-colors"
        >
          <span className="text-sm font-medium">Game Text</span>
          <span className="text-lg">📖</span>
        </button>
      </div>
    )
  }

  return (
    <div className={`bg-dark-800 border border-dark-700 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-dark-700 p-3 border-b border-dark-600">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Game Text</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">
              {displayMessages.length}/{maxMessages}
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

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-64 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-dark-600 scrollbar-track-dark-800"
      >
        {displayMessages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">📖</div>
            <div className="text-sm">Your adventure begins...</div>
            <div className="text-xs">Game events will appear here</div>
          </div>
        ) : (
          displayMessages.map((message) => {
            const messageStyle = messageTypeStyles[message.type] || messageTypeStyles.narrative
            const messageIcon = messageTypeIcons[message.type] || messageTypeIcons.narrative

            return (
              <div
                key={message.id}
                className={`p-2 rounded-lg ${messageStyle} transition-all duration-200 hover:bg-opacity-80`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-sm mt-0.5 flex-shrink-0">{messageIcon}</span>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm leading-relaxed break-words"
                      dangerouslySetInnerHTML={{ __html: formatMessage(message) }}
                    />
                    {showTimestamps && (
                      <div className="text-xs text-gray-400 mt-1">
                        {formatTimestamp(message.timestamp)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}

        {/* Scroll to Bottom Indicator */}
        {isUserScrolling && (
          <div className="sticky bottom-0 text-center py-2">
            <button
              onClick={() => {
                if (scrollRef.current) {
                  scrollRef.current.scrollTop = scrollRef.current.scrollHeight
                  setIsUserScrolling(false)
                }
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-3 py-1 rounded-full transition-colors"
            >
              ↓ Scroll to Bottom
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-dark-700 p-2 border-t border-dark-600">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // Clear messages functionality
                console.log('Clear messages')
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Clear
            </button>
            <span className="text-gray-500">|</span>
            <button
              onClick={() => {
                // Export/save messages functionality
                console.log('Export messages')
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Export
            </button>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-400">Auto-scroll:</span>
            <div className={`w-4 h-2 rounded-full transition-colors ${autoScroll ? 'bg-green-500' : 'bg-gray-600'}`}>
              <div className={`w-2 h-2 bg-white rounded-full transition-transform ${autoScroll ? 'translate-x-2' : ''}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}