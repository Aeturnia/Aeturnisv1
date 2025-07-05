# Game Design Overview

**Last Updated:** July 05, 2025  
**Current Status:** Phase 2 Core Game Systems - Character Foundation Complete

## Vision

Aeturnis Online is a browser-based MMORPG that combines classic RPG elements with modern web technology to create an accessible and engaging multiplayer experience.

## Core Mechanics

### Character System (Implemented ✅)

- **Races**: Human, Elf, Dwarf, Orc, Halfling, Dragonborn (6 races)
- **Classes**: Warrior, Mage, Rogue, Cleric, Ranger, Paladin (6 classes)
- **Stats**: Strength, Dexterity, Intelligence, Constitution, Wisdom, Charisma
- **Leveling**: Infinite progression system with:
  - Standard levels (1-100)
  - Paragon levels (100-500)
  - Prestige system (500+)
  - Stat tier scaling for infinite growth
- **Customization**: Character appearance, gender options (male/female/other)

### Combat System

- **Turn-based**: Strategic combat with 30-second turn timers
- **Damage Types**: Physical, Fire, Ice, Lightning, Holy, Dark
- **Equipment**: Weapons, armor, and accessories affect combat
- **Skills**: Unlockable abilities based on character progression

### World Design

- **Zone-based**: Multiple interconnected game areas
- **Player Limits**: Maximum 100 players per zone for performance
- **Movement**: Grid-based movement with cooldowns
- **Exploration**: Discoverable locations and secrets

### Social Features

- **Chat System**: Global, zone, and private messaging
- **Guilds**: Player organizations with shared goals
- **Trading**: Player-to-player item exchange
- **PvP**: Optional player vs player combat

### Progression Systems

- **Experience**: Gained through combat, quests, and exploration
- **Items**: Equipment with rarity tiers (Common to Legendary)
- **Achievements**: Goals and milestones for players
- **Reputation**: Standing with NPCs and factions

## Technical Constraints

- **Browser-based**: No downloads required
- **Real-time**: WebSocket communication for live updates
- **Scalable**: Architecture supports growing player base
- **Mobile-friendly**: Responsive design for all devices

## Future Expansions

- **Crafting System**: Create items and equipment
- **Housing**: Player-owned spaces and customization
- **Events**: Seasonal and special world events
- **Advanced PvP**: Tournaments and competitive modes