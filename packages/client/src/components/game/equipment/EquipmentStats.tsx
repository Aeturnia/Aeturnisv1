interface EquipmentStatsProps {
  stats: Record<string, number>
  className?: string
}

const statLabels: Record<string, string> = {
  strength: 'STR',
  dexterity: 'DEX',
  intelligence: 'INT',
  wisdom: 'WIS',
  constitution: 'CON',
  charisma: 'CHA',
  health: 'Health',
  mana: 'Mana',
  stamina: 'Stamina',
  damage: 'Damage',
  defense: 'Defense',
  spellPower: 'Spell Power',
  criticalChance: 'Crit %',
  criticalDamage: 'Crit Dmg',
  attackSpeed: 'Attack Speed',
  castSpeed: 'Cast Speed',
  magicResistance: 'Magic Res',
  physicalResistance: 'Physical Res',
  accuracy: 'Accuracy',
  evasion: 'Evasion'
}

const statColors: Record<string, string> = {
  // Primary Stats
  strength: 'text-red-400',
  dexterity: 'text-green-400',
  intelligence: 'text-blue-400',
  wisdom: 'text-purple-400',
  constitution: 'text-orange-400',
  charisma: 'text-pink-400',
  
  // Resources
  health: 'text-red-300',
  mana: 'text-blue-300',
  stamina: 'text-yellow-300',
  
  // Combat Stats
  damage: 'text-red-500',
  defense: 'text-gray-400',
  spellPower: 'text-purple-500',
  criticalChance: 'text-amber-400',
  criticalDamage: 'text-amber-500',
  attackSpeed: 'text-green-500',
  castSpeed: 'text-cyan-400',
  
  // Resistances
  magicResistance: 'text-purple-300',
  physicalResistance: 'text-gray-300',
  
  // Secondary Stats
  accuracy: 'text-emerald-400',
  evasion: 'text-teal-400'
}

export function EquipmentStats({ stats, className = '' }: EquipmentStatsProps) {
  const sortedStats = Object.entries(stats)
    .filter(([, value]) => value > 0)
    .sort(([a], [b]) => {
      // Sort order: primary stats first, then resources, then combat stats
      const order = ['strength', 'dexterity', 'intelligence', 'wisdom', 'constitution', 'charisma', 'health', 'mana', 'stamina']
      const aIndex = order.indexOf(a)
      const bIndex = order.indexOf(b)
      
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex
      } else if (aIndex !== -1) {
        return -1
      } else if (bIndex !== -1) {
        return 1
      } else {
        return a.localeCompare(b)
      }
    })

  if (sortedStats.length === 0) {
    return (
      <div className={`bg-dark-700 rounded-lg p-3 ${className}`}>
        <div className="text-center text-gray-500 text-sm">
          No equipment bonuses
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-dark-700 rounded-lg p-3 ${className}`}>
      <div className="text-sm font-medium text-gray-300 mb-2">
        Equipment Bonuses
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
        {sortedStats.map(([stat, value]) => {
          const label = statLabels[stat] || stat.replace(/([A-Z])/g, ' $1').trim()
          const color = statColors[stat] || 'text-gray-400'
          
          return (
            <div key={stat} className="flex justify-between items-center py-1">
              <span className="text-xs text-gray-400 capitalize">
                {label}:
              </span>
              <span className={`text-xs font-medium ${color}`}>
                +{value}
                {stat.includes('Chance') || stat.includes('Speed') ? '%' : ''}
              </span>
            </div>
          )
        })}
      </div>
      
      {/* Total Equipment Score */}
      <div className="mt-3 pt-2 border-t border-dark-600">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Equipment Score:</span>
          <span className="text-sm font-bold text-amber-400">
            {Object.values(stats).reduce((sum, value) => sum + value, 0)}
          </span>
        </div>
      </div>
    </div>
  )
}