import React, { memo, useEffect, useRef } from 'react'

interface GameMessage {
  id: string
  type: 'system' | 'combat' | 'loot' | 'social' | 'quest'
  message: string
  timestamp: Date
}

interface TextDisplayProps {
  messages: GameMessage[]
  maxMessages?: number
  autoScroll?: boolean
}

const getMessageColor = (type: GameMessage['type']) => {
  switch (type) {
    case 'system': return 'text-gray-300'
    case 'combat': return 'text-red-400'
    case 'loot': return 'text-yellow-400'
    case 'social': return 'text-blue-400'
    case 'quest': return 'text-green-400'
    default: return 'text-white'
  }
}

const getMessageIcon = (type: GameMessage['type']) => {
  switch (type) {
    case 'system': return '🔧'
    case 'combat': return '⚔️'
    case 'loot': return '💰'
    case 'social': return '💬'
    case 'quest': return '📝'
    default: return '📄'
  }
}

const formatTimestamp = (timestamp: Date) => {
  return timestamp.toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export const TextDisplay = memo<TextDisplayProps>(({ 
  messages, 
  maxMessages = 10,
  autoScroll = true
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const displayMessages = messages.slice(-maxMessages)

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, autoScroll])

  if (displayMessages.length === 0) {
    return (
      <div className="bg-dark-800/90 backdrop-blur-sm rounded-lg p-3 border border-dark-600">
        <div className="text-center text-dark-400 text-sm">
          <div className="text-lg mb-1">📜</div>
          <p>No messages yet...</p>
          <p className="text-xs mt-1">Game events will appear here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-dark-800/90 backdrop-blur-sm rounded-lg border border-dark-600 overflow-hidden">
      {/* Header */}
      <div className="bg-dark-700/50 px-3 py-2 border-b border-dark-600">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-white">Game Log</h4>
          <span className="text-xs text-dark-400">
            {displayMessages.length} message{displayMessages.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="max-h-32 overflow-y-auto momentum-scroll p-2 space-y-1"
      >
        {displayMessages.map((message, index) => (
          <div 
            key={message.id}
            className={`
              flex items-start space-x-2 text-sm p-1 rounded
              ${index === displayMessages.length - 1 ? 'bg-dark-700/30' : ''}
              transition-colors duration-200
            `}
          >
            {/* Timestamp */}
            <span className="text-xs text-dark-400 font-mono shrink-0 mt-0.5">
              {formatTimestamp(message.timestamp)}
            </span>

            {/* Message Icon */}
            <span className="shrink-0 mt-0.5">
              {getMessageIcon(message.type)}
            </span>

            {/* Message Text */}
            <span className={`${getMessageColor(message.type)} break-words`}>
              {message.message}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-dark-700/50 px-3 py-1 border-t border-dark-600">
        <div className="flex items-center justify-between text-xs text-dark-400">
          <span>Auto-scroll: {autoScroll ? 'On' : 'Off'}</span>
          <span>Max: {maxMessages}</span>
        </div>
      </div>
    </div>
  )
})

TextDisplay.displayName = 'TextDisplay'