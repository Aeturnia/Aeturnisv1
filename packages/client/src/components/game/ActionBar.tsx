import React, { memo } from 'react'
import { Character } from '@aeturnis/shared'
import { useTouch } from '../../hooks/useTouch'

interface ActionBarProps {
  character: Character | null
  onAction: (actionType: string, actionData?: any) => void
}

interface ActionButton {
  id: string
  icon: string
  label: string
  color: string
  hoverColor: string
  disabled?: boolean
}

export const ActionBar = memo<ActionBarProps>(({ character, onAction }) => {
  const { hapticFeedback } = useTouch()

  const handleAction = (actionType: string, actionData?: any) => {
    hapticFeedback('medium')
    onAction(actionType, actionData)
  }

  const primaryActions: ActionButton[] = [
    {
      id: 'attack',
      icon: '⚔️',
      label: 'Attack',
      color: 'bg-red-600',
      hoverColor: 'hover:bg-red-700',
      disabled: !character
    },
    {
      id: 'defend',
      icon: '🛡️',
      label: 'Defend',
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
      disabled: !character
    },
    {
      id: 'use_item',
      icon: '🧪',
      label: 'Use Item',
      color: 'bg-green-600',
      hoverColor: 'hover:bg-green-700',
      disabled: !character
    },
    {
      id: 'interact',
      icon: '🤝',
      label: 'Interact',
      color: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700',
      disabled: !character
    }
  ]

  const quickActions: ActionButton[] = [
    {
      id: 'character',
      icon: '👤',
      label: 'Character',
      color: 'bg-dark-600',
      hoverColor: 'hover:bg-dark-500'
    },
    {
      id: 'inventory',
      icon: '🎒',
      label: 'Inventory',
      color: 'bg-dark-600',
      hoverColor: 'hover:bg-dark-500'
    },
    {
      id: 'map',
      icon: '🗺️',
      label: 'Map',
      color: 'bg-dark-600',
      hoverColor: 'hover:bg-dark-500'
    },
    {
      id: 'settings',
      icon: '⚙️',
      label: 'Settings',
      color: 'bg-dark-600',
      hoverColor: 'hover:bg-dark-500'
    }
  ]

  const renderActionButton = (action: ActionButton, size: 'large' | 'small' = 'large') => {
    const baseClasses = `
      btn-touch flex flex-col items-center justify-center rounded-lg text-white font-medium
      transition-all duration-200 active:scale-95 shadow-lg
      ${action.color} ${action.hoverColor}
      ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `
    
    const sizeClasses = size === 'large' 
      ? 'w-16 h-16 text-lg' 
      : 'w-12 h-12 text-sm'

    return (
      <button
        key={action.id}
        onClick={() => !action.disabled && handleAction(action.id)}
        className={`${baseClasses} ${sizeClasses}`}
        disabled={action.disabled}
        title={action.label}
      >
        <div className={size === 'large' ? 'text-xl mb-1' : 'text-lg mb-0.5'}>
          {action.icon}
        </div>
        <span className={size === 'large' ? 'text-xs' : 'text-xs'}>
          {action.label}
        </span>
      </button>
    )
  }

  return (
    <div className="bg-dark-800/95 backdrop-blur-sm border-t border-dark-600 p-3">
      <div className="flex items-center justify-between space-x-3">
        {/* Primary Combat Actions */}
        <div className="flex space-x-2">
          {primaryActions.map(action => renderActionButton(action, 'large'))}
        </div>

        {/* Quick Menu Actions */}
        <div className="flex space-x-1">
          {quickActions.map(action => renderActionButton(action, 'small'))}
        </div>
      </div>

      {/* Character Status Indicator */}
      {character && (
        <div className="flex items-center justify-center mt-2 pt-2 border-t border-dark-700">
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <span className="text-yellow-400">⚡</span>
              <span className="text-white">Ready</span>
            </div>
            
            {/* Buffs/Debuffs placeholder */}
            <div className="flex items-center space-x-1">
              <span className="text-green-400">🔋</span>
              <span className="text-white">Well Rested</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

ActionBar.displayName = 'ActionBar'