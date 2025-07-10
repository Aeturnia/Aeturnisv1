import React, { memo } from 'react'
import { Character, Zone } from '@aeturnis/shared'
import { useWebSocketStatus } from '../../hooks/useServices'

interface GameHUDProps {
  character: Character | null
  currentZone?: Zone | null
}

export const GameHUD = memo<GameHUDProps>(({ character, currentZone }) => {
  const wsStatus = useWebSocketStatus()

  if (!character) {
    return (
      <div className="bg-dark-800/95 backdrop-blur-sm p-3 border-b border-dark-600">
        <div className="flex items-center justify-center">
          <span className="text-dark-400 text-sm">No character selected</span>
        </div>
      </div>
    )
  }

  const healthPercentage = (character.health / character.maxHealth) * 100
  const manaPercentage = (character.mana / character.maxMana) * 100
  const staminaPercentage = character.stamina && character.maxStamina 
    ? (character.stamina / character.maxStamina) * 100 
    : 0

  return (
    <div className="bg-dark-800/95 backdrop-blur-sm p-3 border-b border-dark-600">
      <div className="flex items-center justify-between">
        {/* Character Info */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {character.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-white font-medium text-sm">{character.name}</h3>
            <p className="text-dark-400 text-xs">
              Lvl {character.level} {character.race}
            </p>
          </div>
        </div>

        {/* Resource Bars */}
        <div className="flex-1 max-w-sm space-y-1 mx-4">
          {/* Health Bar */}
          <div className="flex items-center space-x-2">
            <span className="text-red-400 text-xs w-4">❤️</span>
            <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500 rounded-full transition-all duration-300"
                style={{ width: `${healthPercentage}%` }}
              />
            </div>
            <span className="text-xs text-white min-w-[40px] text-right">
              {character.health}/{character.maxHealth}
            </span>
          </div>

          {/* Mana Bar */}
          <div className="flex items-center space-x-2">
            <span className="text-blue-400 text-xs w-4">💧</span>
            <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${manaPercentage}%` }}
              />
            </div>
            <span className="text-xs text-white min-w-[40px] text-right">
              {character.mana}/{character.maxMana}
            </span>
          </div>

          {/* Stamina Bar */}
          {character.stamina && character.maxStamina && (
            <div className="flex items-center space-x-2">
              <span className="text-yellow-400 text-xs w-4">⚡</span>
              <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 rounded-full transition-all duration-300"
                  style={{ width: `${staminaPercentage}%` }}
                />
              </div>
              <span className="text-xs text-white min-w-[40px] text-right">
                {character.stamina}/{character.maxStamina}
              </span>
            </div>
          )}
        </div>

        {/* Zone and Connection Info */}
        <div className="text-right">
          {/* Zone */}
          <div className="flex items-center space-x-1 mb-1">
            <span className="text-xs text-dark-400">📍</span>
            <span className="text-xs text-white">
              {currentZone?.name || 'Unknown Area'}
            </span>
          </div>

          {/* Connection Status */}
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${
              wsStatus.connected ? 'bg-green-500' : 
              wsStatus.connecting ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className="text-xs text-white">
              {wsStatus.connected ? 'Online' : 
               wsStatus.connecting ? 'Connecting' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="flex items-center justify-center space-x-4 mt-2 pt-2 border-t border-dark-700">
        <div className="flex items-center space-x-1">
          <span className="text-xs text-dark-400">💪</span>
          <span className="text-xs text-white">{character.stats.strength}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-xs text-dark-400">🏃</span>
          <span className="text-xs text-white">{character.stats.dexterity}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-xs text-dark-400">🧠</span>
          <span className="text-xs text-white">{character.stats.intelligence}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-xs text-dark-400">🛡️</span>
          <span className="text-xs text-white">{character.stats.vitality}</span>
        </div>
      </div>
    </div>
  )
})

GameHUD.displayName = 'GameHUD'